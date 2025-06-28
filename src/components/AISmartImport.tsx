'use client';

import { useState, useRef } from 'react';
import { 
  Upload, Bot, FileText, Book, CheckCircle, AlertCircle, 
  Eye, Download, Sparkles, Loader2, Trash2, Edit, Wand2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Progress } from '../components/ui/progress'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { savePublicVocabularyPack, savePublicDialogue } from '../lib/firestore-service'
import { VocabularyPack, Dialogue } from '../lib/data'
import { LexiconAIService } from '../lib/ai/core-service'
import { useToast } from '../hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { ScrollArea } from '../components/ui/scroll-area'
import { Input } from './ui/input'

interface ParsedData {
  contentType: 'vocabulary' | 'dialogue' | 'mixed';
  vocabulary: Array<{
    english: string;
    chinese: string;
    explanation: string;
  }>;
  dialogues: Array<{
    title: string;
    description: string;
    lines: Array<{
      speaker: string;
      english: string;
      chinese: string;
    }>;
  }>;
}

export function AISmartImport() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [inputText, setInputText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  // AI解析文本
  const handleParse = async () => {
    if (!inputText.trim()) {
      toast({
        title: "输入为空",
        description: "请输入要解析的文本内容",
        variant: "destructive"
      });
      return;
    }

    setParsing(true);
    try {
      const result = await LexiconAIService.parseSmartContent(inputText);
      
      if (result.success && result.data) {
        const parsed = JSON.parse(result.data);
        setParsedData(parsed);
        setActiveTab('preview');
        setShowPreview(true);
        
        toast({
          title: "解析成功！",
          description: `AI识别到${parsed.contentType === 'mixed' ? '词汇和对话' : 
            parsed.contentType === 'vocabulary' ? '词汇内容' : '对话内容'}`,
        });
      } else {
        throw new Error(result.error || '解析失败');
      }
    } catch (error: any) {
      toast({
        title: "解析失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setParsing(false);
    }
  };

  // 导入到云端（使用AI生成例句和公共内容保存）
  const handleImport = async () => {
    if (!parsedData || !user) return;

    setImporting(true);
    setProgress(0);
    
    try {
      const results = [];
      
      // 导入词汇
      if (parsedData.vocabulary && parsedData.vocabulary.length > 0) {
        setProgress(10);
        
        // 生成带编号的词汇包名称
        const timestamp = Date.now();
        const packNumber = Math.floor(timestamp / 1000) % 10000;
        
        toast({
          title: "正在生成AI例句",
          description: `为 ${parsedData.vocabulary.length} 个词汇生成自然例句，请稍候...`,
        });
        
        setProgress(20);
        
        // 使用AI批量生成例句
        const vocabularyItems = parsedData.vocabulary.map(word => ({
          id: `ai-word-${Date.now()}-${Math.random()}`,
          english: word.english,
          chinese: word.chinese
        }));
        
        const exampleResults = await LexiconAIService.generateBatchExampleSentences(
          vocabularyItems,
          (completed, total) => {
            const progressValue = 20 + (completed / total) * 30; // 20-50%
            setProgress(progressValue);
          }
        );
        
        setProgress(50);
        
        // 构建词汇包，使用AI生成的例句
        const vocabularyPack: VocabularyPack = {
          id: `ai-parsed-vocab-${timestamp}`,
          name: `AI导入词包 #${packNumber}`,
          description: `包含 ${parsedData.vocabulary.length} 个AI解析的词汇，配有AI生成的自然例句`,
          items: parsedData.vocabulary.map((word, index) => {
            const itemId = vocabularyItems[index].id;
            const exampleResult = exampleResults.success.find(r => r.id === itemId);
            
            return {
              id: itemId,
              english: word.english,
              chinese: word.chinese,
              exampleSentenceEn: exampleResult?.exampleSentenceEn || `Please check the ${word.english} carefully.`,
              exampleSentenceZh: exampleResult?.exampleSentenceZh || `请仔细检查${word.chinese}。`,
            };
          })
        };
        
        // 保存到公共空间
        await savePublicVocabularyPack(vocabularyPack, user.id);
        results.push(`✅ 成功导入 ${parsedData.vocabulary.length} 个词汇到公共词库`);
        
        if (exampleResults.failed.length > 0) {
          results.push(`⚠️ ${exampleResults.failed.length} 个词汇使用了备用例句`);
        }
        
        setProgress(60);
      }
      
      // 导入对话
      if (parsedData.dialogues && parsedData.dialogues.length > 0) {
        setProgress(70);
        
        for (let i = 0; i < parsedData.dialogues.length; i++) {
          const dialogue = parsedData.dialogues[i];
          
          const dialogueData: Dialogue = {
            id: `ai-parsed-dialogue-${Date.now()}-${i}`,
            title: dialogue.title,
            description: dialogue.description,
            lines: dialogue.lines.map((line, lineIndex) => ({
              id: `ai-line-${lineIndex}`,
              speaker: line.speaker,
              english: line.english,
              chinese: line.chinese
            }))
          };
          
          // 保存到公共空间
          await savePublicDialogue(dialogueData, user.id);
          
          setProgress(70 + ((i + 1) / parsedData.dialogues.length) * 20); // 70-90%
        }
        
        results.push(`✅ 成功导入 ${parsedData.dialogues.length} 个对话到公共对话库`);
        setProgress(90);
      }
      
      setProgress(100);
      
      toast({
        title: "导入成功！",
        description: results.join('\n') + "\n\n所有内容已保存到公共空间，所有用户都可访问。",
      });
      
      // 清空数据
      setInputText('');
      setParsedData(null);
      setShowPreview(false);
      setActiveTab('input');
      
    } catch (error: any) {
      console.error('导入失败:', error);
      toast({
        title: "导入失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  // 清空数据
  const handleClear = () => {
    setInputText('');
    setParsedData(null);
    setShowPreview(false);
    setActiveTab('input');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-500" />
              AI智能导入
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                Beta
              </Badge>
            </CardTitle>
            <CardDescription>
              粘贴任意格式的英语学习内容，AI自动识别并格式化导入
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {parsedData && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                清空
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              文本输入
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!parsedData}>
              <Eye className="h-4 w-4" />
              预览结果
              {parsedData && (
                <Badge variant="secondary" className="ml-1">
                  {parsedData.contentType === 'mixed' ? '混合' : 
                   parsedData.contentType === 'vocabulary' ? '词汇' : '对话'}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>学习内容文本</Label>
                <Textarea
                  placeholder={`直接粘贴任意格式的英语学习内容，AI会自动识别和整理！

示例1 - 词汇列表：
altitude 高度
runway 跑道  
clearance 许可
turbulence 湍流，颠簸

示例2 - 对话内容：
A: Good morning, may I see your boarding pass?
B: Here you are.
A: Thank you. Please proceed to gate 5.

示例3 - 混合内容：
包含词汇解释和对话的混合文本...

AI会智能识别内容类型并自动格式化！`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  ✨ 支持任意格式：纯文本、列表、对话、中英文混合等，AI会自动识别并整理
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleParse}
                  disabled={!inputText.trim() || parsing}
                  className="flex-1"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI智能解析
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            {parsedData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">解析结果</h3>
                    <Badge variant="outline">
                      {parsedData.contentType === 'mixed' ? '混合内容' : 
                       parsedData.contentType === 'vocabulary' ? '词汇内容' : '对话内容'}
                    </Badge>
                  </div>
                  <Button
                    onClick={handleImport}
                    disabled={importing || !user}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        导入中...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        确认导入到云端
                      </>
                    )}
                  </Button>
                </div>
                
                {importing && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground text-center">
                      正在导入到云端... {Math.round(progress)}%
                    </p>
                  </div>
                )}
                
                <ScrollArea className="h-96 w-full border rounded-md p-4">
                  <div className="space-y-6">
                    {/* 词汇预览 */}
                    {parsedData.vocabulary && parsedData.vocabulary.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          词汇 ({parsedData.vocabulary.length} 个)
                        </h4>
                        <div className="grid gap-3">
                          {parsedData.vocabulary.map((word, index) => (
                            <div key={index} className="border rounded-lg p-3 bg-blue-50/50">
                              <div className="flex items-center gap-3">
                                <div className="font-medium text-blue-900">{word.english}</div>
                                <div className="text-gray-600">{word.chinese}</div>
                              </div>
                              {word.explanation && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {word.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 对话预览 */}
                    {parsedData.dialogues && parsedData.dialogues.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          对话 ({parsedData.dialogues.length} 个)
                        </h4>
                        <div className="space-y-4">
                          {parsedData.dialogues.map((dialogue, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-green-50/50">
                              <div className="mb-3">
                                <h5 className="font-medium text-green-900">{dialogue.title}</h5>
                                <p className="text-sm text-gray-600">{dialogue.description}</p>
                              </div>
                              <div className="space-y-2">
                                {dialogue.lines.map((line, lineIndex) => (
                                  <div key={lineIndex} className="pl-3 border-l-2 border-green-200">
                                    <div className="font-medium text-sm text-green-800">
                                      {line.speaker}:
                                    </div>
                                    <div className="text-sm">{line.english}</div>
                                    <div className="text-sm text-gray-600">{line.chinese}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {!user && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      请先登录后再导入内容到云端
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* 功能介绍 */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">✨ AI智能功能</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>🤖 自动识别内容类型</div>
            <div>📝 智能提取词汇对话</div>
            <div>🌍 自动补充中文翻译</div>
            <div>⚡ 一键导入到词汇库</div>
            <div>🔍 支持任意文本格式</div>
            <div>☁️ 直接保存到云端</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 生成英文例句的辅助函数
function generateExampleSentence(word: string, explanation: string): string {
  // 首先尝试从解释中提取英文例句
  if (explanation) {
    const parts = explanation.split('/');
    if (parts.length >= 1 && parts[0].trim().length > word.length + 10) {
      return parts[0].trim();
    }
  }
  
  // 航空词汇例句模板
  const aviationTemplates = [
    `The pilot reported ${word} to air traffic control.`,
    `Please check the ${word} before takeoff.`,
    `We need to monitor the ${word} during flight.`,
    `The ${word} is functioning normally.`,
    `Attention passengers, we are experiencing ${word}.`,
    `The crew will handle the ${word} procedure.`,
    `Flight attendants, prepare for ${word}.`,
    `The aircraft ${word} requires immediate attention.`,
    `According to regulations, ${word} must be checked.`,
    `The captain announced the ${word} to passengers.`
  ];
  
  // 通用例句模板
  const generalTemplates = [
    `The ${word} is important for safety.`,
    `Please ensure the ${word} is secure.`,
    `We must follow ${word} procedures.`,
    `The ${word} has been verified.`,
    `Check the ${word} carefully.`,
    `The ${word} meets all requirements.`,
    `Staff will handle the ${word} process.`,
    `The ${word} is now complete.`,
    `Please be aware of the ${word}.`,
    `The ${word} system is operational.`
  ];
  
  // 根据单词特征选择模板
  const word_lower = word.toLowerCase();
  if (word_lower.includes('pilot') || word_lower.includes('captain') || 
      word_lower.includes('crew') || word_lower.includes('flight') ||
      word_lower.includes('aircraft') || word_lower.includes('runway') ||
      word_lower.includes('altitude') || word_lower.includes('landing')) {
    const template = aviationTemplates[Math.floor(Math.random() * aviationTemplates.length)];
    return template.replace(new RegExp(`\\b${word}\\b`, 'gi'), word);
  } else {
    const template = generalTemplates[Math.floor(Math.random() * generalTemplates.length)];
    return template.replace(new RegExp(`\\b${word}\\b`, 'gi'), word);
  }
}

// 生成中文例句的辅助函数
function generateChineseExampleSentence(chineseWord: string, explanation: string): string {
  // 首先尝试从解释中提取中文例句
  if (explanation) {
    const parts = explanation.split('/');
    if (parts.length >= 2 && parts[1].trim().length > chineseWord.length + 5) {
      return parts[1].trim();
    }
  }
  
  // 航空中文例句模板
  const aviationTemplates = [
    `飞行员向塔台报告了${chineseWord}的情况。`,
    `请在起飞前检查${chineseWord}。`,
    `我们需要在飞行过程中监控${chineseWord}。`,
    `${chineseWord}运行正常。`,
    `各位乘客，我们正在处理${chineseWord}。`,
    `机组人员将执行${chineseWord}程序。`,
    `空乘人员，请准备${chineseWord}。`,
    `飞机${chineseWord}需要立即关注。`,
    `根据规定，必须检查${chineseWord}。`,
    `机长向乘客宣布了${chineseWord}的情况。`
  ];
  
  // 通用中文例句模板
  const generalTemplates = [
    `${chineseWord}对安全很重要。`,
    `请确保${chineseWord}安全可靠。`,
    `我们必须遵循${chineseWord}程序。`,
    `${chineseWord}已经得到验证。`,
    `请仔细检查${chineseWord}。`,
    `${chineseWord}符合所有要求。`,
    `工作人员将处理${chineseWord}流程。`,
    `${chineseWord}现在已完成。`,
    `请注意${chineseWord}。`,
    `${chineseWord}系统运行正常。`
  ];
  
  // 根据词汇特征选择模板（简单的关键词匹配）
  if (chineseWord.includes('飞') || chineseWord.includes('机') || 
      chineseWord.includes('航') || chineseWord.includes('空') ||
      chineseWord.includes('乘客') || chineseWord.includes('跑道') ||
      chineseWord.includes('高度') || chineseWord.includes('降落')) {
    return aviationTemplates[Math.floor(Math.random() * aviationTemplates.length)];
  } else {
    return generalTemplates[Math.floor(Math.random() * generalTemplates.length)];
  }
} 