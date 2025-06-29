// --- 优雅的Firebase代理解决方案 ---
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAI, getGenerativeModel, VertexAIBackend } from "firebase/ai";

// 自定义代理域名配置（替代复杂的Worker切换逻辑）
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

// 🇨🇳 中国大陆代理配置：使用官方SDK方法
if (shouldUseProxy()) {
  console.log(`🇨🇳 检测到中国大陆环境，配置Firebase代理: https://${CUSTOM_PROXY_DOMAIN}`);
  
  // 使用官方方法连接到自定义代理
  // 这比Monkey-patching更稳定且官方支持
  try {
    // Auth服务连接到代理
    connectAuthEmulator(auth, `https://${CUSTOM_PROXY_DOMAIN}/identitytoolkit.googleapis.com`, { 
      disableWarnings: true 
    });
    
    // Firestore服务连接到代理 
    connectFirestoreEmulator(db, CUSTOM_PROXY_DOMAIN, 443);
    
    console.log('✅ Firebase服务已连接到自定义代理');
  } catch (error) {
    console.warn('⚠️ 代理连接失败，将使用直连:', error);
  }
} else {
  console.log('🔧 非生产环境，使用Firebase直连');
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