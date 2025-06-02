"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Mail, Award, LogOut, Edit3 } from 'lucide-react';
import IndexDisplay from '@/components/shared/IndexDisplay';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Card className="pixel-border shadow-lg">
        <CardHeader className="text-center">
          <Image 
            src={`https://placehold.co/120x120.png?text=${user.username ? user.username.charAt(0).toUpperCase() : 'U'}`} 
            alt="用户头像" 
            width={120} 
            height={120} 
            data-ai-hint="avatar character"
            className="rounded-full mx-auto mb-4 pixel-border border-4 border-accent"
          />
          <CardTitle className="font-headline text-3xl text-accent">{user.username}</CardTitle>
          <CardDescription>您的 Lexicon 个人资料</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-card-foreground/5 rounded-sm pixel-border">
            <UserCircle className="text-accent" size={24} />
            <div>
              <p className="text-xs text-muted-foreground">用户名</p>
              <p className="text-lg">{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card-foreground/5 rounded-sm pixel-border">
            <Mail className="text-accent" size={24} />
            <div>
              <p className="text-xs text-muted-foreground">邮箱</p>
              <p className="text-lg">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 p-3 bg-card-foreground/5 rounded-sm pixel-border">
            <div className="flex items-center gap-3">
              <Award className="text-accent" size={24} />
              <div>
                <p className="text-xs text-muted-foreground">当前指数</p>
                 <IndexDisplay points={user.indexPoints} />
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-accent hover:bg-accent/20">
              <Edit3 size={16} className="mr-1" /> 编辑 (敬请期待)
            </Button>
          </div>
          
          <Button onClick={logout} variant="destructive" className="w-full btn-pixel mt-6">
            <LogOut size={20} className="mr-2" /> 退出登录
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
