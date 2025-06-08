import { enableNetwork, disableNetwork, writeBatch, doc } from 'firebase/firestore';
import { db } from './config';

// 网络状态管理
let isOnline = true;

// 离线支持配置
export const enableOfflineSupport = () => {
  // Firestore 默认启用离线缓存
  // 这里主要处理网络状态监听
  if (typeof window !== 'undefined') {
    // 监听网络状态变化
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 初始检查网络状态
    isOnline = navigator.onLine;
  }
};

// 处理在线状态
const handleOnline = async () => {
  isOnline = true;
  console.log('Network connected');
  
  try {
    await enableNetwork(db);
    // 可以在这里触发数据同步
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('firebase-online'));
    }
  } catch (error) {
    console.error('Error enabling network:', error);
  }
};

// 处理离线状态
const handleOffline = async () => {
  isOnline = false;
  console.log('Network disconnected');
  
  try {
    await disableNetwork(db);
    // 可以在这里显示离线提示
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('firebase-offline'));
    }
  } catch (error) {
    console.error('Error disabling network:', error);
  }
};

// 获取网络状态
export const getNetworkStatus = () => isOnline;

// 批量更新词汇学习进度
export const batchUpdateVocabularyProgress = async (
  userId: string, 
  updates: Map<string, any>
) => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach((progress, vocabularyId) => {
      const progressRef = doc(db, `users/${userId}/vocabularyProgress`, vocabularyId);
      batch.set(progressRef, {
        ...progress,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    });
    
    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error('Batch update error:', error);
    return { success: false, error: error.message };
  }
};

// 批量更新对话学习进度
export const batchUpdateDialogueProgress = async (
  userId: string, 
  updates: Map<string, any>
) => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach((progress, dialogueId) => {
      const progressRef = doc(db, `users/${userId}/dialogueProgress`, dialogueId);
      batch.set(progressRef, {
        ...progress,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    });
    
    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error('Batch update error:', error);
    return { success: false, error: error.message };
  }
};

// 同步队列管理（用于离线时缓存操作）
class SyncQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  add(operation: () => Promise<any>) {
    this.queue.push(operation);
    
    // 如果在线，立即处理
    if (isOnline && !this.isProcessing) {
      this.process();
    }
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0 && isOnline) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error('Sync operation failed:', error);
          // 可以选择重新加入队列或记录错误
        }
      }
    }
    
    this.isProcessing = false;
  }
}

// 创建全局同步队列
export const syncQueue = new SyncQueue();

// 监听网络恢复，处理同步队列
if (typeof window !== 'undefined') {
  window.addEventListener('firebase-online', () => {
    syncQueue.process();
  });
} 