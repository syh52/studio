'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { verifyAdminKey, verifySuperAdminKey, getAdminPermissionDebugInfo } from '../../lib/admin-auth';
import { createAdminKey, generateAdminKey } from '../../lib/admin-key-manager';
import { useAuth } from '../../contexts/AuthContext';

export default function TestAdminKeyPage() {
  const [testKey, setTestKey] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { user } = useAuth();

  const testSuperAdminKey = async () => {
    setLoading(true);
    try {
      const superKey = 'LEXICON-SUPER-ADMIN-2024-9F8E7D6C5B4A3928';
      console.log('测试超级管理员密钥:', superKey);
      
      // 测试验证函数
      const isSuperAdmin = verifySuperAdminKey(superKey);
      console.log('超级管理员验证结果:', isSuperAdmin);
      
      // 测试完整验证
      const permissions = await verifyAdminKey(superKey);
      console.log('完整验证结果:', permissions);
      
      setResult({
        inputKey: superKey,
        isSuperAdmin,
        permissions,
        success: !!permissions
      });
    } catch (error: any) {
      console.error('测试失败:', error);
      setResult({
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testCustomKey = async () => {
    if (!testKey.trim()) {
      alert('请输入要测试的密钥');
      return;
    }
    
    setLoading(true);
    try {
      console.log('测试自定义密钥:', testKey);
      
      const isSuperAdmin = verifySuperAdminKey(testKey);
      const permissions = await verifyAdminKey(testKey);
      
      setResult({
        inputKey: testKey,
        isSuperAdmin,
        permissions,
        success: !!permissions
      });
    } catch (error: any) {
      console.error('测试失败:', error);
      setResult({
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestKey = async () => {
    if (!user?.id) {
      alert('请先登录');
      return;
    }
    
    setLoading(true);
    try {
      const newKey = generateAdminKey();
      console.log('生成的密钥:', newKey);
      
      const keyId = await createAdminKey(newKey, '测试密钥', user.id);
      console.log('创建的密钥ID:', keyId);
      
      setResult({
        action: 'create',
        newKey,
        keyId,
        success: true
      });
    } catch (error: any) {
      console.error('创建密钥失败:', error);
      setResult({
        action: 'create',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getDebugInfo = () => {
    const info = getAdminPermissionDebugInfo();
    setDebugInfo(info);
    console.log('调试信息:', info);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="glass-card border-white/20 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">管理员密钥调试工具</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 测试超级管理员密钥 */}
            <div className="space-y-2">
              <Button 
                onClick={testSuperAdminKey} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? '测试中...' : '测试超级管理员密钥'}
              </Button>
            </div>

            {/* 测试自定义密钥 */}
            <div className="space-y-2">
              <Input
                placeholder="输入要测试的密钥"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                className="glass-card border-white/30 bg-white/5 text-white"
              />
              <Button 
                onClick={testCustomKey} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? '测试中...' : '测试自定义密钥'}
              </Button>
            </div>

            {/* 创建测试密钥 */}
            <div className="space-y-2">
              <Button 
                onClick={createTestKey} 
                disabled={loading || !user}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? '创建中...' : '创建测试密钥'}
              </Button>
              {!user && <p className="text-red-400 text-sm">需要先登录才能创建密钥</p>}
            </div>

            {/* 获取调试信息 */}
            <div className="space-y-2">
              <Button 
                onClick={getDebugInfo}
                className="bg-purple-600 hover:bg-purple-700"
              >
                获取调试信息
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 显示结果 */}
        {result && (
          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">测试结果</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-white text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* 显示调试信息 */}
        {debugInfo && (
          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">调试信息</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-white text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* 用户信息 */}
        <Card className="glass-card border-white/20 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">当前用户信息</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-white text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 