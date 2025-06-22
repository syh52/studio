'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  Upload, FileText, Mic, Book, X, CheckCircle, AlertCircle, 
  Download, Table, FileSpreadsheet, HelpCircle, Eye, Edit, Trash2, Bot
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Progress } from '../components/ui/progress'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { savePublicVocabularyPack, savePublicDialogue } from '../lib/firestore-service'
import { VocabularyPack, Dialogue } from '../lib/data'
import { LexiconAIService } from '../lib/ai-service'
import { useToast } from '../hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion'
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { AISmartImport } from './AISmartImport';
import { useRouter } from 'next/navigation';

interface UploadResult {
  success: boolean;
  message: string;
  data?: any;
}

interface ParsedDialogue {
  title: string;
  scenario?: string;
  lines: { speaker: string; text: string; translation?: string }[];
  audioFileName?: string;
}

interface ParsedVocabulary {
  english: string;
  chinese: string;
  explanation?: string;
  audioFileName?: string;
}

export function BulkUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ai-import');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  
  // 对话上传状态
  const [dialogueText, setDialogueText] = useState('');
  const [dialogueFiles, setDialogueFiles] = useState<FileList | null>(null);
  const [dialogueExcelFile, setDialogueExcelFile] = useState<File | null>(null);
  
  // 词汇上传状态
  const [vocabularyText, setVocabularyText] = useState('');
  const [vocabularyFiles, setVocabularyFiles] = useState<FileList | null>(null);
  const [vocabularyExcelFile, setVocabularyExcelFile] = useState<File | null>(null);

  // 生成对话模板Excel
  const generateDialogueTemplate = () => {
    const ws_data = [
      ['标题', '场景', '说话人', '英文对话', '中文翻译', '音频文件名'],
      ['机场安检对话', '乘客通过安检', 'Officer', 'Good morning. May I see your boarding pass and ID?', '早上好。我可以看一下您的登机牌和身份证吗？', 'security-check-1.mp3'],
      ['机场安检对话', '乘客通过安检', 'Passenger', 'Here you are.', '给您。', 'security-check-2.mp3'],
      ['机场安检对话', '乘客通过安检', 'Officer', 'Thank you. Please place all metal items in the tray.', '谢谢。请将所有金属物品放在托盘里。', 'security-check-3.mp3'],
      ['', '', '', '', '', ''],
      ['紧急情况对话', '紧急疏散', 'Captain', 'This is your captain speaking. We need to make an emergency landing.', '我是机长。我们需要紧急降落。', 'emergency-1.mp3'],
      ['紧急情况对话', '紧急疏散', 'Flight Attendant', 'Please remain calm and follow the crew instructions.', '请保持冷静并遵循机组人员的指示。', 'emergency-2.mp3']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '对话模板');
    
    // 设置列宽
    const colWidths = [
      { wch: 20 }, // 标题
      { wch: 20 }, // 场景
      { wch: 15 }, // 说话人
      { wch: 50 }, // 英文对话
      { wch: 50 }, // 中文翻译
      { wch: 20 }  // 音频文件名
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, '对话上传模板.xlsx');
    
    toast({
      title: "模板下载成功",
      description: "请按照模板格式填写对话内容",
    });
  };

  // 生成词汇模板Excel
  const generateVocabularyTemplate = () => {
    const ws_data = [
      ['英文单词', '中文翻译', '解释说明', '音频文件名'],
      ['altitude', '高度', 'The height of an aircraft above sea level / 飞机相对于海平面的高度', 'altitude.mp3'],
      ['runway', '跑道', 'A strip of ground for aircraft takeoff and landing / 供飞机起飞和降落的地面条带', 'runway.mp3'],
      ['clearance', '许可', 'Permission from ATC to proceed / 空中交通管制的许可', 'clearance.mp3'],
      ['turbulence', '湍流', 'Irregular atmospheric motion affecting aircraft / 影响飞机的不规则大气运动', 'turbulence.mp3'],
      ['', '', '', '']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '词汇模板');
    
    // 设置列宽
    const colWidths = [
      { wch: 20 }, // 英文单词
      { wch: 20 }, // 中文翻译
      { wch: 60 }, // 解释说明
      { wch: 20 }  // 音频文件名
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, '词汇上传模板.xlsx');
    
    toast({
      title: "模板下载成功",
      description: "请按照模板格式填写词汇内容",
    });
  };

  // 解析Excel文件中的对话
  const parseDialogueExcel = async (file: File): Promise<ParsedDialogue[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          // 跳过标题行
          const rows = jsonData.slice(1).filter(row => row[0]); // 过滤掉空行
          
          // 按标题分组对话
          const dialogueMap = new Map<string, ParsedDialogue>();
          
          rows.forEach(row => {
            const [title, scenario, speaker, english, chinese, audioFile] = row;
            
            if (!dialogueMap.has(title)) {
              dialogueMap.set(title, {
                title,
                scenario: scenario || title,
                lines: [],
                audioFileName: audioFile
              });
            }
            
            const dialogue = dialogueMap.get(title)!;
            dialogue.lines.push({
              speaker: speaker || 'Speaker',
              text: english || '',
              translation: chinese || ''
            });
          });
          
          resolve(Array.from(dialogueMap.values()));
        } catch (error) {
          reject(new Error('Excel文件解析失败'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  };

  // 解析Excel文件中的词汇
  const parseVocabularyExcel = async (file: File): Promise<ParsedVocabulary[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          // 跳过标题行
          const rows = jsonData.slice(1).filter(row => row[0] && row[1]); // 过滤掉空行
          
          const vocabulary = rows.map(row => ({
            english: row[0] || '',
            chinese: row[1] || '',
            explanation: row[2] || '',
            audioFileName: row[3] || ''
          }));
          
          resolve(vocabulary);
        } catch (error) {
          reject(new Error('Excel文件解析失败'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  };

  // 处理对话上传
  const handleDialogueUpload = useCallback(async () => {
    if (!user) {
      toast({
        title: "未登录",
        description: "请先登录后再上传",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setResults([]);
    
    try {
      let dialogues: ParsedDialogue[] = [];
      
      // 优先使用Excel文件
      if (dialogueExcelFile) {
        dialogues = await parseDialogueExcel(dialogueExcelFile);
      } else if (dialogueText) {
        // 使用文本解析
        dialogues = parseDialogues(dialogueText);
      } else {
        throw new Error('请提供对话内容（Excel文件或文本）');
      }
      
      if (dialogues.length === 0) {
        throw new Error('未找到有效的对话内容');
      }
      
      setProgress(25);
      
      // 处理音频文件
      const audioMap = new Map<string, string>();
      if (dialogueFiles) {
        for (let i = 0; i < dialogueFiles.length; i++) {
          const file = dialogueFiles[i];
          const base64 = await fileToBase64(file);
          audioMap.set(file.name, base64);
          setProgress(25 + (i + 1) / dialogueFiles.length * 25);
        }
      }
      
      // 创建对话对象
      const newDialogues: Dialogue[] = dialogues.map((dialogue, index) => ({
        id: `custom-${Date.now()}-${index}`,
        title: dialogue.title,
        description: dialogue.scenario || dialogue.title,
        lines: dialogue.lines.map((line, lineIndex) => ({
          id: `line-${lineIndex}`,
          speaker: line.speaker,
          english: line.text,
          chinese: line.translation || ''
        })),
        audio: audioMap.get(dialogue.audioFileName || '') || undefined
      }));
      
      // 保存到公共空间
      setProgress(75);
      
      for (let i = 0; i < newDialogues.length; i++) {
        await savePublicDialogue(newDialogues[i], user.id);
        setProgress(75 + ((i + 1) / newDialogues.length) * 25);
      }
      
      setResults([{
        success: true,
        message: `成功上传 ${newDialogues.length} 个对话到公共对话库`,
        data: newDialogues
      }]);
      
      toast({
        title: "上传成功",
        description: `${newDialogues.length} 个对话已保存到公共对话库，所有用户都可访问`,
      });
      
      // 清空表单
      setDialogueText('');
      setDialogueFiles(null);
      setDialogueExcelFile(null);
    } catch (error: any) {
      setResults([{
        success: false,
        message: `上传失败: ${error.message}`
      }]);
      
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [dialogueText, dialogueFiles, dialogueExcelFile, user, toast]);

  // 处理词汇上传
  const handleVocabularyUpload = useCallback(async () => {
    if (!user) {
      toast({
        title: "未登录",
        description: "请先登录后再上传",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setResults([]);
    
    try {
      let vocabulary: ParsedVocabulary[] = [];
      
      // 优先使用Excel文件
      if (vocabularyExcelFile) {
        vocabulary = await parseVocabularyExcel(vocabularyExcelFile);
      } else if (vocabularyText) {
        // 使用文本解析
        vocabulary = parseVocabulary(vocabularyText);
      } else {
        throw new Error('请提供词汇内容（Excel文件或文本）');
      }
      
      if (vocabulary.length === 0) {
        throw new Error('未找到有效的词汇内容');
      }
      
      setProgress(25);
      
      // 处理音频文件
      const audioMap = new Map<string, string>();
      if (vocabularyFiles) {
        for (let i = 0; i < vocabularyFiles.length; i++) {
          const file = vocabularyFiles[i];
          const base64 = await fileToBase64(file);
          audioMap.set(file.name, base64);
          setProgress(25 + (i + 1) / vocabularyFiles.length * 15); // 调整进度条占比
        }
      }
      
      setProgress(40);
      
      // 使用AI批量生成例句
      toast({
        title: "正在生成AI例句",
        description: `为 ${vocabulary.length} 个词汇生成自然例句，请稍候...`,
      });
      
      const vocabularyItems = vocabulary.map(word => ({
        id: `custom-word-${Date.now()}-${Math.random()}`,
        english: word.english,
        chinese: word.chinese
      }));
      
      const exampleResults = await LexiconAIService.generateBatchExampleSentences(
        vocabularyItems,
        (completed, total) => {
          const progressValue = 40 + (completed / total) * 30; // 40-70%
          setProgress(progressValue);
        }
      );
      
      setProgress(70);
      
      // 创建词汇包，使用AI生成的例句
      const vocabularyPack: VocabularyPack = {
        id: `custom-pack-${Date.now()}`,
        name: '自定义词汇包',
        description: `包含 ${vocabulary.length} 个词汇，配有AI生成的自然例句`,
        items: vocabulary.map((word, index) => {
          const itemId = vocabularyItems[index].id;
          const exampleResult = exampleResults.success.find(r => r.id === itemId);
          
          return {
            id: itemId,
            english: word.english,
            chinese: word.chinese,
            exampleSentenceEn: exampleResult?.exampleSentenceEn || word.explanation || `Please check the ${word.english} carefully.`,
            exampleSentenceZh: exampleResult?.exampleSentenceZh || `请仔细检查${word.chinese}。`,
            pronunciationAudio: audioMap.get(word.audioFileName || '') || undefined
          };
        })
      };
      
      // 保存到公共空间
      setProgress(80);
      await savePublicVocabularyPack(vocabularyPack, user.id);
      setProgress(100);
      
      setResults([{
        success: true,
        message: `成功创建词汇包，包含 ${vocabulary.length} 个单词，已保存到公共词库。${exampleResults.success.length} 个词汇使用了AI生成的例句${exampleResults.errors.length > 0 ? `，${exampleResults.errors.length} 个使用了备用例句` : ''}。`,
        data: vocabularyPack
      }]);
      
      toast({
        title: "上传成功",
        description: `词汇包已保存到公共词库，配有AI生成的自然例句，所有用户都可访问`,
      });
      
      // 清空表单
      setVocabularyText('');
      setVocabularyFiles(null);
      setVocabularyExcelFile(null);
    } catch (error: any) {
      setResults([{
        success: false,
        message: `上传失败: ${error.message}`
      }]);
      
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [vocabularyText, vocabularyFiles, vocabularyExcelFile, user, toast]);

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                学习资料上传中心
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  AI驱动
                </Badge>
              </CardTitle>
              <CardDescription>
                🤖 AI智能导入：粘贴任意文本，自动识别格式化 | 📊 传统上传：Excel模板和文本格式 | 🌍 所有内容保存到公共空间，供所有用户学习
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelp(true)}
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                使用帮助
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/manage')}
              >
                <Edit className="h-4 w-4 mr-1" />
                管理已上传内容
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai-import" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI智能导入
              </TabsTrigger>
              <TabsTrigger value="dialogues" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                对话上传
              </TabsTrigger>
              <TabsTrigger value="vocabulary" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                词汇上传
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai-import" className="space-y-4">
              <AISmartImport />
            </TabsContent>
            
            <TabsContent value="dialogues" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">上传方式</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateDialogueTemplate}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    下载Excel模板
                  </Button>
                </div>
                
                <Accordion type="single" collapsible defaultValue="excel">
                  <AccordionItem value="excel">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        表格文件上传（推荐）
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="dialogue-excel">Excel文件 (.xlsx, .xls)</Label>
                          <Input
                            id="dialogue-excel"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setDialogueExcelFile(e.target.files?.[0] || null)}
                            disabled={uploading}
                          />
                          <p className="text-xs text-muted-foreground">
                            请使用提供的模板格式，支持批量导入多个对话
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="text">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        文本输入
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Label>对话内容</Label>
                        <Textarea
                          placeholder={`请按以下格式输入对话：

标题: 机场安检对话
场景: 乘客通过安检
音频文件: security-check.mp3

Officer: Good morning. May I see your boarding pass and ID?
Passenger: Here you are.
Officer: Thank you. Please place all metal items in the tray.

---

(使用三个横线分隔多个对话)`}
                          value={dialogueText}
                          onChange={(e) => setDialogueText(e.target.value)}
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="space-y-2">
                  <Label htmlFor="dialogue-audio">对话音频文件（可选）</Label>
                  <Input
                    id="dialogue-audio"
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={(e) => setDialogueFiles(e.target.files)}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    音频文件名应与对话中指定的文件名匹配
                  </p>
                </div>
                
                <Button 
                  onClick={handleDialogueUpload} 
                  disabled={(!dialogueText && !dialogueExcelFile) || uploading || !user}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  上传对话到公共库
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="vocabulary" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">上传方式</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateVocabularyTemplate}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    下载Excel模板
                  </Button>
                </div>
                
                <Accordion type="single" collapsible defaultValue="excel">
                  <AccordionItem value="excel">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        表格文件上传（推荐）
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="vocabulary-excel">Excel文件 (.xlsx, .xls)</Label>
                          <Input
                            id="vocabulary-excel"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setVocabularyExcelFile(e.target.files?.[0] || null)}
                            disabled={uploading}
                          />
                          <p className="text-xs text-muted-foreground">
                            请使用提供的模板格式，支持批量导入词汇
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="text">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        文本输入
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Label>词汇列表</Label>
                        <Textarea
                          placeholder={`请按以下格式输入词汇：

altitude | 高度 | The height of an aircraft above sea level | altitude.mp3
runway | 跑道 | A strip of ground for aircraft takeoff and landing | runway.mp3

(每行一个单词，用 | 分隔：英文|中文|解释|音频文件名)`}
                          value={vocabularyText}
                          onChange={(e) => setVocabularyText(e.target.value)}
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="space-y-2">
                  <Label htmlFor="vocabulary-audio">单词音频文件（可选）</Label>
                  <Input
                    id="vocabulary-audio"
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={(e) => setVocabularyFiles(e.target.files)}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    音频文件名应与词汇列表中指定的文件名匹配
                  </p>
                </div>
                
                <Button 
                  onClick={handleVocabularyUpload} 
                  disabled={(!vocabularyText && !vocabularyExcelFile) || uploading || !user}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  上传词汇到公共库
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {uploading && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                上传中... {Math.round(progress)}%
              </p>
            </div>
          )}
          
          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              {results.map((result, index) => (
                <Alert key={index} variant={result.success ? "default" : "destructive"}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用帮助对话框 */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>批量上传使用帮助</DialogTitle>
            <DialogDescription>
              了解如何使用批量上传功能
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">📊 表格上传（推荐）</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>点击"下载Excel模板"获取标准格式模板</li>
                <li>在Excel中填写您的内容</li>
                <li>上传填写好的Excel文件</li>
                <li>如需音频，确保音频文件名与表格中的文件名一致</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">📝 文本上传</h3>
              <p className="text-sm mb-2">适合少量内容的快速上传：</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>对话：使用指定格式，包含标题、场景和对话内容</li>
                <li>词汇：每行一个单词，用竖线（|）分隔各项</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">🎵 音频文件</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>支持常见音频格式（mp3, wav等）</li>
                <li>文件名需与内容中指定的名称匹配</li>
                <li>可选项，不上传音频也可以</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">💡 提示</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>上传后的内容会保存在您的个人云端空间</li>
                <li>可以在"管理已上传内容"中查看和编辑</li>
                <li>支持批量上传，一次可以上传多个对话或词汇</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 辅助函数：解析对话文本
function parseDialogues(text: string): ParsedDialogue[] {
  const dialogues = text.split('---').filter(d => d.trim());
  
  return dialogues.map(dialogueText => {
    const lines = dialogueText.trim().split('\n');
    const metadata: any = {};
    const dialogueLines: { speaker: string; text: string; translation?: string }[] = [];
    
    for (const line of lines) {
      if (line.startsWith('标题:') || line.startsWith('Title:')) {
        metadata.title = line.split(':')[1].trim();
      } else if (line.startsWith('场景:') || line.startsWith('Scenario:')) {
        metadata.scenario = line.split(':')[1].trim();
      } else if (line.startsWith('音频文件:') || line.startsWith('Audio:')) {
        metadata.audioFileName = line.split(':')[1].trim();
      } else if (line.trim() && line.includes(':')) {
        const parts = line.split(':');
        const speaker = parts[0].trim();
        const text = parts.slice(1).join(':').trim();
        dialogueLines.push({ speaker, text });
      }
    }
    
    return {
      title: metadata.title || '未命名对话',
      scenario: metadata.scenario || '一般场景',
      lines: dialogueLines,
      audioFileName: metadata.audioFileName
    };
  });
}

// 辅助函数：解析词汇文本
function parseVocabulary(text: string): ParsedVocabulary[] {
  const lines = text.trim().split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    const parts = line.split('|').map(p => p.trim());
    return {
      english: parts[0] || '',
      chinese: parts[1] || '',
      explanation: parts[2] || '',
      audioFileName: parts[3] || ''
    };
  }).filter(word => word.english && word.chinese);
}

// 辅助函数：文件转 Base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
} 