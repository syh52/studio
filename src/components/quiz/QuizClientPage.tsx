
"use client";

import type { VocabularyPack, VocabularyItem } from '@/lib/data';
import { useEffect, useState, useMemo, useCallback } from 'react'; // Added useCallback
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, HelpCircle, ArrowRightCircle, RotateCcw, Volume2 } from 'lucide-react';
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 font-headline text-lg">加载认证信息...</p>
      </div>
    );
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="ml-4 font-headline text-lg">请先登录以进行测验。正在跳转至登录页面...</p>
      </div>
    );
  }

  if (!pack || (pack.items.length === 0 && shuffledItems.length === 0 && !currentItem) ) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
        <HelpCircle size={48} className="text-muted-foreground mb-4" />
        <h1 className="text-2xl font-headline text-accent mb-2">{pack?.name || '测验'}</h1>
        <p className="text-muted-foreground mb-4">
          这个词汇包中目前没有可测验的词条。
        </p>
        <Link href="/quizzes" passHref>
          <Button variant="outline" className="btn-pixel">返回测验列表</Button>
        </Link>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <Card className="w-full max-w-lg mx-auto text-center pixel-border shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-accent">测验完成！</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">您在"{pack.name}"测验中的最终得分是：</p>
          <p className="font-headline text-4xl text-primary">{score} 分</p>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={restartQuiz} className="btn-pixel">
              <RotateCcw size={18} className="mr-2" />
              再试一次
            </Button>
            <Link href="/quizzes" passHref>
              <Button variant="outline" className="btn-pixel">返回测验列表</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentItem) {
     return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
             <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
             <p className="ml-4 font-headline text-lg">加载题目...</p>
        </div>
     );
  }

  const progressPercentage = shuffledItems.length > 0 ? ((currentQuestionIndex +1) / shuffledItems.length) * 100 : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="pixel-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-accent mb-2">{pack.name} - 词汇测验</CardTitle>
          <p className="text-muted-foreground">
            题目 {currentQuestionIndex + 1} / {shuffledItems.length}  |  当前得分: {score}
          </p>
          <Progress value={progressPercentage} className="w-full mt-2 h-3 pixel-border" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-card-foreground/5 rounded-sm pixel-border">
            <p className="text-sm text-muted-foreground mb-1">请选择以下英文单词的正确中文翻译：</p>
            <h2 className="font-headline text-4xl text-primary">{currentItem.english}</h2>
            {currentItem.pronunciationAudio && (
              <Button
                variant="ghost"
                size="icon"
                className="mt-2 text-accent hover:bg-accent/20"
                onClick={() => {
                  alert(`模拟播放音频: ${currentItem.english}`)
                }}
              >
                <Volume2 size={24} />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentOptions.map((option, index) => {
              let buttonClass = "btn-pixel justify-start text-left h-auto py-3 quiz-option";
              if (isAnswerChecked) {
                if (option === currentItem.chinese) {
                  buttonClass += " quiz-option-correct";
                } else if (option === selectedAnswer) {
                  buttonClass += " quiz-option-incorrect";
                } else {
                  buttonClass += " opacity-60 cursor-not-allowed";
                }
              }
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswerChecked}
                >
                  {option}
                </Button>
              );
            })}
          </div>

          {isAnswerChecked && (
            <div className={`p-3 rounded-sm pixel-border text-center ${selectedAnswer === currentItem.chinese ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
              {selectedAnswer === currentItem.chinese ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle size={20} />
                  <p>太棒了！回答正确！</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} />
                    <p>回答错误。</p>
                  </div>
                  <p>正确答案是： <span className="font-bold">{currentItem.chinese}</span></p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center mt-6">
            {isAnswerChecked ? (
              <Button onClick={handleNextQuestion} className="btn-pixel bg-accent text-accent-foreground hover:bg-accent/90">
                <ArrowRightCircle size={20} className="mr-2" />
                {currentQuestionIndex === shuffledItems.length - 1 ? '完成测验' : '下一题'}
              </Button>
            ) : (
              <Button className="btn-pixel opacity-50 cursor-not-allowed" disabled>
                 请先选择答案
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
       <div className="text-center mt-6">
        <Link href="/quizzes" passHref>
          <Button variant="link" className="text-accent">返回测验列表</Button>
        </Link>
      </div>
    </div>
  );
}
