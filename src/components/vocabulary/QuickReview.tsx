"use client";
import { VocabularyItemWithProgress } from '../../lib/vocabulary-learning'
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
    <div className="w-full max-w-lg mx-auto perspective-element transform transition-transform duration-200 ease-out animate-blur-in">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl blur-sm"></div>
        <div className="relative glass-card rounded-3xl p-8 sm:p-10">
          <div className="space-y-6">
            {/* 成功标识 */}
            <div className="flex justify-center">
              <div className="glass-card-strong p-3 rounded-full">
                <CheckCircle className="text-green-400" size={32} />
              </div>
            </div>

            {/* 单词 */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-inter font-semibold text-white flex items-center justify-center gap-3">
                {item.english}
                <button 
                  onClick={playAudio}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
                  aria-label="播放单词发音"
                  title="播放单词发音"
                >
                  <Volume2 className="h-5 w-5 text-purple-400" />
                </button>
              </h2>

              {/* 中文释义（渐显） */}
              <div className={`transition-opacity duration-500 ${showChinese ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-xl text-gray-300">{item.chinese}</p>
              </div>
            </div>

            {/* 核心例句 */}
            <div className="glass-card-strong rounded-xl p-4 space-y-2">
              <p className="font-medium text-sm text-white">{item.exampleSentenceEn}</p>
              <p className="text-sm text-gray-400">{item.exampleSentenceZh}</p>
            </div>

            {/* 学习进度信息 */}
            {item.progress && (
              <div className="text-center text-sm text-gray-400">
                <p>
                  已复习 <span className="text-purple-400">{item.progress.reviewCount}</span> 次 · 
                  正确率 <span className="text-green-400">{item.progress.correctCount > 0 
                    ? Math.round((item.progress.correctCount / item.progress.reviewCount) * 100) 
                    : 0}%</span>
                </p>
              </div>
            )}

            {/* 继续按钮 */}
            <div className="flex justify-center">
              <button 
                onClick={onContinue}
                className="gradient-primary text-white py-3 px-8 rounded-xl text-base font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                继续学习
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 