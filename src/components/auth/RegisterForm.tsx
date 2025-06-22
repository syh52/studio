"use client";
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, Loader2, Check, X, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PasswordStrength {
  score: number;
  feedback: string[];
}

function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('至少需要8个字符');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含大写字母');
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含小写字母');
  }
  
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含数字');
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('包含特殊字符');
  }
  
  return { score, feedback };
}

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const passwordStrength = checkPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password !== '';

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (!username || !email || !password || !confirmPassword) {
      toast({ 
        title: "请填写完整", 
        description: "所有字段都是必填的", 
        variant: "destructive" 
      });
      return;
    }
    
    if (!passwordsMatch) {
      toast({ 
        title: "密码不匹配", 
        description: "两次输入的密码不一致", 
        variant: "destructive" 
      });
      return;
    }
    
    if (password.length < 6) {
      toast({ 
        title: "密码太短", 
        description: "密码至少需要6个字符", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsLoading(true);
    const success = await register(username, email, password);
    if (success) {
      toast({ 
        title: "注册成功", 
        description: "验证邮件已发送，请查收邮箱" 
      });
      router.push('/login');
    }
    setIsLoading(false);
  }, [username, email, password, confirmPassword, passwordsMatch, register, toast, router]);

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
        <h1 className="text-2xl font-inter font-semibold text-white tracking-tight mb-2">创建账户</h1>
        <p className="text-sm text-gray-400">加入 Lexicon 开始学习之旅</p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-white">用户名</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="pl-10 glass-card border-white/20 bg-white/5 text-white placeholder-gray-400 modern-focus rounded-xl h-12"
              placeholder="选择一个用户名"
              disabled={isLoading}
            />
          </div>
        </div>
        
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
              placeholder="user@example.com"
              disabled={isLoading}
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
              onChange={(e) => {
                setPassword(e.target.value);
                setShowPasswordHints(true);
              }}
              onFocus={() => setShowPasswordHints(true)}
              required
              className="pl-10 glass-card border-white/20 bg-white/5 text-white placeholder-gray-400 modern-focus rounded-xl h-12"
              placeholder="创建一个安全的密码"
              disabled={isLoading}
            />
          </div>
          
          {showPasswordHints && password && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      passwordStrength.score <= 2 ? 'bg-red-500' :
                      passwordStrength.score <= 3 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs ${
                  passwordStrength.score <= 2 ? 'text-red-400' :
                  passwordStrength.score <= 3 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {passwordStrength.score <= 2 ? '弱' :
                   passwordStrength.score <= 3 ? '中等' : '强'}
                </span>
              </div>
              
              {passwordStrength.feedback.length > 0 && (
                <p className="text-xs text-gray-400">
                  建议：{passwordStrength.feedback.join('、')}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">确认密码</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10 glass-card border-white/20 bg-white/5 text-white placeholder-gray-400 modern-focus rounded-xl h-12"
              placeholder="再次输入密码"
              disabled={isLoading}
            />
            {confirmPassword && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {passwordsMatch ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
              </div>
            )}
          </div>
        </div>

        <Alert className="bg-blue-500/10 border-blue-500/20">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-gray-300 text-sm">
            注册后，我们将向您的邮箱发送验证邮件。请查收并点击链接完成验证。
          </AlertDescription>
        </Alert>

        <Button 
          type="submit" 
          className="w-full gradient-primary text-white py-3 px-4 rounded-xl text-sm font-medium modern-focus h-12 cursor-pointer flex items-center justify-center gap-2" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              注册中...
            </>
          ) : (
            <>
              创建账户
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-400">
          已经有账户了？{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
