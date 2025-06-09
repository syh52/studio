'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  useEffect(() => {
    // 检查 Firebase 是否初始化
    try {
      if (auth && db) {
        setFirebaseInitialized(true);
      }
    } catch (error) {
      setFirebaseInitialized(false);
    }
    
    // 检查认证状态
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');
    });
    
    // 检查 Firestore 连接
    const checkDb = async () => {
      try {
        // 尝试访问 Firestore
        const { doc, getDoc } = await import('firebase/firestore');
        await getDoc(doc(db, 'test', 'test'));
        setDbStatus('connected');
      } catch (error) {
        console.error('Firestore 连接错误:', error);
        setDbStatus('error');
      }
    };
    
    if (firebaseInitialized) {
      checkDb();
    }
    
    return () => unsubscribe?.();
  }, [firebaseInitialized]);
  
  const StatusIcon = ({ status }: { status: 'success' | 'error' | 'warning' | 'info' }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">Firebase 认证系统测试</h1>
      
      {/* Firebase 初始化状态 */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon status={firebaseInitialized ? 'success' : 'error'} />
            Firebase 初始化状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              Firebase SDK: {firebaseInitialized ? (
                <span className="text-green-400">✅ 已初始化</span>
              ) : (
                <span className="text-red-400">❌ 未初始化</span>
              )}
            </p>
            {!firebaseInitialized && (
              <p className="text-xs text-yellow-400">
                请检查是否已配置 .env.local 文件
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* 认证状态 */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon status={authStatus === 'authenticated' ? 'success' : authStatus === 'checking' ? 'info' : 'warning'} />
            认证状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              Firebase Auth: {authStatus === 'checking' ? (
                <span className="text-blue-400">🔄 检查中...</span>
              ) : authStatus === 'authenticated' ? (
                <span className="text-green-400">✅ 已认证</span>
              ) : (
                <span className="text-yellow-400">⚠️ 未认证</span>
              )}
            </p>
            <p className="text-sm">
              AuthContext 状态: {isLoading ? (
                <span className="text-blue-400">🔄 加载中...</span>
              ) : isAuthenticated ? (
                <span className="text-green-400">✅ 已登录</span>
              ) : (
                <span className="text-yellow-400">⚠️ 未登录</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* 数据库连接状态 */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon status={dbStatus === 'connected' ? 'success' : dbStatus === 'checking' ? 'info' : 'error'} />
            Firestore 数据库
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              连接状态: {dbStatus === 'checking' ? (
                <span className="text-blue-400">🔄 检查中...</span>
              ) : dbStatus === 'connected' ? (
                <span className="text-green-400">✅ 已连接</span>
              ) : (
                <span className="text-red-400">❌ 连接失败</span>
              )}
            </p>
            {dbStatus === 'error' && (
              <p className="text-xs text-red-400">
                请检查 Firestore 是否已在 Firebase Console 中启用
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* 用户信息 */}
      {user && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon status="success" />
              当前用户信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>用户 ID: <span className="text-gray-400">{user.id}</span></p>
              <p>用户名: <span className="text-gray-400">{user.username}</span></p>
              <p>邮箱: <span className="text-gray-400">{user.email}</span></p>
              <p>积分: <span className="text-gray-400">{user.indexPoints}</span></p>
              <p>最后签到: <span className="text-gray-400">{user.lastCheckIn || '未签到'}</span></p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 测试操作 */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>测试操作</CardTitle>
          <CardDescription>点击下方按钮测试各项功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => window.location.href = '/login'}
              variant="outline"
              className="glass-card"
            >
              前往登录页
            </Button>
            <Button
              onClick={() => window.location.href = '/register'}
              variant="outline"
              className="glass-card"
            >
              前往注册页
            </Button>
            {isAuthenticated && (
              <Button
                onClick={() => window.location.href = '/profile'}
                variant="outline"
                className="glass-card"
              >
                查看个人资料
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* 配置说明 */}
      {!firebaseInitialized && (
        <Card className="glass-card border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              配置指南
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-2">1. 创建 Firebase 项目</p>
                <p className="text-gray-400 ml-4">访问 Firebase Console 创建新项目</p>
              </div>
              <div>
                <p className="font-semibold mb-2">2. 启用服务</p>
                <p className="text-gray-400 ml-4">启用 Authentication 和 Firestore Database</p>
              </div>
              <div>
                <p className="font-semibold mb-2">3. 创建 .env.local 文件</p>
                <pre className="bg-gray-800 p-3 rounded ml-4 text-xs overflow-x-auto">
{`NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id`}
                </pre>
              </div>
              <div>
                <p className="font-semibold mb-2">4. 重启开发服务器</p>
                <p className="text-gray-400 ml-4">运行 npm run dev 重新启动</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 