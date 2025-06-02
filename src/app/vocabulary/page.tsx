"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { vocabularyPacks } from '@/lib/data';
import VocabularyPackCard from '@/components/vocabulary/VocabularyPackCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // TODO: Implement search functionality
  // const [searchTerm, setSearchTerm] = useState('');
  // const filteredPacks = vocabularyPacks.filter(pack => 
  //   pack.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-headline text-accent mb-2">词汇包</h1>
        <p className="text-lg text-muted-foreground">选择一个词汇包开始学习航空术语。</p>
      </section>
      
      {/* Search bar - future enhancement */}
      {/* <div className="relative w-full max-w-lg mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="搜索词汇包..." 
          className="pl-10 input-pixel"
          // onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vocabularyPacks.map(pack => (
          <VocabularyPackCard key={pack.id} pack={pack} />
        ))}
      </div>
      {vocabularyPacks.length === 0 && (
        <p className="text-center text-muted-foreground">目前没有可用的词汇包。请稍后再回来查看！</p>
      )}
    </div>
  );
}
