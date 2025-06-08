import type { VocabularyPack } from '@/lib/data';
import { getLearningStats } from '@/lib/vocabulary-learning';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useCallback, useMemo, memo } from 'react';

interface VocabularyPackCardProps {
  pack: VocabularyPack;
}

function calculatePackProgress(packId: string) {
  const stats = getLearningStats(packId);
  const totalWords = stats.totalWords || 0;
  const learnedWords = totalWords - (stats.newWords || 0);
  const percentage = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
  return {
    percentage,
    reviewCount: stats.dueForReview || 0
  };
}

function VocabularyPackCard({ pack }: VocabularyPackCardProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // 使用useMemo缓存计算结果
  const progress = useMemo(() => calculatePackProgress(pack.id), [pack.id]);
  const isNewPack = useMemo(() => progress.percentage === 0, [progress.percentage]);

  // 使用useCallback缓存事件处理函数
  const handleLearnClick = useCallback(() => {
    setIsNavigating(true);
    router.push(`/vocabulary/${pack.id}`);
  }, [pack.id, router]);

  const handleQuizClick = useCallback(() => {
    setIsNavigating(true);
    router.push(`/vocabulary/${pack.id}/quiz`);
  }, [pack.id, router]);

  return (
    <div className={`glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 perspective-element transform transition-all duration-200 ease-out hover:scale-105 cursor-pointer active:scale-95 btn-enhanced ${isNavigating ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-4 mb-4 sm:mb-6">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-inter font-semibold text-white mb-1 tracking-tight">{pack.name}</h3>
        </div>
      </div>
      <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
        {pack.description}
      </p>
        
        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm text-gray-400">
            包含 <span className="font-medium text-purple-400">{pack.items.length}</span> 个词条。
          </p>
          
          {!isNewPack && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">学习进度</span>
                <span className="text-purple-400 font-medium">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 relative overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              
              {progress.reviewCount > 0 && (
                <p className="text-xs sm:text-sm text-orange-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {progress.reviewCount} 个单词待复习
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <button 
            onClick={handleLearnClick}
            disabled={isNavigating}
            className="flex-1 gradient-primary text-white py-3 px-4 rounded-xl text-sm font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BookOpen className="h-4 w-4" />
            {isNavigating ? "加载中..." : (isNewPack ? "开始学习" : "继续学习")}
          </button>
          <button 
            onClick={handleQuizClick}
            disabled={isNavigating}
            className="flex-1 glass-card-strong border-purple-400/30 text-purple-400 py-3 px-4 rounded-xl text-sm font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-purple-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4" />
            {isNavigating ? "加载中..." : "参加测验"}
          </button>
        </div>
    </div>
  );
}

// 使用React.memo包装组件以防止不必要的重新渲染
export default memo(VocabularyPackCard);
