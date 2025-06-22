"use client";
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { PlusCircle, Edit3, Trash2, Settings, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

// Placeholder data - in a real admin panel, this would come from a database via API
const placeholderVocabularyPacks = [
  { id: 'vp1', name: '飞行基础与客舱安全', items: 35, lastModified: '2024-07-28' },
  { id: 'vp2', name: '安保操作与应急处理', items: 47, lastModified: '2024-07-28' },
];

const placeholderDialogues = [
  { id: 'd1', title: '打架斗殴', lines: 6, lastModified: '2024-07-29' },
  { id: 'd2', title: '旅客吸烟事件处置', lines: 6, lastModified: '2024-07-29' },
  { id: 'd3', title: '擅自使用充电宝', lines: 6, lastModified: '2024-07-29' },
  { id: 'd4', title: '机组协同', lines: 6, lastModified: '2024-07-29' },
];

export default function AdminPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    // 备注：未来可以根据用户角色进行更细致的权限控制，例如：
    // if (!isLoading && isAuthenticated && user && !user.isAdmin) { // 假设User对象有isAdmin属性
    //   toast({ title: "权限不足", description: "您没有权限访问此页面。", variant: "destructive" });
    //   router.push('/'); 
    // }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 font-headline text-lg">加载管理后台...</p>
      </div>
    );
  }

  const handleAction = (action: string, type: string, id: string) => {
    alert(`操作: ${action} ${type} (ID: ${id})\n此功能需要连接后端数据库才能实际修改数据。`);
  };

  return (
    <div className="space-y-8">
      <Card className="pixel-border shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings size={32} className="text-accent" />
            <CardTitle className="font-headline text-3xl text-accent">管理后台</CardTitle>
          </div>
          <CardDescription>管理 Lexicon 应用的词汇包和情景对话内容。</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-md pixel-border border-orange-500/50 mb-6">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="text-orange-600 dark:text-orange-400 mt-1" size={24}/>
                    <div>
                        <h3 className="font-semibold text-orange-700 dark:text-orange-300">功能提示</h3>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                            这是一个管理界面的原型。当前的添加、编辑和删除操作仅为界面展示，
                            <strong>实际数据修改功能尚未连接后端数据库。</strong>
                            如需真实修改数据，请直接编辑 <code>src/lib/data.ts</code> 文件。
                        </p>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* 词汇包管理 */}
      <Card className="pixel-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-xl">词汇包管理</CardTitle>
            <Button size="sm" className="btn-pixel" onClick={() => handleAction('添加', '词汇包', 'new')}>
              <PlusCircle size={16} className="mr-2" /> 添加新词汇包
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead className="text-center">词条数</TableHead>
                <TableHead>最后修改 (模拟)</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderVocabularyPacks.map((pack) => (
                <TableRow key={pack.id}>
                  <TableCell className="font-medium">{pack.name}</TableCell>
                  <TableCell className="text-center">{pack.items}</TableCell>
                  <TableCell>{pack.lastModified}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="btn-pixel p-1 h-7 w-7" onClick={() => handleAction('编辑', '词汇包', pack.id)}>
                      <Edit3 size={14} />
                    </Button>
                    <Button variant="destructive" size="icon" className="btn-pixel p-1 h-7 w-7" onClick={() => handleAction('删除', '词汇包', pack.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 情景对话管理 */}
      <Card className="pixel-border">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-xl">情景对话管理</CardTitle>
            <Button size="sm" className="btn-pixel" onClick={() => handleAction('添加', '对话', 'new')}>
              <PlusCircle size={16} className="mr-2" /> 添加新对话
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead className="text-center">对话行数</TableHead>
                <TableHead>最后修改 (模拟)</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderDialogues.map((dialogue) => (
                <TableRow key={dialogue.id}>
                  <TableCell className="font-medium">{dialogue.title}</TableCell>
                  <TableCell className="text-center">{dialogue.lines}</TableCell>
                  <TableCell>{dialogue.lastModified}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" className="btn-pixel p-1 h-7 w-7" onClick={() => handleAction('编辑', '对话', dialogue.id)}>
                      <Edit3 size={14} />
                    </Button>
                    <Button variant="destructive" size="icon" className="btn-pixel p-1 h-7 w-7" onClick={() => handleAction('删除', '对话', dialogue.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

        <div className="text-center mt-6">
            <Link href="/" passHref>
              <Button variant="outline" className="btn-pixel">
                返回主页
              </Button>
            </Link>
        </div>
    </div>
  );
}

    