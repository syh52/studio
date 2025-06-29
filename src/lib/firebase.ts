// --- 这是最终版的 firebase.ts 代码 ---
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAI, getGenerativeModel, VertexAIBackend } from "firebase/ai";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Cloudflare Worker 代理配置
// 选择一个在中国大陆可访问的代理 URL
const PROXY_URL = 'https://yellow-fire-20d4.beelzebub1949.workers.dev'; // 当前不可用

// 备选方案（请取消注释其中一个）：
// const PROXY_URL = 'https://your-new-worker.your-username.workers.dev'; // 新建 Worker
// const PROXY_URL = 'https://proxy.yourdomain.com'; // 自定义域名（推荐）
// const PROXY_URL = 'https://firebase-cn-proxy.your-username.workers.dev'; // 专用中国区Worker

const FIREBASE_HOSTS = [
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com', 
  'firestore.googleapis.com',
  'firebaseml.googleapis.com',
  'aiplatform.googleapis.com',
  'firebase.googleapis.com',
  'www.googleapis.com'
];

// 🚀 中国大陆专用：立即设置代理拦截器
// 必须在 Firebase 初始化之前设置，否则拦截无效
if (typeof window !== 'undefined') {
  // 环境检测：生产环境或包含特定域名
  const isProductionLike = 
    process.env.NODE_ENV === 'production' || 
    window.location.hostname.includes('lexiconlab.cn') ||
    window.location.hostname.includes('firebaseapp.com');
  
  if (isProductionLike) {
    console.log('🇨🇳 检测到生产环境，设置Firebase代理拦截器...');
    console.log(`🔗 代理服务器: ${PROXY_URL.replace('https://', '')}`);
    console.log(`🌍 当前域名: ${window.location.hostname}`);
    
    // 保存原始 fetch 引用
    (window as any).__originalFetch__ = window.fetch;
    const originalFetch = window.fetch;
    
    // 重写全局 fetch 函数
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
      let url: string;
      
      // 处理不同类型的 input
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input instanceof Request) {
        url = input.url;
      } else {
        return originalFetch(input, init);
      }
      
      // 检查是否是 Firebase API 请求
      const urlObj = new URL(url);
      const isFirebaseRequest = FIREBASE_HOSTS.some(host => urlObj.hostname === host);
      
      if (isFirebaseRequest) {
        // 强制重定向到代理（中国大陆用户必须使用代理）
        const proxyUrl = `${PROXY_URL}/${urlObj.hostname}${urlObj.pathname}${urlObj.search}`;
        
        console.log(`🇨🇳 拦截Firebase请求: ${urlObj.hostname}${urlObj.pathname} -> 代理`);
        
        // 创建新的请求，使用代理 URL
        try {
          if (input instanceof Request) {
            const newRequest = new Request(proxyUrl, {
              method: input.method,
              headers: input.headers,
              body: input.body,
              mode: 'cors',
              credentials: 'omit'
            });
            return originalFetch(newRequest);
          } else {
            return originalFetch(proxyUrl, {
              ...init,
              mode: 'cors',
              credentials: 'omit'
            });
          }
        } catch (error) {
          console.error(`❌ 代理请求失败: ${urlObj.hostname}`, error);
          throw error;
        }
      }
      
      // 非 Firebase 请求，直接传递
      return originalFetch(input, init);
    };
    
    console.log('✅ Firebase 强制代理拦截器已设置（中国大陆专用）');
  } else {
    console.log('🔧 开发环境，使用直连Firebase');
  }
}

// 您的 Firebase 项目配置 (来自您的原始代码)
const defaultConfig = {
  apiKey: "AIzaSyDtARFXghjPrzCOUYtucYkUJI22HzcmHcY",
  authDomain: "aviation-lexicon-trainer.firebaseapp.com",
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

// 立即初始化 Auth 和 Firestore（代理拦截器已在上面设置）
export const auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);

// ######################################################################
// #  下面的 AI 初始化代码完全是您原来写的，我们原封不动地保留了下来     #
// ######################################################################

let ai: any = null;
let model: any = null;
let isAIInitializing = false;
let aiInitPromise: Promise<{ ai: any; model: any }> | null = null;

async function initializeAI(): Promise<{ ai: any; model: any }> {
  if (ai && model) {
    return { ai, model };
  }
  if (isAIInitializing && aiInitPromise) {
    return aiInitPromise;
  }
  if (typeof window === 'undefined') {
    throw new Error('AI 服务只能在客户端初始化');
  }

  isAIInitializing = true;
  aiInitPromise = (async () => {
    try {
      console.log('🤖 开始初始化 Firebase AI (Vertex AI)...');
      ai = getAI(firebaseApp, { backend: new VertexAIBackend('us-central1') });
      model = getGenerativeModel(ai, { 
        model: "gemini-2.5-pro",
        generationConfig: {
          temperature: 0.7, maxOutputTokens: 4096, topK: 40, topP: 0.95,
        }
      });
      console.log('✅ Firebase AI 初始化成功');
      return { ai, model };
    } catch (error: any) {
      console.error('❌ Firebase AI 初始化失败:', error);
      const errorHandlers: Record<string, string> = {
        'auth/invalid-api-key': '🔑 API密钥无效，请检查Firebase配置',
        'not enabled': '⚠️ 请在Google Cloud Console启用Vertex AI API\n👉 https://console.cloud.google.com/apis/library/aiplatform.googleapis.com',
        'billing': '💳 需要升级到Blaze计划启用Vertex AI\n👉 https://console.firebase.google.com/project/aviation-lexicon-trainer/usage/details',
        'permission': '🔒 权限错误：请确保项目已启用 Vertex AI API',
        'not found': '❌ 模型未找到，可能需要等待API启用(2-5分钟)'
      };
      for (const [key, message] of Object.entries(errorHandlers)) {
        if (error?.message?.includes(key) || error?.code?.includes(key)) {
          console.error(message);
          break;
        }
      }
      ai = null; model = null; isAIInitializing = false; aiInitPromise = null;
      throw error;
    } finally {
      isAIInitializing = false;
    }
  })();
  return aiInitPromise;
}

export async function getAIInstance(): Promise<{ ai: any; model: any }> {
  try {
    return await initializeAI();
  } catch (error) {
    console.error('AI 服务暂时不可用:', error);
    throw new Error('AI 服务暂时不可用，请稍后重试');
  }
}

export function isAIAvailable(): boolean {
  return ai !== null && model !== null;
}

export function preloadAI(): void {
  if (typeof window !== 'undefined' && !isAIAvailable() && !isAIInitializing) {
    initializeAI().catch(error => {
      console.warn('AI 服务预热失败:', error.message);
    });
  }
}

export { firebaseApp, ai, model }; 