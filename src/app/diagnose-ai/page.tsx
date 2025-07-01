"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Key,
  Cloud,
  Brain,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DiagnosisResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'testing';
  message: string;
  details?: string[];
  recommendation?: string;
  technicalInfo?: any;
}

export default function DiagnoseAIPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const addResult = (result: DiagnosisResult) => {
    setDiagnosisResults(prev => [...prev, result]);
  };

  const updateCurrentStep = (step: string) => {
    setCurrentStep(step);
  };

  const runDiagnosis = async () => {
    setIsRunning(true);
    setDiagnosisResults([]);
    setCurrentStep('开始诊断...');

    try {
      // 1. 检查用户认证状态
      updateCurrentStep('1/6 检查用户认证状态...');
      await checkAuthenticationStatus();

      // 2. 检查Firebase Token
      updateCurrentStep('2/6 检查Firebase Token...');
      await checkFirebaseToken();

      // 3. 检查AI管理器状态
      updateCurrentStep('3/6 检查AI管理器状态...');
      await checkAIManagerStatus();

      // 4. 测试AI初始化
      updateCurrentStep('4/6 测试AI初始化...');
      await testAIInitialization();

      // 5. 测试AI功能
      updateCurrentStep('5/6 测试AI功能...');
      await testAIFunctionality();

      // 6. 检查网络和代理
      updateCurrentStep('6/6 检查网络和代理...');
      await checkNetworkAndProxy();

      updateCurrentStep('诊断完成！');
    } catch (error) {
      addResult({
        name: '诊断过程',
        status: 'error',
        message: `诊断过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
        recommendation: '请刷新页面重试，或联系技术支持'
      });
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  const checkAuthenticationStatus = async () => {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      addResult({
        name: '用户认证状态',
        status: 'error',
        message: '用户未登录',
        recommendation: '请先登录您的账户',
        details: ['Firebase Auth 检测到用户未登录']
      });
      return;
    }

    const userInfo = {
      uid: currentUser.uid,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified,
      displayName: currentUser.displayName,
      metadata: {
        creationTime: currentUser.metadata.creationTime,
        lastSignInTime: currentUser.metadata.lastSignInTime
      }
    };

    addResult({
      name: '用户认证状态',
      status: 'success',
      message: `用户已登录: ${currentUser.email}`,
      details: [
        `用户ID: ${currentUser.uid}`,
        `邮箱验证: ${currentUser.emailVerified ? '已验证' : '未验证'}`,
        `最后登录: ${currentUser.metadata.lastSignInTime}`,
        `创建时间: ${currentUser.metadata.creationTime}`
      ],
      technicalInfo: userInfo
    });
  };

  const checkFirebaseToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        addResult({
          name: 'Firebase Token',
          status: 'error',
          message: '无法获取Token：用户未登录'
        });
        return;
      }

      const idToken = await currentUser.getIdToken(true); // 强制刷新token
      const tokenResult = await currentUser.getIdTokenResult();

      addResult({
        name: 'Firebase Token',
        status: 'success',
        message: 'Token获取成功',
        details: [
          `Token长度: ${idToken.length} 字符`,
          `发行时间: ${new Date(tokenResult.issuedAtTime).toLocaleString()}`,
          `过期时间: ${new Date(tokenResult.expirationTime).toLocaleString()}`,
          `认证时间: ${new Date(tokenResult.authTime).toLocaleString()}`,
          `签名算法: ${tokenResult.signInProvider}`,
          `Claims: ${Object.keys(tokenResult.claims).join(', ')}`
        ],
        technicalInfo: {
          tokenLength: idToken.length,
          claims: tokenResult.claims,
          issuedAt: tokenResult.issuedAtTime,
          expirationTime: tokenResult.expirationTime
        }
      });

      // 检查token是否即将过期（小于10分钟）
      const expirationTime = new Date(tokenResult.expirationTime);
      const now = new Date();
      const timeUntilExpiry = expirationTime.getTime() - now.getTime();
      const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));

      if (minutesUntilExpiry < 10) {
        addResult({
          name: 'Token过期检查',
          status: 'warning',
          message: `Token将在 ${minutesUntilExpiry} 分钟后过期`,
          recommendation: 'Token即将过期，建议重新登录'
        });
      } else {
        addResult({
          name: 'Token过期检查',
          status: 'success',
          message: `Token有效期还有 ${minutesUntilExpiry} 分钟`
        });
      }

    } catch (error) {
      addResult({
        name: 'Firebase Token',
        status: 'error',
        message: `Token获取失败: ${error instanceof Error ? error.message : '未知错误'}`,
        recommendation: '请尝试重新登录',
        details: [
          error instanceof Error ? error.stack || error.message : '未知错误详情'
        ]
      });
    }
  };

  const checkAIManagerStatus = async () => {
    try {
      const { firebaseAIManager } = await import('../../lib/ai-providers/ai-provider-manager');
      
      // 等待初始化
      await firebaseAIManager.waitForInitialization();
      
      const status = firebaseAIManager.getStatus();
      const diagnosis = await firebaseAIManager.diagnose();

      addResult({
        name: 'AI管理器状态',
        status: status.available ? 'success' : 'error',
        message: `${status.name} - ${status.available ? '可用' : '不可用'}`,
        details: [
          `初始化状态: ${status.initialized ? '已完成' : '未完成'}`,
          `可用状态: ${status.available ? '可用' : '不可用'}`,
          `错误信息: ${status.lastError || '无'}`,
          ...diagnosis.details
        ],
        recommendation: diagnosis.recommendations.join('; '),
        technicalInfo: { status, diagnosis }
      });

    } catch (error) {
      addResult({
        name: 'AI管理器状态',
        status: 'error',
        message: `AI管理器检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
        recommendation: '请检查代码配置或重新加载页面'
      });
    }
  };

  const testAIInitialization = async () => {
    try {
      const { getAIInstance } = await import('../../lib/firebase');
      
      const aiInstance = await getAIInstance();
      
      addResult({
        name: 'AI初始化测试',
        status: 'success',
        message: 'Firebase AI Logic初始化成功',
        details: [
          'AI实例创建成功',
          'Model实例创建成功',
          '用户认证通过',
          'VertexAI Backend连接正常'
        ]
      });

    } catch (error) {
      let errorType = 'unknown';
      let recommendation = '请检查配置';

      if (error instanceof Error) {
        if (error.message.includes('需要用户登录')) {
          errorType = 'auth_required';
          recommendation = '请确保已正确登录';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorType = 'permission_denied';
          recommendation = '请检查Firebase项目权限和API启用状态';
        } else if (error.message.includes('403')) {
          errorType = 'forbidden';
          recommendation = '请检查Firebase AI Logic API是否已启用';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorType = 'network_error';
          recommendation = '请检查网络连接和代理设置';
        }
      }

      addResult({
        name: 'AI初始化测试',
        status: 'error',
        message: `Firebase AI Logic初始化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        recommendation,
        details: [
          `错误类型: ${errorType}`,
          `错误详情: ${error instanceof Error ? error.message : '未知错误'}`,
          error instanceof Error && error.stack ? `堆栈跟踪: ${error.stack}` : ''
        ].filter(Boolean),
        technicalInfo: { errorType, error: error instanceof Error ? error.message : error }
      });
    }
  };

  const testAIFunctionality = async () => {
    try {
      const { firebaseAIManager } = await import('../../lib/ai-providers/ai-provider-manager');
      
      const testResult = await firebaseAIManager.generateText('测试连接：请回复"连接成功"');
      
      if (testResult.success) {
        addResult({
          name: 'AI功能测试',
          status: 'success',
          message: 'AI功能测试成功',
          details: [
            '成功发送测试请求',
            '成功接收AI回复',
            `回复内容: ${testResult.data?.substring(0, 100)}${testResult.data && testResult.data.length > 100 ? '...' : ''}`,
            '网络连接正常',
            '代理工作正常'
          ],
          technicalInfo: { response: testResult.data }
        });
      } else {
        addResult({
          name: 'AI功能测试',
          status: 'error',
          message: `AI功能测试失败: ${testResult.error}`,
          recommendation: '请检查网络连接、代理设置或Firebase配置',
          details: [
            `错误信息: ${testResult.error}`,
            '可能原因: 网络问题、认证失败、服务不可用'
          ]
        });
      }

    } catch (error) {
      addResult({
        name: 'AI功能测试',
        status: 'error',
        message: `AI功能测试异常: ${error instanceof Error ? error.message : '未知错误'}`,
        recommendation: '请检查代码配置或网络连接'
      });
    }
  };

  const checkNetworkAndProxy = async () => {
    try {
      // 检查代理状态
      const isProduction = process.env.NODE_ENV === 'production';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const shouldUseProxy = isProduction && hostname.includes('lexiconlab.cn');

      addResult({
        name: '网络和代理检查',
        status: 'success',
        message: '网络配置检查完成',
        details: [
          `运行环境: ${isProduction ? '生产环境' : '开发环境'}`,
          `当前域名: ${hostname}`,
          `代理状态: ${shouldUseProxy ? '启用' : '未启用'}`,
          `代理地址: ${shouldUseProxy ? 'api.lexiconlab.cn' : '直连'}`,
          `浏览器: ${navigator.userAgent}`
        ],
        technicalInfo: {
          environment: isProduction ? 'production' : 'development',
          hostname,
          proxyEnabled: shouldUseProxy,
          userAgent: navigator.userAgent
        }
      });

      // 测试代理连接
      if (shouldUseProxy) {
        try {
          const response = await fetch('https://api.lexiconlab.cn/health', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.ok) {
            addResult({
              name: '代理连接测试',
              status: 'success',
              message: '代理服务器连接正常'
            });
          } else {
            addResult({
              name: '代理连接测试',
              status: 'warning',
              message: `代理服务器响应异常: ${response.status}`,
              recommendation: '代理可能存在问题，但不一定影响AI功能'
            });
          }
        } catch (proxyError) {
          addResult({
            name: '代理连接测试',
            status: 'warning',
            message: `代理连接测试失败: ${proxyError instanceof Error ? proxyError.message : '未知错误'}`,
            recommendation: '代理可能存在问题，可以尝试禁用代理测试'
          });
        }
      }

    } catch (error) {
      addResult({
        name: '网络和代理检查',
        status: 'error',
        message: `网络检查失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { size: 20 };
    switch (status) {
      case 'success':
        return <CheckCircle {...iconProps} className="text-green-500" />;
      case 'error':
        return <XCircle {...iconProps} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-yellow-500" />;
      case 'testing':
        return <Loader2 {...iconProps} className="text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'testing':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-white">正在检查用户身份...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-6 w-6 text-purple-400" />
              Firebase AI Logic 诊断工具
            </CardTitle>
            <p className="text-gray-400">
              专门为已登录用户诊断Firebase AI Logic问题的工具
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">
                    {isAuthenticated ? `已登录: ${user?.email}` : '未登录'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {isAuthenticated ? `用户ID: ${user?.id?.substring(0, 8)}...` : '请先登录后再进行诊断'}
                  </p>
                </div>
              </div>
              <Button
                onClick={runDiagnosis}
                disabled={!isAuthenticated || isRunning}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    诊断中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    开始诊断
                  </>
                )}
              </Button>
            </div>
            
            {!isAuthenticated && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  ⚠️ 请先登录您的账户，然后再运行诊断工具
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Step */}
        {isRunning && currentStep && (
          <Card className="glass-card border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                <p className="text-white">{currentStep}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diagnosis Results */}
        {diagnosisResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">诊断结果</h2>
            {diagnosisResults.map((result, index) => (
              <Card key={index} className={`glass-card border ${getStatusColor(result.status)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-white">{result.name}</h3>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(result.status)}`}>
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{result.message}</p>
                        
                        {result.recommendation && (
                          <div className="mb-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
                            💡 建议: {result.recommendation}
                          </div>
                        )}

                        {(result.details || result.technicalInfo) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(index)}
                            className="text-gray-400 hover:text-white p-0 h-auto"
                          >
                            {expandedResults.has(index) ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                收起详情
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                查看详情
                              </>
                            )}
                          </Button>
                        )}

                        {expandedResults.has(index) && (
                          <div className="mt-3 space-y-2">
                            {result.details && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-1">详细信息:</h4>
                                <ul className="text-xs text-gray-400 space-y-1">
                                  {result.details.map((detail, i) => (
                                    <li key={i}>• {detail}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.technicalInfo && (
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium text-gray-300">技术信息:</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(JSON.stringify(result.technicalInfo, null, 2))}
                                    className="h-auto p-1 text-gray-400 hover:text-white"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <pre className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(result.technicalInfo, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Instructions */}
        <Card className="glass-card border-gray-500/20">
          <CardHeader>
            <CardTitle className="text-white text-lg">使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-300">
            <p>🔍 <strong>诊断步骤</strong>：此工具会依次检查用户认证、Token状态、AI管理器、初始化过程、功能测试和网络连接</p>
            <p>📋 <strong>结果解读</strong>：绿色表示正常，红色表示错误，黄色表示警告</p>
            <p>💡 <strong>建议操作</strong>：每个错误都会提供相应的解决建议</p>
            <p>📞 <strong>技术支持</strong>：如果问题仍未解决，请将诊断结果复制后联系技术支持</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 