"use client";
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { MessageCircleMore, Mail, Lock } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [email, password, login, toast, router]);

  const handleWeChatLogin = useCallback(async () => {
    setIsLoading(true);
    const success = await login('wechat_user_placeholder@lexicon.app', 'mock_wechat_password');

    if (success) {
      toast({
        title: "微信登录成功 (模拟)",
        description: "欢迎，微信用户！",
        className: "bg-green-600 text-white border-green-700"
      });
      router.push('/');
    } else {
      toast({ title: "微信登录失败 (模拟)", description: "模拟微信用户配置错误。", variant: "destructive" });
      setIsLoading(false);
    }
  }, [login, toast, router]);

  return (
    <div className="glass-card rounded-3xl p-8 w-full max-w-md mx-auto animate-blur-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
            <path d="M8.5 8.5v.01"></path>
            <path d="M16 15.5v.01"></path>
            <path d="M12 12v.01"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-inter font-semibold text-white tracking-tight mb-2">欢迎回来</h1>
        <p className="text-sm text-gray-400">登录您的 Lexicon 账户</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-white">邮箱地址</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 glass-card border-white/20 bg-white/5 text-white placeholder-gray-400 modern-focus rounded-xl h-12"
              placeholder="输入您的邮箱地址"
            />
          </div>
        </div>
        
          <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-white">密码</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 glass-card border-white/20 bg-white/5 text-white placeholder-gray-400 modern-focus rounded-xl h-12"
              placeholder="输入您的密码"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full gradient-primary text-white py-3 px-4 rounded-xl text-sm font-medium modern-focus h-12 cursor-pointer" 
          disabled={isLoading}
        >
            {isLoading && !email.startsWith('wechat_') ? '登录中...' : '邮箱登录'}
          </Button>
        </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-white/20"></div>
        <span className="px-3 text-sm text-gray-400">或</span>
        <div className="flex-1 h-px bg-white/20"></div>
      </div>

      {/* WeChat Login */}
        <Button
          variant="outline"
          className="w-full glass-card border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-white modern-focus rounded-xl h-12 cursor-pointer"
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

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-400">
          还没有账户？{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
            在此注册
          </Link>
        </p>
      </div>
    </div>
  );
}
