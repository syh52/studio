"use client";
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation';
import { vocabularyPacks, getAllVocabularyPacks, VocabularyPack } from '../../../lib/data'
import { Button } from '../../../components/ui/button'
import { ChevronLeft, Play, CheckCircle2, X, Volume2 } from 'lucide-react';
import Link from 'next/link';

type LearningMode = 'presentation' | 'detailed' | 'completed';

export default function VocabularyLearningPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ packId: string }>();
  const packId = params.packId;

  const [currentMode, setCurrentMode] = useState<LearningMode>('presentation');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [pack, setPack] = useState<VocabularyPack | null>(null);
  const currentWord = pack?.items[currentWordIndex];

  // 认证检查
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 加载词汇包数据
  useEffect(() => {
    const loadVocabularyPack = async () => {
      if (!packId || authLoading) return;

      setIsLoading(true);
      try {
        // 首先尝试从本地词汇包中查找
        const localPack = vocabularyPacks.find(p => p.id === packId);
        if (localPack) {
          setPack(localPack);
          setIsLoading(false);
          return;
        }

        // 如果本地未找到且用户已登录，从Firestore获取所有词汇包
        if (user) {
          const allPacks = await getAllVocabularyPacks(user.id);
          const foundPack = allPacks.find(p => p.id === packId);
          if (foundPack) {
            setPack(foundPack);
          }
        }
      } catch (error) {
        console.error('Failed to load vocabulary pack:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVocabularyPack();
  }, [packId, user, authLoading]);

  // 播放发音
  const playAudio = () => {
    if (!currentWord) return;
    const utterance = new SpeechSynthesisUtterance(currentWord.english);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  // 处理"认识"
  const handleKnow = () => {
    if (!currentWord) return;
    setCurrentMode('detailed');
  };

  // 处理"不认识"
  const handleDontKnow = () => {
    if (!currentWord) return;
    setCurrentMode('detailed');
  };

  // 继续下一个单词
  const handleContinue = () => {
    if (!currentWord) return;
    
    // 记录已学单词
    if (!learnedWords.includes(currentWord.id)) {
      setLearnedWords(prev => [...prev, currentWord.id]);
    }
    
    goToNextWord();
  };

  // 跳转到下一个单词
  const goToNextWord = () => {
    if (pack && currentWordIndex < pack.items.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setCurrentMode('presentation');
    } else {
      setCurrentMode('completed');
    }
  };

  // 重置学习
  const handleRestart = () => {
    setCurrentWordIndex(0);
    setCurrentMode('presentation');
    setLearnedWords([]);
  };

  // 加载中
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 未找到词汇包
  if (!pack) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-8">
            <h1 className="text-2xl font-semibold text-white mb-4">未找到词汇包</h1>
            <p className="text-gray-400 mb-6">无法找到所请求的词汇包。</p>
            <Link href="/vocabulary" passHref>
              <Button className="gradient-primary text-white px-6 py-3 rounded-xl font-medium">
                返回词汇包列表
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 学习完成
  if (currentMode === 'completed') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="text-center space-y-6">
            {/* 成功图标 */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-sm"></div>
              <div className="relative w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center glass-card">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
            </div>
            
            {/* 完成信息 */}
            <div className="glass-card rounded-3xl p-8">
              <h1 className="text-3xl font-semibold text-white mb-3">学习完成！🎉</h1>
              <p className="text-gray-300 mb-2">
                恭喜你完成了《{pack.name}》的学习
              </p>
              <p className="text-sm text-purple-400">
                共学习了 {learnedWords.length} / {pack.items.length} 个单词
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button 
                onClick={handleRestart}
                className="w-full gradient-primary text-white py-4 px-6 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Play size={18} />
                重新学习
              </button>
              
              <Link href={`/vocabulary/${pack.id}/quiz`} passHref>
                <button className="w-full glass-card-strong text-purple-400 py-4 px-6 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-purple-400/30">
                  <CheckCircle2 size={18} />
                  参加测验
                </button>
              </Link>
              
              <Link href="/vocabulary" passHref>
                <button className="text-gray-400 hover:text-white transition-colors py-2">
                  返回词汇包列表
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 主学习界面
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 头部导航 */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/vocabulary">
            <button 
              className="glass-card p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="返回词汇包列表"
            >
              <ChevronLeft size={20} className="text-gray-300" />
            </button>
          </Link>
          
          <div className="text-center">
            <p className="text-sm text-gray-400">
              {currentWordIndex + 1} / {pack.items.length}
            </p>
          </div>

          <div className="w-12"></div> {/* 占位符 */}
        </div>

        {/* 进度条 */}
        <div className="max-w-md mx-auto mt-6">
          <div className="w-full glass-card rounded-full h-2">
            <div 
              className="gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(((currentWordIndex + 1) / pack.items.length) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 学习内容 */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto">
          {currentMode === 'presentation' && currentWord && (
            <div className="relative">
              {/* 背景光晕 */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-sm"></div>
              
              {/* 单词卡片 */}
              <div className="relative glass-card rounded-3xl p-8 min-h-[500px] flex flex-col">
                {/* 单词显示 */}
                <div className="flex-1 flex flex-col justify-center text-center space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-semibold text-white tracking-tight">
                      {currentWord.english}
                    </h2>
                    
                    {/* 发音按钮 */}
                    <button 
                      onClick={playAudio}
                      className="inline-flex items-center gap-2 px-4 py-2 glass-card-strong rounded-xl hover:bg-white/10 transition-all duration-200 active:scale-95"
                    >
                      <Volume2 size={18} className="text-purple-400" />
                      <span className="text-sm text-purple-400">点击发音</span>
                    </button>
                  </div>

                  {/* 例句 */}
                  <div className="glass-card-strong p-4 rounded-xl space-y-2">
                    <p className="text-base text-white font-medium">
                      {currentWord.exampleSentenceEn}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentWord.exampleSentenceZh}
                    </p>
                  </div>

                  
                </div>

                                 {/* 操作按钮 */}
                 <div className="flex flex-col gap-4 mt-6">
                   <button 
                     onClick={handleKnow}
                     className="gradient-primary text-white py-4 px-6 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                   >
                     <CheckCircle2 size={18} />
                     认识
                   </button>
                   <button 
                     onClick={handleDontKnow}
                     className="gradient-secondary text-white py-4 px-6 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                   >
                     <X size={18} />
                     不认识
                   </button>
                 </div>
              </div>
            </div>
          )}

          {currentMode === 'detailed' && currentWord && (
            <div className="relative">
              {/* 背景光晕 */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-sm"></div>
              
              {/* 详细学习卡片 */}
              <div className="relative glass-card rounded-3xl p-8 min-h-[500px]">
                <div className="space-y-6">
                  {/* 单词标题 */}
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-semibold text-white tracking-tight">
                      {currentWord.english}
                    </h2>
                    <button 
                      onClick={playAudio}
                      className="inline-flex items-center gap-2 px-3 py-1 glass-card-strong rounded-lg hover:bg-white/10 transition-all duration-200"
                    >
                      <Volume2 size={16} className="text-purple-400" />
                      <span className="text-sm text-purple-400">发音</span>
                    </button>
                  </div>

                  {/* 中文释义 */}
                  <div className="glass-card-strong rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-3"></div>
                      <div>
                        <h3 className="font-semibold text-purple-400 mb-2 text-base">中文释义</h3>
                        <div className="flex items-center gap-3">
                          <p className="text-xl text-white">{currentWord.chinese}</p>
                          {currentWord.partOfSpeech && (
                            <span className="glass-card-strong px-2 py-1 rounded-lg text-xs text-orange-400 font-medium">
                              {currentWord.partOfSpeech}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 例句 */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-green-400 text-base flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      例句
                    </h3>
                    <div className="glass-card-strong rounded-xl p-4 space-y-2">
                      <p className="font-medium text-white text-base">
                        {currentWord.exampleSentenceEn}
                      </p>
                      <p className="text-sm text-gray-400">
                        {currentWord.exampleSentenceZh}
                      </p>
                    </div>

                    {/* 更多例句 */}
                    {currentWord.additionalExamples && currentWord.additionalExamples.length > 0 && (
                      <div className="space-y-3">
                        {currentWord.additionalExamples.map((example, index) => (
                          <div key={index} className="glass-card-strong rounded-xl p-4 space-y-2">
                            <p className="font-medium text-white text-base">
                              {example.english}
                            </p>
                            <p className="text-sm text-gray-400">
                              {example.chinese}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 常见用法 */}
                  {currentWord.commonUsages && currentWord.commonUsages.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-blue-400 text-base flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        常见用法
                      </h3>
                      <div className="space-y-3">
                        {currentWord.commonUsages.map((usage, index) => (
                          <div key={index} className="glass-card-strong rounded-xl p-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-400 text-sm">
                                  {usage.phrase}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  • {usage.translation}
                                </span>
                              </div>
                              {usage.example && (
                                <p className="text-sm text-gray-300 italic border-l-2 border-blue-400/30 pl-3">
                                  {usage.example}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  

                  {/* 继续按钮 */}
                                     <button 
                     onClick={handleContinue}
                     className="w-full gradient-primary text-white py-4 px-8 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                   >
                     下一个
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    
