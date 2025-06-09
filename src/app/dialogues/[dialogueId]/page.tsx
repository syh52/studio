
"use client"; // Mark as client component for hooks like useParams, useRouter, useAuth

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { type Dialogue as DialogueType, type DialogueLine } from '@/lib/data';
import { dialoguesApi } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Volume2, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';

const DialogueLineDisplay = ({ line, index }: { line: DialogueLine; index: number }) => {
  const playAudio = () => {
    // Mock audio playback
    alert(`正在播放音频: ${line.english}`);
    if (line.audio) {
      // const audio = new Audio(line.audio);
      // audio.play().catch(e => console.error("Error playing audio for line:", line.id, e));
    }
  };

  const speakerColorClass = line.speaker === 'Safety Officer' || line.speaker === 'Security Officer' 
                            ? 'text-blue-400'  // Blue for officers
                            : line.speaker === 'Captain' 
                            ? 'text-purple-400' // Purple for captain
                            : 'text-green-400'; // Green for others

  const speakerBgClass = line.speaker === 'Safety Officer' || line.speaker === 'Security Officer' 
                         ? 'bg-blue-500/10'  
                         : line.speaker === 'Captain' 
                         ? 'bg-purple-500/10' 
                         : 'bg-green-500/10';

  return (
    <div className={`p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${speakerBgClass} border border-white/10`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${speakerColorClass.replace('text-', 'bg-')}`}></div>
          <p className={`font-semibold ${speakerColorClass}`}>{line.speaker}</p>
        </div>
        {line.audio && (
          <Button variant="ghost" size="icon" onClick={playAudio} className={`w-8 h-8 ${speakerColorClass} hover:bg-white/10`}>
            <Volume2 size={18} />
          </Button>
        )}
      </div>
      <p className="text-white font-medium mb-2 leading-relaxed">{line.english}</p>
      <p className="text-gray-300 text-sm leading-relaxed">{line.chinese}</p>
    </div>
  );
};

export default function DialoguePracticePage() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ dialogueId: string }>();
  const dialogueId = params.dialogueId;

  const [dialogue, setDialogue] = useState<DialogueType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authIsLoading, router]);

  // 从Firestore获取对话数据
  useEffect(() => {
    const fetchDialogue = async () => {
      if (!isAuthenticated || !dialogueId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const fetchedDialogue = await dialoguesApi.getById(dialogueId);
        setDialogue(fetchedDialogue);
        console.log(`📖 从Firestore加载对话: ${fetchedDialogue?.title || '未找到'}`);
      } catch (error) {
        console.error('获取对话数据失败:', error);
        setError('获取对话数据失败，请刷新页面重试');
        setDialogue(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDialogue();
  }, [isAuthenticated, dialogueId]);

  if (authIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-white text-lg">加载认证状态...</p>
      </div>
    );
  }

  if (!isAuthenticated && !authIsLoading) {
    // Should be redirected by useEffect, but as a fallback:
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-white text-lg">需要认证，正在跳转至登录...</p>
      </div>
    );
  }

  if (isLoading) {
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
          <MessageSquare className="h-8 w-8 text-red-400" />
        </div>
        <p className="text-red-400 text-lg">{error}</p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            刷新页面
          </button>
          <Link href="/dialogues" passHref>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              <ArrowLeft size={16} className="mr-2" /> 返回对话列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (!dialogue) {
    return (
      <div className="text-center py-10">
        <MessageSquare size={48} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-2xl text-red-400 mb-2">未找到对话</h1>
        <p className="text-gray-400 mb-4">无法找到您请求的情景对话。可能是对话ID不正确或数据尚未迁移。</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            刷新页面
          </button>
          <Link href="/dialogues" passHref>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              <ArrowLeft size={16} className="mr-2" /> 返回对话列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
      {/* Header Section */}
      <div className="relative perspective-element transform transition-transform duration-200 ease-out animate-blur-in animate-delay-200">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-sm"></div>
        <div className="relative glass-card rounded-3xl p-6 sm:p-8">
          <Link href="/dialogues" passHref>
            <Button variant="ghost" className="absolute top-4 left-4 text-blue-400 hover:bg-blue-400/10 p-2 h-auto">
              <ArrowLeft size={20} /> <span className="ml-1 hidden sm:inline">返回列表</span>
            </Button>
          </Link>
          <div className="text-center pt-8 sm:pt-2">
            <div className="text-xs sm:text-sm font-medium text-blue-400 mb-3 tracking-wide uppercase">情景对话</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-inter font-semibold text-white mb-3 tracking-tight">{dialogue.title}</h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">{dialogue.description}</p>
            <div className="text-sm text-gray-400 mt-4">
              包含 <span className="font-medium text-blue-400">{dialogue.lines.length}</span> 条对话内容
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue Content */}
      <div className="relative perspective-element animate-blur-in animate-delay-400">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8">
          {dialogue.lines.length > 0 ? (
            <div className="space-y-4">
              {dialogue.lines.map((line, index) => (
                <DialogueLineDisplay key={line.id} line={line} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-center">此对话中暂无内容。</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="text-center">
         <Link href="/dialogues" passHref>
          <Button variant="outline" className="text-white border-white hover:bg-white/10">
            <ArrowLeft size={16} className="mr-2" /> 返回对话列表
          </Button>
        </Link>
      </div>
    </div>
  );
}
