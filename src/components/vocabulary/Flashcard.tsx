"use client";
import { VocabularyItemWithProgress } from '../../lib/vocabulary-learning'
import { Volume2, BookOpen, X, Check, Sparkles, Brain, Target } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';

interface FlashCardProps {
  item: VocabularyItemWithProgress;
  currentIndex: number;
  totalCount: number;
  onKnow: () => void;
  onDontKnow: () => void;
  onContinue: () => void;
  mode: 'presentation' | 'detailed';
}

export default function FlashCard({
  item,
  currentIndex,
  totalCount,
  onKnow,
  onDontKnow,
  onContinue,
  mode
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isNewWord = !item.progress || item.progress.stage === 'new';

  // 当模式变为详细时，翻转卡片
  useEffect(() => {
    setIsFlipped(mode === 'detailed');
  }, [mode]);

  const playAudio = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(item.english);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, [item.english]);

  const handleDontKnowClick = useCallback(() => {
    setIsFlipped(true);
    onDontKnow();
  }, [onDontKnow]);

  const progressPercentage = ((currentIndex + 1) / totalCount) * 100;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="w-full bg-white/5 backdrop-blur-sm rounded-full h-2 mb-8 animate-blur-in animate-delay-200">
        <div 
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Flashcard Container */}
      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
        <div className="flip-card-inner">
          {/* Front of card */}
          <div className="flip-card-front">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-sm"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[500px] flex flex-col shadow-2xl">
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-white/8 backdrop-blur-md border border-white/15 px-4 py-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      {isNewWord ? (
                        <>
                          <Sparkles className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-yellow-400 font-medium">新词</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-blue-400 font-medium">复习</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{currentIndex + 1}/{totalCount}</div>
                </div>

                {/* Word Display */}
                <div className="flex-1 flex flex-col justify-center text-center space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-semibold text-white tracking-tight">{item.english}</h2>
                    <button 
                      onClick={playAudio}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl hover:bg-white/10 transition-all duration-200"
                    >
                      <Volume2 className="h-5 w-5 text-purple-400" />
                      <span className="text-sm text-purple-400">播放发音</span>
                    </button>
                  </div>

                  {/* Example Sentence */}
                  <div className="bg-white/8 backdrop-blur-md border border-white/15 p-4 rounded-xl space-y-2">
                    <p className="text-base text-white font-medium">{item.exampleSentenceEn}</p>
                    <p className="text-sm text-gray-400">{item.exampleSentenceZh}</p>
                  </div>

                  {/* Hint */}
                  <p className="text-sm text-gray-400">
                    {isNewWord ? "这是一个新单词，你认识它吗？" : "尝试回忆这个单词的意思"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button 
                    onClick={handleDontKnowClick}
                    className="relative overflow-hidden bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white py-4 px-6 rounded-xl text-base font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <X className="h-5 w-5" />
                    不认识
                  </button>
                  <button 
                    onClick={onKnow}
                    className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 px-6 rounded-xl text-base font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Check className="h-5 w-5" />
                    认识
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Back of card (detailed view) */}
          <div className="flip-card-back">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-sm"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[500px] shadow-2xl">
                <div className="space-y-6">
                  {/* Word Header */}
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-semibold text-white tracking-tight flex items-center justify-center gap-3">
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
                    <p className="text-lg text-purple-400">/音标待添加/</p>
                  </div>

                  {/* Chinese Meaning */}
                  <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-purple-400 mt-1" />
                      <div>
                        <h3 className="font-semibold text-purple-400 mb-1 text-base">中文释义</h3>
                        <p className="text-xl text-white">{item.chinese}</p>
                      </div>
                    </div>
                  </div>

                  {/* Example Sentences */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-400 text-base flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      例句
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-xl p-4 space-y-2">
                        <p className="font-medium text-white text-base">{item.exampleSentenceEn}</p>
                        <p className="text-sm text-gray-400">{item.exampleSentenceZh}</p>
                      </div>
                    </div>
                  </div>

                  {/* Learning Tip */}
                  <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-xl p-4">
                    <p className="text-sm text-blue-400">
                      💡 学习提示：认真理解单词的含义和用法，尝试在实际情境中运用这个单词。
                    </p>
                  </div>

                  {/* Continue Button */}
                  <button 
                    onClick={onContinue}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 px-8 rounded-xl text-base font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    我记住了，继续学习
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .flip-card {
          perspective: 1000px;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        @keyframes blur-in {
          from {
            opacity: 0;
            filter: blur(8px);
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }

        .animate-blur-in {
          animation: blur-in 0.4s ease-out forwards;
        }

        .animate-delay-200 {
          animation-delay: 0.2s;
        }

        .animate-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}
    
