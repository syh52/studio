import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData 
} from 'firebase/firestore';
import { db } from './firebase';
import { VocabularyPack, Dialogue } from './data';

// 集合名称
const CUSTOM_VOCABULARY_COLLECTION = 'customVocabularyPacks';
const CUSTOM_DIALOGUES_COLLECTION = 'customDialogues';

// 用户相关的子集合路径
const getUserVocabularyPath = (userId: string) => `users/${userId}/${CUSTOM_VOCABULARY_COLLECTION}`;
const getUserDialoguePath = (userId: string) => `users/${userId}/${CUSTOM_DIALOGUES_COLLECTION}`;

/**
 * 保存自定义词汇包到 Firestore
 */
export async function saveCustomVocabularyPack(userId: string, pack: VocabularyPack): Promise<void> {
  try {
    const packWithTimestamp = {
      ...pack,
      uploadedAt: Timestamp.now(),
      userId
    };
    
    const docRef = doc(db, getUserVocabularyPath(userId), pack.id);
    await setDoc(docRef, packWithTimestamp);
    console.log('✅ 词汇包已保存到 Firestore');
  } catch (error) {
    console.error('❌ 保存词汇包失败:', error);
    throw error;
  }
}

/**
 * 保存自定义对话到 Firestore
 */
export async function saveCustomDialogue(userId: string, dialogue: Dialogue): Promise<void> {
  try {
    const dialogueWithTimestamp = {
      ...dialogue,
      uploadedAt: Timestamp.now(),
      userId
    };
    
    const docRef = doc(db, getUserDialoguePath(userId), dialogue.id);
    await setDoc(docRef, dialogueWithTimestamp);
    console.log('✅ 对话已保存到 Firestore');
  } catch (error) {
    console.error('❌ 保存对话失败:', error);
    throw error;
  }
}

/**
 * 批量保存多个对话
 */
export async function saveMultipleDialogues(userId: string, dialogues: Dialogue[]): Promise<void> {
  try {
    const promises = dialogues.map(dialogue => saveCustomDialogue(userId, dialogue));
    await Promise.all(promises);
    console.log(`✅ ${dialogues.length} 个对话已保存到 Firestore`);
  } catch (error) {
    console.error('❌ 批量保存对话失败:', error);
    throw error;
  }
}

/**
 * 获取用户的所有自定义词汇包
 */
export async function getCustomVocabularyPacks(userId: string): Promise<VocabularyPack[]> {
  try {
    const collectionRef = collection(db, getUserVocabularyPath(userId));
    const q = query(collectionRef, orderBy('uploadedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const packs: VocabularyPack[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // 转换 Timestamp 为 ISO 字符串
      if (data.uploadedAt?.toDate) {
        data.uploadedAt = data.uploadedAt.toDate().toISOString();
      }
      packs.push(data as VocabularyPack);
    });
    
    console.log(`📚 从 Firestore 加载了 ${packs.length} 个自定义词汇包`);
    return packs;
  } catch (error) {
    console.error('❌ 获取自定义词汇包失败:', error);
    return [];
  }
}

/**
 * 获取用户的所有自定义对话
 */
export async function getCustomDialogues(userId: string): Promise<Dialogue[]> {
  try {
    const collectionRef = collection(db, getUserDialoguePath(userId));
    const q = query(collectionRef, orderBy('uploadedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const dialogues: Dialogue[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // 转换 Timestamp 为 ISO 字符串
      if (data.uploadedAt?.toDate) {
        data.uploadedAt = data.uploadedAt.toDate().toISOString();
      }
      dialogues.push(data as Dialogue);
    });
    
    console.log(`💬 从 Firestore 加载了 ${dialogues.length} 个自定义对话`);
    return dialogues;
  } catch (error) {
    console.error('❌ 获取自定义对话失败:', error);
    return [];
  }
}

/**
 * 删除自定义词汇包
 */
export async function deleteCustomVocabularyPack(userId: string, packId: string): Promise<void> {
  try {
    const docRef = doc(db, getUserVocabularyPath(userId), packId);
    await deleteDoc(docRef);
    console.log('✅ 词汇包已从 Firestore 删除');
  } catch (error) {
    console.error('❌ 删除词汇包失败:', error);
    throw error;
  }
}

/**
 * 删除自定义对话
 */
export async function deleteCustomDialogue(userId: string, dialogueId: string): Promise<void> {
  try {
    const docRef = doc(db, getUserDialoguePath(userId), dialogueId);
    await deleteDoc(docRef);
    console.log('✅ 对话已从 Firestore 删除');
  } catch (error) {
    console.error('❌ 删除对话失败:', error);
    throw error;
  }
}

/**
 * 更新自定义词汇包
 */
export async function updateCustomVocabularyPack(userId: string, packId: string, updates: Partial<VocabularyPack>): Promise<void> {
  try {
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    const docRef = doc(db, getUserVocabularyPath(userId), packId);
    await setDoc(docRef, updateData, { merge: true });
    console.log('✅ 词汇包已更新');
  } catch (error) {
    console.error('❌ 更新词汇包失败:', error);
    throw error;
  }
}

/**
 * 更新自定义对话
 */
export async function updateCustomDialogue(userId: string, dialogueId: string, updates: Partial<Dialogue>): Promise<void> {
  try {
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    const docRef = doc(db, getUserDialoguePath(userId), dialogueId);
    await setDoc(docRef, updateData, { merge: true });
    console.log('✅ 对话已更新');
  } catch (error) {
    console.error('❌ 更新对话失败:', error);
    throw error;
  }
}

/**
 * 检查 Firestore 连接状态
 */
export async function checkFirestoreConnection(): Promise<boolean> {
  try {
    // 尝试读取一个测试集合 - 更简单的测试
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log(`✅ Firestore 连接测试成功，读取到 ${snapshot.size} 个文档`);
    return true;
  } catch (error: any) {
    console.error('❌ Firestore 连接测试详细错误:', error);
    
    if (error.code === 'permission-denied') {
      console.warn('⚠️ Firestore 权限被拒绝，请检查安全规则');
    } else if (error.code === 'unavailable') {
      console.warn('⚠️ Firestore 不可用，请检查网络连接');
    } else if (error.code === 'failed-precondition') {
      console.warn('⚠️ Firestore 配置错误，可能需要启用 Firestore');
    } else if (error.code === 'unauthenticated') {
      console.warn('⚠️ Firebase 认证失败，请检查 API 密钥');
    } else {
      console.warn('⚠️ Firestore 连接测试失败:', error.message);
      console.warn('错误代码:', error.code);
      console.warn('完整错误:', error);
    }
    return false;
  }
}

/**
 * 测试写入权限 - 仅用于调试
 */
export async function testWritePermission(userId: string): Promise<boolean> {
  try {
    // 尝试写入一个测试文档
    const testData = {
      message: 'Test write permission',
      timestamp: Timestamp.now(),
      userId: userId
    };
    
    const docRef = doc(db, `users/${userId}/test`, 'test-doc');
    await setDoc(docRef, testData);
    console.log('✅ 写入权限测试成功');
    
    // 立即删除测试文档
    await deleteDoc(docRef);
    console.log('✅ 测试文档已清理');
    
    return true;
  } catch (error: any) {
    console.error('❌ 写入权限测试失败:', error);
    console.error('错误代码:', error.code);
    console.error('错误消息:', error.message);
    return false;
  }
} 