// --- 优化的Firebase代理解决方案 ---
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

// 🔥 Firestore初始化，支持WebChannel问题的备用方案
export const db = getFirestore(firebaseApp);

// 🚨 WebChannel连接问题的紧急处理
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

// 🚨 紧急调试：添加代理禁用开关
// 在浏览器控制台输入 localStorage.setItem('disable-proxy', 'true') 可禁用代理
const isProxyDisabled = typeof window !== 'undefined' && 
  localStorage.getItem('disable-proxy') === 'true';

// 🇨🇳 中国大陆代理配置：使用fetch拦截方法
if (shouldUseProxy() && !isProxyDisabled) {
  console.log(`🇨🇳 检测到中国大陆环境，设置Firebase代理: https://${CUSTOM_PROXY_DOMAIN}`);
  console.log('💡 如需禁用代理调试，请在控制台运行: localStorage.setItem("disable-proxy", "true") 然后刷新页面');
  
  // 保存原始fetch
  const originalFetch = window.fetch;
  
  // 重写fetch以支持Firebase代理
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    let url: string;
    
    // 处理不同类型的input
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      return originalFetch(input, init);
    }
    
    // Firebase服务域名列表
    const firebaseHosts = [
      'identitytoolkit.googleapis.com',
      'securetoken.googleapis.com', 
      'firestore.googleapis.com',
      'www.googleapis.com',
      'aiplatform.googleapis.com',
      'firebase.googleapis.com'
    ];
    
    try {
      const urlObj = new URL(url);
      const isFirebaseRequest = firebaseHosts.some(host => urlObj.hostname === host);
      
      if (isFirebaseRequest) {
        // 重定向到代理
        const proxyUrl = `https://${CUSTOM_PROXY_DOMAIN}/${urlObj.hostname}${urlObj.pathname}${urlObj.search}`;
        console.log(`🌐 代理Firebase请求: ${urlObj.hostname}${urlObj.pathname}`);
        
        // 🔧 修复Request构造问题，添加duplex参数
        if (input instanceof Request) {
          // 检查是否有body并设置正确的duplex参数
          const hasBody = input.body !== null;
          const requestOptions: RequestInit = {
            method: input.method,
            headers: input.headers,
            mode: 'cors',
            credentials: 'omit'
          };
          
          // 仅在有body时添加body和duplex参数
          if (hasBody) {
            requestOptions.body = input.body;
            // @ts-ignore - duplex是新的Web标准，TypeScript可能还未更新
            requestOptions.duplex = 'half';
          }
          
          const newRequest = new Request(proxyUrl, requestOptions);
          return originalFetch(newRequest);
        } else {
          // 处理非Request类型的input
          const requestOptions: RequestInit = {
            ...init,
            mode: 'cors',
            credentials: 'omit'
          };
          
          // 如果有body，添加duplex参数
          if (init?.body) {
            // @ts-ignore - duplex是新的Web标准
            requestOptions.duplex = 'half';
          }
          
          return originalFetch(proxyUrl, requestOptions);
        }
      }
    } catch (error) {
      console.warn('代理URL解析失败:', error);
      // 代理失败时回退到原始请求
      console.log('🔄 代理失败，回退到直连');
    }
    
    // 非Firebase请求或代理失败时直接通过
    try {
      return originalFetch(input, init);
    } catch (fetchError) {
      console.error('🚨 Firebase请求失败:', fetchError);
      console.log('💡 建议尝试禁用代理调试: localStorage.setItem("disable-proxy", "true")');
      throw fetchError;
    }
  };
  
  console.log('✅ Firebase fetch代理已设置');
} else {
  if (isProxyDisabled) {
    console.log('🚨 代理已手动禁用，使用Firebase直连');
    console.log('💡 要重新启用代理，请运行: localStorage.removeItem("disable-proxy") 然后刷新页面');
  } else {
    console.log('🔧 非生产环境，使用Firebase直连');
  }
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