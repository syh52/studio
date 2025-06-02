"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await register(username, email, password);
    if (success) {
      toast({ title: "注册成功", description: "欢迎！请登录。" });
      router.push('/login');
    } else {
      toast({ title: "注册失败", description: "用户可能已存在或数据无效。", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto pixel-border shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center text-accent">注册</CardTitle>
        <CardDescription className="text-center">创建您的 Lexicon 账户。</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-pixel"
              placeholder="例如：飞行员123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-pixel"
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-pixel"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full btn-pixel bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
            {isLoading ? '注册中...' : '注册'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm">
          已经有账户了？{' '}
          <Link href="/login" className="text-accent hover:underline">
            在此登录
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
