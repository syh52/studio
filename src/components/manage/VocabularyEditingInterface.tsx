'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { VocabularyPack } from '../../lib/data'
import { 
  Search, 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Play
} from 'lucide-react';

interface VocabularyEditingInterfaceProps {
  vocabulary: VocabularyPack;
  onUpdate: (vocab: VocabularyPack) => void;
  toast: any;
}

export default function VocabularyEditingInterface({ 
  vocabulary, 
  onUpdate, 
  toast 
}: VocabularyEditingInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const itemsPerPage = 10;

  // 过滤和分页逻辑
  const filteredItems = vocabulary.items.filter(item =>
    item.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.chinese.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.exampleSentenceEn && item.exampleSentenceEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.exampleSentenceZh && item.exampleSentenceZh.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // 更新单个词汇项
  const updateItem = (index: number, updatedItem: any) => {
    const actualIndex = vocabulary.items.findIndex(item => 
      item.id === paginatedItems[index].id
    );
    const newItems = [...vocabulary.items];
    newItems[actualIndex] = updatedItem;
    onUpdate({ ...vocabulary, items: newItems });
  };

  // 删除词汇项
  const deleteItem = (index: number) => {
    const itemToDelete = paginatedItems[index];
    const newItems = vocabulary.items.filter(item => item.id !== itemToDelete.id);
    onUpdate({ ...vocabulary, items: newItems });
    setEditingIndex(null);
    toast({
      title: "删除成功",
      description: "单词已删除",
    });
  };

  // 添加新词汇
  const addNewWord = () => {
    const newItem = {
      id: `new-word-${Date.now()}`,
      english: '',
      chinese: '',
      exampleSentenceEn: '',
      exampleSentenceZh: '',
      pronunciationAudio: ''
    };
    const newItems = [...vocabulary.items, newItem];
    onUpdate({ ...vocabulary, items: newItems });
    setCurrentPage(Math.ceil(newItems.length / itemsPerPage)); // 跳转到最后一页
    setTimeout(() => setEditingIndex(newItems.length - 1), 100);
  };

  // 生成更好的例句
  const generateExampleSentences = (item: any) => {
    const englishExamples = [
      `${item.english} is essential for aviation safety.`,
      `Please check the ${item.english} before departure.`,
      `The crew will handle ${item.english} procedures.`,
      `We need to monitor ${item.english} carefully.`
    ];
    
    const chineseExamples = [
      `${item.chinese}对飞行安全很重要。`,
      `请在起飞前检查${item.chinese}。`,
      `机组人员将处理${item.chinese}程序。`,
      `我们需要仔细监控${item.chinese}。`
    ];

    return {
      exampleSentenceEn: englishExamples[Math.floor(Math.random() * englishExamples.length)],
      exampleSentenceZh: chineseExamples[Math.floor(Math.random() * chineseExamples.length)]
    };
  };

  // 批量生成例句
  const batchGenerateExamples = () => {
    const newItems = vocabulary.items.map(item => {
      if (!item.exampleSentenceEn || !item.exampleSentenceZh) {
        const examples = generateExampleSentences(item);
        return {
          ...item,
          exampleSentenceEn: item.exampleSentenceEn || examples.exampleSentenceEn,
          exampleSentenceZh: item.exampleSentenceZh || examples.exampleSentenceZh
        };
      }
      return item;
    });
    
    onUpdate({ ...vocabulary, items: newItems });
    toast({
      title: "批量生成完成",
      description: "已为缺少例句的单词生成例句",
    });
  };

  return (
    <div className="space-y-6">
      {/* 搜索和操作栏 */}
      <div className="glass-card bg-white/5 border-white/20 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索单词、中文或例句..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // 重置到第一页
              }}
              className="pl-9 glass-card border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 modern-focus transition-all duration-200"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={batchGenerateExamples}
              className="glass-card border-green-500/30 text-green-400 hover:bg-green-500/10 hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              生成例句
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={addNewWord}
              className="glass-card border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加单词
            </Button>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-400">
            找到 {filteredItems.length} 个匹配的单词
          </div>
        )}
      </div>

      {/* 词汇列表 */}
      <div className="space-y-3">
        {paginatedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm ? '没有找到匹配的单词' : '该词汇包是空的'}
          </div>
        ) : (
          paginatedItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const isEditing = editingIndex === actualIndex;
            
            return (
              <div 
                key={item.id} 
                className="glass-card bg-white/5 border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 animate-blur-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isEditing ? (
                  // 编辑模式
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white text-sm font-medium">英文</Label>
                        <Input
                          value={item.english}
                          onChange={(e) => updateItem(index, { ...item, english: e.target.value })}
                          placeholder="输入英文单词"
                          className="glass-card border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 modern-focus transition-all duration-200"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm font-medium">中文</Label>
                        <Input
                          value={item.chinese}
                          onChange={(e) => updateItem(index, { ...item, chinese: e.target.value })}
                          placeholder="输入中文释义"
                          className="glass-card border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 modern-focus transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-white text-sm font-medium">英文例句</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (item.english) {
                                const examples = generateExampleSentences(item);
                                updateItem(index, { ...item, exampleSentenceEn: examples.exampleSentenceEn });
                              }
                            }}
                            className="glass-card border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs px-2 py-1 hover:scale-105 transition-all duration-200"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            生成
                          </Button>
                        </div>
                        <Textarea
                          value={item.exampleSentenceEn || ''}
                          onChange={(e) => updateItem(index, { ...item, exampleSentenceEn: e.target.value })}
                          placeholder="输入英文例句"
                          className="glass-card border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 modern-focus transition-all duration-200"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-white text-sm font-medium">中文例句</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (item.chinese) {
                                const examples = generateExampleSentences(item);
                                updateItem(index, { ...item, exampleSentenceZh: examples.exampleSentenceZh });
                              }
                            }}
                            className="glass-card border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs px-2 py-1 hover:scale-105 transition-all duration-200"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            生成
                          </Button>
                        </div>
                        <Textarea
                          value={item.exampleSentenceZh || ''}
                          onChange={(e) => updateItem(index, { ...item, exampleSentenceZh: e.target.value })}
                          placeholder="输入中文例句"
                          className="glass-card border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 modern-focus transition-all duration-200"
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIndex(null)}
                        className="glass-card border-gray-500/30 text-gray-400 hover:bg-gray-500/10 transition-all duration-200"
                      >
                        取消
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIndex(null)}
                        className="glass-card border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all duration-200"
                      >
                        保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 显示模式
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="font-medium text-white text-lg font-inter">{item.english}</div>
                        <div className="text-gray-400">{item.chinese}</div>
                        {item.pronunciationAudio && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              try {
                                const audio = new Audio(item.pronunciationAudio);
                                audio.play().catch(console.error);
                              } catch (error) {
                                toast({
                                  title: "播放失败",
                                  description: "无法播放音频文件",
                                  variant: "destructive"
                                });
                              }
                            }}
                            className="h-8 w-8 p-0 hover:bg-white/10 text-blue-400 transition-all duration-200"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingIndex(actualIndex)}
                          className="glass-card border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 modern-focus"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteItem(index)}
                          className="glass-card border-red-500/30 text-red-400 hover:bg-red-500/10 hover:scale-105 transition-all duration-200 modern-focus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {(item.exampleSentenceEn || item.exampleSentenceZh) && (
                      <div className="space-y-2 text-sm">
                        {item.exampleSentenceEn && (
                          <div className="text-gray-300">
                            <span className="text-gray-500">英文：</span>{item.exampleSentenceEn}
                          </div>
                        )}
                        {item.exampleSentenceZh && (
                          <div className="text-gray-300">
                            <span className="text-gray-500">中文：</span>{item.exampleSentenceZh}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 glass-card bg-white/5 border-white/20 rounded-xl p-4">
          <div className="text-sm text-gray-400">
            显示 {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredItems.length)} / 共 {filteredItems.length} 个单词
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="glass-card border-white/30 text-white hover:bg-white/10 disabled:opacity-50 transition-all duration-200"
            >
              上一页
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={
                      currentPage === pageNum 
                        ? "gradient-primary text-white" 
                        : "glass-card border-white/30 text-white hover:bg-white/10"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="glass-card border-white/30 text-white hover:bg-white/10 disabled:opacity-50 transition-all duration-200"
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 