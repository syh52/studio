'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FirebaseCheck() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'dismissed'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // 动态导入以避免初始化错误
        const { auth, db } = await import('@/lib/firebase').catch((err) => {
          console.error('Firebase导入错误:', err);
          throw new Error('Firebase 导入失败');
        });
        
        // 检查 Firebase 是否已初始化
        if (!auth || !db) {
          throw new Error('Firebase 未正确初始化');
        }

        setStatus('success');
      } catch (err: any) {
        console.error('Firebase 检查失败:', err);
        setError(err.message);
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

  // 显示错误
  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <div>
            <div className="font-semibold">Firebase 错误</div>
            <div className="text-sm">{error}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStatus('dismissed')}
            className="text-white hover:bg-red-600 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
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