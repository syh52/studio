'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
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
} from "../../components/ui/alert-dialog";
import { Skeleton } from '../../components/ui/skeleton'
import { Dialogue } from '../../lib/data'
import { 
  Trash2, 
  Edit, 
  Upload, 
  FileText, 
  Calendar,
  MessageSquare,
  Volume2,
  Shield
} from 'lucide-react';
import { getCachedAdminPermissions, hasPermission } from '../../lib/admin-auth';

interface DialogueManagementProps {
  dialogues: Dialogue[];
  dataLoading: boolean;
  searchTerm: string;
  onEdit: (dialogue: Dialogue) => void;
  onDelete: (dialogueId: string) => void;
}

export default function DialogueManagement({ 
  dialogues, 
  dataLoading, 
  searchTerm, 
  onEdit, 
  onDelete 
}: DialogueManagementProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查管理员权限
  useEffect(() => {
    const permissions = getCachedAdminPermissions();
    setIsAdmin(permissions ? hasPermission('canAccessUpload') : false);
  }, []);

  // 过滤对话
  const filteredDialogues = dialogues.filter(dialogue =>
    dialogue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dialogue.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (filteredDialogues.length === 0) {
    return (
      <Card className="glass-card border-white/20 bg-white/5">
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 leading-relaxed">
            {searchTerm ? '没有找到匹配的对话' : '还没有公共对话'}
          </p>
          <Button 
            variant="outline" 
            className="mt-4 glass-card border-white/30 text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            onClick={() => router.push('/upload')}
          >
            上传对话
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 权限提示 */}
      {!isAdmin && (
        <div className="glass-card border-orange-500/30 bg-orange-500/5 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-orange-300">
            <Shield className="h-4 w-4" />
            <span className="font-medium">查看模式</span>
          </div>
          <p className="text-sm text-orange-200 mt-1">
            您当前处于查看模式，无法编辑或删除公共内容。如需管理权限，请联系管理员。
          </p>
        </div>
      )}

      {/* 对话列表 */}
      <div className="grid gap-4">
        {filteredDialogues.map((dialogue, index) => (
          <Card 
            key={dialogue.id} 
            className="glass-card border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 perspective-element animate-blur-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-white font-inter tracking-tight">
                    {dialogue.title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-gray-400 leading-relaxed">
                    {dialogue.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {dialogue.lines.length} 条对话
                    </span>
                    {(dialogue as any).audio && (
                      <span className="flex items-center gap-1">
                        <Volume2 className="h-3 w-3" />
                        包含音频
                      </span>
                    )}
                    {(dialogue as any).uploadedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date((dialogue as any).uploadedAt).toLocaleDateString('zh-CN')}
                      </span>
                    )}
                  </div>
                </div>
                {/* 只有管理员才能看到编辑和删除按钮 */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(dialogue)}
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
                            您确定要删除对话"{dialogue.title}"吗？此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="glass-card border-white/30 text-white hover:bg-white/10">
                            取消
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(dialogue.id)}
                            className="bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                          >
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dialogue.lines.slice(0, 3).map((line, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-white">{line.speaker}:</span>
                    {' '}
                    <span className="text-gray-400">{line.english}</span>
                  </div>
                ))}
                {dialogue.lines.length > 3 && (
                  <p className="text-sm text-gray-500">
                    ... 还有 {dialogue.lines.length - 3} 条对话
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 