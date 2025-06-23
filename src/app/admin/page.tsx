"use client";
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { PlusCircle, Edit3, Trash2, Settings, ShieldAlert, Home } from 'lucide-react';
import Link from 'next/link';

// Placeholder data - in a real admin panel, this would come from a database via API
const placeholderVocabularyPacks = [
  { id: 'vp1', name: '飞行基础与客舱安全', items: 35, lastModified: '2024-07-28' },
  { id: 'vp2', name: '安保操作与应急处理', items: 47, lastModified: '2024-07-28' },
];

const placeholderDialogues = [
  { id: 'd1', title: '打架斗殴', lines: 6, lastModified: '2024-07-29' },
  { id: 'd2', title: '旅客吸烟事件处置', lines: 6, lastModified: '2024-07-29' },
  { id: 'd3', title: '擅自使用充电宝', lines: 6, lastModified: '2024-07-29' },
  { id: 'd4', title: '机组协同', lines: 6, lastModified: '2024-07-29' },
];

export default function AdminPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    // 备注：未来可以根据用户角色进行更细致的权限控制，例如：
    // if (!isLoading && isAuthenticated && user && !user.isAdmin) { // 假设User对象有isAdmin属性
    //   toast({ title: "权限不足", description: "您没有权限访问此页面。", variant: "destructive" });
    //   router.push('/'); 
    // }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-inter text-xl text-white">加载管理后台...</p>
      </div>
    );
  }

  const handleAction = (action: string, type: string, id: string) => {
    alert(`操作: ${action} ${type} (ID: ${id})\n此功能需要连接后端数据库才能实际修改数据。`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10 py-4 sm:py-6">
      {/* Header Section */}
      <div className="relative perspective-element transform transition-transform duration-200 ease-out animate-blur-in animate-delay-200">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl blur-sm"></div>
        <div className="relative glass-card rounded-3xl p-6 sm:p-8 md:p-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-orange-400 mb-3 sm:mb-4 tracking-wide uppercase">系统管理</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-inter font-semibold text-white mb-3 sm:mb-4 tracking-tight">管理后台</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">管理 Lexicon 应用的词汇包和情景对话内容</p>
          </div>
        </div>
      </div>

      {/* 功能提示 */}
      <div className="glass-card-strong rounded-2xl p-4 sm:p-6 border border-orange-500/30 animate-blur-in animate-delay-300">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <ShieldAlert className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-300 text-sm sm:text-base mb-2">功能提示</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              这是一个管理界面的原型。当前的添加、编辑和删除操作仅为界面展示，
              <strong className="text-orange-400">实际数据修改功能尚未连接后端数据库。</strong>
              如需真实修改数据，请直接编辑 <code className="bg-gray-800/50 px-1 py-0.5 rounded text-orange-300">src/lib/data.ts</code> 文件。
            </p>
          </div>
        </div>
      </div>

      {/* 词汇包管理 */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 animate-blur-in animate-delay-400">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-inter font-semibold text-white tracking-tight">词汇包管理</h2>
          <Button 
            onClick={() => handleAction('添加', '词汇包', 'new')}
            className="gradient-primary text-white hover:scale-105 transition-all duration-200 modern-focus flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">添加新词汇包</span>
            <span className="sm:hidden">添加词汇包</span>
          </Button>
        </div>

        {/* 移动端卡片列表 */}
        <div className="sm:hidden space-y-3">
          {placeholderVocabularyPacks.map((pack) => (
            <div key={pack.id} className="glass-card-strong rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-white text-sm">{pack.name}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction('编辑', '词汇包', pack.id)}
                    className="w-8 h-8 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                    title="编辑词汇包"
                  >
                    <Edit3 className="h-4 w-4 text-purple-400" />
                  </button>
                  <button 
                    onClick={() => handleAction('删除', '词汇包', pack.id)}
                    className="w-8 h-8 glass-card rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                    title="删除词汇包"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{pack.items} 个词条</span>
                <span>{pack.lastModified}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 桌面端表格 */}
        <div className="hidden sm:block glass-card-strong rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-gray-300">名称</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-300">词条数</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">最后修改</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-300">操作</th>
                </tr>
              </thead>
              <tbody>
                {placeholderVocabularyPacks.map((pack) => (
                  <tr key={pack.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{pack.name}</td>
                    <td className="p-4 text-center text-gray-300">{pack.items}</td>
                    <td className="p-4 text-gray-300">{pack.lastModified}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction('编辑', '词汇包', pack.id)}
                          className="w-8 h-8 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                          title="编辑词汇包"
                        >
                          <Edit3 className="h-4 w-4 text-purple-400" />
                        </button>
                        <button 
                          onClick={() => handleAction('删除', '词汇包', pack.id)}
                          className="w-8 h-8 glass-card rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                          title="删除词汇包"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 情景对话管理 */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 animate-blur-in animate-delay-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-inter font-semibold text-white tracking-tight">情景对话管理</h2>
          <Button 
            onClick={() => handleAction('添加', '对话', 'new')}
            className="gradient-primary text-white hover:scale-105 transition-all duration-200 modern-focus flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">添加新对话</span>
            <span className="sm:hidden">添加对话</span>
          </Button>
        </div>

        {/* 移动端卡片列表 */}
        <div className="sm:hidden space-y-3">
          {placeholderDialogues.map((dialogue) => (
            <div key={dialogue.id} className="glass-card-strong rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-white text-sm">{dialogue.title}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction('编辑', '对话', dialogue.id)}
                    className="w-8 h-8 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                    title="编辑对话"
                  >
                    <Edit3 className="h-4 w-4 text-purple-400" />
                  </button>
                  <button 
                    onClick={() => handleAction('删除', '对话', dialogue.id)}
                    className="w-8 h-8 glass-card rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                    title="删除对话"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{dialogue.lines} 对话行</span>
                <span>{dialogue.lastModified}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 桌面端表格 */}
        <div className="hidden sm:block glass-card-strong rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-gray-300">标题</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-300">对话行数</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-300">最后修改</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-300">操作</th>
                </tr>
              </thead>
              <tbody>
                {placeholderDialogues.map((dialogue) => (
                  <tr key={dialogue.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{dialogue.title}</td>
                    <td className="p-4 text-center text-gray-300">{dialogue.lines}</td>
                    <td className="p-4 text-gray-300">{dialogue.lastModified}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction('编辑', '对话', dialogue.id)}
                          className="w-8 h-8 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                          title="编辑对话"
                        >
                          <Edit3 className="h-4 w-4 text-purple-400" />
                        </button>
                        <button 
                          onClick={() => handleAction('删除', '对话', dialogue.id)}
                          className="w-8 h-8 glass-card rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                          title="删除对话"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 返回按钮 */}
      <div className="text-center animate-blur-in animate-delay-600">
        <Link href="/" passHref>
          <Button 
            variant="outline" 
            className="glass-card-strong border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
          >
            <Home className="h-4 w-4" />
            返回主页
          </Button>
        </Link>
      </div>
    </div>
  );
}

    