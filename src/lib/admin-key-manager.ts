/**
 * 管理员密钥管理服务
 * 用于生成、管理和统计管理员密钥
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  getFirestore 
} from 'firebase/firestore';
import CryptoJS from 'crypto-js';

// 管理员密钥数据结构
export interface AdminKeyData {
  id?: string;
  keyHash: string;
  createdAt: any; // Firestore timestamp
  createdBy: string;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: any; // Firestore timestamp
  lastUsedBy?: string;
  description: string;
  level: 'regular' | 'admin';
  validUntil?: any; // Firestore timestamp - 可选的过期时间
}

// 密钥使用统计
export interface KeyUsageStats {
  totalKeys: number;
  activeKeys: number;
  totalUsage: number;
  recentActivity: AdminKeyData[];
}

/**
 * 生成新的管理员密钥
 */
export function generateAdminKey(description?: string): string {
  const prefix = 'LEXICON';
  const randomPart = generateRandomString(16);
  return `${prefix}-${randomPart.substring(0, 4)}-${randomPart.substring(4, 8)}-${randomPart.substring(8, 12)}-${randomPart.substring(12, 16)}`;
}

/**
 * 生成随机字符串
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 创建新的管理员密钥
 */
export async function createAdminKey(
  key: string, 
  description: string, 
  createdBy: string,
  level: 'regular' | 'admin' = 'regular',
  validUntil?: Date
): Promise<string> {
  if (typeof window === 'undefined') throw new Error('此函数只能在客户端调用');
  
  const db = getFirestore();
  const keysRef = collection(db, 'adminKeys');
  
  const keyHash = CryptoJS.SHA256(key.trim()).toString();
  
  const keyData: Omit<AdminKeyData, 'id'> = {
    keyHash,
    createdAt: serverTimestamp(),
    createdBy,
    isActive: true,
    usageCount: 0,
    description: description || '管理员密钥',
    level,
    ...(validUntil && { validUntil: validUntil })
  };
  
  const docRef = await addDoc(keysRef, keyData);
  return docRef.id;
}

/**
 * 获取所有管理员密钥
 */
export async function getAllAdminKeys(): Promise<AdminKeyData[]> {
  if (typeof window === 'undefined') return [];
  
  try {
    const db = getFirestore();
    const keysRef = collection(db, 'adminKeys');
    const q = query(keysRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AdminKeyData));
  } catch (error) {
    console.error('获取管理员密钥失败:', error);
    return [];
  }
}

/**
 * 更新密钥状态
 */
export async function updateKeyStatus(keyId: string, isActive: boolean): Promise<void> {
  if (typeof window === 'undefined') throw new Error('此函数只能在客户端调用');
  
  const db = getFirestore();
  const keyRef = doc(db, 'adminKeys', keyId);
  
  await updateDoc(keyRef, {
    isActive,
    updatedAt: serverTimestamp()
  });
}

/**
 * 更新密钥描述
 */
export async function updateKeyDescription(keyId: string, description: string): Promise<void> {
  if (typeof window === 'undefined') throw new Error('此函数只能在客户端调用');
  
  const db = getFirestore();
  const keyRef = doc(db, 'adminKeys', keyId);
  
  await updateDoc(keyRef, {
    description,
    updatedAt: serverTimestamp()
  });
}

/**
 * 获取密钥使用统计
 */
export async function getKeyUsageStats(): Promise<KeyUsageStats> {
  if (typeof window === 'undefined') {
    return {
      totalKeys: 0,
      activeKeys: 0,
      totalUsage: 0,
      recentActivity: []
    };
  }
  
  try {
    const db = getFirestore();
    const keysRef = collection(db, 'adminKeys');
    
    // 获取所有密钥
    const allKeysQuery = query(keysRef);
    const allKeysSnapshot = await getDocs(allKeysQuery);
    const allKeys = allKeysSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AdminKeyData));
    
    // 获取活跃密钥
    const activeKeys = allKeys.filter(key => key.isActive);
    
    // 计算总使用次数
    const totalUsage = allKeys.reduce((sum, key) => sum + (key.usageCount || 0), 0);
    
    // 获取最近活动（有使用记录的密钥，按最后使用时间排序）
    const recentActivity = allKeys
      .filter(key => key.lastUsedAt)
      .sort((a, b) => {
        const timeA = a.lastUsedAt?.toDate?.() || new Date(0);
        const timeB = b.lastUsedAt?.toDate?.() || new Date(0);
        return timeB.getTime() - timeA.getTime();
      })
      .slice(0, 10);
    
    return {
      totalKeys: allKeys.length,
      activeKeys: activeKeys.length,
      totalUsage,
      recentActivity
    };
  } catch (error) {
    console.error('获取密钥统计失败:', error);
    return {
      totalKeys: 0,
      activeKeys: 0,
      totalUsage: 0,
      recentActivity: []
    };
  }
}

/**
 * 验证密钥格式
 */
export function validateKeyFormat(key: string): boolean {
  const keyPattern = /^LEXICON-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return keyPattern.test(key.trim());
}

/**
 * 批量创建管理员密钥
 */
export async function createBulkAdminKeys(
  count: number,
  descriptionPrefix: string,
  createdBy: string,
  level: 'regular' | 'admin' = 'regular'
): Promise<{ key: string; id: string }[]> {
  if (typeof window === 'undefined') throw new Error('此函数只能在客户端调用');
  
  const results: { key: string; id: string }[] = [];
  
  for (let i = 0; i < count; i++) {
    const key = generateAdminKey();
    const description = `${descriptionPrefix} #${i + 1}`;
    const id = await createAdminKey(key, description, createdBy, level);
    results.push({ key, id });
  }
  
  return results;
}

/**
 * 导出密钥数据为CSV格式
 */
export function exportKeysToCSV(keys: AdminKeyData[]): string {
  const headers = ['ID', '描述', '级别', '状态', '使用次数', '绑定用户', '创建时间', '最后使用时间'];
  
  const rows = keys.map(key => [
    key.id || '',
    key.description || '',
    key.level === 'admin' ? '管理员' : '普通管理员',
    key.isActive ? '活跃' : '禁用',
    key.usageCount?.toString() || '0',
    key.lastUsedBy || '未使用',
    key.createdAt?.toDate?.()?.toLocaleString() || '',
    key.lastUsedAt?.toDate?.()?.toLocaleString() || ''
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
}

/**
 * 清理过期密钥
 */
export async function cleanupExpiredKeys(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  
  try {
    const db = getFirestore();
    const keysRef = collection(db, 'adminKeys');
    const now = new Date();
    
    const expiredKeysQuery = query(
      keysRef,
      where('validUntil', '<=', now),
      where('isActive', '==', true)
    );
    
    const expiredSnapshot = await getDocs(expiredKeysQuery);
    let cleanedCount = 0;
    
    for (const docSnapshot of expiredSnapshot.docs) {
      await updateDoc(docSnapshot.ref, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
      cleanedCount++;
    }
    
    return cleanedCount;
  } catch (error) {
    console.error('清理过期密钥失败:', error);
    return 0;
  }
} 