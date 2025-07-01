'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Loader2, RefreshCw, Shield, User, Settings } from 'lucide-react';

interface FirebaseAIStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'testing' | 'auth_required';
  available: boolean;
  initialized: boolean;
  lastError?: string;
  lastTestTime?: Date;
}

export function AIProviderStatus() {
  const [aiStatus, setAIStatus] = useState<FirebaseAIStatus>({
    name: 'Firebase AI Logic (Gemini 2.5 Pro)',
    status: 'disconnected',
    available: false,
    initialized: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // 初始化Firebase AI状态
  useEffect(() => {
    const loadAIStatus = async () => {
      try {
        const { firebaseAIManager } = await import('../../lib/ai-providers/ai-provider-manager');
        const status = firebaseAIManager.getStatus();
        
        setAIStatus(prev => ({
          ...prev,
          available: status.available,
          initialized: status.initialized,
          lastError: status.lastError,
          status: status.available ? 'connected' : 'disconnected'
        }));
      } catch (error) {
        console.error('加载Firebase AI状态失败:', error);
        setAIStatus(prev => ({
          ...prev,
          status: 'disconnected',
          lastError: error instanceof Error ? error.message : '加载失败'
        }));
      }
    };

    loadAIStatus();
  }, []);

  const testFirebaseAI = async () => {
    setIsLoading(true);
    setAIStatus(prev => ({ ...prev, status: 'testing' }));

    try {
      const { firebaseAIManager } = await import('../../lib/ai-providers/ai-provider-manager');
      
      // 等待初始化完成
      await firebaseAIManager.waitForInitialization();
      
      // 测试AI功能
      const isWorking = await firebaseAIManager.testFirebaseAI();
      
      setAIStatus(prev => ({
        ...prev,
        status: isWorking ? 'connected' : 'disconnected',
        available: isWorking,
        lastTestTime: new Date(),
        lastError: isWorking ? undefined : '测试失败'
      }));
      
      if (isWorking) {
        console.log('✅ Firebase AI Logic 测试成功');
      }
    } catch (error) {
      console.error('Firebase AI测试失败:', error);
      
      let status: 'disconnected' | 'auth_required' = 'disconnected';
      let errorMessage = error instanceof Error ? error.message : '连接失败';
      
      if (errorMessage.includes('需要用户登录') || errorMessage.includes('认证失败')) {
        status = 'auth_required';
      }
      
      setAIStatus(prev => ({
        ...prev,
        status,
        available: false,
        lastError: errorMessage,
        lastTestTime: new Date()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const reinitializeAI = async () => {
    setIsLoading(true);
    setAIStatus(prev => ({ ...prev, status: 'testing' }));

    try {
      const { firebaseAIManager } = await import('../../lib/ai-providers/ai-provider-manager');
      const success = await firebaseAIManager.reinitialize();
      
      if (success) {
        const status = firebaseAIManager.getStatus();
        setAIStatus(prev => ({
          ...prev,
          status: 'connected',
          available: status.available,
          initialized: status.initialized,
          lastError: undefined,
          lastTestTime: new Date()
        }));
      } else {
        throw new Error('重新初始化失败');
      }
    } catch (error) {
      setAIStatus(prev => ({
        ...prev,
        status: 'disconnected',
        available: false,
        lastError: error instanceof Error ? error.message : '重新初始化失败'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'testing':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'auth_required':
        return <User className="h-4 w-4 text-yellow-400" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-600">已连接</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">未连接</Badge>;
      case 'testing':
        return <Badge variant="secondary">测试中...</Badge>;
      case 'auth_required':
        return <Badge variant="outline" className="border-yellow-400 text-yellow-400">需要登录</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Firebase AI Logic 状态
          </CardTitle>
          <Button
            onClick={testFirebaseAI}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="glass-card-strong border-white/30 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            测试连接
          </Button>
        </div>
        <p className="text-gray-400 text-sm">
          专注于Firebase AI Logic (Gemini 2.5 Pro)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl border bg-blue-500/10 border-blue-500/30">
          <div className="flex items-center space-x-3">
            {getStatusIcon(aiStatus.status)}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-medium">{aiStatus.name}</h3>
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                  主要服务
                </Badge>
              </div>
              <p className="text-gray-400 text-sm">
                Firebase AI Logic SDK - Google Gemini 2.5 Pro模型
              </p>
              {aiStatus.lastError && (
                <p className="text-red-400 text-sm mt-1">错误: {aiStatus.lastError}</p>
              )}
              {aiStatus.lastTestTime && (
                <p className="text-gray-400 text-xs mt-1">
                  最后测试: {aiStatus.lastTestTime.toLocaleTimeString()}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <span className="text-xs text-gray-400">
                  初始化: {aiStatus.initialized ? '✅ 完成' : '❌ 未完成'}
                </span>
                <span className="text-xs text-gray-400">
                  可用性: {aiStatus.available ? '✅ 可用' : '❌ 不可用'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(aiStatus.status)}
            <div className="flex gap-2">
              <Button
                onClick={testFirebaseAI}
                disabled={isLoading || aiStatus.status === 'testing'}
                variant="outline"
                size="sm"
                className="glass-card border-white/20 text-white hover:bg-white/10"
              >
                {aiStatus.status === 'testing' ? '测试中...' : '测试'}
              </Button>
              {aiStatus.status === 'auth_required' && (
                <Button
                  onClick={reinitializeAI}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="glass-card border-yellow-400/20 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  重新初始化
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-white/10">
          <div className="text-gray-400 text-sm space-y-1">
            <p>• <span className="text-blue-400">Firebase AI Logic</span> - 基于Google Gemini 2.5 Pro的AI服务</p>
            <p>• <span className="text-green-400">身份验证要求</span> - 需要用户登录后才能使用AI功能</p>
            <p>• <span className="text-purple-400">云端代理</span> - 通过Cloudflare Worker代理访问</p>
            <p>• 如遇认证问题，请先登录账户或尝试重新初始化</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 