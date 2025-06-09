"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  parseCSV, 
  parseExcel, 
  validateVocabularyItem, 
  findDuplicates, 
  generateId,
  ImportResult,
  SUPPORTED_FILE_TYPES 
} from '@/lib/import-utils';
import { VocabularyItem, vocabularyPacks } from '@/lib/data';
import { vocabularyApi } from '@/lib/firebase/firestore';

interface VocabularyImporterProps {
  onImportComplete: (result: ImportResult) => void;
}

export function VocabularyImporter({ onImportComplete }: VocabularyImporterProps) {
  const [selectedPack, setSelectedPack] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<VocabularyItem[]>([]);
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
    if (!file || !selectedPack) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      let rawData: any[] = [];

      if (file.type.includes('json') || file.name.endsWith('.json')) {
        const text = await file.text();
        rawData = JSON.parse(text);
        setProgress(30);
      } else if (file.type.includes('csv') || file.name.endsWith('.csv')) {
        const text = await file.text();
        rawData = parseCSV(text);
        setProgress(30);
      } else if (file.type.includes('sheet') || file.name.endsWith('.xlsx')) {
        try {
          rawData = await parseExcel(file);
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
      const validatedData: VocabularyItem[] = [];
      const validationErrors: any[] = [];
      
      // 从Firestore获取现有词汇
      const existingVocabularies = await vocabularyApi.getAll();
      const existingIds = existingVocabularies.map(item => item.id);

      rawData.forEach((item, index) => {
        const validation = validateVocabularyItem(item, index);
        if (validation.isValid && validation.data) {
          // 确保ID唯一
          if (!validation.data.id || existingIds.includes(validation.data.id)) {
            validation.data.id = generateId('vt', existingIds);
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
      // 检查重复项
      const targetPack = vocabularyPacks.find(pack => pack.id === selectedPack);
      if (!targetPack) {
        throw new Error('目标词汇包不存在');
      }

      // 从Firestore获取现有词汇进行重复检查
      const existingVocabularies = await vocabularyApi.getByPack(selectedPack);
      const duplicates = findDuplicates(previewData, existingVocabularies);
      const uniqueItems = previewData.filter(
        item => !duplicates.includes(item.english)
      );

      // 真正写入到Firestore
      const result = await vocabularyApi.addManyToPack(selectedPack, uniqueItems);

      onImportComplete({
        success: true,
        message: `成功导入 ${result.success} 个词汇到Cloud Firestore`,
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
    setSelectedPack('');
    setPreviewData([]);
    setValidationResults([]);
    setShowPreview(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validItems = validationResults.filter(r => r.isValid).length;
  const invalidItems = validationResults.filter(r => !r.isValid).length;

  return (
    <div className="space-y-6">
      {/* 文件选择区域 */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="vocabulary-pack" className="text-white mb-2 block">
            选择目标词汇包
          </Label>
          <Select value={selectedPack} onValueChange={setSelectedPack}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="请选择要导入的词汇包" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {vocabularyPacks.map(pack => (
                <SelectItem key={pack.id} value={pack.id} className="text-white hover:bg-gray-600">
                  {pack.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="file-upload" className="text-white mb-2 block">
            选择导入文件
          </Label>
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".xlsx,.csv,.json"
              onChange={handleFileSelect}
              className="bg-gray-700 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2"
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
              disabled={!selectedPack || isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
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
              <div className="text-sm text-green-300">有效记录</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-500/20 border-red-500/30">
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-400">{invalidItems}</div>
              <div className="text-sm text-red-300">错误记录</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-500/20 border-gray-500/30">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-300">{validationResults.length}</div>
              <div className="text-sm text-gray-400">总记录数</div>
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
              数据预览 ({previewData.length} 条有效记录)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {previewData.slice(0, 5).map((item, index) => (
                  <div key={index} className="bg-gray-700 rounded p-3 space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-white">{item.english}</div>
                        <div className="text-gray-300">{item.chinese}</div>
                        {item.partOfSpeech && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {item.partOfSpeech}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      <div>例句: {item.exampleSentenceEn}</div>
                      <div>翻译: {item.exampleSentenceZh}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {previewData.length > 5 && (
                <div className="text-center text-gray-400 text-sm">
                  ... 还有 {previewData.length - 5} 条记录
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleConfirmImport}
                  disabled={isProcessing || previewData.length === 0}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  {isProcessing ? '导入中...' : `确认导入 ${previewData.length} 条记录`}
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
              数据错误详情
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {validationResults
                .filter(r => !r.isValid)
                .slice(0, 10)
                .map((result, index) => (
                  <div key={index} className="text-sm text-red-300">
                    <div className="font-medium">第 {result.index + 1} 行:</div>
                    <ul className="list-disc list-inside ml-4 text-red-200">
                      {result.errors.map((error: string, errorIndex: number) => (
                        <li key={errorIndex}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
            {validationResults.filter(r => !r.isValid).length > 10 && (
              <div className="text-center text-red-400 text-sm mt-2">
                ... 还有 {validationResults.filter(r => !r.isValid).length - 10} 个错误
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 