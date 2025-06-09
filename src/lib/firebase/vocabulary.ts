import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// 词汇条目接口
export interface VocabularyEntry {
  id?: string;
  term: string;
  definition: string;
  category?: string;
  example?: string;
  pronunciation?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// 添加新词汇（您提到的示例）
export async function addLexiconEntry(
  term: string, 
  definition: string,
  additionalData?: Partial<VocabularyEntry>
) {
  try {
    const docRef = await addDoc(collection(db, 'lexicon'), {
      term,
      definition,
      ...additionalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ 词汇添加成功，ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ 添加词汇失败:', error);
    return { success: false, error };
  }
}

// 获取所有词汇
export async function getAllVocabulary() {
  try {
    const querySnapshot = await getDocs(collection(db, 'lexicon'));
    const vocabulary: VocabularyEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      vocabulary.push({
        id: doc.id,
        ...doc.data()
      } as VocabularyEntry);
    });
    
    return vocabulary;
  } catch (error) {
    console.error('❌ 获取词汇失败:', error);
    return [];
  }
}

// 按类别查询词汇
export async function getVocabularyByCategory(category: string) {
  try {
    const q = query(
      collection(db, 'lexicon'),
      where('category', '==', category),
      orderBy('term')
    );
    
    const querySnapshot = await getDocs(q);
    const vocabulary: VocabularyEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      vocabulary.push({
        id: doc.id,
        ...doc.data()
      } as VocabularyEntry);
    });
    
    return vocabulary;
  } catch (error) {
    console.error('❌ 查询词汇失败:', error);
    return [];
  }
}

// 实时监听词汇变化（您提到的强大功能！）
export function subscribeToVocabulary(
  callback: (vocabulary: VocabularyEntry[]) => void,
  category?: string
) {
  let q = collection(db, 'lexicon');
  
  if (category) {
    q = query(q, where('category', '==', category)) as any;
  }
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const vocabulary: VocabularyEntry[] = [];
    
    snapshot.forEach((doc) => {
      vocabulary.push({
        id: doc.id,
        ...doc.data()
      } as VocabularyEntry);
    });
    
    callback(vocabulary);
  }, (error) => {
    console.error('❌ 实时监听错误:', error);
  });
  
  return unsubscribe;
}

// 更新词汇
export async function updateVocabulary(
  id: string, 
  updates: Partial<VocabularyEntry>
) {
  try {
    const docRef = doc(db, 'lexicon', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ 词汇更新成功');
    return { success: true };
  } catch (error) {
    console.error('❌ 更新词汇失败:', error);
    return { success: false, error };
  }
}

// 删除词汇
export async function deleteVocabulary(id: string) {
  try {
    await deleteDoc(doc(db, 'lexicon', id));
    console.log('✅ 词汇删除成功');
    return { success: true };
  } catch (error) {
    console.error('❌ 删除词汇失败:', error);
    return { success: false, error };
  }
}

// 批量导入词汇（用于初始化数据）
export async function batchImportVocabulary(entries: Omit<VocabularyEntry, 'id'>[]) {
  const results = [];
  
  for (const entry of entries) {
    const result = await addLexiconEntry(
      entry.term,
      entry.definition,
      entry
    );
    results.push(result);
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ 批量导入完成：${successCount}/${entries.length} 成功`);
  
  return results;
}

// 使用示例
export const exampleUsage = async () => {
  // 1. 添加航空术语（您的示例）
  await addLexiconEntry(
    "Aerodynamics",
    "The study of the properties of moving air and the interaction between the air and solid bodies moving through it.",
    {
      category: "Physics",
      difficulty: "intermediate",
      example: "The aerodynamics of the new aircraft design reduce fuel consumption by 15%."
    }
  );
  
  // 2. 实时监听所有词汇变化
  const unsubscribe = subscribeToVocabulary((vocabulary) => {
    console.log('词汇库更新:', vocabulary);
  });
  
  // 3. 查询特定类别
  const physicsTerms = await getVocabularyByCategory('Physics');
  console.log('物理类词汇:', physicsTerms);
  
  // 记得在组件卸载时取消订阅
  // unsubscribe();
}; 