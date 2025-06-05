// 词汇学习进度类型定义
export interface VocabularyProgress {
  vocabularyId: string;
  packId: string;
  stage: 'new' | 'learning' | 'reviewing' | 'mastered';
  lastReviewedAt: string; // ISO date string
  nextReviewAt: string; // ISO date string
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  easeFactor: number; // 难度系数，用于调整复习间隔
  interval: number; // 当前复习间隔（天）
  createdAt: string;
  updatedAt: string;
}

// 学习会话数据
export interface LearningSession {
  packId: string;
  startedAt: string;
  completedAt?: string;
  newWordsLearned: number;
  wordsReviewed: number;
  correctAnswers: number;
  totalAnswers: number;
}

// 扩展的词汇项，包含学习进度
export interface VocabularyItemWithProgress {
  id: string;
  english: string;
  chinese: string;
  pronunciationAudio?: string;
  exampleSentenceEn: string;
  exampleSentenceZh: string;
  progress?: VocabularyProgress;
}

// 艾宾浩斯遗忘曲线间隔（分钟）
const EBBINGHAUS_INTERVALS = {
  immediate: 0,      // 立即
  min20: 20,         // 20分钟
  hour1: 60,         // 1小时
  hour9: 540,        // 9小时
  day1: 1440,        // 1天
  day2: 2880,        // 2天
  day6: 8640,        // 6天
  day31: 44640,      // 31天
};

// 计算下次复习时间
export function calculateNextReview(progress: VocabularyProgress, isCorrect: boolean): VocabularyProgress {
  const now = new Date();
  let newInterval = progress.interval;
  let newEaseFactor = progress.easeFactor;
  let newStage = progress.stage;
  
  if (isCorrect) {
    // 答对了
    if (progress.stage === 'new') {
      newStage = 'learning';
      newInterval = EBBINGHAUS_INTERVALS.min20 / 1440; // 转换为天
    } else if (progress.stage === 'learning') {
      if (progress.reviewCount >= 2) {
        newStage = 'reviewing';
      }
      // 根据复习次数决定间隔
      const intervals = [
        EBBINGHAUS_INTERVALS.min20,
        EBBINGHAUS_INTERVALS.hour1,
        EBBINGHAUS_INTERVALS.hour9,
        EBBINGHAUS_INTERVALS.day1
      ];
      const intervalIndex = Math.min(progress.reviewCount, intervals.length - 1);
      newInterval = intervals[intervalIndex] / 1440;
    } else {
      // reviewing 或 mastered 阶段
      newInterval = progress.interval * progress.easeFactor;
      if (newInterval > 180) { // 超过180天视为掌握
        newStage = 'mastered';
      }
    }
    
    // 增加难度系数（最多2.5）
    newEaseFactor = Math.min(progress.easeFactor + 0.1, 2.5);
  } else {
    // 答错了
    newInterval = EBBINGHAUS_INTERVALS.min20 / 1440; // 重置到20分钟
    newEaseFactor = Math.max(progress.easeFactor - 0.2, 1.3); // 降低难度系数
    if (progress.stage === 'reviewing' || progress.stage === 'mastered') {
      newStage = 'learning'; // 退回学习阶段
    }
  }
  
  const nextReviewAt = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
  
  return {
    ...progress,
    stage: newStage,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReviewAt.toISOString(),
    reviewCount: progress.reviewCount + 1,
    correctCount: isCorrect ? progress.correctCount + 1 : progress.correctCount,
    incorrectCount: isCorrect ? progress.incorrectCount : progress.incorrectCount + 1,
    easeFactor: newEaseFactor,
    interval: newInterval,
    updatedAt: now.toISOString()
  };
}

// 获取需要复习的单词
export function getWordsForReview(
  words: VocabularyItemWithProgress[],
  limit: number = 20
): VocabularyItemWithProgress[] {
  const now = new Date();
  
  // 筛选出需要复习的单词
  const dueWords = words.filter(word => {
    if (!word.progress) return true; // 新词
    const nextReviewDate = new Date(word.progress.nextReviewAt);
    return nextReviewDate <= now;
  });
  
  // 排序：新词优先，然后按照过期时间排序
  dueWords.sort((a, b) => {
    if (!a.progress && !b.progress) return 0;
    if (!a.progress) return -1;
    if (!b.progress) return 1;
    
    const aDate = new Date(a.progress.nextReviewAt);
    const bDate = new Date(b.progress.nextReviewAt);
    return aDate.getTime() - bDate.getTime();
  });
  
  return dueWords.slice(0, limit);
}

// 初始化词汇进度
export function initializeProgress(vocabularyId: string, packId: string): VocabularyProgress {
  const now = new Date().toISOString();
  return {
    vocabularyId,
    packId,
    stage: 'new',
    lastReviewedAt: now,
    nextReviewAt: now,
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    easeFactor: 1.5,
    interval: 0,
    createdAt: now,
    updatedAt: now
  };
}

// 本地存储键名
const STORAGE_KEYS = {
  PROGRESS: 'vocabulary_progress',
  SESSIONS: 'learning_sessions',
  SETTINGS: 'learning_settings'
};

// 保存进度到本地存储
export function saveProgress(packId: string, progresses: VocabularyProgress[]): void {
  const allProgress = loadAllProgress();
  allProgress[packId] = progresses;
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
}

// 加载所有进度
export function loadAllProgress(): Record<string, VocabularyProgress[]> {
  const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  return stored ? JSON.parse(stored) : {};
}

// 加载特定词汇包的进度
export function loadPackProgress(packId: string): VocabularyProgress[] {
  const allProgress = loadAllProgress();
  return allProgress[packId] || [];
}

// 获取学习统计
export function getLearningStats(packId: string): {
  totalWords: number;
  newWords: number;
  learningWords: number;
  reviewingWords: number;
  masteredWords: number;
  dueForReview: number;
} {
  const progresses = loadPackProgress(packId);
  const now = new Date();
  
  const stats = {
    totalWords: progresses.length,
    newWords: 0,
    learningWords: 0,
    reviewingWords: 0,
    masteredWords: 0,
    dueForReview: 0
  };
  
  progresses.forEach(progress => {
    switch (progress.stage) {
      case 'new':
        stats.newWords++;
        break;
      case 'learning':
        stats.learningWords++;
        break;
      case 'reviewing':
        stats.reviewingWords++;
        break;
      case 'mastered':
        stats.masteredWords++;
        break;
    }
    
    if (new Date(progress.nextReviewAt) <= now) {
      stats.dueForReview++;
    }
  });
  
  return stats;
} 