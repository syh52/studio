"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Database, 
  Shield, 
  CloudCog,
  RefreshCw,
  FileText,
  Book
} from 'lucide-react';
import { checkFirestoreConnection, testWritePermission } from '../../lib/firestore-service'
import { getAllVocabularyPacks, getAllDialogues } from '../../lib/data'
import { saveCustomVocabularyPack } from '../../lib/firestore-service'

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function TestFirestorePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [vocabularyData, setVocabularyData] = useState<any[]>([]);
  const [dialogueData, setDialogueData] = useState<any[]>([]);
  const [testingSave, setTestingSave] = useState(false);

  // 运行完整的Firestore测试
  const runFirestoreTests = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    try {
      // 1. 测试用户认证
      testResults.push({
        name: '用户认证检查',
        status: isAuthenticated ? 'success' : 'error',
        message: isAuthenticated ? `用户已登录: ${user?.email}` : '用户未登录',
        details: user ? { uid: user.id, email: user.email } : null
      });

             // 2. 测试Firestore连接
       try {
         const connected = await checkFirestoreConnection();
         testResults.push({
           name: 'Firestore连接测试',
           status: connected ? 'success' : 'error',
           message: connected ? 'Firestore连接正常' : 'Firestore连接失败'
         });
       } catch (error: any) {
         testResults.push({
           name: 'Firestore连接测试',
           status: 'error',
           message: `连接失败: ${error.message}`,
           details: error
         });
       }

       // 2.5. 测试写入权限
       if (user) {
         try {
           const canWrite = await testWritePermission(user.id);
           testResults.push({
             name: 'Firestore写入权限测试',
             status: canWrite ? 'success' : 'error',
             message: canWrite ? '写入权限正常' : '写入权限失败',
             details: canWrite ? '可以正常创建和删除文档' : '无法写入数据，请检查安全规则'
           });
         } catch (error: any) {
           testResults.push({
             name: 'Firestore写入权限测试',
             status: 'error',
             message: `写入测试失败: ${error.message}`,
             details: error
           });
         }
       }

      // 3. 测试词汇包数据获取
      if (user) {
        try {
          const vocabPacks = await getAllVocabularyPacks(user.id);
          const customPacks = vocabPacks.filter(pack => pack.id.startsWith('custom-') || pack.id.startsWith('ai-parsed-'));
          
          testResults.push({
            name: '词汇包数据获取',
            status: 'success',
            message: `成功加载 ${vocabPacks.length} 个词汇包 (包含 ${customPacks.length} 个自定义包)`,
            details: {
              total: vocabPacks.length,
              custom: customPacks.length,
              packs: vocabPacks.map(p => ({ id: p.id, name: p.name, itemCount: p.items?.length || 0 }))
            }
          });
          
          setVocabularyData(vocabPacks);
        } catch (error: any) {
          testResults.push({
            name: '词汇包数据获取',
            status: 'error',
            message: `获取失败: ${error.message}`,
            details: error
          });
        }

        // 4. 测试对话数据获取
        try {
          const dialogues = await getAllDialogues(user.id);
          const customDialogues = dialogues.filter(d => d.id.startsWith('custom-') || d.id.startsWith('ai-parsed-'));
          
          testResults.push({
            name: '对话数据获取',
            status: 'success',
            message: `成功加载 ${dialogues.length} 个对话 (包含 ${customDialogues.length} 个自定义对话)`,
            details: {
              total: dialogues.length,
              custom: customDialogues.length,
              dialogues: dialogues.map(d => ({ id: d.id, title: d.title, lineCount: d.lines?.length || 0 }))
            }
          });
          
          setDialogueData(dialogues);
        } catch (error: any) {
          testResults.push({
            name: '对话数据获取',
            status: 'error',
            message: `获取失败: ${error.message}`,
            details: error
          });
        }
      }

      // 5. 检查Firebase配置
      testResults.push({
        name: 'Firebase配置检查',
        status: 'success',
        message: 'Firebase配置已加载',
        details: {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aviation-lexicon-trainer',
          hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          usingEnvironmentVariables: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        }
      });

    } catch (error: any) {
      testResults.push({
        name: '测试执行',
        status: 'error',
        message: `测试过程中发生错误: ${error.message}`,
        details: error
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  // 页面加载时自动运行测试
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      runFirestoreTests();
         }
   }, [isAuthenticated, isLoading, user]);

   // 测试保存功能
   const testSaveFunction = async () => {
     if (!user) return;
     
     setTestingSave(true);
     try {
       // 创建一个测试词汇包
       const testPack = {
         id: `test-pack-${Date.now()}`,
         name: `测试词汇包 ${new Date().toLocaleTimeString()}`,
         description: '这是一个测试词汇包，用于验证保存功能',
         items: [
           {
             id: 'test-word-1',
             english: 'test',
             chinese: '测试',
             exampleSentenceEn: 'This is a test.',
             exampleSentenceZh: '这是一个测试。'
           }
         ]
       };
       
       await saveCustomVocabularyPack(user.id, testPack);
       
       // 重新运行测试以更新数据
       runFirestoreTests();
       
       alert('✅ 测试保存成功！请查看词汇数据标签页');
     } catch (error: any) {
       console.error('测试保存失败:', error);
       alert(`❌ 测试保存失败: ${error.message}`);
     } finally {
       setTestingSave(false);
     }
   };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-300';
      case 'error':
        return 'bg-red-500/20 text-red-300';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            请先登录以进行Firestore测试
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Firestore 诊断中心</h1>
          <p className="text-gray-400 mt-2">检查Firestore连接状态和数据完整性</p>
        </div>
                 <div className="flex gap-2">
           <Button
             onClick={runFirestoreTests}
             disabled={testing}
             className="flex items-center gap-2"
           >
             <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
             {testing ? '测试中...' : '重新测试'}
           </Button>
           <Button
             onClick={testSaveFunction}
             disabled={testingSave || !user}
             variant="outline"
             className="flex items-center gap-2"
           >
             <Database className={`h-4 w-4 ${testingSave ? 'animate-pulse' : ''}`} />
             {testingSave ? '保存测试中...' : '测试保存功能'}
           </Button>
         </div>
      </div>

      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">连接测试</TabsTrigger>
          <TabsTrigger value="vocabulary">词汇数据</TabsTrigger>
          <TabsTrigger value="dialogues">对话数据</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {results.length === 0 && !testing && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                点击"重新测试"按钮开始检查Firestore状态
              </AlertDescription>
            </Alert>
          )}

          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getStatusIcon(result.status)}
                    {result.name}
                  </CardTitle>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status === 'success' ? '通过' : 
                     result.status === 'error' ? '失败' : '警告'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 mb-3">{result.message}</p>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-400 hover:text-white">
                      查看详细信息
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-800 rounded text-gray-300 overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="vocabulary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                词汇包数据详情
              </CardTitle>
              <CardDescription>
                当前加载的所有词汇包（本地 + 云端自定义）
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vocabularyData.length === 0 ? (
                <p className="text-gray-400">暂无词汇包数据</p>
              ) : (
                <div className="space-y-3">
                  {vocabularyData.map((pack, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{pack.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant={pack.id.startsWith('custom-') || pack.id.startsWith('ai-parsed-') ? 'default' : 'secondary'}>
                            {pack.id.startsWith('custom-') || pack.id.startsWith('ai-parsed-') ? '自定义' : '内置'}
                          </Badge>
                          <Badge variant="outline">
                            {pack.items?.length || 0} 词汇
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{pack.description}</p>
                      <p className="text-xs text-gray-500">ID: {pack.id}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dialogues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                对话数据详情
              </CardTitle>
              <CardDescription>
                当前加载的所有对话（本地 + 云端自定义）
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dialogueData.length === 0 ? (
                <p className="text-gray-400">暂无对话数据</p>
              ) : (
                <div className="space-y-3">
                  {dialogueData.map((dialogue, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{dialogue.title}</h4>
                        <div className="flex gap-2">
                          <Badge variant={dialogue.id.startsWith('custom-') || dialogue.id.startsWith('ai-parsed-') ? 'default' : 'secondary'}>
                            {dialogue.id.startsWith('custom-') || dialogue.id.startsWith('ai-parsed-') ? '自定义' : '内置'}
                          </Badge>
                          <Badge variant="outline">
                            {dialogue.lines?.length || 0} 对话
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{dialogue.description}</p>
                      <p className="text-xs text-gray-500">ID: {dialogue.id}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 调试信息部分 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            调试信息和故障排除
          </CardTitle>
          <CardDescription>
            详细的系统信息，用于排查问题
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">用户信息</h4>
              <div className="text-sm space-y-1 font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <div>认证状态: {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}</div>
                <div>用户ID: {user?.id || '无'}</div>
                <div>用户邮箱: {user?.email || '无'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Firebase配置</h4>
              <div className="text-sm space-y-1 font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <div>项目ID: {typeof window !== 'undefined' ? 
                  (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aviation-lexicon-trainer') : 
                  '服务器端'}</div>
                <div>API密钥前缀: {typeof window !== 'undefined' ? 
                  (process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...' || 'AIzaSyDtAR...') : 
                  '服务器端'}</div>
                <div>使用环境变量: {typeof window !== 'undefined' ? 
                  (!!process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '是' : '否') : 
                  '服务器端'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">故障排除步骤</h4>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>1. 确保已登录 - {isAuthenticated ? '✅' : '❌ 请先登录'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>2. 检查浏览器控制台是否有错误信息</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>3. 确认 Firestore 已在 Firebase 控制台启用</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>4. 验证安全规则是否正确部署</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>5. 检查网络连接是否正常</span>
                </div>
              </div>
            </div>
            
            {/* 快速操作 */}
            <div>
              <h4 className="font-medium mb-2">快速操作</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://console.firebase.google.com/project/aviation-lexicon-trainer/firestore', '_blank')}
                >
                  打开 Firebase 控制台
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('=== Firebase 调试信息 ===');
                    console.log('用户:', user);
                    console.log('认证状态:', isAuthenticated);
                    console.log('词汇数据:', vocabularyData);
                    console.log('对话数据:', dialogueData);
                    alert('调试信息已输出到浏览器控制台');
                  }}
                >
                  输出调试信息到控制台
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.clear();
                    alert('浏览器缓存已清理，请刷新页面');
                  }}
                >
                  清理浏览器缓存
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 