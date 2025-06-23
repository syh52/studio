'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Shield, Lock, Key } from 'lucide-react';
import { AdminKeyDialog } from './AdminKeyDialog';
import { getCachedAdminPermissions, hasPermission, AdminPermissions, getAdminLevelName } from '../../lib/admin-auth';

interface ProtectedFeatureProps {
  children: React.ReactNode;
  requiredPermission: keyof AdminPermissions;
  title?: string;
  description?: string;
  fallbackTitle?: string;
  fallbackDescription?: React.ReactNode;
}

export function ProtectedFeature({
  children,
  requiredPermission,
  title = "管理员功能",
  description = "此功能需要管理员权限",
  fallbackTitle = "权限受限",
  fallbackDescription = "您需要管理员权限才能访问此功能"
}: ProtectedFeatureProps) {
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, [requiredPermission]);

  const checkPermissions = () => {
    console.log('ProtectedFeature: 检查权限，所需权限:', requiredPermission);
    const cachedPermissions = getCachedAdminPermissions();
    console.log('ProtectedFeature: 缓存的权限:', cachedPermissions);
    setPermissions(cachedPermissions);
    
    if (cachedPermissions && hasPermission(requiredPermission)) {
      console.log('ProtectedFeature: 权限检查通过，设置访问权限为true');
      setHasAccess(true);
    } else {
      console.log('ProtectedFeature: 权限检查未通过，设置访问权限为false');
      setHasAccess(false);
    }
  };

  const handleKeySuccess = (newPermissions: AdminPermissions) => {
    console.log('ProtectedFeature: 密钥验证成功，收到新权限:', newPermissions);
    setPermissions(newPermissions);
    checkPermissions();
  };

  const getPermissionName = (permission: keyof AdminPermissions): string => {
    switch (permission) {
      case 'canAccessUpload':
        return '批量上传';
      case 'canAccessAI':
        return 'AI功能';
      case 'canManageKeys':
        return '密钥管理';
      case 'canViewStatistics':
        return '统计数据';
      default:
        return '特殊功能';
    }
  };

  // 如果有权限，直接显示内容
  if (hasAccess) {
    return <>{children}</>;
  }

  // 无权限时显示权限提示
  return (
    <>
      <Card className="glass-card border-white/20 bg-white/5 max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="h-16 w-16 text-gray-400" />
              <Lock className="h-6 w-6 text-red-400 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-white text-xl">
            {fallbackTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-gray-300 leading-relaxed">
            {fallbackDescription}
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-yellow-300 mb-2">
              <Key className="h-4 w-4" />
              <span className="font-medium">所需权限</span>
            </div>
            <p className="text-sm text-yellow-200">
              需要 <span className="font-medium">{getPermissionName(requiredPermission)}</span> 权限
            </p>
          </div>

          {permissions && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="text-blue-300 text-sm">
                <p className="font-medium mb-1">当前权限状态：</p>
                <p>{getAdminLevelName(permissions.level)}</p>
                <p className="text-xs mt-1 text-blue-400">
                  权限有效期至：{new Date(permissions.validUntil).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => setShowKeyDialog(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 hover:scale-105"
            >
              <Key className="mr-2 h-4 w-4" />
              输入管理员密钥
            </Button>

            <p className="text-xs text-gray-400">
              如需获取管理员密钥，请联系系统管理员
            </p>
          </div>
        </CardContent>
      </Card>

      <AdminKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        onSuccess={handleKeySuccess}
        title={title}
        description={description}
      />
    </>
  );
} 