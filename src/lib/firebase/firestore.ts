import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  writeBatch,
  query,
  orderBy,
  where 
} from 'firebase/firestore';
import { db } from './config';
import { Dialogue, VocabularyItem } from '@/lib/data';

// 集合名称
const COLLECTIONS = {
  DIALOGUES: 'dialogues',
  VOCABULARY: 'vocabulary',
  VOCABULARY_PACKS: 'vocabularyPacks'
} as const;

// 对话相关API
export const dialoguesApi = {
  // 获取所有对话
  async getAll(): Promise<Dialogue[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.DIALOGUES), orderBy('title'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Dialogue));
    } catch (error) {
      console.error('获取对话列表失败:', error);
      throw new Error('获取对话列表失败');
    }
  },

  // 根据ID获取单个对话
  async getById(id: string): Promise<Dialogue | null> {
    try {
      const dialogues = await this.getAll();
      return dialogues.find(d => d.id === id) || null;
    } catch (error) {
      console.error('获取对话详情失败:', error);
      throw new Error('获取对话详情失败');
    }
  },

  // 批量添加对话
  async addMany(dialogues: Dialogue[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const batch = writeBatch(db);
    const errors: string[] = [];
    let successCount = 0;

    try {
      for (const dialogue of dialogues) {
        try {
          const docRef = doc(db, COLLECTIONS.DIALOGUES, dialogue.id);
          batch.set(docRef, {
            title: dialogue.title,
            description: dialogue.description,
            icon: dialogue.icon,
            lines: dialogue.lines,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          successCount++;
        } catch (error) {
          errors.push(`对话 "${dialogue.title}" 添加失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }

      await batch.commit();
      
      return {
        success: successCount,
        failed: errors.length,
        errors
      };
    } catch (error) {
      console.error('批量添加对话失败:', error);
      throw new Error('批量添加对话失败');
    }
  },

  // 添加单个对话
  async add(dialogue: Dialogue): Promise<string> {
    try {
      const docRef = doc(db, COLLECTIONS.DIALOGUES, dialogue.id);
      await setDoc(docRef, {
        title: dialogue.title,
        description: dialogue.description,
        icon: dialogue.icon,
        lines: dialogue.lines,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return dialogue.id;
    } catch (error) {
      console.error('添加对话失败:', error);
      throw new Error('添加对话失败');
    }
  },

  // 更新对话
  async update(id: string, dialogue: Partial<Dialogue>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.DIALOGUES, id);
      await updateDoc(docRef, {
        ...dialogue,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('更新对话失败:', error);
      throw new Error('更新对话失败');
    }
  },

  // 删除对话
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.DIALOGUES, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('删除对话失败:', error);
      throw new Error('删除对话失败');
    }
  }
};

// 词汇相关API
export const vocabularyApi = {
  // 获取词汇包中的所有词汇
  async getByPack(packId: string): Promise<VocabularyItem[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.VOCABULARY),
          where('packId', '==', packId),
          orderBy('english')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VocabularyItem));
    } catch (error) {
      console.error(`获取词汇包 ${packId} 失败:`, error);
      throw new Error(`获取词汇包失败`);
    }
  },

  // 获取所有词汇
  async getAll(): Promise<VocabularyItem[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.VOCABULARY), orderBy('english'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VocabularyItem));
    } catch (error) {
      console.error('获取词汇列表失败:', error);
      throw new Error('获取词汇列表失败');
    }
  },

  // 批量添加词汇到指定包
  async addManyToPack(packId: string, vocabularies: VocabularyItem[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const batch = writeBatch(db);
    const errors: string[] = [];
    let successCount = 0;

    try {
      for (const vocabulary of vocabularies) {
        try {
          const docRef = doc(db, COLLECTIONS.VOCABULARY, vocabulary.id);
          batch.set(docRef, {
            ...vocabulary,
            packId: packId, // 添加包ID
            createdAt: new Date(),
            updatedAt: new Date()
          });
          successCount++;
        } catch (error) {
          errors.push(`词汇 "${vocabulary.english}" 添加失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }

      await batch.commit();
      
      return {
        success: successCount,
        failed: errors.length,
        errors
      };
    } catch (error) {
      console.error('批量添加词汇失败:', error);
      throw new Error('批量添加词汇失败');
    }
  },

  // 添加单个词汇
  async add(vocabulary: VocabularyItem & { packId: string }): Promise<string> {
    try {
      const docRef = doc(db, COLLECTIONS.VOCABULARY, vocabulary.id);
      await setDoc(docRef, {
        ...vocabulary,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return vocabulary.id;
    } catch (error) {
      console.error('添加词汇失败:', error);
      throw new Error('添加词汇失败');
    }
  },

  // 更新词汇
  async update(id: string, vocabulary: Partial<VocabularyItem>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.VOCABULARY, id);
      await updateDoc(docRef, {
        ...vocabulary,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('更新词汇失败:', error);
      throw new Error('更新词汇失败');
    }
  },

  // 删除词汇
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.VOCABULARY, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('删除词汇失败:', error);
      throw new Error('删除词汇失败');
    }
  }
};

// 词汇包相关API
export const vocabularyPacksApi = {
  // 获取所有词汇包
  async getAll() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.VOCABULARY_PACKS), orderBy('title'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('获取词汇包列表失败:', error);
      throw new Error('获取词汇包列表失败');
    }
  },

  // 创建词汇包
  async create(pack: { id: string; title: string; description: string; icon?: string }) {
    try {
      const docRef = doc(db, COLLECTIONS.VOCABULARY_PACKS, pack.id);
      await setDoc(docRef, {
        ...pack,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return pack.id;
    } catch (error) {
      console.error('创建词汇包失败:', error);
      throw new Error('创建词汇包失败');
    }
  }
};

// 初始化数据库（将本地数据迁移到Firestore）
export const initializeDatabase = async () => {
  try {
    // 这个函数可以用来将现有的本地数据迁移到Firestore
    // 只需要运行一次
    console.log('数据库初始化功能，可手动调用进行数据迁移');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw new Error('数据库初始化失败');
  }
}; 