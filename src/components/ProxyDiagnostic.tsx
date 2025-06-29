'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface DiagnosticInfo {
  isProduction: boolean;
  hostname: string;
  userAgent: string;
  shouldUseProxy: boolean;
  customDomain: string;
  nodeEnv: string;
}

export default function ProxyDiagnostic() {
  const [info, setInfo] = useState<DiagnosticInfo | null>(null);
  const [proxyTest, setProxyTest] = useState<string>('等待测试...');
  const [customDomainTest, setCustomDomainTest] = useState<string>('等待测试...');

  const CUSTOM_PROXY_DOMAIN = 'api.lexiconlab.cn';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 检查环境和条件
      const isProduction = process.env.NODE_ENV === 'production';
      const hostname = window.location.hostname;
      const shouldUseProxy = 
        isProduction || 
        hostname.includes('lexiconlab.cn') ||
        hostname.includes('firebaseapp.com');

      setInfo({
        isProduction,
        hostname,
        userAgent: navigator.userAgent.substring(0, 50) + '...',
        shouldUseProxy,
        customDomain: CUSTOM_PROXY_DOMAIN,
        nodeEnv: process.env.NODE_ENV || 'undefined'
      });

      // 测试代理连接
      testCustomDomainProxy();
    }
  }, []);

  const testCustomDomainProxy = async () => {
    try {
      setCustomDomainTest('测试自定义域名代理...');
      
      // 测试自定义代理域名的连通性
      const proxyUrl = `https://${CUSTOM_PROXY_DOMAIN}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'online') {
          setCustomDomainTest(`✅ 自定义域名代理正常: ${data.message}`);
        } else {
          setCustomDomainTest(`⚠️ 代理响应异常: ${JSON.stringify(data)}`);
        }
      } else {
        setCustomDomainTest(`❌ HTTP错误: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setCustomDomainTest(`❌ 连接超时: ${CUSTOM_PROXY_DOMAIN}`);
      } else {
        setCustomDomainTest(`❌ 连接失败: ${error.message}`);
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
            <strong>使用代理:</strong>
            <Badge variant={info.shouldUseProxy ? 'default' : 'secondary'} className="ml-2">
              {info.shouldUseProxy ? '是（官方方法）' : '否（直连）'}
            </Badge>
          </div>
          
          <div>
            <strong>代理域名:</strong>
            <Badge variant="outline" className="ml-2">{info.customDomain}</Badge>
          </div>
          
          <div>
            <strong>连接测试:</strong>
            <Badge variant="outline" className="ml-2">{customDomainTest}</Badge>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800 rounded text-sm">
          <strong>详细信息:</strong><br/>
          • 用户代理: {info.userAgent}<br/>
          • 当前URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}<br/>
          • 代理方案: 自定义域名 + 官方SDK方法<br/>
          • 优势: 长期稳定、官方支持、不受workers.dev封锁影响<br/>
          • 代理地址: https://{info.customDomain}
        </div>
        
        <div className="mt-4">
          <button 
            onClick={testCustomDomainProxy}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重新测试代理连接
          </button>
        </div>
      </CardContent>
    </Card>
  );
} 