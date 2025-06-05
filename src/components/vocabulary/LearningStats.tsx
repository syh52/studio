"use client";
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, BookOpen, Target, Trophy, Clock } from 'lucide-react';

interface LearningStatsProps {
  stats: {
    totalWords: number;
    newWords: number;
    learningWords: number;
    reviewingWords: number;
    masteredWords: number;
    dueForReview: number;
  };
  sessionStats: {
    wordsLearned: number;
    wordsReviewed: number;
    correctRate: number;
  };
}

export default function LearningStats({ stats, sessionStats }: LearningStatsProps) {
  const learnedPercentage = stats.totalWords > 0 
    ? ((stats.totalWords - stats.newWords) / stats.totalWords) * 100 
    : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 pixel-border">
      <div className="space-y-4">
        {/* 总体进度 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">词汇包学习进度</span>
            <span className="text-muted-foreground">
              {Math.round(learnedPercentage)}% 已学习
            </span>
          </div>
          <Progress value={learnedPercentage} className="h-2" />
        </div>

        {/* 详细统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-secondary/50 p-3 rounded-md space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={16} />
              <span className="text-xs text-muted-foreground">新词</span>
            </div>
            <p className="text-lg font-semibold">{stats.newWords}</p>
          </div>

          <div className="bg-secondary/50 p-3 rounded-md space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="text-blue-500" size={16} />
              <span className="text-xs text-muted-foreground">学习中</span>
            </div>
            <p className="text-lg font-semibold">{stats.learningWords}</p>
          </div>

          <div className="bg-secondary/50 p-3 rounded-md space-y-1">
            <div className="flex items-center gap-2">
              <Target className="text-orange-500" size={16} />
              <span className="text-xs text-muted-foreground">复习中</span>
            </div>
            <p className="text-lg font-semibold">{stats.reviewingWords}</p>
          </div>

          <div className="bg-secondary/50 p-3 rounded-md space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="text-green-500" size={16} />
              <span className="text-xs text-muted-foreground">已掌握</span>
            </div>
            <p className="text-lg font-semibold">{stats.masteredWords}</p>
          </div>
        </div>

        {/* 今日学习情况 */}
        <div className="border-t pt-3 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock size={14} />
            本次学习
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-accent">{sessionStats.wordsLearned}</p>
              <p className="text-xs text-muted-foreground">新学单词</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-blue-600">{sessionStats.wordsReviewed}</p>
              <p className="text-xs text-muted-foreground">复习单词</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-green-600">{sessionStats.correctRate}%</p>
              <p className="text-xs text-muted-foreground">正确率</p>
            </div>
          </div>
        </div>

        {/* 待复习提醒 */}
        {stats.dueForReview > 0 && (
          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-md">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              🔔 有 {stats.dueForReview} 个单词需要复习
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 