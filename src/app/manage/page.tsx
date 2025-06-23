'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useToast } from '../../hooks/use-toast'
import { 
  getPublicDialogues, 
  getPublicVocabularyPacks, 
  deletePublicDialogue, 
  deletePublicVocabularyPack,
  updatePublicDialogue,
  updatePublicVocabularyPack
} from '../../lib/firestore-service';
import { VocabularyPack, Dialogue } from '../../lib/data'
import { Upload, Search, FileText, Book, Shield } from 'lucide-react';

// 导入新创建的组件
import DialogueManagement from '../../components/manage/DialogueManagement'
import VocabularyManagement from '../../components/manage/VocabularyManagement'
import EditDialogueDialog from '../../components/manage/EditDialogueDialog'
import EditVocabularyDialog from '../../components/manage/EditVocabularyDialog'
import { AdminKeyManagement } from '../../components/admin/AdminKeyManagement'
import { ProtectedFeature } from '../../components/admin/ProtectedFeature'
import { getCachedAdminPermissions, hasPermission } from '../../lib/admin-auth'

export default function ManagePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [dataLoading, setDataLoading] = useState(true);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [vocabularyPacks, setVocabularyPacks] = useState<VocabularyPack[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dialogues');

  // 处理URL参数来设置默认标签页
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab && ['dialogues', 'vocabulary', 'admin'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);
  
  // 编辑状态
  const [editingDialogue, setEditingDialogue] = useState<Dialogue | null>(null);
  const [editingVocabulary, setEditingVocabulary] = useState<VocabularyPack | null>(null);
  
  // 加载公共数据
  const loadData = useCallback(async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      const [dialoguesData, vocabularyData] = await Promise.all([
        getPublicDialogues(),
        getPublicVocabularyPacks()
      ]);
      
      setDialogues(dialoguesData);
      setVocabularyPacks(vocabularyData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载公共学习资料",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  }, [user, toast]);
  
  // 认证检查（移除权限检查）
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
        <p className="font-inter text-xl text-white">加载中...</p>
      </div>
    );
  }

  // 未认证时返回null（重定向已经在useEffect中处理）
  if (!isAuthenticated || !user) {
    return null;
  }
  
  // 删除公共对话
  const handleDeleteDialogue = async (dialogueId: string) => {
    if (!user) return;
    
    try {
      await deletePublicDialogue(dialogueId);
      setDialogues(prev => prev.filter(d => d.id !== dialogueId));
      toast({
        title: "删除成功",
        description: "公共对话已删除",
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除公共对话",
        variant: "destructive"
      });
    }
  };
  
  // 删除公共词汇包
  const handleDeleteVocabulary = async (packId: string) => {
    if (!user) return;
    
    try {
      await deletePublicVocabularyPack(packId);
      setVocabularyPacks(prev => prev.filter(p => p.id !== packId));
      toast({
        title: "删除成功",
        description: "公共词汇包已删除",
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除公共词汇包",
        variant: "destructive"
      });
    }
  };
  
  // 更新公共对话
  const handleUpdateDialogue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingDialogue) return;
    
    try {
      await updatePublicDialogue(editingDialogue.id, {
        title: editingDialogue.title,
        description: editingDialogue.description,
        lines: editingDialogue.lines
      }, user.id);
      
      setDialogues(prev => prev.map(d => 
        d.id === editingDialogue.id ? editingDialogue : d
      ));
      
      setEditingDialogue(null);
      toast({
        title: "更新成功",
        description: "公共对话已更新",
      });
    } catch (error) {
      toast({
        title: "更新失败",
        description: "无法更新公共对话",
        variant: "destructive"
      });
    }
  };
  
  // 更新公共词汇包
  const handleUpdateVocabulary = async () => {
    if (!user || !editingVocabulary) return;
    
    try {
      await updatePublicVocabularyPack(editingVocabulary.id, {
        name: editingVocabulary.name,
        description: editingVocabulary.description,
        items: editingVocabulary.items
      }, user.id);
      
      setVocabularyPacks(prev => prev.map(p => 
        p.id === editingVocabulary.id ? editingVocabulary : p
      ));
      
      setEditingVocabulary(null);
      toast({
        title: "更新成功",
        description: "公共词汇包已更新",
      });
    } catch (error) {
      toast({
        title: "更新失败",
        description: "无法更新公共词汇包",
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-inter font-semibold text-white tracking-tight">管理公共学习资料</h1>
            <div className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
              需要管理员权限
            </div>
          </div>
          <p className="text-gray-400 leading-relaxed">
            查看、编辑和管理社区共享的对话和词汇内容
          </p>
        </div>
      </div>
      
      {/* Protected Management Interface */}
      <ProtectedFeature
        requiredPermission="canAccessUpload"
        title="管理员验证"
        description="请输入管理员密钥以访问管理功能"
        fallbackTitle="管理功能需要管理员权限"
        fallbackDescription={
          <div className="space-y-4">
            <p>管理功能允许查看、编辑和删除公共学习资料，包括对话场景和词汇包。还可以管理系统密钥和用户权限。</p>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <h4 className="text-purple-400 font-medium mb-2">🔐 需要获取管理员密钥？</h4>
              <p className="text-gray-300 text-sm">
                如果您需要管理员权限，请联系 <span className="font-medium text-purple-400">沈亦航</span> 获取有效的管理员密钥。
              </p>
              <p className="text-gray-400 text-xs mt-2">
                请注意：管理员功能涉及系统核心内容，仅限授权人员使用。
              </p>
            </div>
          </div>
        }
      >
        {/* Upload Button */}
        <div className="mb-6 flex justify-end animate-blur-in animate-delay-300">
          <Button 
            onClick={() => router.push('/upload')} 
            className="gradient-primary text-white hover:scale-105 transition-all duration-200 modern-focus"
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
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border-b border-white/10">
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
              <TabsTrigger 
                value="admin" 
                className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-purple-500/20 transition-all duration-200"
              >
                <Shield className="h-4 w-4" />
                密钥管理
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

            <TabsContent value="admin" className="mt-6">
              <ProtectedFeature
                requiredPermission="canManageKeys"
                title="超级管理员验证"
                description="密钥管理需要超级管理员权限，请输入超级管理员密钥"
                fallbackTitle="密钥管理需要更高权限"
                fallbackDescription={
                  <div className="space-y-4">
                    <p>密钥管理功能包括生成、查看、禁用管理员密钥等核心权限操作。</p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <h4 className="text-red-400 font-medium mb-2">⚠️ 超级管理员权限</h4>
                      <p className="text-gray-300 text-sm">
                        此功能需要超级管理员密钥。请联系 <span className="font-medium text-red-400">沈亦航</span> 获取最高权限密钥。
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        注意：密钥管理涉及系统安全核心，仅限最高权限用户操作。
                      </p>
                    </div>
                  </div>
                }
              >
                <div className="space-y-6">
                  {/* 页面标题 */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-inter font-bold text-white mb-2">
                      管理员密钥管理
                    </h2>
                    <p className="text-gray-400">
                      生成、管理和监控所有管理员密钥的使用情况
                    </p>
                  </div>

                  {/* 管理界面 */}
                  <AdminKeyManagement />
                </div>
              </ProtectedFeature>
            </TabsContent>
          </Tabs>
        </div>
      </ProtectedFeature>
      
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