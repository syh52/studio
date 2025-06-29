// src/lib/firebase.ts (最终修正版 v2)

import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
// 🔥【修改1】: 引入 initializeFirestore，不再使用 getFirestore
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAI, getGenerativeModel, VertexAIBackend } from "firebase/ai";

// 自定义代理域名配置
const CUSTOM_PROXY_DOMAIN = 'api.lexiconlab.cn';

// 检测是否需要使用代理的函数 (保持不变)
function shouldUseProxy(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isProduction = process.env.NODE_ENV === 'production';
  const isMainlandChina = 
    window.location.hostname.includes('lexiconlab.cn') ||
    window.location.hostname.includes('firebaseapp.com') ||
    isProduction;
    
  // 提供一个手动禁用代理的调试开关
  const isProxyDisabled = localStorage.getItem('disable-proxy') === 'true';

  return isMainlandChina && !isProxyDisabled;
}

// Firebase 项目配置 (保持不变)
const firebaseConfig = {
  apiKey: "AIzaSyDtARFXghjPrzC0UYtucYkUJI22HzcmHcY",
  authDomain: "lexiconlab.cn",
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

// 🔥【修改2】: 动态初始化 Firestore
export const db = (() => {
  const useProxy = shouldUseProxy();
  
  if (useProxy) {
    console.log(`🇨🇳 检测到中国大陆环境，Firebase请求将通过代理 https://${CUSTOM_PROXY_DOMAIN} 路由`);
    
    // 连接Auth到代理 (这种方式正确，保持不变)
    try {
      connectAuthEmulator(auth, `https://${CUSTOM_PROXY_DOMAIN}`, { disableWarnings: true });
      console.log('✅ Firebase Auth 已连接到代理');
    } catch (authError: any) {
      if (authError.code !== 'auth/emulator-config-failed') {
         console.warn('ℹ️ 设置Auth代理时发生意外错误:', authError);
      }
    }
    
    // 使用 initializeFirestore 并直接指定 host 和 ssl，这是正确的做法
    return initializeFirestore(firebaseApp, {
      host: CUSTOM_PROXY_DOMAIN,
      ssl: true, // 强制使用 HTTPS，解决 Mixed Content 问题
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      experimentalForceLongPolling: true, // ✅ 启用长轮询，提高连接稳定性
    });
  } else {
    console.log('🔧 非代理环境，使用Firebase直连');
    // 在非代理环境下，使用不带参数的 initializeFirestore
    return initializeFirestore(firebaseApp, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      experimentalForceLongPolling: true, // ✅ 启用长轮询，提高连接稳定性
    });
  }
})();

console.log('✅ Firestore 初始化完成');


// 🔥【修改3】: 其他代码保持不变
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('WebChannelConnection') || 
        event.reason?.message?.includes('transport errored')) {
      console.warn('🔥 检测到WebChannel连接问题，建议使用离线模式');
    }
  });
}

let ai: any = null;
let model: any = null;

export async function getAIInstance(): Promise<{ ai: any; model: any }> {
  if (ai && model) {
    return { ai, model };
  }
  
  try {
    console.log('🤖 初始化 Firebase AI...');
    ai = getAI(firebaseApp, { backend: new VertexAIBackend('us-central1') });
    model = getGenerativeModel(ai, { 
      model: "gemini-2.5-pro",
    });
    console.log('✅ Firebase AI 初始化成功');
    return { ai, model };
  } catch (error: any) {
    console.error('❌ Firebase AI 初始化失败:', error);
    ai = null; 
    model = null;
    throw new Error('AI 服务暂时不可用，请稍后重试');
  }
}

export { firebaseApp };