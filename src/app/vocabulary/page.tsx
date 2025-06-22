"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation';
import { getAllVocabularyPacks, deleteCustomVocabularyPack } from '../../lib/data'
import VocabularyPackCard from '../../components/vocabulary/VocabularyPackCard'
import { Search, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button'
import { useToast } from '../../hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function VocabularyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [vocabularyPacks, setVocabularyPacks] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packToDelete, setPackToDelete] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // 加载词汇包数据
    const loadVocabularyPacks = async () => {
      if (isAuthenticated && user) {
        setDataLoading(true);
        try {
          const packs = await getAllVocabularyPacks(user.id);
          setVocabularyPacks(packs);
        } catch (error) {
          console.error('Failed to load vocabulary packs:', error);
          toast({
            title: "加载失败",
            description: "无法加载词汇包",
            variant: "destructive",
          });
        } finally {
          setDataLoading(false);
        }
      }
    };
    
    loadVocabularyPacks();
  }, [isAuthenticated, user, toast]);

  const handleDeletePack = (pack: any) => {
    setPackToDelete(pack);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (packToDelete && packToDelete.id.startsWith('custom-') && user) {
      try {
        const success = await deleteCustomVocabularyPack(user.id, packToDelete.id);
        if (success) {
          // 重新加载数据
          const packs = await getAllVocabularyPacks(user.id);
          setVocabularyPacks(packs);
          toast({
            title: "删除成功",
            description: "自定义词汇包已删除",
          });
        } else {
          toast({
            title: "删除失败",
            description: "无法删除词汇包",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "删除失败",
          description: "发生错误，请稍后再试",
          variant: "destructive",
        });
      }
    }
    setDeleteDialogOpen(false);
    setPackToDelete(null);
  };

  if (isLoading || !isAuthenticated || dataLoading) {
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
          <div key={pack.id} className="relative group">
            <VocabularyPackCard pack={pack} />
            {pack.id.startsWith('custom-') && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePack(pack);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除自定义词汇包 "{packToDelete?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
