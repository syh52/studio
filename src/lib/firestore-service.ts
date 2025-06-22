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
const PUBLIC_VOCABULARY_COLLECTION = 'publicVocabularyPacks';
const PUBLIC_DIALOGUES_COLLECTION = 'publicDialogues';

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

// ==================== 公共内容管理函数 ====================

/**
 * 保存公共词汇包到 Firestore
 */
export async function savePublicVocabularyPack(pack: VocabularyPack, originalAuthor: string): Promise<void> {
  try {
    const packWithMetadata = {
      ...pack,
      originalAuthor,
      createdAt: Timestamp.now(),
      lastModifiedAt: Timestamp.now(),
      lastModifiedBy: originalAuthor,
      isPublic: true
    };
    
    const docRef = doc(db, PUBLIC_VOCABULARY_COLLECTION, pack.id);
    await setDoc(docRef, packWithMetadata);
    console.log('✅ 公共词汇包已保存到 Firestore');
  } catch (error) {
    console.error('❌ 保存公共词汇包失败:', error);
    throw error;
  }
}

/**
 * 保存公共对话到 Firestore
 */
export async function savePublicDialogue(dialogue: Dialogue, originalAuthor: string): Promise<void> {
  try {
    const dialogueWithMetadata = {
      ...dialogue,
      originalAuthor,
      createdAt: Timestamp.now(),
      lastModifiedAt: Timestamp.now(),
      lastModifiedBy: originalAuthor,
      isPublic: true
    };
    
    const docRef = doc(db, PUBLIC_DIALOGUES_COLLECTION, dialogue.id);
    await setDoc(docRef, dialogueWithMetadata);
    console.log('✅ 公共对话已保存到 Firestore');
  } catch (error) {
    console.error('❌ 保存公共对话失败:', error);
    throw error;
  }
}

/**
 * 获取所有公共词汇包
 */
export async function getPublicVocabularyPacks(): Promise<VocabularyPack[]> {
  try {
    const collectionRef = collection(db, PUBLIC_VOCABULARY_COLLECTION);
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const packs: VocabularyPack[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // 转换 Timestamp 为 ISO 字符串
      if (data.createdAt?.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.lastModifiedAt?.toDate) {
        data.lastModifiedAt = data.lastModifiedAt.toDate().toISOString();
      }
      packs.push(data as VocabularyPack);
    });
    
    console.log(`📚 从 Firestore 加载了 ${packs.length} 个公共词汇包`);
    return packs;
  } catch (error) {
    console.error('❌ 获取公共词汇包失败:', error);
    return [];
  }
}

/**
 * 获取所有公共对话
 */
export async function getPublicDialogues(): Promise<Dialogue[]> {
  try {
    const collectionRef = collection(db, PUBLIC_DIALOGUES_COLLECTION);
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const dialogues: Dialogue[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // 转换 Timestamp 为 ISO 字符串
      if (data.createdAt?.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.lastModifiedAt?.toDate) {
        data.lastModifiedAt = data.lastModifiedAt.toDate().toISOString();
      }
      dialogues.push(data as Dialogue);
    });
    
    console.log(`💬 从 Firestore 加载了 ${dialogues.length} 个公共对话`);
    return dialogues;
  } catch (error) {
    console.error('❌ 获取公共对话失败:', error);
    return [];
  }
}

/**
 * 更新公共词汇包
 */
export async function updatePublicVocabularyPack(packId: string, updates: Partial<VocabularyPack>, userId: string): Promise<void> {
  try {
    const updateData = {
      ...updates,
      lastModifiedAt: Timestamp.now(),
      lastModifiedBy: userId
    };
    
    const docRef = doc(db, PUBLIC_VOCABULARY_COLLECTION, packId);
    await setDoc(docRef, updateData, { merge: true });
    console.log('✅ 公共词汇包已更新');
  } catch (error) {
    console.error('❌ 更新公共词汇包失败:', error);
    throw error;
  }
}

/**
 * 更新公共对话
 */
export async function updatePublicDialogue(dialogueId: string, updates: Partial<Dialogue>, userId: string): Promise<void> {
  try {
    const updateData = {
      ...updates,
      lastModifiedAt: Timestamp.now(),
      lastModifiedBy: userId
    };
    
    const docRef = doc(db, PUBLIC_DIALOGUES_COLLECTION, dialogueId);
    await setDoc(docRef, updateData, { merge: true });
    console.log('✅ 公共对话已更新');
  } catch (error) {
    console.error('❌ 更新公共对话失败:', error);
    throw error;
  }
}

/**
 * 删除公共词汇包
 */
export async function deletePublicVocabularyPack(packId: string): Promise<void> {
  try {
    const docRef = doc(db, PUBLIC_VOCABULARY_COLLECTION, packId);
    await deleteDoc(docRef);
    console.log('✅ 公共词汇包已从 Firestore 删除');
  } catch (error) {
    console.error('❌ 删除公共词汇包失败:', error);
    throw error;
  }
}

/**
 * 删除公共对话
 */
export async function deletePublicDialogue(dialogueId: string): Promise<void> {
  try {
    const docRef = doc(db, PUBLIC_DIALOGUES_COLLECTION, dialogueId);
    await deleteDoc(docRef);
    console.log('✅ 公共对话已从 Firestore 删除');
  } catch (error) {
    console.error('❌ 删除公共对话失败:', error);
    throw error;
  }
}

// ==================== 数据迁移函数 ====================

/**
 * 获取所有用户ID
 */
async function getAllUserIds(): Promise<string[]> {
  try {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    const userIds: string[] = [];
    snapshot.forEach((doc) => {
      userIds.push(doc.id);
    });
    return userIds;
  } catch (error) {
    console.error('❌ 获取用户ID失败:', error);
    return [];
  }
}

/**
 * 迁移单个用户的词汇包到公共空间
 */
async function migrateUserVocabularyPacks(userId: string): Promise<{ success: number; errors: number }> {
  let success = 0;
  let errors = 0;
  
  try {
    // 获取用户的私有词汇包
    const userVocabularyPacks = await getCustomVocabularyPacks(userId);
    
    for (const pack of userVocabularyPacks) {
      try {
        // 生成新的公共ID，避免冲突
        const publicId = `migrated-${userId}-${pack.id}`;
        const publicPack = {
          ...pack,
          id: publicId
        };
        
        // 保存到公共空间
        await savePublicVocabularyPack(publicPack, userId);
        success++;
        console.log(`✅ 用户 ${userId} 的词汇包 ${pack.name} 迁移成功`);
      } catch (error) {
        console.error(`❌ 用户 ${userId} 的词汇包 ${pack.name} 迁移失败:`, error);
        errors++;
      }
    }
  } catch (error) {
    console.error(`❌ 获取用户 ${userId} 的词汇包失败:`, error);
    errors++;
  }
  
  return { success, errors };
}

/**
 * 迁移单个用户的对话到公共空间
 */
async function migrateUserDialogues(userId: string): Promise<{ success: number; errors: number }> {
  let success = 0;
  let errors = 0;
  
  try {
    // 获取用户的私有对话
    const userDialogues = await getCustomDialogues(userId);
    
    for (const dialogue of userDialogues) {
      try {
        // 生成新的公共ID，避免冲突
        const publicId = `migrated-${userId}-${dialogue.id}`;
        const publicDialogue = {
          ...dialogue,
          id: publicId
        };
        
        // 保存到公共空间
        await savePublicDialogue(publicDialogue, userId);
        success++;
        console.log(`✅ 用户 ${userId} 的对话 ${dialogue.title} 迁移成功`);
      } catch (error) {
        console.error(`❌ 用户 ${userId} 的对话 ${dialogue.title} 迁移失败:`, error);
        errors++;
      }
    }
  } catch (error) {
    console.error(`❌ 获取用户 ${userId} 的对话失败:`, error);
    errors++;
  }
  
  return { success, errors };
}

/**
 * 迁移所有用户的私有内容到公共空间
 * @returns 迁移结果统计
 */
export async function migrateAllPrivateContentToPublic(): Promise<{
  totalUsers: number;
  vocabularyPacksMigrated: number;
  dialoguesMigrated: number;
  errors: number;
}> {
  console.log('🚀 开始迁移所有用户的私有内容到公共空间...');
  
  let totalUsers = 0;
  let vocabularyPacksMigrated = 0;
  let dialoguesMigrated = 0;
  let totalErrors = 0;
  
  try {
    // 获取所有用户ID
    const userIds = await getAllUserIds();
    totalUsers = userIds.length;
    
    console.log(`📋 找到 ${totalUsers} 个用户，开始迁移...`);
    
    // 逐个迁移用户数据
    for (const userId of userIds) {
      console.log(`📦 正在迁移用户 ${userId} 的数据...`);
      
      // 迁移词汇包
      const vocabResult = await migrateUserVocabularyPacks(userId);
      vocabularyPacksMigrated += vocabResult.success;
      totalErrors += vocabResult.errors;
      
      // 迁移对话
      const dialogueResult = await migrateUserDialogues(userId);
      dialoguesMigrated += dialogueResult.success;
      totalErrors += dialogueResult.errors;
      
      console.log(`✅ 用户 ${userId} 迁移完成: 词汇包 ${vocabResult.success}个, 对话 ${dialogueResult.success}个`);
    }
    
    console.log('🎉 数据迁移完成！');
    console.log(`📊 迁移统计: 
      - 用户总数: ${totalUsers}
      - 词汇包迁移: ${vocabularyPacksMigrated}个
      - 对话迁移: ${dialoguesMigrated}个
      - 错误数: ${totalErrors}个`);
    
  } catch (error) {
    console.error('❌ 数据迁移过程中发生错误:', error);
    totalErrors++;
  }
  
  return {
    totalUsers,
    vocabularyPacksMigrated,
    dialoguesMigrated,
    errors: totalErrors
  };
}

/**
 * 备份现有数据（导出为JSON）
 * @returns 备份数据
 */
export async function backupExistingData(): Promise<{
  vocabularyPacks: any[];
  dialogues: any[];
  timestamp: string;
}> {
  console.log('💾 开始备份现有数据...');
  
  const allVocabularyPacks: any[] = [];
  const allDialogues: any[] = [];
  
  try {
    // 获取所有用户ID
    const userIds = await getAllUserIds();
    
    // 备份每个用户的数据
    for (const userId of userIds) {
      try {
        const userVocabulary = await getCustomVocabularyPacks(userId);
        const userDialogues = await getCustomDialogues(userId);
        
        // 添加用户信息到备份数据
        userVocabulary.forEach(pack => {
          allVocabularyPacks.push({
            ...pack,
            _backupUserId: userId
          });
        });
        
        userDialogues.forEach(dialogue => {
          allDialogues.push({
            ...dialogue,
            _backupUserId: userId
          });
        });
        
      } catch (error) {
        console.error(`❌ 备份用户 ${userId} 数据失败:`, error);
      }
    }
    
    const backupData = {
      vocabularyPacks: allVocabularyPacks,
      dialogues: allDialogues,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ 备份完成: ${allVocabularyPacks.length}个词汇包, ${allDialogues.length}个对话`);
    
    return backupData;
    
  } catch (error) {
    console.error('❌ 数据备份失败:', error);
    throw error;
  }
} 