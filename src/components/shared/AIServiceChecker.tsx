'use client';

import { useState, useEffect } from 'react';
import { Zap, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface AIServiceStatus {
  isAvailable: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
  error?: string;
}

export default function AIServiceChecker() {
  const [status, setStatus] = useState<AIServiceStatus>({
    isAvailable: false,
    isChecking: false,
    lastCheck: null
  });

  // 检查AI服务状态
  const checkAIStatus = async () => {
    setStatus(prev => ({ ...prev, isChecking: true, error: undefined }));
    
    try {
      const coreService = await import('../../lib/ai/core-service');
      const isAvailable = await coreService.LexiconAIService.isAvailable();
      
      setStatus({
        isAvailable,
        isChecking: false,
        lastCheck: new Date(),
        error: isAvailable ? undefined : 'AI服务未就绪'
      });
    } catch (error) {
      setStatus({
        isAvailable: false,
        isChecking: false,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'AI服务检查失败'
      });
    }
  };

  // 预热AI服务
  const warmupAI = async () => {
    setStatus(prev => ({ ...prev, isChecking: true, error: undefined }));
    
    try {
      const coreService = await import('../../lib/ai/core-service');
      await coreService.LexiconAIService.warmup();
      
      // 预热完成后再次检查状态
      await checkAIStatus();
    } catch (error) {
      setStatus({
        isAvailable: false,
        isChecking: false,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'AI服务预热失败'
      });
    }
  };

  // 组件挂载时检查一次 - 大幅延迟避免阻塞初始加载
  useEffect(() => {
    // 🚀 性能优化：延迟AI检查到10秒后，让页面先完全加载
    const timer = setTimeout(() => {
      // 仅在用户停留足够时间后才检查，避免无意义的网络请求
      if (document.visibilityState === 'visible') {
        checkAIStatus().catch(error => {
          console.warn('AI服务检查失败，但不影响应用加载:', error);
          setStatus({
            isAvailable: false,
            isChecking: false,
            lastCheck: new Date(),
            error: 'AI服务需要手动初始化'
          });
        });
      }
    }, 10000); // 延迟到10秒，让页面完全加载完成
    return () => clearTimeout(timer);
  }, []);

  // 如果AI服务可用，不显示组件
  if (status.isAvailable && !status.error) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="glass-card rounded-lg p-4 border border-orange-500/20 bg-orange-500/5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {status.isChecking ? (
              <RefreshCw className="h-5 w-5 text-orange-400 animate-spin" />
            ) : status.isAvailable ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white mb-1">
              {status.isChecking ? 'AI服务检查中...' : 
               status.isAvailable ? 'AI服务已就绪' : 'AI服务需要初始化'}
            </div>
            
            <div className="text-xs text-gray-400 mb-3">
              {status.error || (status.isAvailable ? 
                '所有AI功能已可用' : 
                '首次使用AI功能前需要初始化服务')}
            </div>
            
            <div className="flex gap-2">
              {!status.isAvailable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={warmupAI}
                  disabled={status.isChecking}
                  className="text-xs h-7 px-3 bg-orange-500/10 border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {status.isChecking ? '初始化中...' : '立即初始化'}
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={checkAIStatus}
                disabled={status.isChecking}
                className="text-xs h-7 px-2 text-gray-400 hover:text-gray-300"
              >
                <RefreshCw className={`h-3 w-3 ${status.isChecking ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
        
        {status.lastCheck && (
          <div className="text-xs text-gray-500 mt-2 text-right">
            上次检查: {status.lastCheck.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
} 