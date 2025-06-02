
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
import { MessageCircleMore } from 'lucide-react'; // Using a generic chat icon for WeChat

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    if (success) {
      toast({ title: "登录成功", description: "欢迎回来！" });
      router.push('/');
    } else {
      toast({ title: "登录失败", description: "邮箱或密码无效。", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleWeChatLogin = async () => {
    setIsLoading(true);
    // Simulate WeChat login process
    // In a real app, this would involve redirecting to WeChat, getting a code, exchanging for token, etc.
    // For mock, we'll use a predefined mock WeChat user.
    const success = await login('wechat_user_placeholder@lexicon.app', 'mock_wechat_password');
    if (success) {
      toast({ title: "微信登录成功 (模拟)", description: "欢迎，微信用户！", className:"bg-green-600 text-white pixel-border" });
      router.push('/');
    } else {
      // This case should ideally not happen if mock user is set up correctly
      toast({ title: "微信登录失败 (模拟)", description: "模拟微信用户配置错误。", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto pixel-border shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center text-accent">登录</CardTitle>
        <CardDescription className="text-center">访问您的 Lexicon 账户。</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {isLoading && !email.startsWith('wechat_') ? '登录中...' : '邮箱登录'}
          </Button>
        </form>
        <Button 
          variant="outline" 
          className="w-full mt-4 btn-pixel bg-green-500 hover:bg-green-600 text-white border-green-700 focus:ring-green-400" 
          onClick={handleWeChatLogin}
          disabled={isLoading}
        >
          {isLoading && email.startsWith('wechat_') ? (
            '微信登录中...'
          ) : (
            <>
              <MessageCircleMore size={20} className="mr-2" />
              微信一键登录 (模拟)
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm">
          还没有账户？{' '}
          <Link href="/register" className="text-accent hover:underline">
            在此注册
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
