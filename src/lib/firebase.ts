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

// 配置状态日志
if (typeof window !== 'undefined') {
  console.log('🔧 Firebase 配置状态:');
  console.log('- 使用环境变量:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  console.log('- Project ID:', firebaseConfig.projectId);
  console.log('- API Key 预览:', firebaseConfig.apiKey.substring(0, 10) + '...');
}

// 初始化 Firebase
const firebaseApp = initializeApp(firebaseConfig);

// 初始化 Firestore
export const db = getFirestore(firebaseApp);

// 初始化 Auth
export const auth = getAuth(firebaseApp);

// 初始化 AI 服务（延迟初始化以避免服务器端错误）
let ai: any = null;
let model: any = null;

function initializeAI() {
  if (typeof window !== 'undefined' && !ai) {
    try {
      console.log('🤖 正在初始化 Firebase AI Logic (Vertex AI)...');
      
      // 使用 Vertex AI Backend，指定location
      ai = getAI(firebaseApp, { 
        backend: new VertexAIBackend('us-central1') // 传递区域作为字符串参数
      });
      
      // Vertex AI 支持的模型配置
      // 注意：使用正确的模型版本
      model = getGenerativeModel(ai, { 
        model: "gemini-2.5-flash", // Firebase AI 使用的标准模型名称
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,  // 增加到 2048 以支持更详细的回复
                                  // 约 1500-1600 个英文单词或 1000 个中文字
          topK: 40,
          topP: 0.95,
        }
      });
      
      console.log('✅ Firebase AI Logic (Vertex AI) 初始化成功');
    } catch (error: any) {
      console.error('❌ Firebase AI Logic 初始化失败:', error);
      console.error('错误详情:', {
        message: error?.message || '未知错误',
        code: error?.code || 'UNKNOWN',
        stack: error?.stack || '无堆栈信息'
      });
      
      // 提供更友好的错误提示
      if (error?.code === 'auth/invalid-api-key') {
        console.error('🔑 API密钥无效，请检查Firebase配置');
      } else if (error?.message?.includes('not enabled')) {
        console.error('⚠️ 请在Google Cloud Console启用Vertex AI API');
        console.error('👉 访问: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=aviation-lexicon-trainer');
      } else if (error?.message?.includes('billing')) {
        console.error('💳 Vertex AI 需要启用计费（升级到Blaze计划）');
        console.error('👉 访问: https://console.firebase.google.com/project/aviation-lexicon-trainer/usage/details');
      } else if (error?.message?.includes('permission')) {
        console.error('🔒 权限错误：请确保项目已启用 Vertex AI API');
      } else if (error?.message?.includes('not found')) {
        console.error('❌ 模型未找到，可能原因：');
        console.error('1. Vertex AI API 未启用');
        console.error('2. 项目未升级到 Blaze 计划');
        console.error('3. API 正在启用中（需要等待2-5分钟）');
      }
      
      throw error;
    }
  }
  return { ai, model };
}

// 获取 AI 实例的函数
export function getAIInstance() {
  return initializeAI();
}

export { firebaseApp };

// 导出 AI 实例（延迟初始化）
export { ai, model }; 