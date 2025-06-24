'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Zap, 
  Wifi, 
  WifiOff, 
  Globe, 
  Shield, 
  RefreshCw, 
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { aiProviderManager, AIProviderConfig, AIProviderType } from '../../lib/ai-providers/ai-provider-manager';

export function AIProviderStatus() {
  const [providerStatus, setProviderStatus] = useState<{
    current: AIProviderType;
    available: AIProviderConfig[];
    isWorking: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStatus = async () => {
    try {
      const status = aiProviderManager.getProviderStatus();
      setProviderStatus(status);
    } catch (error) {
      console.error('获取AI服务状态失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = async () => {
    setIsRefreshing(true);
    await loadStatus();
    setIsRefreshing(false);
  };

  const switchProvider = async (providerType: AIProviderType) => {
    const success = aiProviderManager.setProvider(providerType);
    if (success) {
      await loadStatus();
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (isLoading) {
    return (
      <Card className="glass-card border-white/20 bg-white/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-gray-300">检查AI服务状态...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!providerStatus) {
    return (
      <Alert className="glass-card border-red-500/20 bg-red-500/10">
        <XCircle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300">
          无法获取AI服务状态
        </AlertDescription>
      </Alert>
    );
  }

  const currentProviderConfig = providerStatus.available.find(
    p => p.type === providerStatus.current
  );

  const getStatusIcon = (provider: AIProviderConfig) => {
    if (!provider.enabled) {
      return <XCircle className="h-4 w-4 text-red-400" />;
    }
    if (provider.type === providerStatus?.current) {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    }
    return <Wifi className="h-4 w-4 text-gray-400" />;
  };

  const getStatusBadge = (provider: AIProviderConfig) => {
    if (!provider.enabled) {
      return <Badge variant="destructive" className="text-xs">未配置</Badge>;
    }
    if (provider.type === providerStatus?.current) {
      return <Badge className="bg-green-600 text-xs">当前使用</Badge>;
    }
    return <Badge variant="outline" className="text-xs">可用</Badge>;
  };

  return (
    <Card className="glass-card border-white/20 bg-white/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-400" />
            AI服务状态
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatus}
            disabled={isRefreshing}
            className="glass-card border-white/30 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 当前服务状态 */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {providerStatus.isWorking ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              )}
              <span className="text-white font-medium">
                当前服务: {currentProviderConfig?.name || '未知'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentProviderConfig?.type === 'deepseek' && (
              <Badge className="bg-green-600 text-xs">🇨🇳 国内访问</Badge>
            )}
            {currentProviderConfig?.type === 'google' && (
              <Badge variant="secondary" className="text-xs">🌍 需要VPN</Badge>
            )}
          </div>
        </div>

        {/* 服务列表 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">可用服务:</h4>
          {providerStatus.available.map((provider) => (
            <div
              key={provider.type}
              className="flex items-center justify-between p-3 rounded-lg glass-card border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(provider)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{provider.name}</span>
                    {getStatusBadge(provider)}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{provider.description}</p>
                </div>
              </div>
              
              {provider.enabled && provider.type !== providerStatus.current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => switchProvider(provider.type)}
                  className="glass-card border-white/30 text-white hover:bg-white/10"
                >
                  切换
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* 配置提示 */}
        {!providerStatus.available.some(p => p.enabled) && (
          <Alert className="glass-card border-yellow-500/20 bg-yellow-500/10">
            <Info className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300 text-sm">
              <div className="space-y-2">
                <p className="font-medium">没有可用的AI服务</p>
                <p>请配置以下任一AI服务：</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>DeepSeek API（推荐，中国大陆直接访问）</li>
                  <li>Google AI（需要VPN）</li>
                </ul>
                <p className="text-xs">
                  配置方法：在 <code>.env.local</code> 文件中添加相应的API密钥
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
} 