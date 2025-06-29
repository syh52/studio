// --- 这是最终版的 firebase.ts 代码 ---
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAI, getGenerativeModel, VertexAIBackend } from "firebase/ai";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const isProduction = process.env.NODE_ENV === 'production';

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

// 立即初始化 Auth 和 Firestore
export const auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);

// --- ★ 代理确认逻辑 ★ ---
// 临时禁用代理，因为 Cloudflare Worker 代理服务不可用
// TODO: 修复或重新配置 Cloudflare Worker 代理
console.log('⚠️ 代理已临时禁用，直接连接 Firebase 服务');

// if (isProduction && typeof window !== 'undefined' && window.location.hostname.includes('lexiconlab.cn')) {
//   console.log('🚀 应用于生产环境，所有 Firebase 后端请求将由 Cloudflare Worker 透明代理。');
// }

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