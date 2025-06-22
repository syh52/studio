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
  RefreshCw
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

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

export default function KnowledgePage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedKnowledge, setExtractedKnowledge] = useState<KnowledgeItem[]>([]);
  const [existingKnowledge, setExistingKnowledge] = useState<KnowledgeItem[]>([]);
  const [showExtracted, setShowExtracted] = useState(false);
  const { toast } = useToast();

  // 加载现有知识库
  useEffect(() => {
    // 主动初始化知识库，确保从云端加载数据
    KnowledgeBase.initialize().then(() => {
      loadExistingKnowledge();
    }).catch((error) => {
      console.error('知识库初始化失败:', error);
      loadExistingKnowledge(); // 即使初始化失败也尝试获取本地缓存
    });
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
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // 文件上传和处理
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setExtractedKnowledge([]);
    setShowExtracted(false);

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 500);

      const result = await KnowledgeBase.parseFileContent(file);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (result.success && result.data) {
        setExtractedKnowledge(result.data);
        setShowExtracted(true);
        toast({
          title: "文件解析成功",
          description: `AI从文档中提取了 ${result.data.length} 个知识条目`,
        });
      } else {
        toast({
          title: "解析失败",
          description: result.error || "无法解析文件内容",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "处理失败",
        description: "文件处理过程中发生错误",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">智能知识库</h1>
          <p className="text-gray-300">上传您的专业文档，AI自动提取知识条目</p>
        </div>

        {/* 文件上传区域 */}
        <Card className="mb-8 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5" />
              上传文档
            </CardTitle>
            <CardDescription className="text-gray-400">
              支持 .txt、.pdf、.docx 格式，AI会自动分析并提取专业知识
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-purple-400 bg-purple-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isProcessing ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 text-purple-400 mx-auto animate-spin" />
                  <div className="space-y-2">
                    <p className="text-white">AI正在分析文档内容...</p>
                    <Progress value={processingProgress} className="w-full max-w-xs mx-auto" />
                    <p className="text-sm text-gray-400">{processingProgress}%</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-white mb-2">拖拽文件到这里，或点击选择文件</p>
                                         <input
                       type="file"
                       id="fileInput"
                       className="hidden"
                       accept=".txt,.pdf,.docx,.doc"
                       onChange={handleFileSelect}
                       aria-label="选择文档文件上传"
                     />
                    <Button 
                      onClick={() => document.getElementById('fileInput')?.click()}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      选择文件
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    支持的格式：TXT、PDF、Word文档
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI提取的知识条目预览 */}
        {showExtracted && extractedKnowledge.length > 0 && (
          <Card className="mb-8 bg-white/5 border-white/10 border-green-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-400" />
                  <CardTitle className="text-white">AI提取的知识条目</CardTitle>
                  <Badge className="bg-green-500/20 text-green-300">
                    {extractedKnowledge.length} 个条目
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowExtracted(false)}
                    variant="ghost" 
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-gray-400">
                请检查AI提取的知识条目，确认无误后添加到知识库
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {extractedKnowledge.map((item, index) => {
                  const categoryInfo = categoryConfig[item.category];
                  const importanceInfo = importanceConfig[item.importance];
                  return (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{item.title}</h4>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className={categoryInfo.color}>
                            {categoryInfo.label}
                          </Badge>
                          <Badge variant="secondary" className={importanceInfo.color}>
                            {importanceInfo.label}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                        {item.content}
                      </p>
                      {item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-white/20 text-gray-400">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
                <Button 
                  onClick={() => setShowExtracted(false)}
                  variant="outline"
                  className="border-white/20 text-gray-300"
                >
                  取消
                </Button>
                <Button 
                  onClick={handleConfirmKnowledge}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-4 w-4 mr-2" />
                  添加到知识库
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 现有知识库 */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-white">当前知识库</CardTitle>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  {existingKnowledge.length} 个条目
                </Badge>
              </div>
              {existingKnowledge.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    onClick={loadExistingKnowledge}
                    variant="ghost" 
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleClearAll}
                    variant="ghost" 
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {existingKnowledge.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">知识库为空</p>
                <p className="text-sm text-gray-500">上传您的专业文档开始构建知识库</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {existingKnowledge.map((item) => {
                  const categoryInfo = categoryConfig[item.category];
                  const importanceInfo = importanceConfig[item.importance];
                  return (
                    <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{item.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={categoryInfo.color}>
                            {categoryInfo.label}
                          </Badge>
                          <Badge variant="secondary" className={importanceInfo.color}>
                            {importanceInfo.label}
                          </Badge>
                          <Button
                            onClick={() => handleDeleteKnowledge(item.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        {item.content}
                      </p>
                      {item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.keywords.slice(0, 5).map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-white/20 text-gray-400">
                              {keyword}
                            </Badge>
                          ))}
                          {item.keywords.length > 5 && (
                            <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                              +{item.keywords.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(item.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 统计信息 */}
        {existingKnowledge.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const count = existingKnowledge.filter(item => item.category === key).length;
              return (
                <Card key={key} className="bg-white/5 border-white/10">
                  <CardContent className="p-4 text-center">
                    <div className={`p-2 rounded-lg ${config.color} w-fit mx-auto mb-2`}>
                      <Brain className="h-4 w-4" />
                    </div>
                    <div className="text-xl font-bold text-white">{count}</div>
                    <div className="text-xs text-gray-400">{config.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 