'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';

export default function FirebaseCheck() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
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
        setError(err.message);
        setStatus('error');
      }
    };

    checkFirebase();
  }, []);

  // 开发环境显示状态
  if (process.env.NODE_ENV === 'development') {
    if (status === 'checking') {
      return (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg text-sm">
          正在检查 Firebase 配置...
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-md">
          <div className="font-semibold mb-1">Firebase 配置错误</div>
          <div className="text-xs">{error}</div>
          <div className="text-xs mt-2">请检查 .env.local 文件配置</div>
        </div>
      );
    }

    if (status === 'success') {
      // 成功后3秒自动消失
      setTimeout(() => {
        const element = document.getElementById('firebase-check-success');
        if (element) {
          element.style.display = 'none';
        }
      }, 3000);

      return (
        <div
          id="firebase-check-success"
          className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
        >
          Firebase 已成功初始化 ✓
        </div>
      );
    }
  }

  return null;
} 