'use client';

import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Key, ShieldCheck, ShieldAlert } from 'lucide-react';
import { verifyAdminKey, AdminPermissions, AdminLevel, getAdminLevelName } from '../../lib/admin-auth';
import { useToast } from '../../hooks/use-toast';

interface AdminKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (permissions: AdminPermissions) => void;
  title?: string;
  description?: string;
}

export function AdminKeyDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  title = "管理员验证",
  description = "请输入管理员密钥以访问此功能"
}: AdminKeyDialogProps) {
  const [inputKey, setInputKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!inputKey.trim()) {
      setError('请输入管理员密钥');
      return;
    }

    if (attemptCount >= 3) {
      setError('尝试次数过多，请稍后再试');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const permissions = await verifyAdminKey(inputKey.trim());
      
      if (permissions) {
        toast({
          title: "验证成功",
          description: `欢迎，${getAdminLevelName(permissions.level)}！`,
        });
        
        onSuccess(permissions);
        setInputKey('');
        setAttemptCount(0);
        onOpenChange(false);
      } else {
        setAttemptCount(prev => prev + 1);
        setError(`密钥无效或已过期（${attemptCount + 1}/3 次尝试）`);
        setInputKey('');
      }
    } catch (error: any) {
      console.error('密钥验证错误:', error);
      setError('验证过程中发生错误，请重试');
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !verifying) {
      handleVerify();
    }
  };

  const handleClose = () => {
    setInputKey('');
    setError(null);
    setAttemptCount(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-white/20 bg-gray-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Key className="h-5 w-5 text-purple-400" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-key" className="text-white">
              管理员密钥
            </Label>
            <Input
              id="admin-key"
              type="password"
              placeholder="请输入管理员密钥..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={verifying}
              className="glass-card border-white/30 bg-white/5 text-white placeholder:text-gray-400"
            />
          </div>

          {error && (
            <Alert className="glass-card border-red-500/50 bg-red-500/10">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">权限级别说明：</p>
                <ul className="space-y-1 text-xs">
                  <li>• <span className="text-purple-300">超级管理员</span>：完全访问权限，可管理密钥</li>
                  <li>• <span className="text-blue-300">管理员</span>：可访问上传和AI功能</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={verifying}
              className="flex-1 glass-card border-white/30 text-white hover:bg-white/10"
            >
              取消
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verifying || !inputKey.trim() || attemptCount >= 3}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  验证中...
                </>
              ) : (
                '验证密钥'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 