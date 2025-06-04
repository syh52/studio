
"use client";
import { useCallback } from 'react';
import type { VocabularyItem } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Volume2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FlashcardProps {
  item: VocabularyItem;
  isFlipped: boolean;
  onFlipCard: () => void;
}

export default function Flashcard({ item, isFlipped, onFlipCard }: FlashcardProps) {

  const playAudio = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); 
    alert(`正在播放音频： ${item.english}`);
    if (item.pronunciationAudio) {
      // const audio = new Audio(item.pronunciationAudio);
      // audio.play().catch(err => console.error("Audio play error:", err));
    }
  }, [item.english, item.pronunciationAudio]);

  const handleMarkAsSimple = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); 
    alert(`"${item.english}" 标记为太简单 (功能待实现)`);
  }, [item.english]);

  return (
    <div 
      className="w-full max-w-md h-64 sm:h-72 mx-auto perspective cursor-pointer"
      onClick={onFlipCard} // Use the passed in flip handler
    >
      <Card 
        className={`relative w-full h-full pixel-border shadow-lg transition-all duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden bg-card flex flex-col items-center justify-center p-4 text-center">
          <Button variant="ghost" size="icon" onClick={playAudio} className="absolute top-2 right-2 text-accent hover:bg-accent/20 p-1">
            <Volume2 size={20} />
          </Button>
          <h2 className="font-headline text-3xl sm:text-4xl text-accent mb-2">{item.english}</h2>
          {/* Assuming phonetic might be added to VocabularyItem interface */}
          {/* {item.phonetic && <p className="text-muted-foreground text-sm sm:text-base mb-2">/{item.phonetic}/</p>} */}
          
          <Button variant="outline" size="sm" onClick={handleMarkAsSimple} className="text-xs text-muted-foreground mt-1 pixel-border hover:bg-muted/50 py-1 px-2">
            <Trash2 size={12} className="mr-1" /> 标记为太简单
          </Button>

          <p className="text-xs text-muted-foreground mt-auto pt-2">尝试回想释义，点击卡片查看</p>
        </div>

        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden bg-secondary text-secondary-foreground flex flex-col items-center justify-center p-4 text-center rotate-y-180">
          <Button variant="ghost" size="icon" onClick={playAudio} className="absolute top-2 right-2 text-accent hover:bg-accent/20 p-1">
            <Volume2 size={20} />
          </Button>
          <h3 className="font-headline text-2xl sm:text-3xl text-accent mb-2">{item.chinese}</h3>
          <div className="text-xs sm:text-sm space-y-1 overflow-auto max-h-28 sm:max-h-32 w-full px-1">
              <p><span className="font-semibold">例 (EN):</span> {item.exampleSentenceEn}</p>
              <p><span className="font-semibold">例 (ZH):</span> {item.exampleSentenceZh}</p>
          </div>
          <p className="text-xs text-muted-foreground/80 mt-auto pt-2">点击卡片返回</p>
        </div>
      </Card>
    </div>
  );
}
    
