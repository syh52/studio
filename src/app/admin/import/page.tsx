"use client";

import { useState, useEffect } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Database, CloudUpload, RefreshCw, Menu, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { VocabularyImporter } from '@/components/admin/VocabularyImporter';
import { DialogueImporter } from '@/components/admin/DialogueImporter';
import { ImportTemplateGenerator } from '@/components/admin/ImportTemplateGenerator';
import { AudioManager } from '@/components/admin/AudioManager';
import { migrateDataToFirestore, checkExistingData } from '@/scripts/migrate-data';

export default function ImportPage() {
  const [importResults, setImportResults] = useState<any>(null);
  const [dataStatus, setDataStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [activeTab, setActiveTab] = useState("migrate");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 检查Firestore中的现有数据
  const handleCheckData = async () => {
    setIsChecking(true);
    try {
      const status = await checkExistingData();
      setDataStatus(status);
    } catch (error) {
      console.error('检查数据状态失败:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // 执行数据迁移
  const handleMigrateData = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateDataToFirestore();
      setImportResults(result);
      // 迁移完成后重新检查数据状态
      await handleCheckData();
    } catch (error) {
      console.error('数据迁移失败:', error);
      setImportResults({
        success: false,
        message: `数据迁移失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setIsMigrating(false);
    }
  };

  // 页面加载时检查数据状态
  useEffect(() => {
    handleCheckData();
  }, []);

  const tabItems = [
    { value: "migrate", label: "数据迁移", icon: CloudUpload, color: "orange" },
    { value: "vocabulary", label: "词汇库", icon: FileText, color: "purple" },
    { value: "dialogue", label: "对话库", icon: Upload, color: "blue" },
    { value: "audio", label: "音频管理", icon: Upload, color: "pink" },
    { value: "templates", label: "模板下载", icon: Download, color: "green" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* 移动端头部 */}
      <div className="lg:hidden sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">数据导入</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-gray-400 hover:text-white"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* 移动端菜单 */}
        {showMobileMenu && (
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="grid grid-cols-2 gap-2">
              {tabItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.value}
                    variant={activeTab === item.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setActiveTab(item.value);
                      setShowMobileMenu(false);
                    }}
                    className={`justify-start gap-2 ${
                      activeTab === item.value 
                        ? `bg-${item.color}-600 hover:bg-${item.color}-700 text-white` 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto p-4 lg:p-6 space-y-6 max-w-7xl">
        {/* 桌面端头部 */}
        <div className="hidden lg:block">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    数据批量导入
                  </h1>
                  <p className="text-gray-400 text-sm">
                    高效管理词汇库和对话库，支持多种文件格式的批量导入
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Database className="w-4 h-4 mr-1" />
                数据管理
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Smartphone className="w-4 h-4 mr-1" />
                移动友好
              </Badge>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* 桌面端标签页 */}
          <TabsList className="hidden lg:flex bg-gray-800/50 border border-gray-700 rounded-xl p-1 w-full">
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className={`flex-1 flex items-center gap-2 rounded-lg transition-all duration-200 ${
                    activeTab === item.value
                      ? `data-[state=active]:bg-${item.color}-600 data-[state=active]:text-white data-[state=active]:shadow-lg`
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="migrate" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <CloudUpload className="w-5 h-5 text-orange-400" />
                  </div>
                  初始化数据迁移
                </CardTitle>
                <CardDescription className="text-gray-300">
                  将本地数据一键迁移到Cloud Firestore，解决导入后看不见数据的问题
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 数据状态检查 */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleCheckData}
                      disabled={isChecking}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-shrink-0"
                    >
                      {isChecking ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="w-4 h-4 mr-2" />
                      )}
                      检查Firestore数据状态
                    </Button>
                  </div>

                  {dataStatus && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className={`border transition-all duration-300 ${
                        dataStatus.hasDialogues 
                          ? 'border-green-500/50 bg-green-500/10 shadow-green-500/20' 
                          : 'border-yellow-500/50 bg-yellow-500/10 shadow-yellow-500/20'
                      } shadow-lg`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            {dataStatus.hasDialogues ? (
                              <CheckCircle className="w-6 h-6 text-green-400" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-yellow-400" />
                            )}
                            <span className="font-medium text-white">对话数据</span>
                          </div>
                          <div className="text-sm text-gray-300">
                            Firestore中有 <span className="text-white font-semibold">{dataStatus.dialogueCount}</span> 个对话
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={`border transition-all duration-300 ${
                        dataStatus.hasVocabulary 
                          ? 'border-green-500/50 bg-green-500/10 shadow-green-500/20' 
                          : 'border-yellow-500/50 bg-yellow-500/10 shadow-yellow-500/20'
                      } shadow-lg`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            {dataStatus.hasVocabulary ? (
                              <CheckCircle className="w-6 h-6 text-green-400" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-yellow-400" />
                            )}
                            <span className="font-medium text-white">词汇数据</span>
                          </div>
                          <div className="text-sm text-gray-300">
                            Firestore中有 <span className="text-white font-semibold">{dataStatus.vocabularyCount}</span> 个词汇
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                {/* 数据迁移按钮 */}
                <div className="space-y-4">
                  <Alert className="border-orange-500/50 bg-orange-500/10 shadow-lg">
                    <CloudUpload className="w-5 h-5 text-orange-400" />
                    <AlertDescription className="text-orange-200">
                      如果Firestore中没有数据，请点击下方按钮将本地数据一键迁移到云端。
                      这是首次使用时的必要步骤，确保导入功能正常工作。
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleMigrateData}
                    disabled={isMigrating}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg"
                  >
                    {isMigrating ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        正在迁移数据到Firestore...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-5 h-5 mr-2" />
                        开始数据迁移
                      </>
                    )}
                  </Button>
                </div>

                {/* 迁移说明 */}
                <Card className="bg-gray-700/30 border-gray-600">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-300 space-y-3">
                      <div>
                        <h4 className="font-medium text-white mb-2">📦 数据迁移包含:</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
                          <li>2个词汇包：飞行基础与客舱安全、安保操作与应急处理</li>
                          <li>162个专业词汇：每个包含完整的学习材料</li>
                          <li>10个情景对话：涵盖日常执勤和紧急处理场景</li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-gray-600">
                        <p className="text-yellow-300">
                          <strong>⚠️ 注意:</strong> 迁移是一次性操作，完成后所有导入和显示功能将正常工作。
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vocabulary" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  词汇库批量导入
                </CardTitle>
                <CardDescription className="text-gray-300">
                  支持 Excel (.xlsx)、CSV (.csv) 和 JSON (.json) 格式的词汇数据导入
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VocabularyImporter onImportComplete={setImportResults} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dialogue" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-400" />
                  </div>
                  对话库批量导入
                </CardTitle>
                <CardDescription className="text-gray-300">
                  支持 Excel (.xlsx)、CSV (.csv) 和 JSON (.json) 格式的对话数据导入
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DialogueImporter onImportComplete={setImportResults} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-pink-400" />
                  </div>
                  音频文件管理
                </CardTitle>
                <CardDescription className="text-gray-300">
                  上传和管理词汇发音、对话音频等音频文件
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudioManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-400" />
                  </div>
                  导入模板下载
                </CardTitle>
                <CardDescription className="text-gray-300">
                  下载标准格式的导入模板，确保数据格式正确
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImportTemplateGenerator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 导入结果展示 */}
        {importResults && (
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  importResults.success ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {importResults.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                导入结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={`shadow-lg ${
                importResults.success 
                  ? "border-green-500/50 bg-green-500/10" 
                  : "border-red-500/50 bg-red-500/10"
              }`}>
                <AlertDescription className="text-white">
                  {importResults.message}
                </AlertDescription>
              </Alert>
              
              {importResults.details && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {importResults.details.successful || 0}
                      </div>
                      <div className="text-sm text-gray-300">成功导入</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {importResults.details.failed || 0}
                      </div>
                      <div className="text-sm text-gray-300">导入失败</div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {importResults.details.duplicates || 0}
                      </div>
                      <div className="text-sm text-gray-300">重复跳过</div>
                    </div>
                  </div>
                  
                  {importResults.details.errors && importResults.details.errors.length > 0 && (
                    <Card className="bg-red-500/5 border-red-500/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-400">错误详情</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-300 max-h-40 overflow-y-auto">
                          {importResults.details.errors.map((error: string, index: number) => (
                            <div key={index} className="mb-1 p-1 hover:bg-gray-800 rounded">
                              {error}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 使用说明 - 移动端优化 */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              使用说明
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    📁 支持的文件格式
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <div className="font-medium text-blue-300">Excel (.xlsx)</div>
                      <div className="text-sm text-gray-400">推荐格式，支持多工作表和丰富的数据结构</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <div className="font-medium text-green-300">CSV (.csv)</div>
                      <div className="text-sm text-gray-400">简单格式，适合基础数据导入</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <div className="font-medium text-purple-300">JSON (.json)</div>
                      <div className="text-sm text-gray-400">完整格式，支持所有字段和嵌套结构</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    📝 词汇数据必填字段
                  </h4>
                  <ul className="space-y-1 text-sm bg-gray-700/20 rounded-lg p-3">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      英文单词 (english)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      中文翻译 (chinese)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      英文例句 (exampleSentenceEn)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      中文例句 (exampleSentenceZh)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    💬 对话数据必填字段
                  </h4>
                  <ul className="space-y-1 text-sm bg-gray-700/20 rounded-lg p-3">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      对话标题 (title)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      对话描述 (description)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      对话行数据 (lines): 包含说话人、英文、中文
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    🎵 音频文件管理
                  </h4>
                  <ul className="space-y-1 text-sm bg-gray-700/20 rounded-lg p-3">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                      支持MP3、WAV、OGG、M4A格式
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                      音频文件按类型分类管理
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                      支持在线播放预览和删除
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                ⚠️ 重要提醒
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span>首次使用请先执行"数据迁移"，将本地数据同步到Firestore</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span>导入前请先下载对应的模板文件，确保数据格式正确</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span>系统会自动检测并跳过重复的数据</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span>建议在正式导入前先进行小批量测试</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 