'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FirebaseCheck() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'dismissed'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // 动态导入以避免初始化错误
        const { auth, db } = await import('@/lib/firebase').catch((err) => {
          if (err.code === 'auth/invalid-api-key' || err.message?.includes('invalid-api-key')) {
            throw new Error('INVALID_API_KEY');
          }
          throw err;
        });
        
        // 检查 Firebase 是否已初始化
        if (!auth || !db) {
          throw new Error('Firebase 未正确初始化');
        }

        // 检查环境变量
        const requiredEnvVars = [
          'NEXT_PUBLIC_FIREBASE_API_KEY',
          'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
          'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        ];

        const missingVars = requiredEnvVars.filter(
          varName => !process.env[varName]
        );

        if (missingVars.length > 0) {
          throw new Error(`缺少环境变量: ${missingVars.join(', ')}`);
        }

        setStatus('success');
      } catch (err: any) {
        console.error('Firebase 检查失败:', err);
        
        if (err.message === 'INVALID_API_KEY' || err.message?.includes('缺少环境变量')) {
          setShowGuide(true);
          setError('Firebase 配置缺失或无效');
        } else {
          setError(err.message);
        }
        
        setStatus('error');
      }
    };

    checkFirebase();
  }, []);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (status === 'checking' || status === 'dismissed') {
    return null;
  }

  // 显示配置指南
  if (status === 'error' && showGuide) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-semibold text-white">Firebase 配置缺失</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStatus('dismissed')}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p>应用需要 Firebase 配置才能正常运行。请按以下步骤配置：</p>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-white">快速解决方案</h3>
                <p className="text-sm mb-3">在项目根目录创建 <code className="bg-gray-700 px-2 py-1 rounded">.env.local</code> 文件：</p>
                <pre className="bg-gray-950 p-3 rounded text-xs overflow-x-auto text-green-400">
{`NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id`}
                </pre>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-blue-300">💡 提示</h3>
                <p className="text-sm">
                  查看 <code className="bg-gray-700 px-2 py-1 rounded">FIREBASE_QUICK_SETUP.md</code> 文件获取详细配置指南。
                </p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
                  className="gradient-primary"
                >
                  打开 Firebase Console
                </Button>
                <Button
                  onClick={() => setStatus('dismissed')}
                  variant="outline"
                  className="glass-card"
                >
                  暂时关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 显示普通错误
  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <div>
            <div className="font-semibold">Firebase 错误</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // 显示成功状态
  if (status === 'success') {
    // 3秒后自动隐藏
    setTimeout(() => setStatus('dismissed'), 3000);
    
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg text-sm z-50 opacity-90 flex items-center gap-2">
        <CheckCircle className="h-4 w-4" />
        Firebase 已连接
      </div>
    );
  }

  return null;
} 