// src/lib/firebase.ts (修复版)

import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAI, getGenerativeModel, VertexAIBackend } from "firebase/ai";

// 检测是否需要使用代理的函数
function shouldUseProxy(): boolean {
  if (typeof window === 'undefined') return false;
  
  // 简化代理检测逻辑
  const isProxyDisabled = localStorage.getItem('disable-proxy') === 'true';
  
  // 默认不使用代理，除非明确指定
  return !isProxyDisabled && process.env.NODE_ENV === 'production';
}

// Firebase 项目配置
const firebaseConfig = {
  apiKey: "AIzaSyDtARFXghjPrzC0UYtucYkUJI22HzcmHcY",
  authDomain: "aviation-lexicon-trainer.firebaseapp.com", // 使用原始域名
  projectId: "aviation-lexicon-trainer",
  storageBucket: "aviation-lexicon-trainer.firebasestorage.app",
  messagingSenderId: "461284748566",
  appId: "1:461284748566:web:917008c87daa9bfa38f437"
};

// 初始化 Firebase App
let firebaseApp: FirebaseApp;
try {
  firebaseApp = getApp();
} catch (e) {
  firebaseApp = initializeApp(firebaseConfig);
}

// 初始化 Auth
export const auth = getAuth(firebaseApp);

// 初始化 Firestore - 完全禁用WebChannel，使用Cloud Functions架构
export const db = (() => {
  const useProxy = shouldUseProxy();
  
  console.log('🏗️ 使用Cloud Functions架构 - 避免WebChannel问题');
  
  // 🔥 新架构：对于复杂操作使用Cloud Functions，简单读取使用Firestore
  if (useProxy) {
    console.log('🇨🇳 代理模式 + Cloud Functions架构');
          return initializeFirestore(firebaseApp, {
        host: 'api.lexiconlab.cn',
        ssl: true,
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        // 🔥 完全禁用WebChannel和实时功能
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: false,
      });
  } else {
    console.log('🔧 直连模式 + Cloud Functions架构');
          return initializeFirestore(firebaseApp, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        // 🔥 直连模式也禁用WebChannel，统一使用Cloud Functions
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: false,
      });
  }
})();

console.log('✅ Firebase初始化完成');

// 错误处理
if (typeof window !== 'undefined') {
  // 禁用WebChannel错误的全局处理
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('WebChannelConnection') || 
        event.reason?.message?.includes('transport errored') ||
        event.reason?.message?.includes('WebChannel transport')) {
      console.warn('🔥 WebChannel连接问题已忽略');
      event.preventDefault(); // 阻止错误冒泡
    }
  });
  
  // 🔥 智能代理配置 - 生产环境启用代理，开发环境可选
  if (process.env.NODE_ENV === 'production') {
    // 生产环境默认启用代理（除非用户明确禁用）
    if (!localStorage.getItem('disable-proxy')) {
      console.log('🇨🇳 生产环境：启用代理模式');
    }
  } else {
    // 开发环境默认直连（除非用户明确启用代理）
    if (!localStorage.getItem('disable-proxy')) {
      localStorage.setItem('disable-proxy', 'true');
      console.log('🔧 开发环境：启用直连模式');
    }
  }
}

let ai: any = null;
let model: any = null;
let currentUserId: string | null = null;

export async function getAIInstance(): Promise<{ ai: any; model: any }> {
  // 检查用户身份验证状态
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('Firebase AI Logic需要用户登录后才能使用。请先登录您的账户。');
  }
  
  // 如果用户ID发生变化，重新初始化AI
  if (currentUserId !== currentUser.uid) {
    ai = null;
    model = null;
    currentUserId = currentUser.uid;
  }
  
  if (ai && model) {
    return { ai, model };
  }
  
  try {
    console.log('🤖 为已登录用户初始化 Firebase AI Logic...');
    console.log('👤 用户ID:', currentUser.uid);
    console.log('📧 用户邮箱:', currentUser.email);
    
    // 确保用户已通过身份验证
    const idToken = await currentUser.getIdToken();
    console.log('🔐 获取到身份验证令牌');
    
    ai = getAI(firebaseApp, { backend: new VertexAIBackend('us-central1') });
    model = getGenerativeModel(ai, { 
      model: "gemini-2.5-pro",
    });
    console.log('✅ Firebase AI Logic 初始化成功');
    return { ai, model };
  } catch (error: any) {
    console.error('❌ Firebase AI Logic 初始化失败:', error);
    ai = null; 
    model = null;
    currentUserId = null;
    
    // 提供更详细的错误信息
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-user-token') {
      throw new Error('用户身份验证已过期，请重新登录。');
    } else if (error.code === 'permission-denied') {
      throw new Error('您没有权限使用AI功能，请联系管理员。');
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      throw new Error('Firebase AI Logic认证失败，请重新登录后重试。');
    } else {
      throw new Error(`AI 服务暂时不可用: ${error.message}`);
    }
  }
}

// 添加用户状态监听，当用户登出时清理AI实例
if (typeof window !== 'undefined') {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      // 用户登出时清理AI实例
      ai = null;
      model = null;
      currentUserId = null;
      console.log('🔄 用户登出，已清理Firebase AI Logic实例');
    }
  });
}

export { firebaseApp };