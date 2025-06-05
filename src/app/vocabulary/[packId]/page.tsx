"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { vocabularyPacks } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import WordPresentation from '@/components/vocabulary/WordPresentation';
import DetailedLearning from '@/components/vocabulary/DetailedLearning';
import QuickReview from '@/components/vocabulary/QuickReview';
import LearningStats from '@/components/vocabulary/LearningStats';
import {
  VocabularyItemWithProgress,
  VocabularyProgress,
  getWordsForReview,
  loadPackProgress,
  saveProgress,
  initializeProgress,
  calculateNextReview,
  getLearningStats
} from '@/lib/vocabulary-learning';

type LearningMode = 'presentation' | 'detailed' | 'quick-review' | 'stats';

export default function VocabularyLearningPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ packId: string }>();
  const packId = params.packId;

  const [currentMode, setCurrentMode] = useState<LearningMode>('presentation');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [learningQueue, setLearningQueue] = useState<VocabularyItemWithProgress[]>([]);
  const [progresses, setProgresses] = useState<VocabularyProgress[]>([]);
  const [isLoadingPack, setIsLoadingPack] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    wordsLearned: 0,
    wordsReviewed: 0,
    correctAnswers: 0,
    totalAnswers: 0
  });

  const pack = useMemo(() => vocabularyPacks.find(p => p.id === packId), [packId]);

  // 认证检查
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 初始化学习队列和进度
  useEffect(() => {
    if (!pack || authLoading) return;

    const storedProgresses = loadPackProgress(packId);
    
    // 为每个单词创建或更新进度
    const updatedProgresses = pack.items.map(item => {
      const existingProgress = storedProgresses.find(p => p.vocabularyId === item.id);
      return existingProgress || initializeProgress(item.id, packId);
    });

    setProgresses(updatedProgresses);

    // 创建带进度的词汇项
    const itemsWithProgress: VocabularyItemWithProgress[] = pack.items.map(item => ({
      ...item,
      progress: updatedProgresses.find(p => p.vocabularyId === item.id)
    }));

    // 获取需要学习的单词
    const wordsToLearn = getWordsForReview(itemsWithProgress, 20);
    setLearningQueue(wordsToLearn);
    setIsLoadingPack(false);
  }, [pack, packId, authLoading]);

  // 获取当前单词
  const currentWord = learningQueue[currentWordIndex];

  // 处理"认识"
  const handleKnow = useCallback(() => {
    if (!currentWord) return;

    const isNewWord = !currentWord.progress || currentWord.progress.stage === 'new';
    
    // 更新进度
    if (currentWord.progress) {
      const updatedProgress = calculateNextReview(currentWord.progress, true);
      const newProgresses = progresses.map(p => 
        p.vocabularyId === currentWord.id ? updatedProgress : p
      );
      setProgresses(newProgresses);
      saveProgress(packId, newProgresses);

      // 更新学习队列中的进度
      setLearningQueue(prev => prev.map(item => 
        item.id === currentWord.id 
          ? { ...item, progress: updatedProgress }
          : item
      ));
    } else {
      // 新词，创建进度
      const newProgress = initializeProgress(currentWord.id, packId);
      const updatedProgress = calculateNextReview(newProgress, true);
      const newProgresses = [...progresses, updatedProgress];
      setProgresses(newProgresses);
      saveProgress(packId, newProgresses);
    }

    // 更新会话统计
    setSessionStats(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + 1,
      totalAnswers: prev.totalAnswers + 1,
      wordsReviewed: isNewWord ? prev.wordsReviewed : prev.wordsReviewed + 1,
      wordsLearned: isNewWord ? prev.wordsLearned + 1 : prev.wordsLearned
    }));

    // 进入快速复习模式
    setCurrentMode('quick-review');
  }, [currentWord, progresses, packId]);

  // 处理"不认识"
  const handleDontKnow = useCallback(() => {
    if (!currentWord) return;

    // 更新进度
    if (currentWord.progress) {
      const updatedProgress = calculateNextReview(currentWord.progress, false);
      const newProgresses = progresses.map(p => 
        p.vocabularyId === currentWord.id ? updatedProgress : p
      );
      setProgresses(newProgresses);
      saveProgress(packId, newProgresses);

      // 更新学习队列中的进度
      setLearningQueue(prev => prev.map(item => 
        item.id === currentWord.id 
          ? { ...item, progress: updatedProgress }
          : item
      ));
    } else {
      // 新词，创建进度
      const newProgress = initializeProgress(currentWord.id, packId);
      const newProgresses = [...progresses, newProgress];
      setProgresses(newProgresses);
      saveProgress(packId, newProgresses);
    }

    // 更新会话统计
    setSessionStats(prev => ({
      ...prev,
      totalAnswers: prev.totalAnswers + 1
    }));

    // 进入详细学习模式
    setCurrentMode('detailed');
  }, [currentWord, progresses, packId]);

  // 继续下一个单词
  const handleContinue = useCallback(() => {
    if (currentWordIndex < learningQueue.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setCurrentMode('presentation');
    } else {
      // 学习完成，显示统计
      setCurrentMode('stats');
    }
  }, [currentWordIndex, learningQueue.length]);

  // 加载中
  if (authLoading || isLoadingPack) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 未找到词汇包
  if (!pack) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-headline text-destructive">未找到词汇包</h1>
        <p className="text-muted-foreground">无法找到所请求的词汇包。</p>
        <Link href="/vocabulary" passHref>
          <Button variant="link" className="text-accent mt-4">返回词汇包列表</Button>
        </Link>
      </div>
    );
  }

  // 没有需要学习的单词
  if (learningQueue.length === 0) {
    const stats = getLearningStats(packId);
    return (
      <div className="space-y-6 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-headline text-accent">{pack.name}</h1>
          <p className="text-muted-foreground mt-2">
            太棒了！暂时没有需要学习的单词。
          </p>
        </div>
        
        <LearningStats 
          stats={stats}
          sessionStats={{
            ...sessionStats,
            correctRate: sessionStats.totalAnswers > 0 
              ? Math.round((sessionStats.correctAnswers / sessionStats.totalAnswers) * 100)
              : 0
          }}
        />

        <div className="flex flex-col items-center gap-4">
          <Link href={`/vocabulary/${pack.id}/quiz`} passHref>
            <Button className="btn-pixel bg-accent text-accent-foreground hover:bg-accent/90">
              <CheckCircle2 size={18} className="mr-2" />
              参加测验
            </Button>
          </Link>
          <Link href="/vocabulary" passHref>
            <Button variant="link" className="text-accent">返回词汇包列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 渲染当前学习模式
  return (
    <div className="min-h-[calc(100vh-200px)] py-6">
      {/* 头部信息 */}
      <div className="max-w-2xl mx-auto mb-6 px-4">
        <div className="flex items-center justify-between">
          <Link href="/vocabulary">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft size={16} />
              返回
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-xl font-headline text-accent">{pack.name}</h1>
            <p className="text-sm text-muted-foreground">
              学习进度：{currentWordIndex + 1} / {learningQueue.length}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMode('stats')}
            className="gap-2"
          >
            <BarChart3 size={16} />
            统计
          </Button>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="px-4">
        {currentMode === 'presentation' && currentWord && (
          <WordPresentation
            item={currentWord}
            onKnow={handleKnow}
            onDontKnow={handleDontKnow}
          />
        )}

        {currentMode === 'detailed' && currentWord && (
          <DetailedLearning
            item={currentWord}
            onContinue={handleContinue}
          />
        )}

        {currentMode === 'quick-review' && currentWord && (
          <QuickReview
            item={currentWord}
            onContinue={handleContinue}
          />
        )}

        {currentMode === 'stats' && (
          <div className="space-y-6">
            <LearningStats 
              stats={getLearningStats(packId)}
              sessionStats={{
                ...sessionStats,
                correctRate: sessionStats.totalAnswers > 0 
                  ? Math.round((sessionStats.correctAnswers / sessionStats.totalAnswers) * 100)
                  : 0
              }}
            />

            <div className="flex flex-col items-center gap-4">
              {currentWordIndex < learningQueue.length - 1 ? (
                <Button 
                  onClick={() => {
                    setCurrentMode('presentation');
                    setCurrentWordIndex(prev => prev + 1);
                  }}
                  className="btn-pixel bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  继续学习
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              ) : (
                <>
                  <p className="text-center text-muted-foreground">
                    本轮学习完成！
                  </p>
                  <Link href={`/vocabulary/${pack.id}/quiz`} passHref>
                    <Button className="btn-pixel bg-accent text-accent-foreground hover:bg-accent/90">
                      <CheckCircle2 size={18} className="mr-2" />
                      参加测验
                    </Button>
                  </Link>
                </>
              )}
              
              <Link href="/vocabulary" passHref>
                <Button variant="link" className="text-accent">
                  返回词汇包列表
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
    
