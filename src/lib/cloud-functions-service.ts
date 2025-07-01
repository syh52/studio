// Cloud Functions 客户端服务
// 解决WebChannel问题的核心解决方案

import { auth } from './firebase';

interface CloudFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

interface UserRegistrationData {
  uid: string;
  email: string;
  displayName: string;
  role?: string;
}

interface SessionData {
  type: string;
  duration: number;
  score: number;
  totalAnswers: number;
  correctAnswers: number;
  topics: string[];
  difficulty: string;
}

class CloudFunctionsService {
  private baseURL: string;
  
  constructor() {
    // 根据环境选择Cloud Functions URL
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://us-central1-aviation-lexicon-trainer.cloudfunctions.net/api'  // 生产环境
      : 'http://localhost:5001/aviation-lexicon-trainer/us-central1/api';        // 开发环境
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<CloudFunctionResponse<T>> {
    try {
      // 获取当前用户的认证令牌
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`🌐 请求Cloud Function: ${endpoint}`);
      
      // 通过Cloudflare Worker代理请求（简单HTTP代理）
      const proxyURL = process.env.NODE_ENV === 'production'
        ? `https://api.lexiconlab.cn/us-central1-aviation-lexicon-trainer.cloudfunctions.net/api${endpoint}`
        : `${this.baseURL}${endpoint}`;

      const response = await fetch(proxyURL, {
        ...options,
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Cloud Function响应:`, { endpoint, success: data.success });
      
      return data;
      
    } catch (error: any) {
      console.error(`❌ Cloud Function请求失败:`, { endpoint, error: error.message });
      
      return {
        success: false,
        error: error.message || 'Cloud Function请求失败',
        code: 'CLOUD_FUNCTION_ERROR'
      };
    }
  }

  // 🔥 用户注册 - 避免WebChannel问题
  async registerUser(userData: UserRegistrationData): Promise<CloudFunctionResponse> {
    console.log('📝 通过Cloud Function注册用户:', userData.uid);
    
    return this.makeRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // 🔥 获取用户数据 - 避免实时监听
  async getUserData(uid: string): Promise<CloudFunctionResponse> {
    console.log('📖 通过Cloud Function获取用户数据:', uid);
    
    return this.makeRequest(`/users/${uid}`, {
      method: 'GET'
    });
  }

  // 🔥 保存学习进度 - 批量写入
  async saveProgress(uid: string, sessionData: SessionData): Promise<CloudFunctionResponse> {
    console.log('💾 通过Cloud Function保存学习进度:', { uid, type: sessionData.type });
    
    return this.makeRequest('/progress/save', {
      method: 'POST',
      body: JSON.stringify({ uid, sessionData })
    });
  }

  // 🔥 获取学习历史 - 分页查询
  async getProgress(uid: string, limit = 20, offset = 0): Promise<CloudFunctionResponse> {
    console.log('📊 通过Cloud Function获取学习历史:', { uid, limit, offset });
    
    return this.makeRequest(`/progress/${uid}?limit=${limit}&offset=${offset}`, {
      method: 'GET'
    });
  }

  // 🔥 健康检查
  async healthCheck(): Promise<CloudFunctionResponse> {
    return this.makeRequest('/health', {
      method: 'GET'
    });
  }

  // 🔥 批量操作 - 减少网络请求
  async batchOperation(operations: Array<{
    type: 'register' | 'save' | 'get';
    data: any;
  }>): Promise<CloudFunctionResponse> {
    console.log('🔄 批量操作请求:', operations.length);
    
    return this.makeRequest('/batch', {
      method: 'POST',
      body: JSON.stringify({ operations })
    });
  }
}

// 创建单例实例
export const cloudFunctionsService = new CloudFunctionsService();

// 导出类型
export type { 
  CloudFunctionResponse, 
  UserRegistrationData, 
  SessionData 
}; 