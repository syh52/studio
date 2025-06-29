'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { firebaseProxyInterceptor } from '../lib/proxy-interceptor';

interface DiagnosticInfo {
  isProduction: boolean;
  hostname: string;
  userAgent: string;
  proxyConditionMet: boolean;
  fetchIntercepted: boolean;
  monkeyPatchActive: boolean;
  nodeEnv: string;
}

export default function ProxyDiagnostic() {
  const [info, setInfo] = useState<DiagnosticInfo | null>(null);
  const [proxyTest, setProxyTest] = useState<string>('等待测试...');
  const [monkeyPatchTest, setMonkeyPatchTest] = useState<string>('等待测试...');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 检查环境和条件
      const isProduction = process.env.NODE_ENV === 'production';
      const hostname = window.location.hostname;
      const proxyConditionMet = 
        isProduction || 
        hostname.includes('lexiconlab.cn') ||
        hostname.includes('firebaseapp.com');
      
      // 检查是否已设置拦截器
      const originalFetch = (window as any).__originalFetch__;
      const fetchIntercepted = typeof originalFetch !== 'undefined';
      
      // 检查Monkey-patching拦截器是否激活
      const monkeyPatchActive = window.fetch !== fetch;

      setInfo({
        isProduction,
        hostname,
        userAgent: navigator.userAgent.substring(0, 50) + '...',
        proxyConditionMet,
        fetchIntercepted,
        monkeyPatchActive,
        nodeEnv: process.env.NODE_ENV || 'undefined'
      });

      // 测试代理连接
      testProxy();
      testMonkeyPatch();
    }
  }, []);

  const testProxy = async () => {
    try {
      setProxyTest('测试多个Worker中...');
      
      // 测试多个Worker代理
      const proxyUrls = [
        'https://firebase-cn-proxy.beelzebub1949.workers.dev',
        'https://firebase-proxy-backup.beelzebub1949.workers.dev', 
        'https://cn-firebase-api.beelzebub1949.workers.dev',
        'https://firebase-proxy-2024.beelzebub1949.workers.dev',
        'https://yellow-fire-20d4.beelzebub1949.workers.dev'
      ];
      
      const results: string[] = [];
      
      for (const proxyUrl of proxyUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            signal: controller.signal,
            mode: 'cors'
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok || response.status === 404) {
            results.push(`✅ ${proxyUrl.split('//')[1].split('.')[0]}`);
            // 找到第一个可用的就停止
            setProxyTest(`✅ 找到可用Worker: ${proxyUrl.split('//')[1].split('.')[0]}`);
            return;
          } else {
            results.push(`⚠️ ${proxyUrl.split('//')[1].split('.')[0]} (${response.status})`);
          }
        } catch (error: any) {
          results.push(`❌ ${proxyUrl.split('//')[1].split('.')[0]} (超时)`);
        }
      }
      
      setProxyTest(`❌ 所有Worker都不可用 (${results.length}个测试)`);
    } catch (error: any) {
      setProxyTest(`❌ 测试失败: ${error.message}`);
    }
  };

  const testMonkeyPatch = async () => {
    try {
      setMonkeyPatchTest('测试Monkey-patching代理...');
      
      // 测试强力代理拦截器
      const testResult = await firebaseProxyInterceptor.testProxyConnection();
      
      if (testResult) {
        setMonkeyPatchTest('✅ Monkey-patching代理工作正常');
      } else {
        setMonkeyPatchTest('❌ Monkey-patching代理测试失败');
      }
    } catch (error: any) {
      setMonkeyPatchTest(`❌ 测试失败: ${error.message}`);
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
            <strong>Monkey-patching:</strong>
            <Badge variant={info.monkeyPatchActive ? 'default' : 'destructive'} className="ml-2">
              {info.monkeyPatchActive ? '已激活' : '未激活'}
            </Badge>
          </div>
          
          <div>
            <strong>Worker测试:</strong>
            <Badge variant="outline" className="ml-2">{proxyTest}</Badge>
          </div>
          
          <div>
            <strong>强力代理测试:</strong>
            <Badge variant="outline" className="ml-2">{monkeyPatchTest}</Badge>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800 rounded text-sm">
          <strong>详细信息:</strong><br/>
          • 用户代理: {info.userAgent}<br/>
          • 当前URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}<br/>
          • 备用Workers: <br/>
          &nbsp;&nbsp;- firebase-cn-proxy.beelzebub1949.workers.dev<br/>
          &nbsp;&nbsp;- firebase-proxy-backup.beelzebub1949.workers.dev<br/>
          &nbsp;&nbsp;- cn-firebase-api.beelzebub1949.workers.dev<br/>
          &nbsp;&nbsp;- firebase-proxy-2024.beelzebub1949.workers.dev<br/>
          &nbsp;&nbsp;- yellow-fire-20d4.beelzebub1949.workers.dev
        </div>
        
        <div className="mt-4 flex gap-2">
          <button 
            onClick={testProxy}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            测试Worker代理
          </button>
          <button 
            onClick={testMonkeyPatch}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            测试强力代理
          </button>
        </div>
      </CardContent>
    </Card>
  );
} 