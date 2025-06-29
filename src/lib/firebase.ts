// --- 优化的Firebase代理解决方案 (完全自定义方法) ---
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

// 全局变量
let app: FirebaseApp | null = null;
let auth: any = null;
let db: any = null;
let ai: any = null;

// 🔧 强力代理拦截器 - 这次我们需要更彻底的方法
function setupAdvancedProxyInterceptor() {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 设置强力代理拦截器...');
  
  // 保存原始fetch
  const originalFetch = window.fetch;
  
  // 重写fetch，强制所有Firebase请求通过代理
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // 检查是否是Firebase相关请求
    const isFirebaseRequest = 
      url.includes('googleapis.com') ||
      url.includes('firestore.googleapis.com') ||
      url.includes('identitytoolkit.googleapis.com') ||
      url.includes('securetoken.googleapis.com') ||
      url.includes('firebasestorage.googleapis.com');
    
    if (isFirebaseRequest && !url.includes(CUSTOM_PROXY_DOMAIN)) {
      // 提取目标域名和路径
      const urlObj = new URL(url);
      const targetHost = urlObj.hostname;
      const targetPath = urlObj.pathname + urlObj.search;
      
      // 构建代理URL
      const proxyUrl = `https://${CUSTOM_PROXY_DOMAIN}/${targetHost}${targetPath}`;
      
      console.log(`🔧 拦截Firebase请求: ${url}`);
      console.log(`🔧 重定向到代理: ${proxyUrl}`);
      
      // 创建新的请求对象，保持所有原始头部和选项
      const proxyInit = {
        ...init,
        headers: {
          ...init?.headers,
          // 确保关键的Firebase头部被正确传递
          'Origin': window.location.origin,
          'Referer': window.location.href
        }
      };
      
      // 使用代理URL调用原始fetch
      return originalFetch(proxyUrl, proxyInit);
    }
    
    // 非Firebase请求，正常处理
    return originalFetch(input, init);
  };
  
  console.log('✅ 强力代理拦截器设置完成');
}

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
    
    // 🔧 如果需要代理，先设置拦截器
    if (useProxy && !isProxyDisabled) {
      setupAdvancedProxyInterceptor();
    }
    
    console.log(`🌍 使用标准Firebase配置初始化`);
    return initializeApp(defaultConfig);
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
    
    // 🇨🇳 只对Auth使用模拟器连接（这个是安全的）
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
    
    // 🔧 对于Firestore，使用标准初始化，依赖我们的拦截器
    db = getFirestore(app);
    
    if (useProxy && !isProxyDisabled) {
      console.log('✅ Firebase Firestore 已初始化，使用代理拦截器');
    } else {
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
      console.log('✅ Firebase 服务已全部初始化（使用强力代理拦截器）');
      console.log('💡 如需禁用代理调试，请运行: localStorage.setItem("disable-proxy", "true")');
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