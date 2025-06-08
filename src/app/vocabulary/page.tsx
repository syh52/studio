"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { vocabularyPacks } from '@/lib/data';
import VocabularyPackCard from '@/components/vocabulary/VocabularyPackCard';
import { Search } from 'lucide-react';

export default function VocabularyPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // TODO: Implement search functionality
  // const [searchTerm, setSearchTerm] = useState('');
  // const filteredPacks = vocabularyPacks.filter(pack => 
  //   pack.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10 py-4 sm:py-6">

      {/* Search bar - future enhancement */}
      {/* <div className="relative w-full max-w-lg mx-auto animate-blur-in animate-delay-300">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <div className="glass-card rounded-2xl">
          <input 
            type="search" 
            placeholder="搜索词汇包..." 
            className="w-full bg-transparent border-0 pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-2xl"
          />
        </div>
      </div> */}

      {/* Vocabulary Packs Grid - 优化桌面端布局 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 animate-blur-in animate-delay-400">
        {vocabularyPacks.map(pack => (
          <VocabularyPackCard key={pack.id} pack={pack} />
        ))}
      </div>
      
      {vocabularyPacks.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm sm:text-base">目前没有可用的词汇包。请稍后再回来查看！</p>
        </div>
      )}
    </div>
  );
}
