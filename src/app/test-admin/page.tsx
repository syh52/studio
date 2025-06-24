'use client';

import { ProtectedFeature } from '../../components/admin/ProtectedFeature';
import { AIProviderStatus } from '../../components/ai/AIProviderStatus';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getCachedAdminPermissions, clearAdminCache, getAdminPermissionDebugInfo } from '../../lib/admin-auth';
import { useState } from 'react';

export default function TestAdminPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const showDebugInfo = () => {
    const info = getAdminPermissionDebugInfo();
    setDebugInfo(info);
    console.log('调试信息:', info);
  };

  const clearCache = () => {
    clearAdminCache();
    console.log('管理员权限缓存已清除');
    setDebugInfo(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* AI服务状态 */}
      <AIProviderStatus />

      <Card className="glass-card border-white/20 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">测试超级管理员功能</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              <strong>超级管理员密钥：</strong> LEXICON-SUPER-ADMIN-2024-9F8E7D6C5B4A3928
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              <strong>重要提示：</strong> 项目现已支持DeepSeek AI服务，可在中国大陆无需VPN直接使用。
              配置DeepSeek API密钥后，AI功能将自动切换到国内服务。
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={showDebugInfo} variant="outline" className="glass-card border-white/30 text-white">
              显示调试信息
            </Button>
            <Button onClick={clearCache} variant="outline" className="glass-card border-red-500/30 text-red-300">
              清除权限缓存
            </Button>
          </div>

          {debugInfo && (
            <Card className="glass-card border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="text-blue-300 text-sm">调试信息</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-gray-300 overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <ProtectedFeature
        requiredPermission="canManageKeys"
        title="超级管理员功能测试"
        description="请输入超级管理员密钥以访问密钥管理功能"
        fallbackTitle="需要超级管理员权限"
        fallbackDescription="此功能需要超级管理员权限才能访问"
      >
        <Card className="glass-card border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-green-300">🎉 超级管理员功能访问成功！</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-200">
              恭喜！您已成功通过超级管理员验证，现在可以访问所有管理功能。
            </p>
          </CardContent>
        </Card>
      </ProtectedFeature>
    </div>
  );
} 