'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Loader2, RefreshCw, Crown, Shield } from 'lucide-react';

interface AIProvider {
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'testing';
  isPrimary: boolean;
  isEnabled: boolean;
  priority: number;
  description: string;
  lastTestTime?: Date;
  error?: string;
}

export function AIProviderStatus() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 初始化提供者状态
  useEffect(() => {
    const loadProviderStatus = async () => {
      try {
        const { aiProviderManager } = await import('../../lib/ai-providers/ai-provider-manager');
        const availableProviders = aiProviderManager.getAvailableProviders();
        const current = aiProviderManager.getCurrentProvider();
        
        const providersData: AIProvider[] = availableProviders.map(provider => ({
          name: provider.name,
          type: provider.type,
          status: provider.enabled ? 'connected' : 'disconnected',
          isPrimary: provider.type === current,
          isEnabled: provider.enabled,
          priority: provider.priority,
          description: provider.description
        }));

        setProviders(providersData);
        setCurrentProvider(current);
      } catch (error) {
        console.error('加载AI提供者状态失败:', error);
      }
    };

    loadProviderStatus();
  }, []);

  const testAIProvider = async (providerType: string) => {
    setIsLoading(true);
    setProviders(prev => prev.map(p => 
      p.type === providerType 
        ? { ...p, status: 'testing' as const }
        : p
    ));

    try {
      const { aiProviderManager } = await import('../../lib/ai-providers/ai-provider-manager');
      
      // 临时切换到要测试的提供者
      const originalProvider = aiProviderManager.getCurrentProvider();
      const switched = aiProviderManager.setProvider(providerType as any);
      
      if (switched) {
        // 测试提供者
        const isWorking = await aiProviderManager.testCurrentProvider();
        
        setProviders(prev => prev.map(p => 
          p.type === providerType 
            ? { 
                ...p, 
                status: isWorking ? 'connected' as const : 'disconnected' as const,
                lastTestTime: new Date(),
                error: isWorking ? undefined : '测试失败'
              }
            : p
        ));
        
        // 如果测试成功且不是原提供者，询问是否切换
        if (isWorking && providerType !== originalProvider) {
          console.log(`✅ ${providerType} 测试成功`);
        } else {
          // 恢复原提供者
          aiProviderManager.setProvider(originalProvider);
        }
      } else {
        throw new Error('无法切换到该提供者');
      }
    } catch (error) {
      setProviders(prev => prev.map(p => 
        p.type === providerType 
          ? { 
              ...p, 
              status: 'disconnected' as const,
              error: error instanceof Error ? error.message : '连接失败'
            }
          : p
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const switchProvider = async (providerType: string) => {
    try {
      const { aiProviderManager } = await import('../../lib/ai-providers/ai-provider-manager');
      const switched = aiProviderManager.setProvider(providerType as any);
      
      if (switched) {
        setCurrentProvider(providerType);
        setProviders(prev => prev.map(p => ({
          ...p,
          isPrimary: p.type === providerType
        })));
      }
    } catch (error) {
      console.error('切换AI提供者失败:', error);
    }
  };

  const testAllProviders = async () => {
    for (const provider of providers) {
      if (provider.isEnabled) {
        await testAIProvider(provider.type);
      }
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
            AI 服务状态
          </CardTitle>
          <Button
            onClick={testAllProviders}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="glass-card-strong border-white/30 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            测试所有
          </Button>
        </div>
        <p className="text-gray-400 text-sm">
          当前使用: <span className="text-blue-400 font-medium">{providers.find(p => p.isPrimary)?.name || '未知'}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers
          .sort((a, b) => a.priority - b.priority)
          .map((provider, index) => (
          <div
            key={provider.type}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              provider.isPrimary 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(provider.status)}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-white font-medium">{provider.name}</h3>
                  {provider.isPrimary && (
                    <Crown className="h-4 w-4 text-yellow-400" />
                  )}
                  {provider.priority === 1 && (
                    <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                      首选
                    </Badge>
                  )}
                  {provider.priority > 1 && (
                    <Badge variant="outline" className="text-xs border-orange-400 text-orange-400">
                      备用
                    </Badge>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{provider.description}</p>
                {provider.error && (
                  <p className="text-red-400 text-sm mt-1">错误: {provider.error}</p>
                )}
                {provider.lastTestTime && (
                  <p className="text-gray-400 text-xs mt-1">
                    最后测试: {provider.lastTestTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(provider.status)}
              <div className="flex gap-2">
                <Button
                  onClick={() => testAIProvider(provider.type)}
                  disabled={isLoading || provider.status === 'testing'}
                  variant="outline"
                  size="sm"
                  className="glass-card border-white/20 text-white hover:bg-white/10"
                >
                  {provider.status === 'testing' ? '测试中...' : '测试'}
                </Button>
                {!provider.isPrimary && provider.isEnabled && (
                  <Button
                    onClick={() => switchProvider(provider.type)}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="glass-card border-blue-400/20 text-blue-400 hover:bg-blue-500/10"
                  >
                    切换
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-white/10">
          <div className="text-gray-400 text-sm space-y-1">
            <p>• <span className="text-blue-400">Google AI (Gemini)</span> - 功能强大的多模态AI，首选服务</p>
            <p>• <span className="text-orange-400">DeepSeek (备用)</span> - 仅在主要服务不可用时使用</p>
            <p>• 系统会自动选择可用的服务，无需手动切换</p>
            <p>• 如遇余额不足等错误，系统会自动切换到可用服务</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 