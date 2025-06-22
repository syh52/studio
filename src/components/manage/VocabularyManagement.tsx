'use client';

import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '../../components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '../../components/ui/skeleton'
import { VocabularyPack } from '../../lib/data'
import { 
  Trash2, 
  Edit, 
  Book, 
  Volume2
} from 'lucide-react';

interface VocabularyManagementProps {
  vocabularyPacks: VocabularyPack[];
  dataLoading: boolean;
  searchTerm: string;
  onEdit: (pack: VocabularyPack) => void;
  onDelete: (packId: string) => void;
}

export default function VocabularyManagement({ 
  vocabularyPacks, 
  dataLoading, 
  searchTerm, 
  onEdit, 
  onDelete 
}: VocabularyManagementProps) {
  const router = useRouter();

  // 过滤词汇包
  const filteredVocabularyPacks = vocabularyPacks.filter(pack =>
    pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (dataLoading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <Skeleton className="h-6 w-1/3 bg-white/10" />
              <Skeleton className="h-4 w-2/3 mt-2 bg-white/10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredVocabularyPacks.length === 0) {
    return (
      <Card className="glass-card border-white/20 bg-white/5">
        <CardContent className="text-center py-12">
          <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 leading-relaxed">
            {searchTerm ? '没有找到匹配的词汇包' : '您还没有上传任何词汇包'}
          </p>
          <Button 
            variant="outline" 
            className="mt-4 glass-card border-white/30 text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            onClick={() => router.push('/upload')}
          >
            上传词汇包
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredVocabularyPacks.map((pack, index) => (
        <Card 
          key={pack.id} 
          className="glass-card border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 perspective-element animate-blur-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl text-white font-inter tracking-tight">
                  {pack.name}
                </CardTitle>
                <CardDescription className="mt-1 text-gray-400 leading-relaxed">
                  {pack.description}
                </CardDescription>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Book className="h-3 w-3" />
                    {pack.items.length} 个词汇
                  </span>
                  <span className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    {pack.items.filter(item => item.pronunciationAudio).length} 个有音频
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(pack)}
                  className="glass-card border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 modern-focus"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="glass-card border-red-500/30 text-red-400 hover:bg-red-500/10 hover:scale-105 transition-all duration-200 modern-focus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-card-strong border-white/30 bg-gray-900/95">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white font-inter">确认删除</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400 leading-relaxed">
                        您确定要删除词汇包"{pack.name}"吗？此操作无法撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="glass-card border-white/30 text-white hover:bg-white/10">
                        取消
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(pack.id)}
                        className="bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                      >
                        删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pack.items.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-white min-w-20">{item.english}</span>
                  <span className="text-gray-400 flex-1">{item.chinese}</span>
                  {item.pronunciationAudio && (
                    <Volume2 className="h-3 w-3 text-green-400" />
                  )}
                </div>
              ))}
              {pack.items.length > 5 && (
                <p className="text-sm text-gray-500 pt-2">
                  ... 还有 {pack.items.length - 5} 个词汇
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 