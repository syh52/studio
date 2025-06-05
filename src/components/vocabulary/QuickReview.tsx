"use client";
import { VocabularyItemWithProgress } from '@/lib/vocabulary-learning';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, CheckCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface QuickReviewProps {
  item: VocabularyItemWithProgress;
  onContinue: () => void;
}

export default function QuickReview({ item, onContinue }: QuickReviewProps) {
  const [showChinese, setShowChinese] = useState(false);

  useEffect(() => {
    // 延迟显示中文，让用户先尝试回忆
    const timer = setTimeout(() => {
      setShowChinese(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const playAudio = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(item.english);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }, [item.english]);

  return (
    <Card className="w-full max-w-lg mx-auto p-6 pixel-border">
      <div className="space-y-6">
        {/* 成功标识 */}
        <div className="flex justify-center">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
          </div>
        </div>

        {/* 单词 */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-headline text-accent flex items-center justify-center gap-3">
            {item.english}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={playAudio}
              className="text-accent hover:bg-accent/20"
            >
              <Volume2 size={20} />
            </Button>
          </h2>

          {/* 中文释义（渐显） */}
          <div className={`transition-opacity duration-500 ${showChinese ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-xl">{item.chinese}</p>
          </div>
        </div>

        {/* 核心例句 */}
        <div className="bg-secondary/50 p-4 rounded-md space-y-2">
          <p className="font-medium text-sm">{item.exampleSentenceEn}</p>
          <p className="text-sm text-muted-foreground">{item.exampleSentenceZh}</p>
        </div>

        {/* 学习进度信息 */}
        {item.progress && (
          <div className="text-center text-sm text-muted-foreground">
            <p>
              已复习 {item.progress.reviewCount} 次 · 
              正确率 {item.progress.correctCount > 0 
                ? Math.round((item.progress.correctCount / item.progress.reviewCount) * 100) 
                : 0}%
            </p>
          </div>
        )}

        {/* 继续按钮 */}
        <div className="flex justify-center">
          <Button 
            onClick={onContinue}
            className="btn-pixel bg-green-600 text-white hover:bg-green-700"
            size="lg"
          >
            继续学习
          </Button>
        </div>
      </div>
    </Card>
  );
} 