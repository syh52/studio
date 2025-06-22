"use client";
import { VocabularyItemWithProgress } from '../../lib/vocabulary-learning'
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
    <div className="w-full max-w-lg mx-auto perspective-element transform transition-transform duration-200 ease-out animate-blur-in">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-sm"></div>
        <div className="relative glass-card rounded-3xl p-8 sm:p-10">
          <div className="space-y-6">
            {/* 单词状态标签 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 glass-card-strong px-4 py-2 rounded-xl">
                {isNewWord ? (
                  <>
                    <Sparkles className="text-yellow-400" size={16} />
                    <span className="text-sm text-yellow-400 font-medium">新词</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="text-blue-400" size={16} />
                    <span className="text-sm text-blue-400 font-medium">复习</span>
                  </>
                )}
              </div>
              
              {item.progress && item.progress.reviewCount > 0 && (
                <span className="text-xs text-gray-400">
                  第 {item.progress.reviewCount + 1} 次复习
                </span>
              )}
            </div>

            {/* 单词展示 */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-inter font-semibold text-white flex items-center justify-center gap-3">
                {item.english}
                <button 
                  onClick={playAudio}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
                  aria-label="播放单词发音"
                  title="播放单词发音"
                >
                  <Volume2 className="h-6 w-6 text-purple-400" />
                </button>
              </h2>

              {/* 新词显示例句帮助理解 */}
              {isNewWord && (
                <div className="glass-card-strong p-4 rounded-xl space-y-2 text-left">
                  <p className="text-sm font-medium text-white">{item.exampleSentenceEn}</p>
                  <p className="text-xs text-gray-400">{item.exampleSentenceZh}</p>
                </div>
              )}
            </div>

            {/* 提示文字 */}
            <p className="text-center text-sm text-gray-400">
              {isNewWord 
                ? "这是一个新单词，你认识它吗？" 
                : "尝试回忆这个单词的意思"}
            </p>

            {/* 操作按钮 */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onDontKnow}
                className="gradient-secondary text-white py-3 px-6 rounded-xl text-base font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                <X size={20} />
                不认识
              </button>
              <button 
                onClick={onKnow}
                className="gradient-primary text-white py-3 px-6 rounded-xl text-base font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                <Check size={20} />
                认识
              </button>
            </div>

            {/* 学习提示 */}
            {!isNewWord && item.progress && (
              <div className="text-center text-xs text-gray-400">
                <p>
                  上次复习：{new Date(item.progress.lastReviewedAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 