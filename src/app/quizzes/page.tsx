"use client";
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation';
import { vocabularyPacks, type VocabularyPack } from '../../lib/data'
import Link from 'next/link';
import * as LucideIcons from 'lucide-react'; // For dynamic icons

interface QuizPackCardProps {
  pack: VocabularyPack;
}

const QuizPackCard = ({ pack }: QuizPackCardProps) => {
  const IconComponent = pack.icon ? (LucideIcons[pack.icon as keyof typeof LucideIcons] as React.ElementType) : LucideIcons.FileQuestion;

  return (
    <div className="relative group">
      <Link href={`/vocabulary/${pack.id}/quiz`} passHref>
        <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 perspective-element transform transition-all duration-200 ease-out hover:scale-105 cursor-pointer active:scale-95 btn-enhanced h-full flex flex-col">
          <div className="flex items-start gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
              {IconComponent && <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-400" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-inter font-semibold text-white mb-1 tracking-tight">{pack.name}</h3>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed flex-grow">
            通过测验检验您对"{pack.name}"词汇包的掌握程度。
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              包含 <span className="font-medium text-green-400">{pack.items.length}</span> 个相关词条的测验。
            </p>
            <button className="w-full gradient-primary text-white py-3 px-4 rounded-xl text-sm font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2">
              <LucideIcons.PlayCircle className="h-4 w-4" />
              开始测验
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default function QuizzesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-inter text-xl text-white">加载认证状态...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-inter text-xl text-white">需要登录，正在跳转至登录页面...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10 py-4 sm:py-6">
      {/* Header Section */}
      <div className="relative perspective-element transform transition-transform duration-200 ease-out animate-blur-in animate-delay-200">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-sm"></div>
        <div className="relative glass-card rounded-3xl p-6 sm:p-8 md:p-10">
          <div className="text-center">
            <div className="text-xs sm:text-sm font-medium text-green-400 mb-3 sm:mb-4 tracking-wide uppercase">测验中心</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-inter font-semibold text-white mb-3 sm:mb-4 tracking-tight">智能测验</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">选择一个词汇包来检验您的学习成果并赢取积分！</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 animate-blur-in animate-delay-400">
        {vocabularyPacks.map(pack => (
          <QuizPackCard key={pack.id} pack={pack} />
        ))}
      </div>
      
      {vocabularyPacks.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <LucideIcons.HelpCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm sm:text-base mb-2">目前没有可用的测验</p>
          <p className="text-gray-500 text-xs sm:text-sm">请先学习一些词汇包！</p>
        </div>
      )}
    </div>
  );
}
