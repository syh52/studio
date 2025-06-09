import type { VocabularyPack } from '@/lib/data';
import { getLearningStats } from '@/lib/vocabulary-learning';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useCallback, useMemo, memo } from 'react';

interface VocabularyPackCardProps {
  pack: VocabularyPack;
}

// 计算学习进度的函数
function calculatePackProgress(packId: string) {
  const stats = getLearningStats(packId);
  // 计算已学习的单词数（学习中 + 复习中 + 已掌握）
  const learnedWords = stats.learningWords + stats.reviewingWords + stats.masteredWords;
  const totalWords = stats.totalWords;
  const percentage = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
  return {
    percentage,
    reviewCount: stats.dueForReview
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
    <div className={`glass-card rounded-2xl p-4 md:p-5 lg:p-6 perspective-element transform transition-all duration-200 ease-out hover:scale-105 cursor-pointer active:scale-95 btn-enhanced ${isNavigating ? 'opacity-50' : ''} h-full flex flex-col`}>
      <div className="flex items-start gap-3 mb-3 md:mb-4">
        <div className="flex-1">
          <h3 className="text-base md:text-lg lg:text-xl font-inter font-semibold text-white mb-1 tracking-tight line-clamp-2">{pack.name}</h3>
        </div>
      </div>
      <p className="text-sm md:text-base text-gray-300 mb-3 md:mb-4 leading-relaxed line-clamp-3 flex-grow">
        {pack.description}
      </p>
        
        <div className="space-y-3 md:space-y-4">
          <p className="text-xs md:text-sm text-gray-400">
            包含 <span className="font-medium text-purple-400">{pack.items.length}</span> 个词条。
          </p>
          
          {!isNewPack && (
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-300">学习进度</span>
                <span className="text-purple-400 font-medium">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-1.5 md:h-2 relative overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 md:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              
              {progress.reviewCount > 0 && (
                <p className="text-xs text-orange-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                  {progress.reviewCount} 个单词待复习
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 md:gap-3 mt-3 md:mt-4">
          <button 
            onClick={handleLearnClick}
            disabled={isNavigating}
            className="w-full gradient-primary text-white py-2.5 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl text-xs md:text-sm font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
            {isNavigating ? "加载中..." : (isNewPack ? "开始学习" : "继续学习")}
          </button>
          <button 
            onClick={handleQuizClick}
            disabled={isNavigating}
            className="w-full glass-card-strong border-purple-400/30 text-purple-400 py-2.5 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl text-xs md:text-sm font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-purple-500/10 flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
            {isNavigating ? "加载中..." : "参加测验"}
          </button>
        </div>
    </div>
  );
}

// 使用React.memo优化重渲染
export default memo(VocabularyPackCard);
