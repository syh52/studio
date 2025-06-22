'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useToast } from '../../hooks/use-toast'
import { 
  getCustomDialogues, 
  getCustomVocabularyPacks, 
  deleteCustomDialogue, 
  deleteCustomVocabularyPack,
  updateCustomDialogue,
  updateCustomVocabularyPack
} from '../../lib/firestore-service';
import { VocabularyPack, Dialogue } from '../../lib/data'
import { Upload, Search, FileText, Book } from 'lucide-react';

// 导入新创建的组件
import DialogueManagement from '../../components/manage/DialogueManagement'
import VocabularyManagement from '../../components/manage/VocabularyManagement'
import EditDialogueDialog from '../../components/manage/EditDialogueDialog'
import EditVocabularyDialog from '../../components/manage/EditVocabularyDialog'

export default function ManagePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [dataLoading, setDataLoading] = useState(true);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [vocabularyPacks, setVocabularyPacks] = useState<VocabularyPack[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dialogues');
  
  // 编辑状态
  const [editingDialogue, setEditingDialogue] = useState<Dialogue | null>(null);
  const [editingVocabulary, setEditingVocabulary] = useState<VocabularyPack | null>(null);
  
  // 加载数据
  const loadData = useCallback(async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      const [dialoguesData, vocabularyData] = await Promise.all([
        getCustomDialogues(user.id),
        getCustomVocabularyPacks(user.id)
      ]);
      
      setDialogues(dialoguesData);
      setVocabularyPacks(vocabularyData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载您的学习资料",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  }, [user, toast]);
  
  // 认证检查
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!isLoading && isAuthenticated && user) {
      loadData();
    }
  }, [isLoading, isAuthenticated, user, router, loadData]);
  
  // 显示加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-inter text-xl text-white">验证身份中...</p>
      </div>
    );
  }

  // 未认证时返回null（重定向已经在useEffect中处理）
  if (!isAuthenticated || !user) {
    return null;
  }
  
  // 删除对话
  const handleDeleteDialogue = async (dialogueId: string) => {
    if (!user) return;
    
    try {
      await deleteCustomDialogue(user.id, dialogueId);
      setDialogues(prev => prev.filter(d => d.id !== dialogueId));
      toast({
        title: "删除成功",
        description: "对话已从云端删除",
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除对话",
        variant: "destructive"
      });
    }
  };
  
  // 删除词汇包
  const handleDeleteVocabulary = async (packId: string) => {
    if (!user) return;
    
    try {
      await deleteCustomVocabularyPack(user.id, packId);
      setVocabularyPacks(prev => prev.filter(p => p.id !== packId));
      toast({
        title: "删除成功",
        description: "词汇包已从云端删除",
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除词汇包",
        variant: "destructive"
      });
    }
  };
  
  // 更新对话
  const handleUpdateDialogue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingDialogue) return;
    
    try {
      await updateCustomDialogue(user.id, editingDialogue.id, {
        title: editingDialogue.title,
        description: editingDialogue.description,
        lines: editingDialogue.lines
      });
      
      setDialogues(prev => prev.map(d => 
        d.id === editingDialogue.id ? editingDialogue : d
      ));
      
      setEditingDialogue(null);
      toast({
        title: "更新成功",
        description: "对话已更新",
      });
    } catch (error) {
      toast({
        title: "更新失败",
        description: "无法更新对话",
        variant: "destructive"
      });
    }
  };
  
  // 更新词汇包
  const handleUpdateVocabulary = async () => {
    if (!user || !editingVocabulary) return;
    
    try {
      await updateCustomVocabularyPack(user.id, editingVocabulary.id, {
        name: editingVocabulary.name,
        description: editingVocabulary.description,
        items: editingVocabulary.items
      });
      
      setVocabularyPacks(prev => prev.map(p => 
        p.id === editingVocabulary.id ? editingVocabulary : p
      ));
      
      setEditingVocabulary(null);
      toast({
        title: "更新成功",
        description: "词汇包已更新",
      });
    } catch (error) {
      toast({
        title: "更新失败",
        description: "无法更新词汇包",
        variant: "destructive"
      });
    }
  };
  
  // 过滤数据
  const filteredDialogues = dialogues.filter(dialogue =>
    dialogue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dialogue.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredVocabularyPacks = vocabularyPacks.filter(pack =>
    pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6 sm:space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8 animate-blur-in animate-delay-200">
        <div>
          <h1 className="text-3xl font-inter font-semibold text-white tracking-tight">管理学习资料</h1>
          <p className="text-gray-400 mt-2 leading-relaxed">
            查看、编辑和删除您上传的对话和词汇
          </p>
        </div>
        <Button 
          onClick={() => router.push('/upload')} 
          className="gradient-primary text-white hover:scale-105 transition-all duration-200 modern-focus animate-blur-in animate-delay-300"
        >
          <Upload className="h-4 w-4 mr-2" />
          上传新内容
        </Button>
      </div>
      
      {/* 搜索框 */}
      <div className="mb-6 relative animate-blur-in animate-delay-400">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="搜索对话或词汇..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 glass-card border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 transition-all duration-200 modern-focus"
        />
      </div>
      
      {/* 主要内容 */}
      <div className="glass-card-strong rounded-2xl overflow-hidden animate-blur-in animate-delay-500">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border-b border-white/10">
            <TabsTrigger 
              value="dialogues" 
              className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-500/20 transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              对话管理 ({filteredDialogues.length})
            </TabsTrigger>
            <TabsTrigger 
              value="vocabulary" 
              className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-500/20 transition-all duration-200"
            >
              <Book className="h-4 w-4" />
              词汇管理 ({filteredVocabularyPacks.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dialogues" className="mt-6">
            <DialogueManagement
              dialogues={filteredDialogues}
              dataLoading={dataLoading}
              searchTerm={searchTerm}
              onEdit={setEditingDialogue}
              onDelete={handleDeleteDialogue}
            />
          </TabsContent>
          
          <TabsContent value="vocabulary" className="mt-6">
            <VocabularyManagement
              vocabularyPacks={filteredVocabularyPacks}
              dataLoading={dataLoading}
              searchTerm={searchTerm}
              onEdit={setEditingVocabulary}
              onDelete={handleDeleteVocabulary}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 编辑对话框 */}
      <EditDialogueDialog
        dialogue={editingDialogue}
        onUpdate={setEditingDialogue}
        onClose={() => setEditingDialogue(null)}
        onSave={handleUpdateDialogue}
      />
      
      {/* 编辑词汇包对话框 */}
      <EditVocabularyDialog
        vocabulary={editingVocabulary}
        onUpdate={setEditingVocabulary}
        onClose={() => setEditingVocabulary(null)}
        onSave={handleUpdateVocabulary}
        toast={toast}
      />
    </div>
  );
}