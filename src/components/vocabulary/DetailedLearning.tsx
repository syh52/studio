"use client";
import { VocabularyItemWithProgress } from '@/lib/vocabulary-learning';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, BookOpen, Brain, Target } from 'lucide-react';
import { useCallback } from 'react';

interface DetailedLearningProps {
  item: VocabularyItemWithProgress;
  onContinue: () => void;
}

export default function DetailedLearning({ item, onContinue }: DetailedLearningProps) {
  const playAudio = useCallback(() => {
    // TODO: 实现真实的音频播放
    const utterance = new SpeechSynthesisUtterance(item.english);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }, [item.english]);

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 pixel-border">
      <div className="space-y-6">
        {/* 单词头部 */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-headline text-accent flex items-center justify-center gap-3">
            {item.english}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={playAudio}
              className="text-accent hover:bg-accent/20"
            >
              <Volume2 size={24} />
            </Button>
          </h2>
          {/* TODO: 添加音标 */}
          <p className="text-lg text-muted-foreground">/音标待添加/</p>
        </div>

        {/* 释义部分 */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <BookOpen className="text-accent mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-accent mb-1">中文释义</h3>
              <p className="text-lg">{item.chinese}</p>
            </div>
          </div>

          {/* 英文释义（未来可扩展） */}
          <div className="flex items-start gap-3">
            <Brain className="text-accent mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-accent mb-1">英文释义</h3>
              <p className="text-muted-foreground italic">
                (付费功能 - 柯林斯词典释义)
              </p>
            </div>
          </div>
        </div>

        {/* 例句部分 */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-start gap-3">
            <Target className="text-accent mt-1" size={20} />
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-accent">例句</h3>
              
              <div className="bg-secondary/50 p-3 rounded-md space-y-2">
                <p className="font-medium">{item.exampleSentenceEn}</p>
                <p className="text-sm text-muted-foreground">{item.exampleSentenceZh}</p>
              </div>

              {/* 可以添加更多例句 */}
              <div className="text-sm text-muted-foreground italic">
                更多例句功能开发中...
              </div>
            </div>
          </div>
        </div>

        {/* 学习提示 */}
        <div className="bg-accent/10 p-4 rounded-md">
          <p className="text-sm text-accent">
            💡 学习提示：仔细阅读例句，理解单词在实际语境中的用法。试着用这个单词造一个句子！
          </p>
        </div>

        {/* 继续按钮 */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={onContinue}
            className="btn-pixel bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            我记住了，继续学习
          </Button>
        </div>
      </div>
    </Card>
  );
} 