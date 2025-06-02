
"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation'; // 修复导入语句
import { dialogues, type Dialogue } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';

interface DialogueCardProps {
  dialogue: Dialogue;
}

const DialogueCard = ({ dialogue }: DialogueCardProps) => {
  const IconComponent = dialogue.icon ? (LucideIcons[dialogue.icon as keyof typeof LucideIcons] as React.ElementType) : LucideIcons.MessageCircle;

  return (
    <Link href={`/dialogues/${dialogue.id}`} passHref>
      <Card className="pixel-border shadow-md hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            {IconComponent && <IconComponent size={32} className="text-accent" />}
            <CardTitle className="font-headline text-xl">{dialogue.title}</CardTitle>
          </div>
          <CardDescription className="h-16 overflow-hidden text-ellipsis">{dialogue.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">包含 {dialogue.lines.length} 条对话。</p>
        </CardContent>
        <CardFooter>
          <Button className="btn-pixel bg-primary text-primary-foreground hover:bg-primary/90 w-full">
             <LucideIcons.PlayCircle size={16} className="mr-2"/>开始练习
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};


export default function DialoguesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  // const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 font-headline text-lg">加载对话模块...</p>
      </div>
    );
  }

  // const filteredDialogues = dialogues.filter(dialogue =>
  //   dialogue.title.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-headline text-accent mb-2">情景对话</h1>
        <p className="text-lg text-muted-foreground">选择一个情景对话开始练习。</p>
      </section>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dialogues.map(dialogue => (
          <DialogueCard key={dialogue.id} dialogue={dialogue} />
        ))}
      </div>
      {dialogues.length === 0 && (
        <p className="text-center text-muted-foreground">目前没有可用的情景对话。请稍后再回来查看！</p>
      )}
    </div>
  );
}
