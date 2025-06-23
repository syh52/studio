/**
 * 超级管理员认证服务
 * 处理超级管理员密钥验证和权限管理
 */

import CryptoJS from 'crypto-js';

// 超级管理员密钥哈希 (SHA-256)
// 原始密钥: LEXICON-SUPER-ADMIN-2024-9F8E7D6C5B4A3928
const SUPER_ADMIN_KEY_HASH = 'a09b3af83adb296d66ae42292577ace2118e0eea7ff2d4e916a5c58cb47c650d';

// 管理员权限级别
export enum AdminLevel {
  NONE = 0,
  REGULAR_ADMIN = 1,
  SUPER_ADMIN = 2
}

// 管理员权限接口
export interface AdminPermissions {
  level: AdminLevel;
  canManageKeys: boolean;
  canAccessUpload: boolean;
  canAccessAI: boolean;
  canViewStatistics: boolean;
  validUntil: number; // 时间戳
}

// 本地存储的权限缓存
interface AdminCache {
  permissions: AdminPermissions;
  keyHash: string;
  lastVerified: number;
  userId: string; // 绑定的用户ID
}

/**
 * 验证是否为超级管理员密钥
 */
export function verifySuperAdminKey(inputKey: string): boolean {
  const inputHash = CryptoJS.SHA256(inputKey.trim()).toString();
  return inputHash === SUPER_ADMIN_KEY_HASH;
}

/**
 * 验证管理员密钥（包括超级管理员和普通管理员）
 */
export async function verifyAdminKey(inputKey: string): Promise<AdminPermissions | null> {
  try {
    console.log('verifyAdminKey: 开始验证密钥');
    
    // 首先检查是否为超级管理员密钥
    if (verifySuperAdminKey(inputKey)) {
      console.log('verifyAdminKey: 检测到超级管理员密钥');
      const superAdminPermissions: AdminPermissions = {
        level: AdminLevel.SUPER_ADMIN,
        canManageKeys: true,
        canAccessUpload: true,
        canAccessAI: true,
        canViewStatistics: true,
        validUntil: Date.now() + 24 * 60 * 60 * 1000 // 24小时
      };
      
      // 缓存超级管理员权限
      console.log('verifyAdminKey: 准备缓存超级管理员权限');
      cacheAdminPermissions(inputKey, superAdminPermissions);
      console.log('verifyAdminKey: 超级管理员权限验证完成');
      return superAdminPermissions;
    }

    // 检查普通管理员密钥（从 Firestore 验证）
    console.log('verifyAdminKey: 检查普通管理员密钥');
    const regularAdminPermissions = await verifyRegularAdminKey(inputKey);
    if (regularAdminPermissions) {
      console.log('verifyAdminKey: 普通管理员密钥验证成功');
      cacheAdminPermissions(inputKey, regularAdminPermissions);
      return regularAdminPermissions;
    }

    console.log('verifyAdminKey: 密钥验证失败');
    return null;
  } catch (error) {
    console.error('verifyAdminKey: 密钥验证失败:', error);
    return null;
  }
}

/**
 * 验证普通管理员密钥（从 Firestore）
 */
async function verifyRegularAdminKey(inputKey: string): Promise<AdminPermissions | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const { collection, query, where, getDocs, getFirestore } = await import('firebase/firestore');
    const db = getFirestore();
    
    const keyHash = CryptoJS.SHA256(inputKey.trim()).toString();
    const keysRef = collection(db, 'adminKeys');
    const q = query(
      keysRef,
      where('keyHash', '==', keyHash),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const keyDoc = querySnapshot.docs[0];
    const keyData = keyDoc.data();
    
    // 更新最后使用时间
    await updateKeyUsage(keyDoc.id);
    
    return {
      level: AdminLevel.REGULAR_ADMIN,
      canManageKeys: false, // 普通管理员不能管理密钥
      canAccessUpload: true,
      canAccessAI: true,
      canViewStatistics: false,
      validUntil: Date.now() + 24 * 60 * 60 * 1000 // 24小时
    };
  } catch (error) {
    console.error('普通管理员密钥验证失败:', error);
    return null;
  }
}

/**
 * 更新密钥使用记录
 */
async function updateKeyUsage(keyId: string): Promise<void> {
  try {
    const { doc, updateDoc, getFirestore, increment, serverTimestamp } = await import('firebase/firestore');
    const db = getFirestore();
    
    const keyRef = doc(db, 'adminKeys', keyId);
    await updateDoc(keyRef, {
      usageCount: increment(1),
      lastUsedAt: serverTimestamp(),
      lastUsedBy: getCurrentUserId()
    });
  } catch (error) {
    console.error('更新密钥使用记录失败:', error);
  }
}

/**
 * 获取当前用户信息（用于密钥使用记录）
 */
function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  try {
    const { getAuth } = require('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      // 优先返回邮箱，如果没有邮箱则返回用户名，最后返回UID的前8位
      return user.email || user.displayName || `用户${user.uid.slice(0, 8)}`;
    }
    return 'anonymous';
  } catch {
    return 'anonymous';
  }
}

/**
 * 获取当前用户的真实ID（用于权限缓存绑定）
 */
function getCurrentUserIdFromAuth(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const { getAuth } = require('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    return user?.uid || null;
  } catch {
    return null;
  }
}

/**
 * 缓存管理员权限到本地存储
 */
function cacheAdminPermissions(inputKey: string, permissions: AdminPermissions): void {
  if (typeof window === 'undefined') {
    console.log('cacheAdminPermissions: 非浏览器环境，跳过缓存');
    return;
  }
  
  console.log('cacheAdminPermissions: 开始缓存权限');
  
  const currentUserId = getCurrentUserIdFromAuth();
  console.log('cacheAdminPermissions: 当前用户ID:', currentUserId);
  
  if (!currentUserId || currentUserId === 'anonymous') {
    console.warn('cacheAdminPermissions: 无法缓存管理员权限：用户未登录或为匿名用户');
    // 对于超级管理员，我们允许在未登录状态下使用临时缓存
    if (permissions.level === AdminLevel.SUPER_ADMIN) {
      console.log('cacheAdminPermissions: 超级管理员使用临时缓存');
      const tempCache = {
        permissions,
        keyHash: CryptoJS.SHA256(inputKey.trim()).toString(),
        lastVerified: Date.now(),
        userId: 'temp_super_admin'
      };
      localStorage.setItem('lexicon_admin_cache', JSON.stringify(tempCache));
    }
    return;
  }
  
  const keyHash = CryptoJS.SHA256(inputKey.trim()).toString();
  const cache: AdminCache = {
    permissions,
    keyHash,
    lastVerified: Date.now(),
    userId: currentUserId
  };
  
  console.log('cacheAdminPermissions: 保存权限缓存:', cache);
  localStorage.setItem('lexicon_admin_cache', JSON.stringify(cache));
  console.log('cacheAdminPermissions: 权限缓存保存完成');
}

/**
 * 从本地缓存获取管理员权限
 */
export function getCachedAdminPermissions(): AdminPermissions | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cacheStr = localStorage.getItem('lexicon_admin_cache');
    if (!cacheStr) {
      console.log('getCachedAdminPermissions: 没有找到权限缓存');
      return null;
    }
    
    const cache: AdminCache = JSON.parse(cacheStr);
    console.log('getCachedAdminPermissions: 读取到权限缓存:', cache);
    
    // 检查缓存是否过期
    if (cache.permissions.validUntil < Date.now()) {
      console.log('getCachedAdminPermissions: 权限缓存已过期');
      clearAdminCache();
      return null;
    }
    
    // 检查是否为旧版本缓存（没有userId字段）
    if (!cache.userId) {
      console.warn('getCachedAdminPermissions: 发现旧版本管理员权限缓存，自动清除');
      clearAdminCache();
      return null;
    }
    
    // 对于超级管理员的临时缓存，允许使用
    if (cache.userId === 'temp_super_admin' && cache.permissions.level === AdminLevel.SUPER_ADMIN) {
      console.log('getCachedAdminPermissions: 使用超级管理员临时缓存');
      return cache.permissions;
    }
    
    // 检查缓存的用户ID是否与当前用户匹配
    const currentUserId = getCurrentUserIdFromAuth();
    if (!currentUserId || cache.userId !== currentUserId) {
      console.warn('getCachedAdminPermissions: 管理员权限缓存用户不匹配，当前用户:', currentUserId, '缓存用户:', cache.userId);
      clearAdminCache();
      return null;
    }
    
    console.log('getCachedAdminPermissions: 权限缓存验证通过');
    return cache.permissions;
  } catch (error) {
    console.error('getCachedAdminPermissions: 读取管理员缓存失败:', error);
    clearAdminCache();
    return null;
  }
}

/**
 * 清除管理员权限缓存
 */
export function clearAdminCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('lexicon_admin_cache');
}

/**
 * 检查并清除不匹配的管理员权限缓存
 */
export function validateAndClearInvalidCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheStr = localStorage.getItem('lexicon_admin_cache');
    if (!cacheStr) return;
    
    const cache = JSON.parse(cacheStr);
    const currentUserId = getCurrentUserIdFromAuth();
    
    // 如果没有用户ID字段，或者用户ID不匹配，或者已过期，则清除缓存
    if (!cache.userId || 
        !currentUserId || 
        cache.userId !== currentUserId ||
        cache.permissions?.validUntil < Date.now()) {
      console.warn('清除无效的管理员权限缓存');
      clearAdminCache();
    }
  } catch (error) {
    console.error('验证管理员缓存失败:', error);
    clearAdminCache();
  }
}

/**
 * 检查是否有特定权限
 */
export function hasPermission(permission: keyof AdminPermissions): boolean {
  const permissions = getCachedAdminPermissions();
  if (!permissions) return false;
  
  return Boolean(permissions[permission]);
}

/**
 * 检查是否为超级管理员
 */
export function isSuperAdmin(): boolean {
  const permissions = getCachedAdminPermissions();
  return permissions?.level === AdminLevel.SUPER_ADMIN;
}

/**
 * 获取管理员级别显示名称
 */
export function getAdminLevelName(level: AdminLevel): string {
  switch (level) {
    case AdminLevel.SUPER_ADMIN:
      return '超级管理员';
    case AdminLevel.REGULAR_ADMIN:
      return '管理员';
    default:
      return '普通用户';
  }
}

/**
 * 调试功能：获取当前权限状态信息
 */
export function getAdminPermissionDebugInfo(): any {
  if (typeof window === 'undefined') return { error: 'Not in browser environment' };
  
  try {
    const currentUserId = getCurrentUserIdFromAuth();
    const cacheStr = localStorage.getItem('lexicon_admin_cache');
    const permissions = getCachedAdminPermissions();
    
    return {
      currentUserId,
      hasCache: !!cacheStr,
      cacheContent: cacheStr ? JSON.parse(cacheStr) : null,
      validPermissions: permissions,
      isSuperAdmin: isSuperAdmin(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 