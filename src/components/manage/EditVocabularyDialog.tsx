'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { VocabularyPack } from '../../lib/data'
import VocabularyEditingInterface from './VocabularyEditingInterface';

interface EditVocabularyDialogProps {
  vocabulary: VocabularyPack | null;
  onUpdate: (vocab: VocabularyPack) => void;
  onClose: () => void;
  onSave: () => void;
  toast: any;
}

export default function EditVocabularyDialog({
  vocabulary,
  onUpdate,
  onClose,
  onSave,
  toast
}: EditVocabularyDialogProps) {
  if (!vocabulary) return null;

  return (
    <Dialog open={!!vocabulary} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col glass-card-strong border-white/30 bg-gray-900/95 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/20 flex-shrink-0">
          <DialogTitle className="text-white font-inter">编辑词汇包 - {vocabulary.name}</DialogTitle>
          <DialogDescription className="text-gray-400 leading-relaxed">
            修改词汇包信息和管理词汇内容 - 共 {vocabulary.items.length} 个单词
          </DialogDescription>
        </DialogHeader>
        
        {/* 基本信息编辑 - 固定区域 */}
        <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-white/20 flex-shrink-0">
          <div>
            <Label htmlFor="vocabulary-name" className="text-white font-medium">词汇包名称</Label>
            <Input
              id="vocabulary-name"
              value={vocabulary.name}
              onChange={(e) => onUpdate({
                ...vocabulary,
                name: e.target.value
              })}
              className="glass-card border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 modern-focus transition-all duration-200"
            />
          </div>
          <div>
            <Label htmlFor="vocabulary-description" className="text-white font-medium">描述</Label>
            <Input
              id="vocabulary-description"
              value={vocabulary.description}
              onChange={(e) => onUpdate({
                ...vocabulary,
                description: e.target.value
              })}
              className="glass-card border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 modern-focus transition-all duration-200"
            />
          </div>
        </div>

        {/* 可滚动的词汇编辑区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <VocabularyEditingInterface 
            vocabulary={vocabulary}
            onUpdate={onUpdate}
            toast={toast}
          />
        </div>

        {/* 底部操作按钮 - 固定区域 */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-white/20 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="glass-card border-white/30 text-white hover:bg-white/10 transition-all duration-200"
          >
            取消
          </Button>
          <Button 
            onClick={onSave}
            className="gradient-primary text-white hover:scale-105 transition-all duration-200 modern-focus"
          >
            保存更改
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 