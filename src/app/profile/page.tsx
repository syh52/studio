"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { 
  UserCircle, 
  Mail, 
  Award, 
  LogOut, 
  Edit2, 
  Save, 
  X, 
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  Camera,
  Loader2
} from 'lucide-react';
import IndexDisplay from '../../components/shared/IndexDisplay'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { useToast } from '../../hooks/use-toast'
import { Alert, AlertDescription } from '../../components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const DEFAULT_AVATAR_PATH = "/images/dino-avatar.png"; 

export default function ProfilePage() {
  const { user, logout, isAuthenticated, isLoading, updateUserProfile, sendVerificationEmail, dailyCheckIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setEditedUsername(user.username);
      setEditedBio((user as any).bio || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    const success = await updateUserProfile({
      username: editedUsername,
      bio: editedBio
    });
    
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleSendVerification = async () => {
    setSendingVerification(true);
    await sendVerificationEmail();
    setSendingVerification(false);
  };

  const handleDailyCheckIn = async () => {
    await dailyCheckIn();
  };

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="glass-card border-white/20">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-700 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 w-1/3 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const canCheckIn = user.lastCheckIn !== new Date().toISOString().split('T')[0];
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* 主要资料卡片 */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 border-4 border-white/20">
                <AvatarImage
                  src={user.photoURL || DEFAULT_AVATAR_PATH} 
                  alt={user.username || "用户头像"}
                />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                  {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              
              <div>
                {isEditing ? (
                  <Input
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    className="mb-2 glass-card border-white/20 bg-white/5 text-white"
                    placeholder="用户名"
                  />
                ) : (
                  <h2 className="text-2xl font-semibold text-white">{user.username}</h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={user.emailVerified ? "default" : "secondary"}
                    className={user.emailVerified ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}
                  >
                    {user.emailVerified ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已验证
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        未验证
                      </>
                    )}
                  </Badge>
                  {user.createdAt && (
                    <span className="text-sm text-gray-400">
                      加入于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="glass-card border-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="gradient-primary"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="glass-card border-white/20"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  编辑
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 个人简介 */}
          {isEditing && (
            <div className="space-y-2">
              <Label className="text-white">个人简介</Label>
              <Textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="glass-card border-white/20 bg-white/5 text-white placeholder-gray-400"
                placeholder="介绍一下自己..."
                rows={3}
              />
            </div>
          )}
          
          {!isEditing && (user as any).bio && (
            <p className="text-gray-300">{(user as any).bio}</p>
          )}
          
          {/* 信息网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card border-white/10 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="text-purple-400" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">邮箱地址</p>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="glass-card border-white/10 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Award className="text-yellow-400" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">学习指数</p>
                  <IndexDisplay points={user.indexPoints} />
                </div>
              </div>
            </div>
            
            <div className="glass-card border-white/10 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="text-blue-400" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">上次签到</p>
                  <p className="text-white">
                    {user.lastCheckIn ? new Date(user.lastCheckIn).toLocaleDateString('zh-CN') : '尚未签到'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="glass-card border-white/10 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Shield className="text-green-400" size={20} />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">账户状态</p>
                  <p className="text-white">活跃</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 邮箱验证提示 */}
          {!user.emailVerified && (
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-gray-300">
                您的邮箱尚未验证。验证邮箱可以提高账户安全性。
                <Button
                  size="sm"
                  variant="link"
                  className="text-yellow-400 hover:text-yellow-300 p-0 h-auto ml-2"
                  onClick={handleSendVerification}
                  disabled={sendingVerification}
                >
                  {sendingVerification ? "发送中..." : "重新发送验证邮件"}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* 操作按钮 */}
          <div className="space-y-3 pt-4">
            {canCheckIn && (
              <Button 
                onClick={handleDailyCheckIn}
                className="w-full gradient-primary text-white"
              >
                <Calendar className="mr-2 h-4 w-4" />
                每日签到（+10积分）
              </Button>
            )}
            

            <Button 
              onClick={() => setShowLogoutDialog(true)}
              variant="outline" 
              className="w-full glass-card border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={20} className="mr-2" /> 
              退出登录
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* 退出登录确认对话框 */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认退出</DialogTitle>
            <DialogDescription>
              您确定要退出登录吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              取消
            </Button>
            <Button 
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              确认退出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
