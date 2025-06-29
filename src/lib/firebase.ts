// --- 优化的Firebase代理解决方案 ---
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAI, getGenerativeModel } from "firebase/ai";

// 自定义代理域名配置
const CUSTOM_PROXY_DOMAIN = 'api.lexiconlab.cn';

// 检测是否需要使用代理（中国大陆环境）
function shouldUseProxy(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isProduction = process.env.NODE_ENV === 'production';
  const isMainlandChina = 
    window.location.hostname.includes('lexiconlab.cn') ||
    window.location.hostname.includes('firebaseapp.com') ||
    isProduction;
    
  return isMainlandChina;
}

// Firebase 项目配置
const defaultConfig = {
  apiKey: "AIzaSyDtARFXghjPrzCOUYtucYkUJI22HzcmHcY",
  authDomain: "aviation-lexicon-trainer.firebaseapp.com",
  projectId: "aviation-lexicon-trainer",
  storageBucket: "aviation-lexicon-trainer.firebasestorage.app",
  messagingSenderId: "461284748566",
  appId: "1:461284748566:web:917008c87daa9bfa38f437"
};

// 🇨🇳 中国大陆优化的Firebase配置
const chinaOptimizedConfig = {
  ...defaultConfig,
  // 🔧 使用代理域名进行初始化
  authDomain: CUSTOM_PROXY_DOMAIN,
  databaseURL: `https://${CUSTOM_PROXY_DOMAIN}/aviation-lexicon-trainer-default-rtdb.asia-southeast1.firebasedatabase.app`
};

// 全局变量
let app: FirebaseApp | null = null;
let auth: any = null;
let db: any = null;
let ai: any = null;

// 初始化Firebase
function initializeFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase只能在浏览器环境中初始化');
  }

  try {
    return getApp();
  } catch {
    const useProxy = shouldUseProxy();
    const isProxyDisabled = typeof window !== 'undefined' && 
                           window.localStorage?.getItem('disable-proxy') === 'true';
    
    console.log(`🔥 Firebase初始化 - 环境: ${useProxy ? '中国大陆' : '海外'}`);
    
    if (useProxy && !isProxyDisabled) {
      console.log(`🇨🇳 使用中国大陆优化配置`);
      return initializeApp(chinaOptimizedConfig);
    } else {
      console.log(`🌍 使用标准配置`);
      return initializeApp(defaultConfig);
    }
  }
}

// 初始化Firebase服务
export function initializeFirebaseServices() {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Firebase服务只能在浏览器环境中初始化');
    return { app: null, auth: null, db: null, ai: null };
  }

  try {
    // 初始化app
    app = initializeFirebaseApp();
    
    const useProxy = shouldUseProxy();
    const isProxyDisabled = typeof window !== 'undefined' && 
                           window.localStorage?.getItem('disable-proxy') === 'true';

    // 初始化Auth
    auth = getAuth(app);
    
    // 🇨🇳 仅对Auth使用模拟器连接（推荐的官方方式）
    if (useProxy && !isProxyDisabled) {
      try {
        connectAuthEmulator(auth, `https://${CUSTOM_PROXY_DOMAIN}`, {
          disableWarnings: true
        });
        console.log('✅ Firebase Auth 已连接到代理');
      } catch (authError) {
        console.log('ℹ️ Firebase Auth 代理连接已存在:', authError);
      }
    }
    
    // 🔧 初始化Firestore - 根据环境选择配置
    if (useProxy && !isProxyDisabled) {
      // 🇨🇳 中国大陆环境：使用特殊配置初始化Firestore
      try {
        db = initializeFirestore(app, {
          host: CUSTOM_PROXY_DOMAIN,
          ssl: true,
          experimentalForceLongPolling: true, // 强制长轮询，避免WebSocket问题
        });
        console.log('✅ Firebase Firestore 已使用代理配置初始化');
      } catch (firestoreError) {
        console.log('ℹ️ Firestore已初始化，使用现有实例:', firestoreError);
        db = getFirestore(app);
      }
    } else {
      // 🌍 标准环境：使用默认配置
      db = getFirestore(app);
      console.log('✅ Firebase Firestore 已使用标准配置初始化');
    }
    
    // 初始化Firebase AI
    try {
      ai = getAI(app);
      console.log('✅ Firebase AI 初始化成功');
    } catch (aiError) {
      console.warn('⚠️ Firebase AI 初始化失败:', aiError);
      ai = null;
    }

    if (useProxy && !isProxyDisabled) {
      console.log('✅ Firebase 服务已全部初始化（中国大陆优化配置）');
    } else {
      console.log('✅ Firebase 服务已全部初始化（标准配置）');
    }

    return { app, auth, db, ai };
    
  } catch (error) {
    console.error('❌ Firebase初始化失败:', error);
    throw error;
  }
}

// 导出服务实例的getter函数
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const services = initializeFirebaseServices();
    app = services.app;
  }
  return app!;
}

export function getFirebaseAuth() {
  if (!auth) {
    const services = initializeFirebaseServices();
    auth = services.auth;
  }
  return auth;
}

export function getFirebaseFirestore() {
  if (!db) {
    const services = initializeFirebaseServices();
    db = services.db;
  }
  return db;
}

export function getFirebaseAI() {
  if (!ai) {
    const services = initializeFirebaseServices();
    ai = services.ai;
  }
  return ai;
}

// 自动初始化（浏览器环境）
if (typeof window !== 'undefined') {
  initializeFirebaseServices();
}

// 默认导出
export { app, auth, db, ai }; 