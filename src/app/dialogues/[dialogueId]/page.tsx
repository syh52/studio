"use client"; // Mark as client component for hooks like useParams, useRouter, useAuth

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { dialogues, type Dialogue as DialogueType, type DialogueLine } from '../../../lib/data';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { ArrowLeft, Volume2, MessageSquare } from 'lucide-react';
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
                            ? 'text-accent'  // Accent for officers
                            : 'text-primary'; // Primary for others

  return (
    <div className={`mb-4 p-3 rounded-md pixel-border ${index % 2 === 0 ? 'bg-card-foreground/5' : 'bg-card-foreground/10'}`}>
      <div className="flex justify-between items-center mb-1">
        <p className={`font-semibold ${speakerColorClass}`}>{line.speaker}</p>
        {line.audio && (
          <Button variant="ghost" size="icon" onClick={playAudio} className="w-7 h-7 text-accent hover:bg-accent/20">
            <Volume2 size={18} />
          </Button>
        )}
      </div>
      <p className="text-foreground/90">{line.english}</p>
      <p className="text-sm text-muted-foreground mt-1">{line.chinese}</p>
    </div>
  );
};

export default function DialoguePracticePage() {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ dialogueId: string }>();
  const dialogueId = params.dialogueId;

  const dialogue = useMemo(() => dialogues.find(d => d.id === dialogueId), [dialogueId]);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authIsLoading, router]);

  if (authIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 font-headline text-lg">加载认证状态...</p>
      </div>
    );
  }

  if (!isAuthenticated && !authIsLoading) {
    // Should be redirected by useEffect, but as a fallback:
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 font-headline text-lg">需要认证，正在跳转至登录...</p>
      </div>
    );
  }
  
  if (!dialogue) {
    return (
      <div className="text-center py-10">
        <MessageSquare size={48} className="mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-headline text-destructive mb-2">未找到对话</h1>
        <p className="text-muted-foreground mb-4">无法找到您请求的情景对话。</p>
        <Link href="/dialogues" passHref>
          <Button variant="outline" className="btn-pixel">
            <ArrowLeft size={16} className="mr-2" /> 返回对话列表
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <Card className="pixel-border shadow-lg">
        <CardHeader>
          <Link href="/dialogues" passHref>
            <Button variant="ghost" className="absolute top-4 left-4 text-accent hover:bg-accent/10 p-2 h-auto">
              <ArrowLeft size={20} /> <span className="ml-1 hidden sm:inline">返回列表</span>
            </Button>
          </Link>
          <CardTitle className="font-headline text-3xl text-accent text-center pt-8 sm:pt-2">{dialogue.title}</CardTitle>
          <CardDescription className="text-center">{dialogue.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {dialogue.lines.length > 0 ? (
            dialogue.lines.map((line, index) => (
              <DialogueLineDisplay key={line.id} line={line} index={index} />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">此对话中暂无内容。</p>
          )}
        </CardContent>
      </Card>
      <div className="text-center">
         <Link href="/dialogues" passHref>
          <Button variant="outline" className="btn-pixel">
            <ArrowLeft size={16} className="mr-2" /> 返回对话列表
          </Button>
        </Link>
      </div>
    </div>
  );
}
