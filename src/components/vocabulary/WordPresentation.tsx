"use client";
import { VocabularyItemWithProgress } from '@/lib/vocabulary-learning';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, BookOpen, X, Check, Sparkles } from 'lucide-react';
import { useCallback } from 'react';

interface WordPresentationProps {
  item: VocabularyItemWithProgress;
  onKnow: () => void;
  onDontKnow: () => void;
}

export default function WordPresentation({ item, onKnow, onDontKnow }: WordPresentationProps) {
  const isNewWord = !item.progress || item.progress.stage === 'new';
  
  const playAudio = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(item.english);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }, [item.english]);

  return (
    <Card className="w-full max-w-lg mx-auto p-6 pixel-border">
      <div className="space-y-6">
        {/* 单词状态标签 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isNewWord ? (
              <>
                <Sparkles className="text-yellow-500" size={16} />
                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">新词</span>
              </>
            ) : (
              <>
                <BookOpen className="text-blue-500" size={16} />
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">复习</span>
              </>
            )}
          </div>
          
          {item.progress && item.progress.reviewCount > 0 && (
            <span className="text-xs text-muted-foreground">
              第 {item.progress.reviewCount + 1} 次复习
            </span>
          )}
        </div>

        {/* 单词展示 */}
        <div className="text-center space-y-4">
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

          {/* 新词显示例句帮助理解 */}
          {isNewWord && (
            <div className="bg-secondary/30 p-4 rounded-md space-y-2 text-left">
              <p className="text-sm font-medium">{item.exampleSentenceEn}</p>
              <p className="text-xs text-muted-foreground">{item.exampleSentenceZh}</p>
            </div>
          )}
        </div>

        {/* 提示文字 */}
        <p className="text-center text-sm text-muted-foreground">
          {isNewWord 
            ? "这是一个新单词，你认识它吗？" 
            : "尝试回忆这个单词的意思"}
        </p>

        {/* 操作按钮 */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={onDontKnow}
            className="btn-pixel bg-orange-500 hover:bg-orange-600 text-white"
            size="lg"
          >
            <X size={20} className="mr-2" />
            不认识
          </Button>
          <Button 
            onClick={onKnow}
            className="btn-pixel bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Check size={20} className="mr-2" />
            认识
          </Button>
        </div>

        {/* 学习提示 */}
        {!isNewWord && item.progress && (
          <div className="text-center text-xs text-muted-foreground">
            <p>
              上次复习：{new Date(item.progress.lastReviewedAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 