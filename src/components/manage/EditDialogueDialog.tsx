'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialogue } from '@/lib/data';
import { Trash2, Plus } from 'lucide-react';

interface EditDialogueDialogProps {
  dialogue: Dialogue | null;
  onUpdate: (dialogue: Dialogue) => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export default function EditDialogueDialog({
  dialogue,
  onUpdate,
  onClose,
  onSave
}: EditDialogueDialogProps) {
  if (!dialogue) return null;

  return (
    <Dialog open={!!dialogue} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto glass-card-strong border-white/30 bg-gray-900/95">
        <DialogHeader>
          <DialogTitle className="text-white font-inter">编辑对话</DialogTitle>
          <DialogDescription className="text-gray-400 leading-relaxed">
            修改对话的标题、描述和内容
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="dialogue-title" className="text-white font-medium">标题</Label>
              <Input
                id="dialogue-title"
                value={dialogue.title}
                onChange={(e) => onUpdate({
                  ...dialogue,
                  title: e.target.value
                })}
                required
                className="glass-card border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 modern-focus transition-all duration-200"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="dialogue-description" className="text-white font-medium">描述</Label>
            <Textarea
              id="dialogue-description"
              value={dialogue.description}
              onChange={(e) => onUpdate({
                ...dialogue,
                description: e.target.value
              })}
              className="glass-card border-white/20 bg-white/10 text-white placeholder-gray-400 focus:border-purple-400 modern-focus transition-all duration-200"
            />
          </div>
          
          <div>
            <Label className="text-white font-medium">对话内容</Label>
            <div className="space-y-3 max-h-80 overflow-y-auto bg-white/5 rounded-xl p-4 border border-white/20">
              {dialogue.lines.map((line, index) => (
                <div key={line.id} className="space-y-2 p-3 glass-card bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300 min-w-20">说话人:</span>
                    <Input
                      value={line.speaker}
                      onChange={(e) => {
                        const newLines = [...dialogue.lines];
                        newLines[index] = { ...line, speaker: e.target.value };
                        onUpdate({ ...dialogue, lines: newLines });
                      }}
                      className="flex-1 glass-card border-white/20 bg-white/10 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300 min-w-20">英文:</span>
                    <Input
                      value={line.english}
                      onChange={(e) => {
                        const newLines = [...dialogue.lines];
                        newLines[index] = { ...line, english: e.target.value };
                        onUpdate({ ...dialogue, lines: newLines });
                      }}
                      className="flex-1 glass-card border-white/20 bg-white/10 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300 min-w-20">中文:</span>
                    <Input
                      value={line.chinese}
                      onChange={(e) => {
                        const newLines = [...dialogue.lines];
                        newLines[index] = { ...line, chinese: e.target.value };
                        onUpdate({ ...dialogue, lines: newLines });
                      }}
                      className="flex-1 glass-card border-white/20 bg-white/10 text-white placeholder-gray-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newLines = dialogue.lines.filter((_, i) => i !== index);
                        onUpdate({ ...dialogue, lines: newLines });
                      }}
                      className="glass-card border-red-500/30 text-red-400 hover:bg-red-500/10 hover:scale-105 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newLines = [...dialogue.lines, { 
                  id: `line-${Date.now()}`, 
                  speaker: '', 
                  english: '', 
                  chinese: '' 
                }];
                onUpdate({ ...dialogue, lines: newLines });
              }}
              className="mt-2 glass-card border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加对话行
            </Button>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="glass-card border-white/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              取消
            </Button>
            <Button 
              type="submit"
              className="gradient-primary text-white hover:scale-105 transition-all duration-200 modern-focus"
            >
              保存更改
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 