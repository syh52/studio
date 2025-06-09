"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Volume2, Trash2, Search, Music, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { audioApi, audioValidation, audioUtils, type AudioFile } from '@/lib/firebase/storage';

interface AudioManagerProps {
  onAudioSelect?: (audioFile: AudioFile) => void;
  allowSelection?: boolean;
}

export function AudioManager({ onAudioSelect, allowSelection = false }: AudioManagerProps) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'vocabulary' | 'dialogue' | 'pronunciation'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'vocabulary' | 'dialogue' | 'pronunciation'>('vocabulary');
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [audioStats, setAudioStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasStoragePermission, setHasStoragePermission] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // 获取音频文件列表
  const fetchAudioFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await audioApi.getAllAudios();
      setAudioFiles(files);
      setHasStoragePermission(true);
      
      // 获取统计信息
      const stats = await audioApi.getAudioStats();
      setAudioStats(stats);
      
      console.log(`📊 成功加载 ${files.length} 个音频文件`);
    } catch (error) {
      console.error('获取音频文件失败:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('retry-limit-exceeded')) {
          setError('Firebase Storage连接超时，请检查网络连接或稍后重试');
          setHasStoragePermission(false);
        } else if (error.message.includes('permission-denied')) {
          setError('Firebase Storage权限不足，请检查storage rules配置');
          setHasStoragePermission(false);
        } else if (error.message.includes('not-found')) {
          setError('Storage bucket不存在，请检查Firebase项目配置');
          setHasStoragePermission(false);
        } else {
          setError(`音频加载失败: ${error.message}`);
        }
      } else {
        setError('音频加载失败，请重试');
      }
      
      // 即使出错也设置空数据，让界面能显示
      setAudioFiles([]);
      setAudioStats({ total: 0, byType: {}, totalSize: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudioFiles();
  }, []);

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // 验证文件
    const { valid, invalid } = audioValidation.validateAudioFiles(files);
    
    if (invalid.length > 0) {
      alert(`以下文件格式不正确:\n${invalid.map(f => `${f.file.name}: ${f.error}`).join('\n')}`);
    }

    if (valid.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let completed = 0;
      const results = await audioApi.uploadMultipleAudios(
        valid,
        uploadType,
        (completedCount, total) => {
          completed = completedCount;
          setUploadProgress((completedCount / total) * 100);
        }
      );

      if (results.success.length > 0) {
        alert(`成功上传 ${results.success.length} 个音频文件`);
        await fetchAudioFiles(); // 刷新列表
      }

      if (results.failed.length > 0) {
        alert(`${results.failed.length} 个文件上传失败:\n${results.failed.map(f => `${f.file.name}: ${f.error}`).join('\n')}`);
      }
    } catch (error) {
      console.error('批量上传失败:', error);
      alert('音频上传失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 播放/暂停音频
  const togglePlay = (audioFile: AudioFile) => {
    const audioId = audioFile.id;
    let audio = audioRefs.current[audioId];

    if (!audio) {
      audio = new Audio(audioFile.url);
      audioRefs.current[audioId] = audio;
      
      audio.addEventListener('ended', () => {
        setCurrentPlayingId(null);
      });
    }

    if (currentPlayingId === audioId) {
      audio.pause();
      setCurrentPlayingId(null);
    } else {
      // 停止其他正在播放的音频
      Object.values(audioRefs.current).forEach(a => a.pause());
      
      audio.play();
      setCurrentPlayingId(audioId);
    }
  };

  // 删除音频文件
  const handleDelete = async (audioFile: AudioFile) => {
    if (!confirm(`确定要删除音频文件 "${audioFile.name}" 吗？`)) return;

    try {
      await audioApi.deleteAudio(audioFile.id, audioFile.type);
      alert('音频文件删除成功');
      await fetchAudioFiles(); // 刷新列表
    } catch (error) {
      console.error('删除音频文件失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 过滤音频文件
  const filteredAudioFiles = audioFiles.filter(audio => {
    const matchesSearch = audio.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || audio.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* 错误信息显示 */}
      {error && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-red-200">
            <div className="font-medium mb-2">Firebase Storage连接问题</div>
            <div className="text-sm">{error}</div>
            {!hasStoragePermission && (
              <div className="mt-3 space-y-2 text-xs">
                <div><strong>可能的解决方案：</strong></div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>检查Firebase项目的Storage是否已启用</li>
                  <li>确认storage.rules文件已正确配置和部署</li>
                  <li>验证网络连接是否正常</li>
                  <li>尝试刷新页面或稍后重试</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 统计信息 */}
      {audioStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-purple-500/20 border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Music className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">{audioStats.total}</div>
              <div className="text-sm text-purple-300">总音频文件</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-500/20 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Volume2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">{audioStats.byType.vocabulary || 0}</div>
              <div className="text-sm text-blue-300">词汇音频</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/20 border-green-500/30">
            <CardContent className="p-4 text-center">
              <Play className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">{audioStats.byType.dialogue || 0}</div>
              <div className="text-sm text-green-300">对话音频</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500/20 border-orange-500/30">
            <CardContent className="p-4 text-center">
              <Upload className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-400">
                {audioUtils.formatFileSize(audioStats.totalSize)}
              </div>
              <div className="text-sm text-orange-300">总存储大小</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600">
            上传音频
          </TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-blue-600">
            管理音频
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5" />
                批量上传音频文件
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="upload-type" className="text-white mb-2 block">
                  音频类型
                </Label>
                <Select value={uploadType} onValueChange={(value: any) => setUploadType(value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="选择音频类型" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="vocabulary" className="text-white">词汇发音</SelectItem>
                    <SelectItem value="dialogue" className="text-white">对话音频</SelectItem>
                    <SelectItem value="pronunciation" className="text-white">发音示例</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="audio-upload" className="text-white mb-2 block">
                  选择音频文件
                </Label>
                <Input
                  ref={fileInputRef}
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="bg-gray-700 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2"
                />
                <div className="text-sm text-gray-400 mt-2">
                  支持格式: MP3, WAV, OGG, M4A (最大10MB)
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>上传进度</span>
                    <span>{uploadProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="bg-gray-700" />
                </div>
              )}

              <Alert className="border-purple-500 bg-purple-500/10">
                <Upload className="w-4 h-4" />
                <AlertDescription className="text-purple-200">
                  音频文件将上传到Firebase Storage，可在导入数据时通过文件名关联到对应的词汇或对话。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* 搜索和过滤 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索音频文件..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
              <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="筛选类型" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white">全部类型</SelectItem>
                <SelectItem value="vocabulary" className="text-white">词汇发音</SelectItem>
                <SelectItem value="dialogue" className="text-white">对话音频</SelectItem>
                <SelectItem value="pronunciation" className="text-white">发音示例</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchAudioFiles}
              disabled={isLoading}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              刷新
            </Button>
          </div>

          {/* 音频文件列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAudioFiles.map((audioFile) => (
              <Card key={audioFile.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{audioFile.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {audioFile.type}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {audioUtils.formatFileSize(audioFile.size)}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleDelete(audioFile)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => togglePlay(audioFile)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-600"
                      >
                        {currentPlayingId === audioFile.id ? (
                          <Pause className="w-4 h-4 mr-2" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        {currentPlayingId === audioFile.id ? '暂停' : '播放'}
                      </Button>

                      {allowSelection && onAudioSelect && (
                        <Button
                          onClick={() => onAudioSelect(audioFile)}
                          variant="default"
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          选择
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-gray-400">
                      上传时间: {audioFile.uploadTime.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAudioFiles.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-400">
                {searchTerm ? '没有找到匹配的音频文件' : '还没有上传任何音频文件'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 