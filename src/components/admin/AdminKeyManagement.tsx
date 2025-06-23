'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Key, 
  Plus, 
  Download, 
  Eye, 
  EyeOff, 
  Copy, 
  BarChart3,
  Trash2,
  Edit,
  RefreshCw,
  Users,
  Activity,
  Shield,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import {
  AdminKeyData,
  KeyUsageStats,
  generateAdminKey,
  createAdminKey,
  getAllAdminKeys,
  updateKeyStatus,
  updateKeyDescription,
  getKeyUsageStats,
  exportKeysToCSV,
  validateKeyFormat,
  createBulkAdminKeys
} from '../../lib/admin-key-manager';

interface CreateKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyCreated: () => void;
}

function CreateKeyDialog({ open, onOpenChange, onKeyCreated }: CreateKeyDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [count, setCount] = useState(1);
  const [creating, setCreating] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);

  const handleCreate = async () => {
    if (!user?.id || !description.trim()) return;

    setCreating(true);
    try {
      let newKeys: string[] = [];
      
      if (count === 1) {
        const key = generateAdminKey();
        await createAdminKey(key, description.trim(), user.id);
        newKeys = [key];
      } else {
        const results = await createBulkAdminKeys(
          count, 
          description.trim(), 
          user.id
        );
        newKeys = results.map(r => r.key);
      }

      // 立即更新生成的密钥状态
      setGeneratedKeys(newKeys);

      toast({
        title: "密钥创建成功",
        description: `已创建 ${count} 个管理员密钥，请复制保存`,
        className: "bg-green-600 text-white border-green-700"
      });

      // 不再自动刷新，让用户自己决定何时关闭对话框
      
    } catch (error: any) {
      console.error('创建密钥失败:', error);
      toast({
        title: "创建失败",
        description: error.message || "创建密钥时发生错误",
        variant: "destructive",
      });
      setGeneratedKeys([]); // 确保错误时清空生成的密钥
    } finally {
      setCreating(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "已复制",
      description: "密钥已复制到剪贴板",
    });
  };

  const handleClose = () => {
    // 如果有生成的密钥，说明用户已经成功创建了密钥，需要刷新数据
    const shouldRefresh = generatedKeys.length > 0;
    
    setDescription('');
    setCount(1);
    setGeneratedKeys([]);
    onOpenChange(false);
    
    // 在对话框关闭后刷新数据
    if (shouldRefresh) {
      setTimeout(() => {
        onKeyCreated();
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-white/20 bg-gray-900/95 backdrop-blur-xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white text-sm md:text-base">
            <Plus className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
            生成管理员密钥
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-xs md:text-sm">
            创建新的管理员密钥以分发给申请人。密钥永久有效，当申请人输入密钥后，您可以在密钥列表中看到绑定的用户信息。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              密钥描述
            </Label>
            <Input
              id="description"
              placeholder="例如：张三的管理员密钥"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-card border-white/30 bg-white/5 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="count" className="text-white">
              生成数量
            </Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="10"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="glass-card border-white/30 bg-white/5 text-white"
            />
          </div>

          {generatedKeys.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white text-sm">生成的密钥</Label>
                {generatedKeys.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const allKeys = generatedKeys.join('\n');
                      navigator.clipboard.writeText(allKeys);
                      toast({
                        title: "已复制全部",
                        description: `已复制 ${generatedKeys.length} 个密钥到剪贴板`,
                      });
                    }}
                    className="glass-card border-green-500/30 text-green-300 hover:bg-green-500/10 text-xs px-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    复制全部
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {generatedKeys.map((key, index) => (
                  <div key={index} className="flex items-center gap-2 glass-card border-white/20 bg-white/5 p-2 md:p-3 rounded">
                    <code className="flex-1 text-green-300 font-mono text-xs md:text-sm break-all">{key}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyKey(key)}
                      className="glass-card border-white/30 text-white hover:bg-white/10 p-1 md:p-2"
                    >
                      <Copy className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Alert className="glass-card border-red-500/50 bg-red-500/10">
                <Shield className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  <div className="space-y-2">
                    <p className="font-bold text-red-200">🚨 重要：请立即复制密钥！</p>
                    <ul className="text-sm space-y-1">
                      <li>• <strong>密钥只显示这一次</strong>，关闭对话框后无法再次查看</li>
                      <li>• 密钥永久有效，直到您手动禁用</li>
                      <li>• 复制密钥后，点击"已复制，关闭"按钮完成操作</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="glass-card border-white/30 text-white hover:bg-white/10"
          >
            {generatedKeys.length > 0 ? '已复制，关闭' : '取消'}
          </Button>
          {generatedKeys.length === 0 && (
            <Button
              onClick={handleCreate}
              disabled={creating || !description.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {creating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  生成密钥
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminKeyManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<AdminKeyData[]>([]);
  const [stats, setStats] = useState<KeyUsageStats>({
    totalKeys: 0,
    activeKeys: 0,
    totalUsage: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingKey, setEditingKey] = useState<{ id: string; description: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [keysData, statsData] = await Promise.all([
        getAllAdminKeys(),
        getKeyUsageStats()
      ]);
      setKeys(keysData);
      setStats(statsData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载密钥数据",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    try {
      await updateKeyStatus(keyId, !currentStatus);
      await loadData();
      
      toast({
        title: "状态更新成功",
        description: `密钥已${!currentStatus ? '启用' : '禁用'}`,
      });
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message || "更新密钥状态时发生错误",
        variant: "destructive",
      });
    }
  };

  const saveDescription = async () => {
    if (!editingKey) return;

    try {
      await updateKeyDescription(editingKey.id, editingKey.description);
      await loadData();
      setEditingKey(null);
      
      toast({
        title: "描述更新成功",
        description: "密钥描述已更新",
      });
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message || "更新描述时发生错误",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csvContent = exportKeysToCSV(keys);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin-keys-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "导出成功",
      description: "密钥数据已导出为CSV文件",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white">加载管理员密钥数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="glass-card border-white/20 bg-white/5">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">总密钥数</p>
                <p className="text-lg md:text-2xl font-bold text-white">{stats.totalKeys}</p>
              </div>
              <Key className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-white/5">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">活跃密钥</p>
                <p className="text-lg md:text-2xl font-bold text-white">{stats.activeKeys}</p>
              </div>
              <Users className="h-6 w-6 md:h-8 md:w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-white/5">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">总使用次数</p>
                <p className="text-lg md:text-2xl font-bold text-white">{stats.totalUsage}</p>
              </div>
              <Activity className="h-6 w-6 md:h-8 md:w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-white/5">
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">最近活动</p>
                <p className="text-lg md:text-2xl font-bold text-white">{stats.recentActivity.length}</p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Tabs defaultValue="keys" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList className="glass-card border-white/20 bg-white/5">
            <TabsTrigger value="keys" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Key className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">密钥管理</span>
              <span className="sm:hidden">密钥</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">使用统计</span>
              <span className="sm:hidden">统计</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={keys.length === 0}
              className="glass-card border-white/30 text-white hover:bg-white/10 text-xs md:text-sm px-2 md:px-4"
            >
              <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">导出CSV</span>
              <span className="sm:hidden">导出</span>
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs md:text-sm px-2 md:px-4"
            >
              <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">生成密钥</span>
              <span className="sm:hidden">生成</span>
            </Button>
          </div>
        </div>

        <TabsContent value="keys">
          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">管理员密钥列表</CardTitle>
              <CardDescription className="text-gray-300">
                管理所有管理员密钥的状态和描述
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 移动端：卡片布局 */}
              <div className="block md:hidden space-y-4">
                {keys.map((key) => (
                  <div key={key.id} className="glass-card border-white/20 bg-white/5 p-4 rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingKey?.id === key.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingKey?.description || ''}
                              onChange={(e) => editingKey && setEditingKey({ ...editingKey, description: e.target.value })}
                              className="h-8 glass-card border-white/30 bg-white/5 text-white text-sm"
                            />
                            <Button size="sm" onClick={saveDescription}>
                              <Key className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{key.description}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingKey({ id: key.id!, description: key.description })}
                              className="p-1"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleKeyStatus(key.id!, key.isActive)}
                        className="glass-card border-white/30 text-white hover:bg-white/10 ml-2"
                      >
                        {key.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">级别：</span>
                        <Badge variant={key.level === 'admin' ? 'default' : 'secondary'} className="ml-1 text-xs">
                          {key.level === 'admin' ? '管理员' : '普通'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-400">状态：</span>
                        <Badge variant={key.isActive ? 'default' : 'destructive'} className="ml-1 text-xs">
                          {key.isActive ? '活跃' : '禁用'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-400">使用次数：</span>
                        <span className="text-white">{key.usageCount || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">创建：</span>
                        <span className="text-white">{key.createdAt?.toDate?.()?.toLocaleDateString() || '-'}</span>
                      </div>
                    </div>
                    
                    {key.lastUsedBy && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">绑定用户：</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <span className="text-xs text-purple-300">
                              {key.lastUsedBy.slice(0, 1).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white text-xs">{key.lastUsedBy}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 桌面端：表格布局 */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-gray-300">描述</TableHead>
                      <TableHead className="text-gray-300">级别</TableHead>
                      <TableHead className="text-gray-300">状态</TableHead>
                      <TableHead className="text-gray-300">使用次数</TableHead>
                      <TableHead className="text-gray-300">绑定用户</TableHead>
                      <TableHead className="text-gray-300">创建时间</TableHead>
                      <TableHead className="text-gray-300">最后使用</TableHead>
                      <TableHead className="text-gray-300">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow key={key.id} className="border-white/10">
                        <TableCell className="text-white">
                          {editingKey?.id === key.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingKey?.description || ''}
                                onChange={(e) => editingKey && setEditingKey({ ...editingKey, description: e.target.value })}
                                className="h-8 glass-card border-white/30 bg-white/5 text-white"
                              />
                              <Button size="sm" onClick={saveDescription}>
                                <Key className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{key.description}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingKey({ id: key.id!, description: key.description })}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={key.level === 'admin' ? 'default' : 'secondary'}>
                            {key.level === 'admin' ? '管理员' : '普通管理员'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={key.isActive ? 'default' : 'destructive'}>
                            {key.isActive ? '活跃' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">{key.usageCount || 0}</TableCell>
                        <TableCell className="text-white">
                          {key.lastUsedBy ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <span className="text-xs text-purple-300">
                                  {key.lastUsedBy.slice(0, 1).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm">{key.lastUsedBy}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">未使用</span>
                          )}
                        </TableCell>
                        <TableCell className="text-white">
                          {key.createdAt?.toDate?.()?.toLocaleDateString() || '-'}
                        </TableCell>
                        <TableCell className="text-white">
                          {key.lastUsedAt?.toDate?.()?.toLocaleDateString() || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleKeyStatus(key.id!, key.isActive)}
                            className="glass-card border-white/30 text-white hover:bg-white/10"
                          >
                            {key.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">使用统计</CardTitle>
              <CardDescription className="text-gray-300">
                查看密钥的使用情况和活动记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium mb-4">最近活动</h3>
                  {stats.recentActivity.length > 0 ? (
                    <div className="space-y-2">
                      {stats.recentActivity.map((activity, index) => (
                        <div key={index} className="glass-card border-white/20 bg-white/5 p-3 rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{activity.description}</p>
                              <p className="text-gray-400 text-sm">
                                使用次数: {activity.usageCount} | 最后使用者: {activity.lastUsedBy || '未知'}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={activity.isActive ? 'default' : 'destructive'}>
                                {activity.isActive ? '活跃' : '禁用'}
                              </Badge>
                              <p className="text-gray-400 text-xs mt-1">
                                {activity.lastUsedAt?.toDate?.()?.toLocaleString() || '从未使用'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">暂无活动记录</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateKeyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onKeyCreated={loadData}
      />
    </div>
  );
} 