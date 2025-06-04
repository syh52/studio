
"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { vocabularyPacks, type VocabularyItem } from '@/lib/data';
import Flashcard from '@/components/vocabulary/Flashcard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
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
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const pack = useMemo(() => vocabularyPacks.find(p => p.id === packId), [packId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (pack) {
      setShuffledItems([...pack.items].sort(() => Math.random() - 0.5));
      setCurrentCardIndex(0); 
      setIsLoadingPack(false);
    } else if (!authLoading && packId) {
        setIsLoadingPack(false);
    }
  }, [pack, packId, authLoading]);

  useEffect(() => {
    // Reset flip state whenever the card index changes
    setIsCardFlipped(false);
  }, [currentCardIndex]);

  const flipCard = useCallback(() => {
    setIsCardFlipped(prev => !prev);
  }, []);

  const goToNextCard = useCallback(() => {
    setCurrentCardIndex(prev => (prev + 1) % (shuffledItems.length || 1) );
  }, [shuffledItems.length]);

  const handleKnow = useCallback(() => {
    if (shuffledItems.length > 0) {
      console.log("User knows:", shuffledItems[currentCardIndex]?.english);
    }
    goToNextCard();
  }, [goToNextCard, currentCardIndex, shuffledItems]);

  const handleDontKnow = useCallback(() => {
    if (shuffledItems.length > 0) {
      console.log("User doesn't know:", shuffledItems[currentCardIndex]?.english);
      if (!isCardFlipped) {
        setIsCardFlipped(true); // Flip to show answer
      } else {
        // If already flipped (they saw the answer), then advance
        goToNextCard();
      }
    } else {
      goToNextCard(); // Should not happen if items exist, but as a fallback
    }
  }, [goToNextCard, currentCardIndex, shuffledItems, isCardFlipped]);


  const goToPreviousCard = useCallback(() => {
    setCurrentCardIndex(prev => (prev - 1 + (shuffledItems.length || 1)) % (shuffledItems.length || 1));
  }, [shuffledItems.length]);

  const restartPack = useCallback(() => {
    if (pack) {
        setShuffledItems([...pack.items].sort(() => Math.random() - 0.5));
    }
    setCurrentCardIndex(0);
  }, [pack]);

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
  const progressPercentage = ((currentCardIndex + 1) / shuffledItems.length) * 100;

  return (
    <div className="flex flex-col items-center space-y-4 py-6 min-h-[calc(100vh-150px)] sm:min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md px-2">
        <h1 className="text-2xl sm:text-3xl font-headline text-accent text-center">{pack.name}</h1>
        <p className="text-muted-foreground text-center text-sm sm:text-base">卡片 {currentCardIndex + 1} / {shuffledItems.length}</p>
        <Progress value={progressPercentage} className="w-full mt-2 h-2 sm:h-3 pixel-border" />
      </div>

      <div className="flex-grow flex items-center justify-center w-full max-w-md px-2">
        {currentItem && <Flashcard item={currentItem} isFlipped={isCardFlipped} onFlipCard={flipCard} />}
      </div>
      
      <div className="w-full max-w-md px-2 space-y-3 pt-2 sm:pt-4">
        <div className="flex items-center justify-center space-x-4">
          <Button onClick={goToPreviousCard} variant="outline" className="btn-pixel text-xs sm:text-sm" aria-label="Previous card">
            <ChevronLeft size={18} /> 上一个
          </Button>
          <Button onClick={restartPack} variant="outline" className="btn-pixel text-xs sm:text-sm" aria-label="Restart pack">
            <RotateCcw size={16} /> 重置
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleDontKnow} 
              className="btn-pixel text-base sm:text-lg py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
              aria-label="I don't know this word, show answer or go next"
            >
              <XCircle size={20} className="mr-1 sm:mr-2 " /> 不认识
            </Button>
            <Button 
              onClick={handleKnow} 
              className="btn-pixel text-base sm:text-lg py-3 bg-green-600 hover:bg-green-700 text-white rounded-md"
              aria-label="I know this word, go next"
            >
              <CheckCircle2 size={20} className="mr-1 sm:mr-2 " /> 我认识
            </Button>
        </div>
      </div>

      <div className="w-full max-w-md px-2 text-center mt-2 sm:mt-4">
        <Link href={`/vocabulary/${packId}/quiz`} passHref>
          <Button className="btn-pixel bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto text-sm sm:text-base mb-2">
            <CheckCircle2 size={18} className="mr-2" />
            学完了？参加测验！
          </Button>
        </Link>
        <Link href="/vocabulary" passHref>
          <Button variant="link" className="text-accent text-sm">返回词汇包列表</Button>
        </Link>
      </div>
    </div>
  );
}
    
