"use client";
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
    <div className="w-full max-w-2xl mx-auto perspective-element transform transition-transform duration-200 ease-out">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-sm"></div>
        <div className="relative glass-card rounded-3xl p-6 sm:p-8">
          <div className="space-y-4">
            {/* 总体进度 */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-white">词汇包学习进度</span>
                <span className="text-gray-400">
                  {Math.round(learnedPercentage)}% 已学习
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${learnedPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* 详细统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="glass-card-strong rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-yellow-400" size={16} />
                  <span className="text-xs text-gray-400">新词</span>
                </div>
                <p className="text-lg font-semibold text-white">{stats.newWords}</p>
              </div>

              <div className="glass-card-strong rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-blue-400" size={16} />
                  <span className="text-xs text-gray-400">学习中</span>
                </div>
                <p className="text-lg font-semibold text-white">{stats.learningWords}</p>
              </div>

              <div className="glass-card-strong rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="text-orange-400" size={16} />
                  <span className="text-xs text-gray-400">复习中</span>
                </div>
                <p className="text-lg font-semibold text-white">{stats.reviewingWords}</p>
              </div>

              <div className="glass-card-strong rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Trophy className="text-green-400" size={16} />
                  <span className="text-xs text-gray-400">已掌握</span>
                </div>
                <p className="text-lg font-semibold text-white">{stats.masteredWords}</p>
              </div>
            </div>

            {/* 今日学习情况 */}
            <div className="glass-card-strong rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                本次学习
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold text-purple-400">{sessionStats.wordsLearned}</p>
                  <p className="text-xs text-gray-400">新学单词</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold text-blue-400">{sessionStats.wordsReviewed}</p>
                  <p className="text-xs text-gray-400">复习单词</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold text-green-400">{sessionStats.correctRate}%</p>
                  <p className="text-xs text-gray-400">正确率</p>
                </div>
              </div>
            </div>

            {/* 待复习提醒 */}
            {stats.dueForReview > 0 && (
              <div className="gradient-secondary rounded-xl p-3">
                <p className="text-sm text-white">
                  🔔 有 <span className="font-semibold text-orange-400">{stats.dueForReview}</span> 个单词需要复习
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 