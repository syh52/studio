'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BulkUpload } from '@/components/BulkUpload';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UploadPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-inter text-xl text-white">加载中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回主页
        </Button>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-inter font-bold text-white mb-2">
          批量上传学习资料
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          上传自定义的对话和词汇，扩展你的学习内容库
        </p>
      </div>

      {/* Upload Component */}
      <BulkUpload />

      {/* Instructions */}
      <div className="mt-8 glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">使用说明</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div>
            <h4 className="text-white font-medium mb-1">对话上传格式：</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>每个对话需要包含标题、场景和对话内容</li>
              <li>可选：指定音频文件名，然后上传对应的音频文件</li>
              <li>使用三个横线（---）分隔多个对话</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-1">词汇上传格式：</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>每行一个单词，使用竖线（|）分隔各部分</li>
              <li>格式：英文 | 中文 | 解释 | 音频文件名</li>
              <li>音频文件名是可选的</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-1">音频文件：</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>支持常见音频格式（mp3, wav, m4a 等）</li>
              <li>文件名需要与文本中指定的名称完全匹配</li>
              <li>音频文件会被编码并存储在本地</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 