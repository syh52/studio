"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { KnowledgeBase, type KnowledgeItem } from '../../lib/knowledge-base';
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  Brain,
  Loader2,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  AlertTriangle,
  Clock,
  Settings,
  PauseCircle,
  PlayCircle,
  Zap,
  AlertCircle,
  FileQuestion
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from "../../components/ui/input";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";

const categoryConfig = {
  department: { label: '部门信息', color: 'bg-blue-500/20 text-blue-300' },
  position: { label: '岗位职责', color: 'bg-green-500/20 text-green-300' },
  terminology: { label: '专业术语', color: 'bg-purple-500/20 text-purple-300' },
  procedure: { label: '工作流程', color: 'bg-orange-500/20 text-orange-300' },
  regulation: { label: '规章制度', color: 'bg-red-500/20 text-red-300' }
};

const importanceConfig = {
  high: { label: '高', color: 'bg-red-500/20 text-red-300' },
  medium: { label: '中', color: 'bg-yellow-500/20 text-yellow-300' },
  low: { label: '低', color: 'bg-gray-500/20 text-gray-300' }
};

// 添加AI配额状态接口
interface AIQuotaStatus {
  available: boolean;
  reason?: string;
  suspendedUntil?: Date;
  consecutiveFailures: number;
}

export default function KnowledgePage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [documentInfo, setDocumentInfo] = useState<{size: string, estimatedTokens?: number, chunks?: number}>({size: ''});
  const [extractedKnowledge, setExtractedKnowledge] = useState<KnowledgeItem[]>([]);
  const [existingKnowledge, setExistingKnowledge] = useState<KnowledgeItem[]>([]);
  const [showExtracted, setShowExtracted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
    estimatedTokens: number;
    estimatedTime: string;
  } | null>(null);

  // 新增状态：AI配额和手动模式
  const [aiQuotaStatus, setAiQuotaStatus] = useState<AIQuotaStatus | null>(null);
  const [useManualMode, setUseManualMode] = useState(false);

  // 加载现有知识库
  useEffect(() => {
    // 主动初始化知识库，确保从云端加载数据
    KnowledgeBase.initialize().then(() => {
      loadExistingKnowledge();
    }).catch((error) => {
      console.error('知识库初始化失败:', error);
      loadExistingKnowledge(); // 即使初始化失败也尝试获取本地缓存
    });
    
    // 检查AI配额状态
    checkAIQuotaStatus();
  }, []);

  const loadExistingKnowledge = async () => {
    try {
      const items = await KnowledgeBase.getAllKnowledge();
      setExistingKnowledge(items);
    } catch (error) {
      console.error('加载知识库失败:', error);
      toast({
        title: "加载失败",
        description: "无法从云端加载知识库",
        variant: "destructive",
      });
    }
  };

  // 文件拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  // 文件选择处理
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError('');

    // 读取文件内容并估算
    try {
      const content = await readFileContent(file);
      const tokens = estimateTokenCount(content);
      const estimatedTime = estimateProcessingTime(tokens, useManualMode);

      setFileInfo({
        name: file.name,
        size: formatFileSize(file.size),
        estimatedTokens: tokens,
        estimatedTime: estimatedTime
      });
    } catch (error) {
      setError('无法读取文件内容');
    }
  };

  // 文件上传和处理
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('准备处理文档...');
    setExtractedKnowledge([]);
    setShowExtracted(false);

    // 显示文件信息
    const fileSize = (file.size / 1024).toFixed(2);
    const sizeUnit = file.size > 1024 * 1024 ? 'MB' : 'KB';
    const displaySize = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : fileSize + ' KB';
    setDocumentInfo({ size: displaySize });

    try {
      // 读取文件内容以估算token数量
      const fileContent = await readFileContent(file);
      const estimatedTokens = Math.ceil(fileContent.length / 4); // 粗略估算
      const chunks = estimatedTokens > 300000 ? Math.ceil(estimatedTokens / 200000) : 1;
      
      setDocumentInfo({ 
        size: displaySize, 
        estimatedTokens: estimatedTokens,
        chunks: chunks
      });

      if (chunks > 1) {
        const estimatedTime = Math.ceil(chunks * 45 / 60); // 每块约45秒（含超长重试和延迟）
        setProcessingStatus(`文档较大，将分为 ${chunks} 个部分处理...`);
        toast({
          title: "大文档检测",
          description: `文档将分为 ${chunks} 个部分进行AI分析，预计需要 ${estimatedTime} 分钟，请耐心等待`,
        });
      } else {
        setProcessingStatus('正在进行AI分析...');
      }

      setProcessingProgress(10);

      // 监听控制台输出以更新进度（这是一个简化的实现）
      const originalConsoleLog = console.log;
      let currentChunk = 0;
      
              console.log = (...args) => {
          originalConsoleLog(...args);
          const message = args.join(' ');
          
          if (message.includes('文档已分为')) {
            setProcessingStatus('开始分块处理...');
            setProcessingProgress(15);
          } else if (message.includes('正在分析第')) {
            const match = message.match(/正在分析第 (\d+)\/(\d+) 块/);
            if (match) {
              const current = parseInt(match[1]);
              const total = parseInt(match[2]);
              const progress = 15 + Math.floor((current / total) * 70);
              setProcessingProgress(progress);
              setProcessingStatus(`正在分析第 ${current}/${total} 个部分...`);
            }
          } else if (message.includes('API限制触发')) {
            const match = message.match(/(\d+)秒后重试.*尝试 (\d+)\/(\d+)/);
            if (match) {
              const delay = match[1];
              const attempt = match[2];
              const maxAttempts = match[3];
              setProcessingStatus(`API限制，${delay}秒后重试 (${attempt}/${maxAttempts})...`);
            }
          } else if (message.includes('冷却期激活')) {
            const match = message.match(/等待 (\d+) 秒.*连续失败 (\d+) 次/);
            if (match) {
              const delay = match[1];
              const failures = match[2];
              setProcessingStatus(`冷却期激活，等待 ${delay} 秒（失败${failures}次）...`);
            }
          } else if (message.includes('全局速率控制')) {
            const match = message.match(/等待 (\d+) 秒/);
            if (match) {
              const delay = match[1];
              setProcessingStatus(`全局速率控制，等待 ${delay} 秒...`);
            }
          } else if (message.includes('块分析完成')) {
            const match = message.match(/第 (\d+) 块分析完成，提取了 (\d+) 个知识条目/);
            if (match) {
              const chunkNum = match[1];
              const itemCount = match[2];
              setProcessingStatus(`第 ${chunkNum} 部分完成，提取了 ${itemCount} 个条目`);
            }
          } else if (message.includes('分块分析完成')) {
            setProcessingStatus('合并分析结果...');
            setProcessingProgress(90);
          } else if (message.includes('优化完成')) {
            setProcessingStatus('优化知识条目...');
            setProcessingProgress(95);
          }
        };

      const result = await KnowledgeBase.parseFileContent(file);
      
      // 恢复原始console.log
      console.log = originalConsoleLog;
      
      setProcessingProgress(100);
      setProcessingStatus('处理完成！');

      if (result.success && result.data) {
        setExtractedKnowledge(result.data);
        setShowExtracted(true);
        toast({
          title: "文档分析成功",
          description: `AI从文档中提取了 ${result.data.length} 个知识条目`,
        });
      } else {
        toast({
          title: "分析失败",
          description: result.error || "无法解析文件内容",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('文件处理错误:', error);
      
      // 根据错误类型提供具体提示
      let errorMessage = "文件处理过程中发生错误";
      if (error instanceof Error) {
        if (error.message.includes('文档内容过大')) {
          errorMessage = "文档内容过大，请尝试上传较小的文档或将文档拆分";
        } else if (error.message.includes('使用频率过高') || error.message.includes('429')) {
          errorMessage = "AI服务使用频率过高，请稍等几分钟后重试";
        } else if (error.message.includes('AI服务')) {
          errorMessage = "AI服务暂时不可用，请稍后重试";
        } else if (error.message.includes('token')) {
          errorMessage = "文档太大超出处理限制，请上传较小的文档";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "处理失败",
        description: errorMessage,
        variant: "destructive",
      });
      setProcessingStatus('处理失败');
    } finally {
      setIsProcessing(false);
      // 3秒后清除状态信息
      setTimeout(() => {
        setProcessingStatus('');
        setDocumentInfo({size: ''});
      }, 3000);
    }
  };

  // 读取文件内容的辅助函数
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  // 确认添加知识条目
  const handleConfirmKnowledge = async () => {
    try {
      setIsProcessing(true);
      await KnowledgeBase.addMultipleKnowledge(extractedKnowledge.map(item => ({
        title: item.title,
        content: item.content,
        category: item.category,
        keywords: item.keywords,
        importance: item.importance
      })));
      
      await loadExistingKnowledge();
      setExtractedKnowledge([]);
      setShowExtracted(false);
      
      toast({
        title: "知识库更新成功",
        description: `已添加 ${extractedKnowledge.length} 个知识条目到云端`,
      });
    } catch (error) {
      toast({
        title: "添加失败",
        description: "无法添加知识条目到云端数据库",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 删除现有知识条目
  const handleDeleteKnowledge = async (id: string) => {
    if (confirm('确定要删除这个知识条目吗？此操作会从云端删除。')) {
      try {
        const success = await KnowledgeBase.deleteKnowledge(id);
        if (success) {
          await loadExistingKnowledge();
          toast({
            title: "删除成功",
            description: "知识条目已从云端删除",
          });
        } else {
          toast({
            title: "删除失败",
            description: "无法删除知识条目",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "删除失败",
          description: "网络错误，请检查连接",
          variant: "destructive",
        });
      }
    }
  };

  // 清空所有知识库
  const handleClearAll = async () => {
    if (confirm('确定要清空整个知识库吗？此操作会从云端删除所有数据，无法撤销。')) {
      try {
        setIsProcessing(true);
        
        // 并行删除所有知识条目
        const deletePromises = existingKnowledge.map(item => 
          KnowledgeBase.deleteKnowledge(item.id)
        );
        
        await Promise.all(deletePromises);
        await loadExistingKnowledge();
        
        toast({
          title: "知识库已清空",
          description: "所有知识条目已从云端删除",
        });
      } catch (error) {
        toast({
          title: "清空失败",
          description: "网络错误，请检查连接",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // 检查AI配额状态
  const checkAIQuotaStatus = async () => {
    try {
      const status = await KnowledgeBase.checkAIQuotaStatus();
      setAiQuotaStatus(status);
      
      // 如果AI不可用，自动启用手动模式
      if (!status.available) {
        setUseManualMode(true);
      }
    } catch (error) {
      console.error('检查AI配额状态失败:', error);
    }
  };

  const filteredItems = existingKnowledge.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const estimateTokenCount = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const estimateProcessingTime = (tokens: number, isManual: boolean): string => {
    if (isManual) {
      return '即时完成';
    }
    
    if (tokens <= 300000) {
      return '30-90秒';
    } else if (tokens <= 1000000) {
      return '10-30分钟';
    } else if (tokens <= 5000000) {
      return '30-90分钟';
    } else {
      return '2-6小时';
    }
  };

  const handleFileUploadNew = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      let result;
      
      if (useManualMode) {
        // 使用手动模式
        setUploadStatus('正在使用手动模式解析文档...');
        setUploadProgress(50);
        
        const content = await readFileContent(selectedFile);
        result = KnowledgeBase.parseFileContentManually(content, selectedFile.name);
        
        setUploadProgress(100);
      } else {
        // 使用AI模式
        setUploadStatus('正在上传并分析文档...');
        
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 2000);

        result = await KnowledgeBase.parseFileContent(selectedFile);
        clearInterval(progressInterval);
      }

      if (result.success && result.data) {
        setUploadStatus('正在保存到云端...');
        setUploadProgress(95);

        const savedItems = await KnowledgeBase.addMultipleKnowledge(
          result.data.map(item => ({
            title: item.title,
            content: item.content,
            category: item.category,
            keywords: item.keywords,
            importance: item.importance
          }))
        );

        setUploadProgress(100);
        setUploadStatus(`成功！已提取并保存 ${savedItems.length} 个知识条目`);

        // 重新加载知识条目
        await loadExistingKnowledge();

        // 重置状态
        setTimeout(() => {
          setSelectedFile(null);
          setFileInfo(null);
          setIsUploading(false);
          setUploadProgress(0);
          setUploadStatus('');
          
          // 重新检查AI配额状态
          checkAIQuotaStatus();
        }, 2000);
      } else {
        throw new Error(result.error || '解析失败');
      }
    } catch (error: any) {
      console.error('文件上传失败:', error);
      setError(error.message || '上传失败，请重试');
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
      
      // 重新检查AI配额状态
      checkAIQuotaStatus();
    }
  };

  // 清理乱码条目
  const handleCleanupCorrupted = async () => {
    if (!confirm('确定要清理可能的乱码条目吗？此操作将删除包含二进制数据或PDF标记的异常条目，操作不可撤销。')) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus('正在检测和清理乱码条目...');
      setUploadProgress(50);

      const result = await KnowledgeBase.cleanupCorruptedEntries();
      
      setUploadProgress(100);
      
      if (result.success) {
        setUploadStatus(`清理完成！已删除 ${result.deletedCount} 个乱码条目`);
        
        if (result.deletedCount > 0) {
          // 重新加载知识库
          await loadExistingKnowledge();
          
          toast({
            title: "清理成功",
            description: `已成功删除 ${result.deletedCount} 个乱码条目`,
          });
        } else {
          toast({
            title: "清理完成",
            description: "未发现需要清理的乱码条目",
          });
        }
      } else {
        throw new Error(result.error || '清理失败');
      }

      // 重置状态
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStatus('');
      }, 2000);

    } catch (error: any) {
      console.error('清理乱码条目失败:', error);
      setError(error.message || '清理失败，请重试');
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
      
      toast({
        title: "清理失败",
        description: error.message || "清理过程中发生错误",
        variant: "destructive",
      });
    }
  };

  // 渲染AI配额状态
  const renderAIQuotaStatus = () => {
    if (!aiQuotaStatus) return null;

    if (aiQuotaStatus.available) {
      return (
        <Alert className="mb-4">
          <PlayCircle className="h-4 w-4" />
          <AlertDescription>
            AI服务正常运行 
            {aiQuotaStatus.consecutiveFailures > 0 && (
              <span className="text-yellow-600 ml-2">
                （已失败 {aiQuotaStatus.consecutiveFailures} 次）
              </span>
            )}
          </AlertDescription>
        </Alert>
      );
    } else {
      return (
        <Alert variant="destructive" className="mb-4">
          <PauseCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>AI服务不可用：</strong>{aiQuotaStatus.reason}</p>
              {aiQuotaStatus.suspendedUntil && (
                <p>恢复时间：{aiQuotaStatus.suspendedUntil.toLocaleString()}</p>
              )}
              <p>已连续失败 {aiQuotaStatus.consecutiveFailures} 次</p>
              <p className="text-sm">建议使用手动模式继续工作</p>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">知识库管理</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            上传文档自动提取专业知识，构建智能化学习资源
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={checkAIQuotaStatus}
            className="flex items-center gap-2 text-sm sm:text-base"
            size="sm"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">刷新状态</span>
            <span className="sm:hidden">刷新</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCleanupCorrupted}
            className="flex items-center gap-2 text-sm sm:text-base"
            disabled={isUploading}
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">清理乱码</span>
            <span className="sm:hidden">清理</span>
          </Button>
        </div>
      </div>

      {/* AI配额状态显示 */}
      {renderAIQuotaStatus()}

      {/* 处理模式选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            处理模式设置
          </CardTitle>
          <CardDescription>
            选择文档处理方式：AI智能解析或手动模式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="manual-mode" className="text-base font-medium">
                使用手动模式
              </Label>
              <p className="text-sm text-muted-foreground">
                {useManualMode 
                  ? '手动模式：快速解析，基于文档结构提取知识'
                  : 'AI模式：智能分析，提取高质量知识条目'
                }
              </p>
            </div>
            <Switch
              id="manual-mode"
              checked={useManualMode}
              onCheckedChange={setUseManualMode}
              disabled={!aiQuotaStatus?.available} // AI不可用时强制手动模式
            />
          </div>
          
          {!aiQuotaStatus?.available && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                AI服务当前不可用，已自动启用手动模式
              </AlertDescription>
            </Alert>
          )}
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-600 flex items-center gap-1">
                <Brain className="h-4 w-4" />
                AI模式优势
              </h4>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>智能内容分析</li>
                <li>高质量知识提取</li>
                <li>自动分类标记</li>
                <li>关键词智能识别</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-600 flex items-center gap-1">
                <Zap className="h-4 w-4" />
                手动模式优势
              </h4>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>即时处理完成</li>
                <li>无需等待配额</li>
                <li>基于文档结构</li>
                <li>稳定可靠</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文件格式说明 */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p><strong>文件格式支持说明：</strong></p>
            <p>• <span className="text-green-600">✅ 支持</span>：纯文本文件(.txt)</p>
            <p>• <span className="text-red-600">❌ 暂不支持</span>：PDF (.pdf)、Word (.doc/.docx)</p>
            <div className="text-sm text-muted-foreground mt-2">
              <p><strong>如何转换PDF/Word文档：</strong></p>
              <p>1. 复制文档内容并粘贴到记事本，保存为.txt文件</p>
              <p>2. 在Word中选择"另存为" → "纯文本(.txt)"格式</p>
              <p>3. 使用在线PDF转文本工具</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* 文档上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            文档上传
          </CardTitle>
          <CardDescription>
            上传纯文本文件(.txt)进行智能知识提取
            {useManualMode && <span className="text-blue-600">（手动模式）</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Input
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={isUploading}
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">点击选择文件</span>
                <br />
                或拖拽文件到此处
              </div>
            </label>
          </div>

          {/* 文件信息显示 */}
          {fileInfo && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{fileInfo.name}</span>
                    <Badge variant="outline">{fileInfo.size}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">预估Token数：</span>
                      <span className="font-medium ml-1">
                        {fileInfo.estimatedTokens.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">预估时间：</span>
                      <span className="font-medium ml-1">{fileInfo.estimatedTime}</span>
                    </div>
                  </div>
                  
                  {/* 大文档警告 */}
                  {fileInfo.estimatedTokens > 1000000 && !useManualMode && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-medium">大文档提醒</p>
                        <p className="text-sm mt-1">
                          此文档较大，AI处理可能需要较长时间。建议：
                        </p>
                        <ul className="text-sm mt-1 list-disc list-inside">
                          <li>考虑拆分成较小文档分批上传</li>
                          <li>或使用手动模式快速处理</li>
                          <li>处理过程中请耐心等待，不要关闭页面</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 上传按钮 */}
          <Button
            onClick={handleFileUploadNew}
            disabled={!selectedFile || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                {useManualMode ? '手动解析中...' : 'AI分析中...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {useManualMode ? <FileQuestion className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                {useManualMode ? '开始手动解析' : '开始AI分析'}
              </div>
            )}
          </Button>

          {/* 进度显示 */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {uploadStatus}
              </p>
              {uploadProgress < 100 && !useManualMode && (
                <p className="text-xs text-center text-muted-foreground">
                  正在处理中，请耐心等待...
                </p>
              )}
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 成功提示 */}
          {uploadStatus && uploadProgress === 100 && !error && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{uploadStatus}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 知识库搜索和列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            知识库浏览
          </CardTitle>
          <CardDescription>
            已收录 {existingKnowledge.length} 条专业知识
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="搜索知识条目..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm sm:text-base">
                  {searchQuery ? '未找到匹配的知识条目' : '暂无知识条目，请上传文档'}
                </div>
              </div>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="p-3 sm:p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.content}
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <Badge 
                          variant={item.importance === 'high' ? 'destructive' : 
                                 item.importance === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.importance}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 