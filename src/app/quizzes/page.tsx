
"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { vocabularyPacks, type VocabularyPack } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react'; // For dynamic icons

interface QuizPackCardProps {
  pack: VocabularyPack;
}

const QuizPackCard = ({ pack }: QuizPackCardProps) => {
  const IconComponent = pack.icon ? (LucideIcons[pack.icon as keyof typeof LucideIcons] as React.ElementType) : LucideIcons.FileQuestion;

  return (
    <Card className="pixel-border shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          {IconComponent && <IconComponent size={32} className="text-accent" />}
          <CardTitle className="font-headline text-xl">{pack.name}</CardTitle>
        </div>
        <CardDescription className="h-16 overflow-hidden text-ellipsis">
          通过测验检验您对“{pack.name}”词汇包的掌握程度。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">包含 {pack.items.length} 个相关词条的测验。</p>
      </CardContent>
      <CardFooter>
        <Link href={`/vocabulary/${pack.id}/quiz`} passHref className="w-full">
          <Button className="btn-pixel bg-primary text-primary-foreground hover:bg-primary/90 w-full">
            <LucideIcons.PlayCircle size={16} className="mr-2"/>开始测验
          </Button>
        </Link>
      </CardFooter>
    </Card>
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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 font-headline text-lg">加载测验模块...</p>
      </div>
    );
  }
  
  // TODO: Implement search/filter functionality for quizzes if many packs are added
  // const [searchTerm, setSearchTerm] = useState('');
  // const filteredPacks = vocabularyPacks.filter(pack => 
  //   pack.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-headline text-accent mb-2">开始测验</h1>
        <p className="text-lg text-muted-foreground">选择一个词汇包来检验您的学习成果并赢取指数！</p>
      </section>
      
      {/* Search bar - future enhancement
      <div className="relative w-full max-w-lg mx-auto">
        <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="搜索测验..." 
          className="pl-10 input-pixel"
          // onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div> 
      */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vocabularyPacks.map(pack => (
          <QuizPackCard key={pack.id} pack={pack} />
        ))}
      </div>
      {vocabularyPacks.length === 0 && (
        <p className="text-center text-muted-foreground">目前没有可用的测验。请先学习一些词汇包！</p>
      )}
    </div>
  );
}
