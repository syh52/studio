'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface DiagnosticInfo {
  isProduction: boolean;
  hostname: string;
  userAgent: string;
  proxyConditionMet: boolean;
  fetchIntercepted: boolean;
  nodeEnv: string;
}

export default function ProxyDiagnostic() {
  const [info, setInfo] = useState<DiagnosticInfo | null>(null);
  const [proxyTest, setProxyTest] = useState<string>('等待测试...');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 检查环境和条件
      const isProduction = process.env.NODE_ENV === 'production';
      const hostname = window.location.hostname;
      const proxyConditionMet = isProduction && hostname.includes('lexiconlab.cn');
      
      // 检查是否已设置拦截器
      const originalFetch = (window as any).__originalFetch__;
      const fetchIntercepted = typeof originalFetch !== 'undefined';

      setInfo({
        isProduction,
        hostname,
        userAgent: navigator.userAgent.substring(0, 50) + '...',
        proxyConditionMet,
        fetchIntercepted,
        nodeEnv: process.env.NODE_ENV || 'undefined'
      });

      // 测试代理连接
      testProxy();
    }
  }, []);

  const testProxy = async () => {
    try {
      setProxyTest('测试中...');
      
      // 测试当前代理
      const proxyUrl = 'https://yellow-fire-20d4.beelzebub1949.workers.dev';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 404) {
        setProxyTest('✅ 代理连接成功');
      } else {
        setProxyTest(`⚠️ 代理响应异常 (${response.status})`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setProxyTest('❌ 代理连接超时 (5s)');
      } else {
        setProxyTest(`❌ 代理连接失败: ${error.message}`);
      }
    }
  };

  if (!info) {
    return <div>加载诊断信息...</div>;
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle>🔍 代理诊断报告</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>环境类型:</strong>
            <Badge variant={info.isProduction ? 'default' : 'secondary'} className="ml-2">
              {info.isProduction ? '生产环境' : '开发环境'}
            </Badge>
          </div>
          
          <div>
            <strong>NODE_ENV:</strong>
            <Badge variant="outline" className="ml-2">{info.nodeEnv}</Badge>
          </div>
          
          <div>
            <strong>域名:</strong>
            <Badge variant="outline" className="ml-2">{info.hostname}</Badge>
          </div>
          
          <div>
            <strong>代理条件:</strong>
            <Badge variant={info.proxyConditionMet ? 'default' : 'destructive'} className="ml-2">
              {info.proxyConditionMet ? '满足' : '不满足'}
            </Badge>
          </div>
          
          <div>
            <strong>Fetch拦截:</strong>
            <Badge variant={info.fetchIntercepted ? 'default' : 'destructive'} className="ml-2">
              {info.fetchIntercepted ? '已设置' : '未设置'}
            </Badge>
          </div>
          
          <div>
            <strong>代理测试:</strong>
            <Badge variant="outline" className="ml-2">{proxyTest}</Badge>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800 rounded text-sm">
          <strong>详细信息:</strong><br/>
          • 用户代理: {info.userAgent}<br/>
          • 当前URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}<br/>
          • 代理URL: https://yellow-fire-20d4.beelzebub1949.workers.dev
        </div>
        
        <div className="mt-4">
          <button 
            onClick={testProxy}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重新测试代理
          </button>
        </div>
      </CardContent>
    </Card>
  );
} 