import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, VertexAIBackend } from "firebase/ai";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 使用硬编码的配置作为后备方案
const defaultConfig = {
  apiKey: "AIzaSyDtARFXghjPrzCOUYtucYkUJI22HzcmHcY",
  authDomain: "aviation-lexicon-trainer.firebaseapp.com",
  projectId: "aviation-lexicon-trainer",
  storageBucket: "aviation-lexicon-trainer.firebasestorage.app",
  messagingSenderId: "461284748566",
  appId: "1:461284748566:web:917008c87daa9bfa38f437"
};

// Firebase 配置 - 优先使用环境变量，否则使用默认配置
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultConfig.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 静默初始化日志，仅在开发环境显示
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 Firebase 配置状态:');
  console.log('- 使用环境变量:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  console.log('- Project ID:', firebaseConfig.projectId);
  console.log('- API Key 预览:', firebaseConfig.apiKey.substring(0, 10) + '...');
}

// 初始化 Firebase
const firebaseApp = initializeApp(firebaseConfig);

// 立即初始化 Firestore 和 Auth（这些服务轻量且必需）
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

// AI 服务状态管理
let ai: any = null;
let model: any = null;
let isAIInitializing = false;
let aiInitPromise: Promise<{ ai: any; model: any }> | null = null;

// 延迟初始化 AI 服务
async function initializeAI(): Promise<{ ai: any; model: any }> {
  // 如果已经初始化，直接返回
  if (ai && model) {
    return { ai, model };
  }
  
  // 如果正在初始化，返回同一个Promise
  if (isAIInitializing && aiInitPromise) {
    return aiInitPromise;
  }
  
  // 只在客户端初始化
  if (typeof window === 'undefined') {
    throw new Error('AI 服务只能在客户端初始化');
  }

  isAIInitializing = true;
  
  aiInitPromise = (async () => {
    try {
      console.log('🤖 开始初始化 Firebase AI (Vertex AI)...');
      
      // 使用 Vertex AI Backend
      ai = getAI(firebaseApp, { 
        backend: new VertexAIBackend('us-central1')
      });
      
      // 配置 Gemini 2.5 Pro 模型
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
      
      // 根据错误类型给出具体的处理建议
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
      
      // 重置状态，允许重试
      ai = null;
      model = null;
      isAIInitializing = false;
      aiInitPromise = null;
      
      throw error;
    } finally {
      isAIInitializing = false;
    }
  })();
  
  return aiInitPromise;
}

// 获取 AI 实例的安全函数
export async function getAIInstance(): Promise<{ ai: any; model: any }> {
  try {
    return await initializeAI();
  } catch (error) {
    console.error('AI 服务暂时不可用:', error);
    throw new Error('AI 服务暂时不可用，请稍后重试');
  }
}

// 检查 AI 服务是否可用
export function isAIAvailable(): boolean {
  return ai !== null && model !== null;
}

// 预热 AI 服务（可选，在用户需要时调用）
export function preloadAI(): void {
  if (typeof window !== 'undefined' && !isAIAvailable() && !isAIInitializing) {
    initializeAI().catch(error => {
      // 静默处理预热失败
      console.warn('AI 服务预热失败:', error.message);
    });
  }
}

export { firebaseApp };

// 导出 AI 实例（延迟初始化，向后兼容）
export { ai, model }; 