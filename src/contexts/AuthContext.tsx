"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase'
import { useToast } from '../hooks/use-toast'

interface User {
  id: string;
  email: string;
  username: string;
  indexPoints: number;
  lastCheckIn: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  bio?: string; // 用户个人简介
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  dailyCheckIn: () => Promise<boolean>;
  addPoints: (points: number) => Promise<void>;
  sendVerificationEmail: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 用户数据缓存
const userDataCache = new Map<string, User>();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // 异步获取用户数据，避免阻塞
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      // 先检查缓存
      const cached = userDataCache.get(firebaseUser.uid);
      if (cached) {
        return cached;
      }

      // 异步获取Firestore数据
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: userData.username || firebaseUser.displayName || '用户',
          indexPoints: userData.indexPoints || 0,
          lastCheckIn: userData.lastCheckIn || null,
          photoURL: firebaseUser.photoURL || userData.photoURL,
          emailVerified: firebaseUser.emailVerified,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          bio: userData.bio || ''
        };
        
        // 缓存用户数据
        userDataCache.set(firebaseUser.uid, user);
        return user;
      } else {
        // 如果Firestore中没有用户数据，创建新的（异步）
        const newUser: Omit<User, 'id'> = {
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || '新用户',
          indexPoints: 0,
          lastCheckIn: null,
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // 过滤掉undefined值的数据对象
        const cleanUserData = Object.fromEntries(
          Object.entries({
            ...newUser,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).filter(([_, value]) => value !== undefined)
        );
        
        // 异步创建用户文档，不阻塞UI
        setDoc(doc(db, 'users', firebaseUser.uid), cleanUserData).catch(error => {
          console.error('创建用户文档失败:', error);
        });
        
        const userWithId = { ...newUser, id: firebaseUser.uid };
        userDataCache.set(firebaseUser.uid, userWithId);
        return userWithId;
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
      // 返回基本用户信息，不阻塞应用
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        username: firebaseUser.displayName || '用户',
        indexPoints: 0,
        lastCheckIn: null,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  };

  // 监听认证状态变化 - 优化版本
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // 先设置基本信息，快速完成初始化
        const basicUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || '用户',
          indexPoints: 0,
          lastCheckIn: null,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setUser(basicUser);
        setIsLoading(false); // 快速完成初始化
        
        // 异步获取完整用户数据
        fetchUserData(firebaseUser).then(fullUser => {
          if (fullUser) {
            setUser(fullUser);
          }
        }).catch(error => {
          console.error('异步获取用户数据失败:', error);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 登录
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // 代理状态检查
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.location.hostname.includes('lexiconlab.cn')) {
        console.log('🔐 Firebase Auth 请求将通过代理发送...');
      }
      
      console.log('🔐 尝试登录用户:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 更新最后登录时间（异步，不阻塞）
      updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(error => {
        console.error('更新登录时间失败:', error);
      });
      
      return true;
    } catch (error: any) {
      console.error('登录错误:', error);
      console.log('错误代码:', error.code);
      
      // 处理特定错误
      let errorMessage = '登录失败，请重试';
      switch (error.code) {
        case 'auth/invalid-credential':
          console.log('检测到 invalid-credential 错误');
          errorMessage = '邮箱或密码错误，请检查后重试';
          break;
        case 'auth/user-not-found':
          errorMessage = '用户不存在';
          break;
        case 'auth/wrong-password':
          errorMessage = '密码错误';
          break;
        case 'auth/invalid-email':
          errorMessage = '邮箱格式无效';
          break;
        case 'auth/user-disabled':
          errorMessage = '账户已被禁用';
          break;
        case 'auth/too-many-requests':
          errorMessage = '尝试次数过多，请稍后再试';
          break;
      }
      
      toast({
        title: "登录失败",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // 代理状态检查
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.location.hostname.includes('lexiconlab.cn')) {
        console.log('🔐 Firebase Auth 注册请求将通过代理发送...');
      }
      
      console.log('🔐 尝试注册用户:', email);
      
      // 创建用户账户
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 更新用户显示名称
      await updateProfile(userCredential.user, {
        displayName: username
      });
      
      // 发送验证邮件
      await sendEmailVerification(userCredential.user);
      
      // 在 Firestore 中创建用户文档
      const userData = {
        email,
        username,
        indexPoints: 0,
        lastCheckIn: null,
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // 过滤掉undefined值的数据对象
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([_, value]) => value !== undefined)
      );
      
      await setDoc(doc(db, 'users', userCredential.user.uid), cleanUserData);
      
      toast({
        title: "注册成功",
        description: "验证邮件已发送，请查收邮箱",
      });
      
      return true;
    } catch (error: any) {
      console.error('注册错误:', error);
      
      // 处理特定错误
      let errorMessage = '注册失败，请重试';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = '该邮箱已被注册';
          break;
        case 'auth/invalid-email':
          errorMessage = '邮箱格式无效';
          break;
        case 'auth/weak-password':
          errorMessage = '密码强度太弱，至少需要6个字符';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = '注册功能暂时不可用';
          break;
      }
      
      toast({
        title: "注册失败",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      // 清除缓存
      userDataCache.clear();
      router.push('/login');
      
      toast({
        title: "已退出登录",
        description: "期待您的再次光临",
      });
    } catch (error) {
      console.error('登出错误:', error);
      toast({
        title: "退出失败",
        description: "请重试",
        variant: "destructive"
      });
    }
  };

  // 重置密码
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      
      toast({
        title: "重置邮件已发送",
        description: "请查收邮箱并按照邮件提示重置密码",
      });
      
      return true;
    } catch (error: any) {
      console.error('重置密码错误:', error);
      
      let errorMessage = '发送失败，请重试';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = '该邮箱未注册';
          break;
        case 'auth/invalid-email':
          errorMessage = '邮箱格式无效';
          break;
      }
      
      toast({
        title: "发送失败",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    }
  };

  // 更新用户资料
  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user || !firebaseUser) return false;
    
    try {
      // 更新 Firebase Auth 的显示名称和头像
      if (updates.username || updates.photoURL) {
        await updateProfile(firebaseUser, {
          displayName: updates.username || firebaseUser.displayName,
          photoURL: updates.photoURL || firebaseUser.photoURL
        });
      }
      
      // 更新 Firestore 中的用户数据
      const userDocRef = doc(db, 'users', user.id);
      
      // 过滤掉undefined值的更新数据
      const cleanUpdates = Object.fromEntries(
        Object.entries({
          ...updates,
          updatedAt: serverTimestamp()
        }).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(userDocRef, cleanUpdates);
      
      // 更新本地状态和缓存
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      userDataCache.set(user.id, updatedUser);
      
      toast({
        title: "资料更新成功",
        description: "您的个人资料已更新",
      });
      
      return true;
    } catch (error) {
      console.error('更新资料错误:', error);
      toast({
        title: "更新失败",
        description: "请重试",
        variant: "destructive"
      });
      return false;
    }
  };

  // 每日签到
  const dailyCheckIn = async (): Promise<boolean> => {
    if (!user) return false;
    
    const today = new Date().toISOString().split('T')[0];
    if (user.lastCheckIn === today) {
      toast({
        title: "今日已签到",
        description: "明天再来吧！",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const pointsEarned = 10;
      const newPoints = user.indexPoints + pointsEarned;
      
      // 更新 Firestore
      await updateDoc(doc(db, 'users', user.id), {
        indexPoints: newPoints,
        lastCheckIn: today,
        updatedAt: serverTimestamp()
      });
      
      // 更新本地状态和缓存
      const updatedUser = {
        ...user,
        indexPoints: newPoints,
        lastCheckIn: today
      };
      setUser(updatedUser);
      userDataCache.set(user.id, updatedUser);
      
      toast({
        title: "签到成功",
        description: `获得 ${pointsEarned} 积分！`,
      });
      
      return true;
    } catch (error) {
      console.error('签到错误:', error);
      toast({
        title: "签到失败",
        description: "请重试",
        variant: "destructive"
      });
      return false;
    }
  };

  // 添加积分
  const addPoints = async (points: number): Promise<void> => {
    if (!user) return;
    
    try {
      const newPoints = user.indexPoints + points;
      
      // 更新 Firestore
      await updateDoc(doc(db, 'users', user.id), {
        indexPoints: newPoints,
        updatedAt: serverTimestamp()
      });
      
      // 更新本地状态和缓存
      const updatedUser = {
        ...user,
        indexPoints: newPoints
      };
      setUser(updatedUser);
      userDataCache.set(user.id, updatedUser);
    } catch (error) {
      console.error('添加积分错误:', error);
    }
  };

  // 发送验证邮件
  const sendVerificationEmail = async (): Promise<boolean> => {
    if (!firebaseUser) return false;
    
    try {
      await sendEmailVerification(firebaseUser);
      
      toast({
        title: "验证邮件已发送",
        description: "请查收邮箱",
      });
      
      return true;
    } catch (error: any) {
      console.error('发送验证邮件错误:', error);
      
      let errorMessage = '发送失败，请重试';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = '发送过于频繁，请稍后再试';
      }
      
      toast({
        title: "发送失败",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout, 
      resetPassword,
      updateUserProfile,
      dailyCheckIn, 
      addPoints,
      sendVerificationEmail
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
