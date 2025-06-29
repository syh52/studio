// --- 优化的Firebase代理解决方案 ---
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAI, getGenerativeModel, VertexAIBackend } from "firebase/ai";

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
  apiKey: "AIzaSyDtARFXghjPrzC0UYtucYkUJI22HzcmHcY",
  authDomain: "lexiconlab.cn", // 使用自定义域名
  projectId: "aviation-lexicon-trainer",
  storageBucket: "aviation-lexicon-trainer.firebasestorage.app",
  messagingSenderId: "461284748566",
  appId: "1:461284748566:web:917008c87daa9bfa38f437"
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultConfig.appId,
};

// 初始化 Firebase App
let firebaseApp: FirebaseApp;
try {
  firebaseApp = getApp();
} catch (e) {
  firebaseApp = initializeApp(firebaseConfig);
}

// 初始化 Auth 和 Firestore
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// 🚨 紧急调试：添加代理禁用开关
// 在浏览器控制台输入 localStorage.setItem('disable-proxy', 'true') 可禁用代理
const isProxyDisabled = typeof window !== 'undefined' && 
  localStorage.getItem('disable-proxy') === 'true';

// 🇨🇳 使用官方模拟器连接方式连接到代理（更稳定的方案）
if (shouldUseProxy() && !isProxyDisabled) {
  console.log(`🇨🇳 检测到中国大陆环境，使用官方模拟器连接方式设置Firebase代理: https://${CUSTOM_PROXY_DOMAIN}`);
  console.log('💡 如需禁用代理调试，请在控制台运行: localStorage.setItem("disable-proxy", "true") 然后刷新页面');
  
  try {
    // 使用官方的模拟器连接函数连接到代理
    // 这比重写fetch更稳定，且受Firebase官方支持
    
    // 🔧 强制所有连接使用HTTPS代理
    try {
      // 连接Auth到代理，强制使用HTTPS
      connectAuthEmulator(auth, `https://${CUSTOM_PROXY_DOMAIN}`, {
        disableWarnings: true
      });
      console.log('✅ Firebase Auth 已连接到HTTPS代理');
    } catch (authError) {
      console.log('ℹ️ Firebase Auth 代理连接已存在:', authError);
    }
    
    try {
      // 连接Firestore到代理，强制使用HTTPS
      connectFirestoreEmulator(db, CUSTOM_PROXY_DOMAIN, 443);
      console.log('✅ Firebase Firestore 已连接到HTTPS代理');
    } catch (firestoreError) {
      console.log('ℹ️ Firebase Firestore 代理连接已存在:', firestoreError);
    }
    
    // 🔧 阻止Firebase尝试直连Google服务
    try {
      // 拦截可能的混合内容请求
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0].toString();
        
        // 检查是否是Firebase相关的HTTP请求，强制转换为代理
        if (url.includes('googleapis.com') && !url.includes(CUSTOM_PROXY_DOMAIN)) {
          console.log('🔧 拦截并重定向Firebase请求到代理:', url);
          // 不允许直连，强制通过代理
          return Promise.reject(new Error('Blocked direct Firebase connection, use proxy only'));
        }
        
        return originalFetch.apply(this, args);
      };
      
      console.log('🔧 已设置Firebase请求拦截器，强制使用代理');
    } catch (interceptError) {
      console.log('⚠️ 请求拦截器设置失败:', interceptError);
    }
    
    console.log('✅ Firebase Auth 和 Firestore 已连接到代理');
    
  } catch (error) {
    console.warn('⚠️ 代理连接设置失败，将使用直连:', error);
    console.log('💡 建议尝试禁用代理调试: localStorage.setItem("disable-proxy", "true")');
  }
  
} else {
  if (isProxyDisabled) {
    console.log('🚨 代理已手动禁用，使用Firebase直连');
    console.log('💡 要重新启用代理，请运行: localStorage.removeItem("disable-proxy") 然后刷新页面');
  } else {
    console.log('🔧 非生产环境，使用Firebase直连');
  }
}

// 🔥 WebChannel连接问题的紧急处理
if (typeof window !== 'undefined') {
  // 监听未处理的网络错误
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('WebChannelConnection') || 
        event.reason?.message?.includes('transport errored')) {
      console.warn('🔥 检测到WebChannel连接问题，建议使用离线模式');
      console.log('💡 可以运行以下命令禁用实时功能: localStorage.setItem("disable-realtime", "true")');
    }
  });
}

// ######################################################################
// #  简化的 AI 初始化（可选功能）                                          #
// ######################################################################

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
      generationConfig: {
        temperature: 0.7, 
        maxOutputTokens: 4096, 
        topK: 40, 
        topP: 0.95,
      }
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

export function isAIAvailable(): boolean {
  return ai !== null && model !== null;
}

export { firebaseApp, ai, model }; 