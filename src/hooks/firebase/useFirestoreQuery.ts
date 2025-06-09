import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// 获取单个文档
export const useFirestoreDoc = <T = DocumentData>(
  collectionName: string,
  documentId: string | undefined,
  options?: UseQueryOptions<T | null>
) => {
  return useQuery<T | null>({
    queryKey: ['firestore', collectionName, documentId],
    queryFn: async () => {
      if (!documentId) return null;
      
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    },
    enabled: !!documentId,
    ...options
  });
};

// 获取集合
export const useFirestoreCollection = <T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options?: UseQueryOptions<T[]>
) => {
  return useQuery<T[]>({
    queryKey: ['firestore', collectionName, ...constraints.map(c => c.type)],
    queryFn: async () => {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    },
    ...options
  });
};

// 获取用户数据
export const useUserData = (userId: string | undefined) => {
  return useFirestoreDoc('users', userId, {
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟 (v5 中 cacheTime 改为 gcTime)
  } as any);
};

// 获取词汇包列表
export const useVocabularyPacks = () => {
  return useFirestoreCollection('vocabularyPacks', [], {
    staleTime: 30 * 60 * 1000, // 30分钟
    gcTime: 60 * 60 * 1000, // 1小时
  } as any);
};

// 获取对话列表
export const useDialogues = () => {
  return useFirestoreCollection('dialogues', [], {
    staleTime: 30 * 60 * 1000, // 30分钟
    gcTime: 60 * 60 * 1000, // 1小时
  } as any);
}; 