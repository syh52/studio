"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  parseCSV, 
  parseExcel, 
  validateDialogue, 
  generateId,
  ImportResult 
} from '@/lib/import-utils';
import { Dialogue } from '@/lib/data';
import { dialoguesApi } from '@/lib/firebase/firestore';

interface DialogueImporterProps {
  onImportComplete: (result: ImportResult) => void;
}

export function DialogueImporter({ onImportComplete }: DialogueImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<Dialogue[]>([]);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewData([]);
      setValidationResults([]);
      setShowPreview(false);
    }
  };

  const handleParseFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      let rawData: any[] = [];

      if (file.type.includes('json') || file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        // 如果是单个对话对象，转换为数组
        rawData = Array.isArray(parsed) ? parsed : [parsed];
        setProgress(30);
      } else if (file.type.includes('csv') || file.name.endsWith('.csv')) {
        const text = await file.text();
        rawData = parseCSVDialogues(text);
        setProgress(30);
      } else if (file.type.includes('sheet') || file.name.endsWith('.xlsx')) {
        try {
          rawData = await parseExcelDialogues(file);
          setProgress(30);
        } catch (error) {
          if (error instanceof Error && error.message.includes('Excel解析功能不可用')) {
            throw new Error('Excel解析功能暂时不可用，请将文件另存为CSV格式后重试，或使用JSON格式。');
          }
          throw error;
        }
      } else {
        throw new Error('不支持的文件格式');
      }

      // 验证数据
      setProgress(50);
      const validatedData: Dialogue[] = [];
      const validationErrors: any[] = [];
      
      // 从Firestore获取现有对话
      const existingDialogues = await dialoguesApi.getAll();
      const existingIds = existingDialogues.map(dialogue => dialogue.id);

      rawData.forEach((item, index) => {
        const validation = validateDialogue(item, index);
        if (validation.isValid && validation.data) {
          // 确保ID唯一
          if (!validation.data.id || existingIds.includes(validation.data.id)) {
            validation.data.id = generateId('dialogue-', existingIds);
            existingIds.push(validation.data.id);
          }
          validatedData.push(validation.data);
        }
        validationErrors.push({
          index,
          item,
          isValid: validation.isValid,
          errors: validation.errors
        });
      });

      setProgress(80);
      setPreviewData(validatedData);
      setValidationResults(validationErrors);
      setShowPreview(true);
      setProgress(100);

    } catch (error) {
      console.error('文件解析失败:', error);
      onImportComplete({
        success: false,
        message: `文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: {
          successful: 0,
          failed: 0,
          duplicates: 0,
          errors: [error instanceof Error ? error.message : '未知错误']
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (previewData.length === 0) return;

    setIsProcessing(true);
    
    try {
      // 从Firestore获取现有对话以检查重复项
      const existingDialogues = await dialoguesApi.getAll();
      const existingTitles = new Set(existingDialogues.map(d => d.title.toLowerCase()));
      const duplicates = previewData.filter(item => 
        existingTitles.has(item.title.toLowerCase())
      );
      const uniqueItems = previewData.filter(item => 
        !existingTitles.has(item.title.toLowerCase())
      );

      // 真正写入到Firestore
      const result = await dialoguesApi.addMany(uniqueItems);

      onImportComplete({
        success: true,
        message: `成功导入 ${result.success} 个对话到Cloud Firestore`,
        details: {
          successful: result.success,
          failed: result.failed + validationResults.filter(r => !r.isValid).length,
          duplicates: duplicates.length,
          errors: [
            ...result.errors,
            ...validationResults
              .filter(r => !r.isValid)
              .map(r => r.errors.join(', '))
          ]
        }
      });

      // 重置状态
      resetForm();

    } catch (error) {
      onImportComplete({
        success: false,
        message: `导入失败: ${error instanceof Error ? error.message : '未知错误'}`,
        details: {
          successful: 0,
          failed: previewData.length,
          duplicates: 0,
          errors: [error instanceof Error ? error.message : '未知错误']
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setValidationResults([]);
    setShowPreview(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // CSV对话解析（特殊格式处理）
  const parseCSVDialogues = (csvText: string): any[] => {
    const rows = parseCSV(csvText);
    const dialogues: any[] = [];
    let currentDialogue: any = null;

    rows.forEach(row => {
      if (row.title && row.title !== currentDialogue?.title) {
        // 新对话开始
        if (currentDialogue) {
          dialogues.push(currentDialogue);
        }
        currentDialogue = {
          title: row.title,
          description: row.description || '',
          icon: row.icon || 'MessageCircle',
          lines: []
        };
      }

      if (currentDialogue && row.speaker && row.english && row.chinese) {
        currentDialogue.lines.push({
          speaker: row.speaker,
          english: row.english,
          chinese: row.chinese,
          audio: row.audio || ''
        });
      }
    });

    if (currentDialogue) {
      dialogues.push(currentDialogue);
    }

    return dialogues;
  };

  // Excel对话解析
  const parseExcelDialogues = async (file: File): Promise<any[]> => {
    const rows = await parseExcel(file);
    return parseCSVDialogues(
      rows.map(row => Object.values(row).join(',')).join('\n')
    );
  };

  const validItems = validationResults.filter(r => r.isValid).length;
  const invalidItems = validationResults.filter(r => !r.isValid).length;

  return (
    <div className="space-y-6">
      {/* 文件选择区域 */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="dialogue-file-upload" className="text-white mb-2 block">
            选择对话文件
          </Label>
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              id="dialogue-file-upload"
              type="file"
              accept=".xlsx,.csv,.json"
              onChange={handleFileSelect}
              className="bg-gray-700 border-gray-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2"
            />
            <div className="text-sm text-gray-400">
              支持 .xlsx, .csv, .json 格式
            </div>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <FileText className="w-4 h-4" />
              <span>{file.name}</span>
              <Badge variant="secondary" className="bg-gray-700">
                {(file.size / 1024).toFixed(1)} KB
              </Badge>
            </div>
            <Button
              onClick={handleParseFile}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? '解析中...' : '解析文件'}
            </Button>
          </div>
        )}
      </div>

      {/* 进度条 */}
      {isProcessing && progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>解析进度</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="bg-gray-700" />
        </div>
      )}

      {/* 验证结果摘要 */}
      {validationResults.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-green-500/20 border-green-500/30">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">{validItems}</div>
              <div className="text-sm text-green-300">有效对话</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-500/20 border-red-500/30">
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-400">{invalidItems}</div>
              <div className="text-sm text-red-300">错误对话</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-500/20 border-gray-500/30">
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-300">{validationResults.length}</div>
              <div className="text-sm text-gray-400">总对话数</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 预览数据 */}
      {showPreview && previewData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              对话预览 ({previewData.length} 个有效对话)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-4">
                {previewData.slice(0, 2).map((dialogue, index) => (
                  <div key={index} className="bg-gray-700 rounded p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      <div className="font-medium text-white">{dialogue.title}</div>
                    </div>
                    <div className="text-gray-300 text-sm">{dialogue.description}</div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-400">
                        对话内容 ({dialogue.lines.length} 行):
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {dialogue.lines.slice(0, 3).map((line, lineIndex) => (
                          <div key={lineIndex} className="text-xs bg-gray-800 rounded p-2">
                            <div className="font-medium text-blue-300">{line.speaker}:</div>
                            <div className="text-gray-300">{line.english}</div>
                            <div className="text-gray-400">{line.chinese}</div>
                          </div>
                        ))}
                        {dialogue.lines.length > 3 && (
                          <div className="text-xs text-gray-400 text-center">
                            ... 还有 {dialogue.lines.length - 3} 行对话
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {previewData.length > 2 && (
                <div className="text-center text-gray-400 text-sm">
                  ... 还有 {previewData.length - 2} 个对话
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleConfirmImport}
                  disabled={isProcessing || previewData.length === 0}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  {isProcessing ? '导入中...' : `确认导入 ${previewData.length} 个对话`}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  重新选择
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误详情 */}
      {validationResults.some(r => !r.isValid) && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              对话错误详情
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {validationResults
                .filter(r => !r.isValid)
                .slice(0, 5)
                .map((result, index) => (
                  <div key={index} className="text-sm text-red-300">
                    <div className="font-medium">对话 {result.index + 1}:</div>
                    <ul className="list-disc list-inside ml-4 text-red-200">
                      {result.errors.map((error: string, errorIndex: number) => (
                        <li key={errorIndex}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
            {validationResults.filter(r => !r.isValid).length > 5 && (
              <div className="text-center text-red-400 text-sm mt-2">
                ... 还有 {validationResults.filter(r => !r.isValid).length - 5} 个错误
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 对话格式说明 */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 text-sm">
            对话数据格式说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-200 space-y-2">
          <div><strong>JSON格式:</strong> 直接包含title、description、lines数组的对象</div>
          <div><strong>CSV/Excel格式:</strong> 包含title、description、speaker、english、chinese列</div>
          <div><strong>注意:</strong> 相同title的行会被归并为一个对话</div>
        </CardContent>
      </Card>
    </div>
  );
} 