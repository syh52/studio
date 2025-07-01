"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { 
  auth, 
  db, 
  loginWithEmail, 
  registerUser, 
  loginWithGoogle,
  logout as firebaseLogout,
  onAuthChange,
  migrateLocalDataToFirebase,
  enableOfflineSupport
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  username: string;
  indexPoints: number;
  lastCheckIn: string | null; // YYYY-MM-DD
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (username: string, email: string, pass: string) => Promise<boolean>;
  loginWithProvider: (provider: 'google') => Promise<boolean>;
  logout: () => void;
  dailyCheckIn: () => Promise<boolean>;
  addPoints: (points: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // 初始化离线支持
  useEffect(() => {
    enableOfflineSupport();
  }, []);

  // 监听 Firebase 认证状态
  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // 订阅用户数据实时更新
        const userRef = doc(db, 'users', fbUser.uid);
        const unsubscribeUser = onSnapshot(
          userRef, 
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUser({
                id: fbUser.uid,
                email: fbUser.email!,
                username: data.profile?.username || fbUser.displayName || '用户',
                indexPoints: data.progress?.indexPoints || 0,
                lastCheckIn: data.progress?.lastCheckIn || null,
                photoURL: data.profile?.photoURL || fbUser.photoURL || undefined
              });
            }
            setIsLoading(false);
          },
          (error) => {
            console.error('用户数据订阅错误:', error);
            toast({
              title: "数据同步错误",
              description: "无法获取用户数据，请检查网络连接",
              variant: "destructive"
            });
            setIsLoading(false);
          }
        );
        
        // 尝试迁移本地数据
        try {
          await migrateLocalDataToFirebase(fbUser.uid, fbUser.email!);
        } catch (error) {
          console.error('数据迁移失败:', error);
        }
        
        return () => unsubscribeUser();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  // 邮箱密码登录
  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    
    // 微信模拟登录特殊处理
    if (email === 'wechat_user_placeholder@lexicon.app' && pass === 'mock_wechat_password') {
      // 模拟微信用户数据
      const mockWeChatUser: User = {
        id: 'wechat_mock_user_001',
        email: email,
        username: '微信用户',
        indexPoints: 100,
        lastCheckIn: null,
        photoURL: undefined
      };
      
      setUser(mockWeChatUser);
      setIsLoading(false);
      
      toast({
        title: "微信登录成功 (模拟)",
        description: "欢迎，微信用户！",
        className: "bg-green-600 text-white border-green-700"
      });
      return true;
    }
    
    // 正常的Firebase邮箱密码登录
    const result = await loginWithEmail(email, pass);
    
    if (result.success) {
      toast({
        title: "登录成功",
        description: "欢迎回来！",
        className: "bg-green-600 text-white border-green-700"
      });
      return true;
    } else {
      toast({
        title: "登录失败",
        description: result.error || "请检查您的邮箱和密码",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  };

  // 注册新用户
  const register = async (username: string, email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    const result = await registerUser(username, email, pass);
    
    if (result.success) {
      toast({
        title: "注册成功",
        description: "欢迎加入 Lexicon！",
        className: "bg-green-600 text-white border-green-700"
      });
      return true;
    } else {
      toast({
        title: "注册失败",
        description: result.error || "请稍后重试",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  };

  // 第三方登录
  const loginWithProvider = async (provider: 'google'): Promise<boolean> => {
    setIsLoading(true);
    
    let result;
    switch (provider) {
      case 'google':
        result = await loginWithGoogle();
        break;
      default:
        result = { success: false, error: '不支持的登录方式' };
    }
    
    if (result.success) {
      toast({
        title: "登录成功",
        description: "欢迎回来！",
        className: "bg-green-600 text-white border-green-700"
      });
      return true;
    } else {
      toast({
        title: "登录失败",
        description: result.error || "请稍后重试",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  };

  // 登出
  const logout = async () => {
    setIsLoading(true);
    
    // 如果是微信模拟用户，直接清除状态
    if (user?.id === 'wechat_mock_user_001') {
      setUser(null);
      router.push('/login');
      toast({
        title: "已退出登录",
        description: "期待您的再次光临！",
      });
      setIsLoading(false);
      return;
    }
    
    // 正常的Firebase登出
    const result = await firebaseLogout();
    
    if (result.success) {
      setUser(null);
      router.push('/login');
      toast({
        title: "已退出登录",
        description: "期待您的再次光临！",
      });
    } else {
      toast({
        title: "退出失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };
  
  // 每日签到
  const dailyCheckIn = async (): Promise<boolean> => {
    if (!user) return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (user.lastCheckIn === today) {
      toast({
        title: "今日已签到",
        description: "您今天已经签到过了，明天再来吧！",
      });
      return false;
    }
    
    // 微信模拟用户的签到处理
    if (user.id === 'wechat_mock_user_001') {
      const updatedUser = {
        ...user,
        indexPoints: user.indexPoints + 10,
        lastCheckIn: today
      };
      setUser(updatedUser);
      
      toast({
        title: "签到成功！",
        description: `您已获得10点"指数"！当前指数：${updatedUser.indexPoints}。`,
        className: "bg-green-600 text-white border-green-700"
      });
      return true;
    }
    
    // Firebase用户的签到处理
    if (!firebaseUser) return false;
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        'progress.indexPoints': increment(10),
        'progress.lastCheckIn': today,
        'progress.totalCheckIns': increment(1)
      });
      
      toast({
        title: "签到成功！",
        description: `您已获得10点"指数"！当前指数：${user.indexPoints + 10}。`,
        className: "bg-green-600 text-white border-green-700"
      });
      return true;
    } catch (error) {
      console.error('签到失败:', error);
      toast({
        title: "签到失败",
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
      return false;
    }
  };

  // 添加积分
  const addPoints = async (points: number) => {
    if (!user) return;
    
    // 微信模拟用户的积分处理
    if (user.id === 'wechat_mock_user_001') {
      const updatedUser = {
        ...user,
        indexPoints: user.indexPoints + points
      };
      setUser(updatedUser);
      return;
    }
    
    // Firebase用户的积分处理
    if (!firebaseUser) return;
    
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        'progress.indexPoints': increment(points)
      });
    } catch (error) {
      console.error('添加积分失败:', error);
      toast({
        title: "积分更新失败",
        description: "请检查网络连接",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register,
      loginWithProvider,
      logout, 
      dailyCheckIn, 
      addPoints 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
