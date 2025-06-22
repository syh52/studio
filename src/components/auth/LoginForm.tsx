"use client";
import { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useToast } from "../../hooks/use-toast"
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ 
        title: "请填写完整", 
        description: "邮箱和密码不能为空", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsLoading(true);
    const success = await login(email, password);
    if (success) {
      toast({ 
        title: "登录成功", 
        description: "欢迎回来！" 
      });
      router.push('/');
    }
    setIsLoading(false);
  }, [email, password, login, toast, router]);

  const handleResetPassword = useCallback(async () => {
    if (!resetEmail) {
      toast({ 
        title: "请输入邮箱", 
        description: "请输入您的注册邮箱", 
        variant: "destructive" 
      });
      return;
    }
    
    setResetLoading(true);
    const success = await resetPassword(resetEmail);
    if (success) {
      setShowResetDialog(false);
      setResetEmail('');
    }
    setResetLoading(false);
  }, [resetEmail, resetPassword, toast]);

  return (
    <>
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
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-white">密码</Label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowResetDialog(true);
                }}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                忘记密码？
              </button>
            </div>
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
                disabled={isLoading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-primary text-white py-3 px-4 rounded-xl text-sm font-medium modern-focus h-12 cursor-pointer flex items-center justify-center gap-2" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                登录中...
              </>
            ) : (
              <>
                登录
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            还没有账户？{' '}
            <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              立即注册
            </Link>
          </p>
        </div>
      </div>

      {/* 密码重置对话框 */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              输入您的注册邮箱，我们将发送密码重置链接给您。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reset-email">邮箱地址</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={resetLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              disabled={resetLoading}
            >
              取消
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={resetLoading || !resetEmail}
            >
              {resetLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  发送中...
                </>
              ) : (
                '发送重置邮件'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
