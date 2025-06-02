import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { VocabularyPack } from '@/lib/data';
import * as LucideIcons from 'lucide-react';

interface VocabularyPackCardProps {
  pack: VocabularyPack;
}

export default function VocabularyPackCard({ pack }: VocabularyPackCardProps) {
  const IconComponent = pack.icon ? (LucideIcons[pack.icon as keyof typeof LucideIcons] as React.ElementType) : LucideIcons.BookOpen;

  return (
    <Card className="pixel-border shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          {IconComponent && <IconComponent size={32} className="text-accent" />}
          <CardTitle className="font-headline text-xl">{pack.name}</CardTitle>
        </div>
        <CardDescription className="h-16 overflow-hidden text-ellipsis">{pack.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">包含 {pack.items.length} 个词条。</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Link href={`/vocabulary/${pack.id}`} passHref>
          <Button className="btn-pixel bg-primary text-primary-foreground hover:bg-primary/90">
            <LucideIcons.Sparkles size={16} className="mr-2"/>开始学习
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
