import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  uploadBytesResumable,
  getMetadata 
} from 'firebase/storage';
import { storage } from './config';

// 音频文件类型
export interface AudioFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadTime: Date;
  type: 'vocabulary' | 'dialogue' | 'pronunciation';
  relatedId?: string; // 关联的词汇或对话ID
}

// 音频存储API
export const audioApi = {
  // 上传音频文件
  async uploadAudio(
    file: File, 
    type: 'vocabulary' | 'dialogue' | 'pronunciation',
    relatedId?: string,
    onProgress?: (progress: number) => void
  ): Promise<AudioFile> {
    try {
      // 生成文件路径
      const filename = `${Date.now()}-${file.name}`;
      const filePath = `audio/${type}/${filename}`;
      const audioRef = ref(storage, filePath);

      // 上传文件（支持进度回调）
      const uploadTask = uploadBytesResumable(audioRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (onProgress) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            }
          },
          (error) => {
            console.error('音频上传失败:', error);
            reject(new Error(`音频上传失败: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const metadata = await getMetadata(uploadTask.snapshot.ref);
              
              const audioFile: AudioFile = {
                id: filename,
                name: file.name,
                url: downloadURL,
                size: file.size,
                uploadTime: new Date(),
                type,
                relatedId
              };

              resolve(audioFile);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('音频上传初始化失败:', error);
      throw new Error('音频上传初始化失败');
    }
  },

  // 批量上传音频文件
  async uploadMultipleAudios(
    files: File[],
    type: 'vocabulary' | 'dialogue' | 'pronunciation',
    onProgress?: (completed: number, total: number) => void
  ): Promise<{ success: AudioFile[]; failed: { file: File; error: string }[] }> {
    const success: AudioFile[] = [];
    const failed: { file: File; error: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const audioFile = await this.uploadAudio(files[i], type);
        success.push(audioFile);
        if (onProgress) {
          onProgress(i + 1, files.length);
        }
      } catch (error) {
        failed.push({
          file: files[i],
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    return { success, failed };
  },

  // 获取指定类型的所有音频文件
  async getAudiosByType(type: 'vocabulary' | 'dialogue' | 'pronunciation'): Promise<AudioFile[]> {
    try {
      const audioRef = ref(storage, `audio/${type}`);
      const result = await listAll(audioRef);
      
      const audioFiles: AudioFile[] = [];
      
      for (const itemRef of result.items) {
        try {
          const [url, metadata] = await Promise.all([
            getDownloadURL(itemRef),
            getMetadata(itemRef)
          ]);

          audioFiles.push({
            id: itemRef.name,
            name: metadata.customMetadata?.originalName || itemRef.name,
            url,
            size: metadata.size,
            uploadTime: new Date(metadata.timeCreated),
            type,
            relatedId: metadata.customMetadata?.relatedId
          });
        } catch (error) {
          console.warn(`获取音频文件 ${itemRef.name} 信息失败:`, error);
        }
      }

      return audioFiles.sort((a, b) => b.uploadTime.getTime() - a.uploadTime.getTime());
    } catch (error) {
      console.error(`获取 ${type} 音频列表失败:`, error);
      
      // 检查具体错误类型并返回空数组而不是抛出错误
      if (error instanceof Error) {
        if (error.message.includes('retry-limit-exceeded')) {
          console.warn(`Firebase Storage连接超时，返回空列表`);
          return [];
        }
        if (error.message.includes('permission-denied')) {
          console.warn(`Firebase Storage权限不足，请检查storage rules`);
          return [];
        }
        if (error.message.includes('object-not-found')) {
          console.warn(`音频目录不存在: audio/${type}`);
          return [];
        }
      }
      
      // 返回空数组而不是抛出错误，让界面能正常显示
      return [];
    }
  },

  // 获取所有音频文件
  async getAllAudios(): Promise<AudioFile[]> {
    try {
      const [vocabulary, dialogue, pronunciation] = await Promise.all([
        this.getAudiosByType('vocabulary'),
        this.getAudiosByType('dialogue'),
        this.getAudiosByType('pronunciation')
      ]);

      return [...vocabulary, ...dialogue, ...pronunciation]
        .sort((a, b) => b.uploadTime.getTime() - a.uploadTime.getTime());
    } catch (error) {
      console.error('获取所有音频文件失败:', error);
      // 返回空数组而不是抛出错误，让界面能正常显示
      return [];
    }
  },

  // 删除音频文件
  async deleteAudio(audioId: string, type: 'vocabulary' | 'dialogue' | 'pronunciation'): Promise<void> {
    try {
      const audioRef = ref(storage, `audio/${type}/${audioId}`);
      await deleteObject(audioRef);
    } catch (error) {
      console.error('删除音频文件失败:', error);
      throw new Error('删除音频文件失败');
    }
  },

  // 根据文件名搜索音频
  async searchAudioByName(searchTerm: string): Promise<AudioFile[]> {
    try {
      const allAudios = await this.getAllAudios();
      return allAudios.filter(audio => 
        audio.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('搜索音频文件失败:', error);
      throw new Error('搜索音频文件失败');
    }
  },

  // 获取音频文件统计信息
  async getAudioStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    totalSize: number;
  }> {
    try {
      const allAudios = await this.getAllAudios();
      
      const byType = allAudios.reduce((acc, audio) => {
        acc[audio.type] = (acc[audio.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalSize = allAudios.reduce((sum, audio) => sum + audio.size, 0);

      return {
        total: allAudios.length,
        byType,
        totalSize
      };
    } catch (error) {
      console.error('获取音频统计失败:', error);
      throw new Error('获取音频统计失败');
    }
  }
};

// 音频文件验证
export const audioValidation = {
  // 支持的音频格式
  supportedFormats: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  
  // 最大文件大小 (10MB)
  maxFileSize: 10 * 1024 * 1024,

  // 验证音频文件
  validateAudioFile(file: File): { isValid: boolean; error?: string } {
    if (!this.supportedFormats.includes(file.type)) {
      return {
        isValid: false,
        error: `不支持的音频格式。支持的格式: ${this.supportedFormats.join(', ')}`
      };
    }

    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `文件大小超过限制 (${(this.maxFileSize / 1024 / 1024).toFixed(1)}MB)`
      };
    }

    return { isValid: true };
  },

  // 批量验证音频文件
  validateAudioFiles(files: File[]): {
    valid: File[];
    invalid: { file: File; error: string }[];
  } {
    const valid: File[] = [];
    const invalid: { file: File; error: string }[] = [];

    files.forEach(file => {
      const validation = this.validateAudioFile(file);
      if (validation.isValid) {
        valid.push(file);
      } else {
        invalid.push({
          file,
          error: validation.error || '未知错误'
        });
      }
    });

    return { valid, invalid };
  }
};

// 工具函数
export const audioUtils = {
  // 格式化文件大小
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // 获取音频时长（需要在浏览器中运行）
  getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        reject(new Error('无法获取音频时长'));
      });
      audio.src = URL.createObjectURL(file);
    });
  },

  // 生成音频缩略图URL（对于音频文件，通常是默认图标）
  getAudioThumbnail(audioType: string): string {
    const thumbnails = {
      'vocabulary': '/images/audio-vocabulary.png',
      'dialogue': '/images/audio-dialogue.png',
      'pronunciation': '/images/audio-pronunciation.png'
    };
    return thumbnails[audioType as keyof typeof thumbnails] || '/images/audio-default.png';
  }
}; 