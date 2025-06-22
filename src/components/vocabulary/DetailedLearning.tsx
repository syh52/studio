"use client";
import { VocabularyItemWithProgress } from '../../lib/vocabulary-learning'
import { Volume2, BookOpen, Brain, Target } from 'lucide-react';
import { useCallback } from 'react';

interface DetailedLearningProps {
  item: VocabularyItemWithProgress;
  onContinue: () => void;
}

export default function DetailedLearning({ item, onContinue }: DetailedLearningProps) {
  const playAudio = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(item.english);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }, [item.english]);

  return (
    <div className="w-full max-w-2xl mx-auto perspective-element transform transition-transform duration-200 ease-out animate-blur-in">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-sm"></div>
        <div className="relative glass-card rounded-3xl p-8 sm:p-10">
          <div className="space-y-6">
            {/* 单词头部 */}
            <div className="text-center space-y-2">
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
              <p className="text-lg text-gray-400">/音标待添加/</p>
            </div>

            {/* 释义部分 */}
            <div className="space-y-4">
              <div className="glass-card-strong rounded-xl p-4 flex items-start gap-3">
                <BookOpen className="text-purple-400 mt-1" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-400 mb-1">中文释义</h3>
                  <p className="text-lg text-white">{item.chinese}</p>
                </div>
              </div>

              {/* 英文释义（未来可扩展） */}
              <div className="glass-card-strong rounded-xl p-4 flex items-start gap-3">
                <Brain className="text-blue-400 mt-1" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-400 mb-1">英文释义</h3>
                  <p className="text-gray-400 italic">
                    (付费功能 - 柯林斯词典释义)
                  </p>
                </div>
              </div>
            </div>

            {/* 例句部分 */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="text-green-400 mt-1" size={20} />
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold text-green-400">例句</h3>
                  
                  <div className="glass-card-strong rounded-xl p-4 space-y-2">
                    <p className="font-medium text-white">{item.exampleSentenceEn}</p>
                    <p className="text-sm text-gray-400">{item.exampleSentenceZh}</p>
                  </div>

                  {/* 可以添加更多例句 */}
                  <div className="text-sm text-gray-400 italic">
                    更多例句功能开发中...
                  </div>
                </div>
              </div>
            </div>

            {/* 学习提示 */}
            <div className="gradient-secondary rounded-xl p-4">
              <p className="text-sm text-white">
                💡 学习提示：仔细阅读例句，理解单词在实际语境中的用法。试着用这个单词造一个句子！
              </p>
            </div>

            {/* 继续按钮 */}
            <div className="flex justify-center pt-4">
              <button 
                onClick={onContinue}
                className="gradient-primary text-white py-3 px-8 rounded-xl text-base font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                我记住了，继续学习
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 