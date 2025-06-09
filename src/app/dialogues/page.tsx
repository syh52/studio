
"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { type Dialogue } from '@/lib/data';
import { dialoguesApi } from '@/lib/firebase/firestore';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';

interface DialogueCardProps {
  dialogue: Dialogue;
}

const DialogueCard = ({ dialogue }: DialogueCardProps) => {
  const IconComponent = dialogue.icon ? (LucideIcons[dialogue.icon as keyof typeof LucideIcons] as React.ElementType) : LucideIcons.MessageCircle;

  return (
    <Link href={`/dialogues/${dialogue.id}`} passHref>
      <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 perspective-element transform transition-all duration-200 ease-out hover:scale-105 cursor-pointer active:scale-95 btn-enhanced h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
            {IconComponent && <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-400" />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-inter font-semibold text-white mb-1 tracking-tight">{dialogue.title}</h3>
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed flex-grow">
          {dialogue.description}
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            包含 <span className="font-medium text-blue-400">{dialogue.lines.length}</span> 条对话。
          </p>
          <button className="w-full gradient-primary text-white py-3 px-4 rounded-xl text-sm font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2">
            <LucideIcons.PlayCircle className="h-4 w-4" />
            开始练习
          </button>
        </div>
      </div>
    </Link>
  );
};


export default function DialoguesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [dialoguesLoading, setDialoguesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 从Firestore获取对话数据
  useEffect(() => {
    const fetchDialogues = async () => {
      if (!isAuthenticated) return;
      
      try {
        setDialoguesLoading(true);
        const fetchedDialogues = await dialoguesApi.getAll();
        setDialogues(fetchedDialogues);
        setError(null);
        console.log(`📊 从Firestore加载了 ${fetchedDialogues.length} 个对话`);
      } catch (error) {
        console.error('获取对话数据失败:', error);
        setError('获取对话数据失败，请刷新页面重试');
      } finally {
        setDialoguesLoading(false);
      }
    };

    fetchDialogues();
  }, [isAuthenticated, lastRefresh]);

  // 手动刷新数据
  const handleRefresh = () => {
    console.log('🔄 手动刷新对话数据...');
    setLastRefresh(Date.now());
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-white text-lg">加载对话模块...</p>
      </div>
    );
  }

  if (dialoguesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-white text-lg">从Cloud Firestore加载对话数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] space-y-4">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <LucideIcons.AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <p className="text-red-400 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          刷新页面
        </button>
      </div>
    );
  }

  // const filteredDialogues = dialogues.filter(dialogue =>
  //   dialogue.title.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10 py-4 sm:py-6">
      {/* Header Section */}
      <div className="relative perspective-element transform transition-transform duration-200 ease-out animate-blur-in animate-delay-200">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-sm"></div>
        <div className="relative glass-card rounded-3xl p-6 sm:p-8 md:p-10">
          <div className="text-center">
            <div className="text-xs sm:text-sm font-medium text-purple-400 mb-3 sm:mb-4 tracking-wide uppercase">练习中心</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-inter font-semibold text-white mb-3 sm:mb-4 tracking-tight">情景对话</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">选择一个情景对话开始练习。</p>
            
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-sm text-gray-400">
                当前显示 {dialogues.length} 个对话
              </div>
              <button
                onClick={handleRefresh}
                disabled={dialoguesLoading}
                className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                <LucideIcons.RefreshCw className={`h-4 w-4 ${dialoguesLoading ? 'animate-spin' : ''}`} />
                刷新数据
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search bar - future enhancement */}
      {/* 
      <div className="relative w-full max-w-lg mx-auto">
        <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="搜索对话..." 
          className="pl-10 input-pixel"
          // onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div> 
      */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 animate-blur-in animate-delay-400">
        {dialogues.map(dialogue => (
          <DialogueCard key={dialogue.id} dialogue={dialogue} />
        ))}
      </div>
      {dialogues.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <LucideIcons.MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm sm:text-base">目前没有可用的情景对话。请稍后再回来查看！</p>
        </div>
      )}
    </div>
  );
}
