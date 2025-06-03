
"use client";
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { vocabularyPacks, type VocabularyItem } from '@/lib/data';
import Flashcard from '@/components/vocabulary/Flashcard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Progress } from "@/components/ui/progress";

export default function FlashcardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ packId: string }>();
  const packId = params.packId;

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [shuffledItems, setShuffledItems] = useState<VocabularyItem[]>([]);
  const [isLoadingPack, setIsLoadingPack] = useState(true);

  const pack = useMemo(() => vocabularyPacks.find(p => p.id === packId), [packId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (pack) {
      // Shuffle items once when pack loads
      setShuffledItems([...pack.items].sort(() => Math.random() - 0.5));
      setIsLoadingPack(false);
    } else if (!authLoading && packId) { // If pack not found and not loading auth
        // router.push('/vocabulary'); // Or show a 404 like message
        setIsLoadingPack(false); // Stop loading, pack is not found
    }
  }, [pack, packId, authLoading, router]);


  if (authLoading || isLoadingPack) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-headline text-destructive">未找到词汇包</h1>
        <p className="text-muted-foreground">无法找到所请求的词汇包。</p>
        <Link href="/vocabulary" passHref>
          <Button variant="link" className="text-accent mt-4">返回词汇包列表</Button>
        </Link>
      </div>
    );
  }
  
  if (shuffledItems.length === 0) {
     return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-headline text-accent">{pack.name}</h1>
        <p className="text-muted-foreground">此词汇包中还没有词条。</p>
         <Link href={`/vocabulary/${pack.id}/quiz`} passHref>
          <Button variant="outline" className="btn-pixel mt-4 mr-2 border-accent text-accent hover:bg-accent/10">参加测验</Button>
        </Link>
        <Link href="/vocabulary" passHref>
          <Button variant="link" className="text-accent mt-4">返回词汇包</Button>
        </Link>
      </div>
    );
  }

  const currentItem = shuffledItems[currentCardIndex];

  const goToNextCard = () => {
    setCurrentCardIndex(prev => (prev + 1) % shuffledItems.length);
  };

  const goToPreviousCard = () => {
    setCurrentCardIndex(prev => (prev - 1 + shuffledItems.length) % shuffledItems.length);
  };

  const restartPack = () => {
    setShuffledItems([...pack.items].sort(() => Math.random() - 0.5));
    setCurrentCardIndex(0);
  }

  const progressPercentage = ((currentCardIndex + 1) / shuffledItems.length) * 100;

  return (
    <div className="flex flex-col items-center space-y-6 py-6">
      <h1 className="text-3xl font-headline text-accent text-center">{pack.name}</h1>
      <p className="text-muted-foreground">卡片 {currentCardIndex + 1} / {shuffledItems.length}</p>
      
      <Progress value={progressPercentage} className="w-full max-w-md pixel-border h-3" />

      {currentItem && <Flashcard item={currentItem} />}
      
      <div className="flex items-center justify-center space-x-4 mt-6 w-full max-w-md">
        <Button onClick={goToPreviousCard} className="btn-pixel" aria-label="Previous card">
          <ChevronLeft size={24} /> 上一个
        </Button>
        <Button onClick={restartPack} variant="outline" className="btn-pixel" aria-label="Restart pack">
          <RotateCcw size={20} /> 重置
        </Button>
        <Button onClick={goToNextCard} className="btn-pixel" aria-label="Next card">
          下一个 <ChevronRight size={24} />
        </Button>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
        <Link href={`/vocabulary/${packId}/quiz`} passHref>
          <Button className="btn-pixel bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
            <CheckCircle2 size={20} className="mr-2" />
            学完了？参加测验！
          </Button>
        </Link>
        <Link href="/vocabulary" passHref>
          <Button variant="link" className="text-accent">返回词汇包列表</Button>
        </Link>
      </div>
    </div>
  );
}
