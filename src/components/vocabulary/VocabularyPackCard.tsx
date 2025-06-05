import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { VocabularyPack } from '@/lib/data';
import { getLearningStats } from '@/lib/vocabulary-learning';
import * as LucideIcons from 'lucide-react';
import { useEffect, useState } from 'react';

interface VocabularyPackCardProps {
  pack: VocabularyPack;
}

export default function VocabularyPackCard({ pack }: VocabularyPackCardProps) {
  const [stats, setStats] = useState<ReturnType<typeof getLearningStats> | null>(null);
  const IconComponent = pack.icon ? (LucideIcons[pack.icon as keyof typeof LucideIcons] as React.ElementType) : LucideIcons.BookOpen;

  useEffect(() => {
    // 加载学习统计
    const packStats = getLearningStats(pack.id);
    setStats(packStats);
  }, [pack.id]);

  const learnedPercentage = stats && pack.items.length > 0
    ? ((pack.items.length - (stats.newWords || pack.items.length)) / pack.items.length) * 100
    : 0;

  return (
    <Card className="pixel-border shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          {IconComponent && <IconComponent size={32} className="text-accent" />}
          <CardTitle className="font-headline text-xl">{pack.name}</CardTitle>
        </div>
        <CardDescription className="h-16 overflow-hidden text-ellipsis">{pack.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-sm text-muted-foreground">包含 {pack.items.length} 个词条。</p>
        
        {/* 学习进度 */}
        {stats && learnedPercentage > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>学习进度</span>
              <span>{Math.round(learnedPercentage)}%</span>
            </div>
            <Progress value={learnedPercentage} className="h-2" />
            
            {stats.dueForReview > 0 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <LucideIcons.Clock size={12} />
                {stats.dueForReview} 个单词待复习
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Link href={`/vocabulary/${pack.id}`} passHref>
          <Button className="btn-pixel bg-primary text-primary-foreground hover:bg-primary/90">
            <LucideIcons.Sparkles size={16} className="mr-2"/>
            {learnedPercentage > 0 ? '继续学习' : '开始学习'}
          </Button>
        </Link>
        <Link href={`/vocabulary/${pack.id}/quiz`} passHref>
          <Button variant="outline" className="btn-pixel border-accent text-accent hover:bg-accent/10">
            <LucideIcons.FileQuestion size={16} className="mr-2"/>参加测验
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
