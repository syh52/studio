"use client";

import type { VocabularyPack, VocabularyItem } from '../../lib/data'
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Progress } from "../../components/ui/progress"
import { AlertCircle, CheckCircle, HelpCircle, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface QuizClientPageProps {
  pack: VocabularyPack;
}

const POINTS_PER_CORRECT_ANSWER = 5;
const TOTAL_OPTIONS = 4;

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function QuizClientPage({ pack }: QuizClientPageProps) {
  const { user, isAuthenticated, isLoading: authLoading, addPoints } = useAuth();
  const router = useRouter();

  const [shuffledItems, setShuffledItems] = useState<VocabularyItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (pack && pack.items.length > 0) {
      setShuffledItems(shuffleArray([...pack.items]));
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizCompleted(false);
      setIsAnswerChecked(false);
      setSelectedAnswer(null);
    } else if (pack && pack.items.length === 0) {
      setShuffledItems([]);
    }
  }, [pack]);

  const currentItem = useMemo(() => {
    if (shuffledItems.length > 0 && currentQuestionIndex < shuffledItems.length) {
      return shuffledItems[currentQuestionIndex];
    }
    return null;
  }, [shuffledItems, currentQuestionIndex]);

  useEffect(() => {
    if (currentItem) {
      const correctAnswer = currentItem.chinese;
      let distractors = pack.items
        .filter(item => item.id !== currentItem.id)
        .map(item => item.chinese)
        .filter(translation => translation !== correctAnswer);

      distractors = shuffleArray(distractors);

      const uniqueDistractors = Array.from(new Set(distractors)).slice(0, TOTAL_OPTIONS - 1);

      let options = [correctAnswer, ...uniqueDistractors];

      const genericDistractors = ["其他选项A", "其他选项B", "其他选项C", "另一个答案", "以上都不是"];
      let genericIndex = 0;
      while(options.length < TOTAL_OPTIONS && genericIndex < genericDistractors.length) {
        if (!options.includes(genericDistractors[genericIndex])) {
            options.push(genericDistractors[genericIndex]);
        }
        genericIndex++;
      }
      options = shuffleArray(options.slice(0, TOTAL_OPTIONS));

      while(options.length < TOTAL_OPTIONS) {
          options.push(`补充选项${options.length + 1}`);
      }

      setCurrentOptions(options);
    }
  }, [currentItem, pack.items]);

  const handleAnswerSelect = useCallback((option: string) => {
    if (isAnswerChecked || !currentItem) return;

    setSelectedAnswer(option);
    setIsAnswerChecked(true);

    if (option === currentItem.chinese) {
      setScore(prevScore => prevScore + POINTS_PER_CORRECT_ANSWER);
      if (isAuthenticated) {
        addPoints(POINTS_PER_CORRECT_ANSWER);
      }
    }
  }, [isAnswerChecked, currentItem, isAuthenticated, addPoints]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < shuffledItems.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setQuizCompleted(true);
    }
  }, [currentQuestionIndex, shuffledItems.length]);

  const restartQuiz = useCallback(() => {
    if (pack && pack.items.length > 0) {
      setShuffledItems(shuffleArray([...pack.items]));
    } else {
      setShuffledItems([]);
    }
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setIsAnswerChecked(false);
    setSelectedAnswer(null);
  }, [pack]);

  // 播放发音
  const playAudio = () => {
    if (!currentItem) return;
    const utterance = new SpeechSynthesisUtterance(currentItem.english);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-inter text-xl text-white">加载认证信息...</p>
      </div>
    );
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <p className="font-inter text-xl text-white">请先登录以进行测验。正在跳转至登录页面...</p>
      </div>
    );
  }

  if (!pack || (pack.items.length === 0 && shuffledItems.length === 0 && !currentItem) ) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-8">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-inter font-semibold text-white mb-4">{pack?.name || '测验'}</h1>
            <p className="text-gray-400 mb-6">
              这个词汇包中目前没有可测验的词条。
            </p>
            <Link href="/quizzes" passHref>
              <Button className="glass-card-strong text-purple-400 border-purple-400/30 hover:bg-purple-500/10 px-6 py-3 rounded-xl font-medium">
                返回测验列表
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="text-center space-y-6">
            {/* 成功图标 */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-sm"></div>
              <div className="relative w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center glass-card">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
            </div>
            
            {/* 完成信息 */}
            <div className="glass-card rounded-3xl p-8">
              <h1 className="text-3xl font-inter font-semibold text-white mb-3">测验完成！🎉</h1>
              <p className="text-gray-300 mb-2">
                恭喜你完成了《{pack.name}》的测验
              </p>
              <p className="text-4xl font-inter font-bold text-green-400 my-4">{score} 分</p>
              <p className="text-sm text-purple-400">
                答对了 {Math.round(score / POINTS_PER_CORRECT_ANSWER)} / {shuffledItems.length} 题
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button 
                onClick={restartQuiz}
                className="w-full gradient-primary text-white py-4 px-6 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                再试一次
              </button>
              
              <Link href="/quizzes" passHref>
                <button className="w-full glass-card-strong text-purple-400 py-4 px-6 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-purple-400/30">
                  返回测验列表
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItem) {
     return (
        <div className="flex flex-col items-center justify-center text-center py-20">
             <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="font-inter text-xl text-white">加载题目...</p>
        </div>
     );
  }

  const progressPercentage = shuffledItems.length > 0 ? ((currentQuestionIndex +1) / shuffledItems.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 进度和返回按钮 */}
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/quizzes">
              <button 
                className="glass-card p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                title="返回测验列表"
              >
                <ArrowRight className="h-5 w-5 text-gray-300 rotate-180" />
              </button>
            </Link>
            <div className="text-center">
              <p className="text-sm text-gray-400">
                {currentQuestionIndex + 1} / {shuffledItems.length}  •  得分: {score}
              </p>
            </div>
            <div className="w-12"></div> {/* 占位符 */}
          </div>

          {/* 进度条 */}
          <div className="glass-card rounded-full h-2 mb-8">
            <div 
              className="gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 测验内容 */}
      <div className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* 背景光晕 */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-sm"></div>
            
            {/* 测验卡片 */}
            <div className="relative glass-card rounded-3xl p-6 sm:p-8 space-y-6 sm:space-y-8">
              {/* 标题 */}
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-inter font-semibold text-white mb-2">{pack.name} - 词汇测验</h1>
                <p className="text-sm text-gray-400">请选择以下英文单词的正确中文翻译</p>
              </div>

              {/* 单词显示 */}
              <div className="text-center glass-card-strong rounded-2xl p-6 sm:p-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-inter font-bold text-white tracking-tight mb-4">
                  {currentItem.english}
                </h2>
                
                {/* 发音按钮 */}
                <button 
                  onClick={playAudio}
                  className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-xl hover:bg-white/10 transition-all duration-200 active:scale-95"
                >
                  <Volume2 className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-green-400">点击发音</span>
                </button>
              </div>

              {/* 选项 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {currentOptions.map((option, index) => {
                  const isCorrect = option === currentItem.chinese;
                  const isSelected = option === selectedAnswer;
                  
                  let buttonClass = "w-full glass-card-strong text-left p-4 sm:p-5 rounded-xl transition-all duration-200 border ";
                  
                  if (isAnswerChecked) {
                    if (isCorrect) {
                      buttonClass += "border-green-500/50 bg-green-500/20 text-green-100";
                    } else if (isSelected) {
                      buttonClass += "border-red-500/50 bg-red-500/20 text-red-100";
                    } else {
                      buttonClass += "border-white/10 text-gray-400 opacity-60";
                    }
                  } else {
                    buttonClass += "border-white/20 text-white hover:border-purple-400/50 hover:bg-purple-500/10 active:scale-95 cursor-pointer";
                  }
                  
                  return (
                    <button
                      key={index}
                      className={buttonClass}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isAnswerChecked}
                    >
                      <span className="text-sm sm:text-base font-medium">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* 答案反馈 */}
              {isAnswerChecked && (
                <div className={`glass-card-strong rounded-xl p-4 sm:p-5 text-center border ${selectedAnswer === currentItem.chinese ? 'border-green-500/50 bg-green-500/20' : 'border-red-500/50 bg-red-500/20'}`}>
                  {selectedAnswer === currentItem.chinese ? (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <p className="font-medium">太棒了！回答正确！</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-red-400">
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">回答错误</p>
                      </div>
                      <p className="text-sm">
                        正确答案是：<span className="font-bold text-white">{currentItem.chinese}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 下一题按钮 */}
              <div className="flex justify-center">
                {isAnswerChecked ? (
                  <button 
                    onClick={handleNextQuestion}
                    className="gradient-primary text-white py-4 px-8 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <ArrowRight className="h-5 w-5" />
                    {currentQuestionIndex === shuffledItems.length - 1 ? '完成测验' : '下一题'}
                  </button>
                ) : (
                  <button 
                    className="glass-card-strong text-gray-400 py-4 px-8 rounded-xl font-medium opacity-50 cursor-not-allowed border border-white/10"
                    disabled
                  >
                    请先选择答案
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
