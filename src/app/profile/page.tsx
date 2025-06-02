
"use client";
import { useEffect } from 'react';
import { useAuth, AVATAR_STYLES, DEFAULT_AVATAR_STYLE } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Mail, Award, LogOut } from 'lucide-react';
import IndexDisplay from '@/components/shared/IndexDisplay';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProfilePage() {
  const { user, logout, isAuthenticated, isLoading, updateAvatarStyle } = useAuth();
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

  const handleAvatarStyleChange = (newStyle: string) => {
    updateAvatarStyle(newStyle);
  };
  
  const currentAvatarStyle = user.avatarStyle || DEFAULT_AVATAR_STYLE;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Card className="pixel-border shadow-lg">
        <CardHeader className="text-center">
          <Avatar className="w-32 h-32 mx-auto mb-4 pixel-border border-4 border-accent">
            <AvatarImage
              src={`https://api.dicebear.com/8.x/${currentAvatarStyle}/svg?seed=${user.id}`}
              alt={user.username || "用户头像"}
              data-ai-hint="pixel avatar"
            />
            <AvatarFallback className="text-3xl font-headline bg-secondary text-secondary-foreground">
              {user.username ? user.username.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
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
          </div>

          <div className="space-y-2 p-3 bg-card-foreground/5 rounded-sm pixel-border">
            <Label htmlFor="avatar-style-select" className="text-xs text-muted-foreground">头像风格</Label>
            <Select
              value={currentAvatarStyle}
              onValueChange={handleAvatarStyleChange}
            >
              <SelectTrigger id="avatar-style-select" className="w-full input-pixel">
                <SelectValue placeholder="选择头像风格" />
              </SelectTrigger>
              <SelectContent className="pixel-border">
                {AVATAR_STYLES.map(style => (
                  <SelectItem key={style.value} value={style.value} className="font-body">
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={logout} variant="destructive" className="w-full btn-pixel mt-6">
            <LogOut size={20} className="mr-2" /> 退出登录
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
