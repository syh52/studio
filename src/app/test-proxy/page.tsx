'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import ProxyDiagnostic from '../../components/ProxyDiagnostic';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function TestProxyPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [networkLogs, setNetworkLogs] = useState<string[]>([]);

  // 监听网络请求日志
  const addLog = (message: string) => {
    setNetworkLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 测试登录（会触发Firebase Auth API请求）
  const testLogin = async () => {
    setLoading(true);
    setResult('');
    addLog('🔥 开始测试Firebase Auth登录...');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      addLog('✅ 登录成功！代理拦截器工作正常');
      setResult(`✅ 登录成功: ${userCredential.user.email}`);
    } catch (error: any) {
      addLog(`❌ 登录失败: ${error.code} - ${error.message}`);
      setResult(`❌ 登录失败: ${error.code}`);
      
      // 分析错误类型
      if (error.code === 'auth/network-request-failed') {
        addLog('🚨 网络请求失败 - 代理可能没有正确拦截请求');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        addLog('✅ 网络连接正常 - 代理拦截器工作（认证错误是正常的）');
      }
    } finally {
      setLoading(false);
    }
  };

  // 测试注册（会触发Firebase Auth API请求）
  const testRegister = async () => {
    setLoading(true);
    setResult('');
    addLog('🔥 开始测试Firebase Auth注册...');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      addLog('✅ 注册成功！代理拦截器工作正常');
      setResult(`✅ 注册成功: ${userCredential.user.email}`);
    } catch (error: any) {
      addLog(`❌ 注册失败: ${error.code} - ${error.message}`);
      setResult(`❌ 注册失败: ${error.code}`);
      
      // 分析错误类型
      if (error.code === 'auth/network-request-failed') {
        addLog('🚨 网络请求失败 - 代理可能没有正确拦截请求');
      } else if (error.code === 'auth/email-already-in-use' || error.code === 'auth/weak-password') {
        addLog('✅ 网络连接正常 - 代理拦截器工作（注册错误是正常的）');
      }
    } finally {
      setLoading(false);
    }
  };

  // 清空日志
  const clearLogs = () => {
    setNetworkLogs([]);
    setResult('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🔬 代理拦截器测试实验室
          </h1>
          <p className="text-gray-400 mt-2">
            测试Monkey-patching代理拦截器是否能够正确处理Firebase Auth请求
          </p>
        </div>

        {/* 代理诊断信息 */}
        <ProxyDiagnostic />

        {/* 测试控制面板 */}
        <Card className="glass-card-strong">
          <CardHeader>
            <CardTitle>🧪 Firebase Auth 测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">测试邮箱</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入邮箱地址"
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">测试密码</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  className="bg-gray-800 border-gray-600"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={testLogin}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? '测试中...' : '🔐 测试登录'}
              </Button>
              
              <Button 
                onClick={testRegister}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? '测试中...' : '📝 测试注册'}
              </Button>
              
              <Button 
                onClick={clearLogs}
                variant="outline"
                className="border-gray-600"
              >
                🗑️ 清空日志
              </Button>
            </div>

            {/* 测试结果 */}
            {result && (
              <div className={`p-3 rounded ${
                result.includes('✅') ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'
              }`}>
                <strong>测试结果:</strong> {result}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 网络请求日志 */}
        <Card className="glass-card-strong">
          <CardHeader>
            <CardTitle>📝 网络请求日志</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-800 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
              {networkLogs.length === 0 ? (
                <div className="text-gray-500 text-center mt-8">
                  还没有网络请求日志...
                  <br />
                  点击上面的测试按钮开始测试
                </div>
              ) : (
                networkLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>📋 测试说明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-300 space-y-2">
            <p><strong>🎯 测试目标:</strong> 验证Monkey-patching代理拦截器是否能正确拦截Firebase Auth请求</p>
            <p><strong>✅ 成功标志:</strong> 看到网络请求日志显示"✅ 网络连接正常 - 代理拦截器工作"</p>
            <p><strong>❌ 失败标志:</strong> 看到"🚨 网络请求失败 - 代理可能没有正确拦截请求"</p>
            <p><strong>💡 提示:</strong> 认证失败（如用户不存在）是正常的，重要的是网络连接要通过代理成功</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 