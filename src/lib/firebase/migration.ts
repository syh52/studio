import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

// 迁移本地数据到 Firebase
export const migrateLocalDataToFirebase = async (userId: string, email: string) => {
  try {
    // 收集所有本地数据
    const localData = {
      points: localStorage.getItem(`${email}_points`),
      lastCheckIn: localStorage.getItem(`${email}_lastCheckIn`),
      vocabularyProgress: localStorage.getItem(`${email}_vocabularyProgress`),
      dialogueProgress: localStorage.getItem(`${email}_dialogueProgress`),
      quizHistory: localStorage.getItem(`${email}_quizHistory`),
      // 老版本的数据键名（向后兼容）
      oldPoints: localStorage.getItem(`aviationLexicon_${email}_points`),
      oldCheckIn: localStorage.getItem(`aviationLexicon_${email}_lastCheckIn`)
    };

    // 检查是否有需要迁移的数据
    const hasData = Object.values(localData).some(value => value !== null);
    if (!hasData) {
      console.log('No local data to migrate');
      return { success: true, migrated: false };
    }

    // 获取用户文档引用
    const userRef = doc(db, 'users', userId);
    
    // 检查用户文档是否存在
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error('User document does not exist');
      return { success: false, error: 'User document not found' };
    }

    // 准备更新数据
    const updates: any = {};

    // 迁移积分
    const points = localData.points || localData.oldPoints;
    if (points) {
      updates['progress.indexPoints'] = parseInt(points);
    }

    // 迁移最后签到日期
    const lastCheckIn = localData.lastCheckIn || localData.oldCheckIn;
    if (lastCheckIn) {
      updates['progress.lastCheckIn'] = lastCheckIn;
    }

    // 迁移词汇学习进度
    if (localData.vocabularyProgress) {
      try {
        const vocabularyProgress = JSON.parse(localData.vocabularyProgress);
        updates['learning.vocabularyProgress'] = vocabularyProgress;
      } catch (e) {
        console.warn('Failed to parse vocabulary progress');
      }
    }

    // 迁移对话学习进度
    if (localData.dialogueProgress) {
      try {
        const dialogueProgress = JSON.parse(localData.dialogueProgress);
        updates['learning.dialogueProgress'] = dialogueProgress;
      } catch (e) {
        console.warn('Failed to parse dialogue progress');
      }
    }

    // 迁移测验历史
    if (localData.quizHistory) {
      try {
        const quizHistory = JSON.parse(localData.quizHistory);
        updates['learning.quizHistory'] = quizHistory;
      } catch (e) {
        console.warn('Failed to parse quiz history');
      }
    }

    // 执行更新
    if (Object.keys(updates).length > 0) {
      await updateDoc(userRef, updates);
      console.log('Data migrated successfully:', updates);

      // 清理本地数据
      cleanupLocalData(email);
      
      return { success: true, migrated: true, updates };
    }

    return { success: true, migrated: false };
  } catch (error: any) {
    console.error('Migration error:', error);
    return { success: false, error: error.message };
  }
};

// 清理本地数据
const cleanupLocalData = (email: string) => {
  const keysToRemove = [
    `${email}_points`,
    `${email}_lastCheckIn`,
    `${email}_vocabularyProgress`,
    `${email}_dialogueProgress`,
    `${email}_quizHistory`,
    // 老版本的键名
    `aviationLexicon_${email}_points`,
    `aviationLexicon_${email}_lastCheckIn`,
    `aviationLexiconUser`
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('Local data cleaned up');
};

// 导出本地数据（用于备份）
export const exportLocalData = (email: string) => {
  const data: any = {};
  
  // 收集所有相关的本地存储数据
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes(email) || key.includes('aviationLexicon'))) {
      data[key] = localStorage.getItem(key);
    }
  }

  return data;
}; 