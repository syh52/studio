/**
 * Firebase AI Logic 服务管理器
 * 专注于Firebase AI Logic SDK (Gemini)
 */

import { getAIInstance } from '../firebase';
import type { AIResponse, ConversationMessage } from '../ai/types';

// ！！！代理配置 - 与 firebase.ts 保持一致 ！！！
const proxyUrl = "https://api.lexiconlab.cn"; // 统一使用正确的代理地址
// 备选方案（如果主代理失效）：
// const proxyUrl = 'https://your-new-worker.your-username.workers.dev'; // 新建 Worker
// const proxyUrl = 'https://proxy.yourdomain.com'; // 自定义域名（推荐）
// const proxyUrl = 'https://firebase-cn-proxy.your-username.workers.dev'; // 专用中国区Worker
const isProduction = process.env.NODE_ENV === 'production';

/**
 * AI 服务代理说明：
 * - 在生产环境且域名包含 'lexiconlab.cn' 时，所有 AI 请求将通过 Cloudflare Worker 透明代理
 * - 代理在网络层工作，无需修改 Vertex AI SDK 的具体配置
 * - 真正的 AI 初始化在 firebase.ts 中完成，这里主要添加代理状态提示
 */

export class FirebaseAIManager {
  private static instance: FirebaseAIManager;
  private isFirebaseAIAvailable: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    console.log('🚀 初始化Firebase AI Logic管理器...');
    // 异步初始化Firebase AI
    this.initializeFirebaseAIAsync();
  }

  static getInstance(): FirebaseAIManager {
    if (!FirebaseAIManager.instance) {
      FirebaseAIManager.instance = new FirebaseAIManager();
    }
    return FirebaseAIManager.instance;
  }

  private initializeFirebaseAIAsync() {
    // 设置初始化Promise，避免重复初始化
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization() {
    if (typeof window !== 'undefined') {
      // --- ★ Firebase AI 代理确认逻辑 ★ ---
      if (isProduction && window.location.hostname.includes('lexiconlab.cn')) {
        console.log('🚀 Firebase AI代理状态: 所有AI请求将通过Cloudflare Worker透明代理');
        console.log(`🔗 代理服务器: ${new URL(proxyUrl).host}`);
      }
      
      console.log('🤖 初始化Firebase AI Logic (Gemini)...');
      
      try {
        await this.checkFirebaseAIAsync();
        if (this.isFirebaseAIAvailable) {
          console.log('🎯 Firebase AI Logic (Gemini) 初始化成功');
        }
      } catch (error) {
        console.error('❌ Firebase AI Logic初始化失败:', error);
        this.isFirebaseAIAvailable = false;
      }
    }
  }

  private async checkFirebaseAIAsync() {
    try {
      // 设置较短超时，快速检测
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firebase AI检查超时')), 5000);
      });
      
      const checkPromise = getAIInstance();
      
      const result = await Promise.race([checkPromise, timeoutPromise]);
      
      if (result && result.model) {
        this.isFirebaseAIAvailable = true;
        console.log('🤖 Firebase AI Logic状态: ✅ 可用');
        
        // 简单测试生成
        try {
          const testResult = await result.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
            generationConfig: { maxOutputTokens: 10 }
          });
          console.log('🧪 Firebase AI Logic测试成功');
        } catch (testError) {
          console.warn('⚠️ Firebase AI Logic功能测试失败:', testError);
        }
      } else {
        throw new Error('Firebase AI实例无效');
      }
    } catch (error) {
      this.isFirebaseAIAvailable = false;
      console.error('🤖 Firebase AI Logic状态: ❌ 不可用 -', error instanceof Error ? error.message : '未知错误');
      throw error;
    }
  }

  /**
   * 获取Firebase AI可用状态
   */
  isAvailable(): boolean {
    return this.isFirebaseAIAvailable;
  }

  /**
   * 等待初始化完成
   */
  async waitForInitialization(): Promise<boolean> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
    return this.isFirebaseAIAvailable;
  }

  /**
   * 强制重新初始化Firebase AI
   */
  async reinitialize(): Promise<boolean> {
    console.log('🔄 强制重新初始化Firebase AI Logic...');
    this.isFirebaseAIAvailable = false;
    this.initializationPromise = null;
    
    try {
      await this.initializeFirebaseAIAsync();
      return this.isFirebaseAIAvailable;
    } catch (error) {
      console.error('🔄 重新初始化失败:', error);
      return false;
    }
  }

  /**
   * 生成文本回复（使用Firebase AI Logic）
   */
  async generateText(prompt: string): Promise<AIResponse> {
    try {
      // 确保初始化完成
      await this.waitForInitialization();
      
      if (!this.isFirebaseAIAvailable) {
        throw new Error('Firebase AI Logic不可用，请检查初始化状态');
      }

      // AI 代理状态提示
      if (isProduction && typeof window !== 'undefined' && window.location.hostname.includes('lexiconlab.cn')) {
        console.log('🤖 Firebase AI Logic请求将通过代理发送...');
      }
      
      const { model } = await getAIInstance();
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          topK: 40,
          topP: 0.95,
        }
      });
      
      return {
        success: true,
        data: result.response.text()
      };
    } catch (error) {
      console.error('Firebase AI Logic调用失败:', error);
      
      // 如果是认证错误，标记为不可用并建议重新初始化
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('unauthorized'))) {
        this.isFirebaseAIAvailable = false;
        return {
          success: false,
          error: `Firebase AI认证失败: ${error.message}。请检查项目配置和权限。`
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Firebase AI Logic生成失败'
      };
    }
  }

  /**
   * 生成对话回复（使用Firebase AI Logic）
   */
  async generateChatResponse(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>): Promise<AIResponse> {
    try {
      // 确保初始化完成
      await this.waitForInitialization();
      
      if (!this.isFirebaseAIAvailable) {
        throw new Error('Firebase AI Logic不可用，请检查初始化状态');
      }

      // AI 代理状态提示
      if (isProduction && typeof window !== 'undefined' && window.location.hostname.includes('lexiconlab.cn')) {
        console.log('🤖 Firebase AI Logic对话请求将通过代理发送...');
      }
      
      const { model } = await getAIInstance();
      const conversationHistory: ConversationMessage[] = messages
        .filter(msg => msg.role !== 'system') // 过滤掉system消息，因为ConversationMessage不支持
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));
      
      // 如果有system消息，将其合并到第一个用户消息中
      const systemMessages = messages.filter(msg => msg.role === 'system');
      if (systemMessages.length > 0 && conversationHistory.length > 0) {
        const systemContext = systemMessages.map(msg => msg.content).join('\n');
        const firstUserMessage = conversationHistory.find(msg => msg.role === 'user');
        if (firstUserMessage) {
          firstUserMessage.parts[0].text = `${systemContext}\n\n${firstUserMessage.parts[0].text}`;
        }
      }
      
      const result = await model.generateContent({
        contents: conversationHistory,
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });
      
      return {
        success: true,
        data: result.response.text()
      };
    } catch (error) {
      console.error('Firebase AI Logic对话生成失败:', error);
      
      // 如果是认证错误，标记为不可用
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('unauthorized'))) {
        this.isFirebaseAIAvailable = false;
        return {
          success: false,
          error: `Firebase AI认证失败: ${error.message}。请检查项目配置和权限。`
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Firebase AI Logic对话生成失败'
      };
    }
  }

  /**
   * 流式生成（使用Firebase AI Logic）
   */
  async* generateStreamingResponse(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>): AsyncGenerator<string> {
    try {
      // 确保初始化完成
      await this.waitForInitialization();
      
      if (!this.isFirebaseAIAvailable) {
        throw new Error('Firebase AI Logic不可用，请检查初始化状态');
      }

      // AI 代理状态提示
      if (isProduction && typeof window !== 'undefined' && window.location.hostname.includes('lexiconlab.cn')) {
        console.log('🤖 Firebase AI Logic流式响应将通过代理发送...');
      }
      
      const { model } = await getAIInstance();
      const conversationHistory: ConversationMessage[] = messages
        .filter(msg => msg.role !== 'system') // 过滤掉system消息，因为ConversationMessage不支持
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));
      
      // 如果有system消息，将其合并到第一个用户消息中
      const systemMessages = messages.filter(msg => msg.role === 'system');
      if (systemMessages.length > 0 && conversationHistory.length > 0) {
        const systemContext = systemMessages.map(msg => msg.content).join('\n');
        const firstUserMessage = conversationHistory.find(msg => msg.role === 'user');
        if (firstUserMessage) {
          firstUserMessage.parts[0].text = `${systemContext}\n\n${firstUserMessage.parts[0].text}`;
        }
      }
      
      const result = await model.generateContentStream({
        contents: conversationHistory,
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error('Firebase AI Logic流式响应生成失败:', error);
      
      // 如果是认证错误，标记为不可用
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('unauthorized'))) {
        this.isFirebaseAIAvailable = false;
      }
      
      throw error;
    }
  }

  /**
   * 测试Firebase AI Logic是否可用
   */
  async testFirebaseAI(): Promise<boolean> {
    try {
      const result = await this.generateText('测试连接');
      return result.success;
    } catch (error) {
      console.error('Firebase AI Logic测试失败:', error);
      return false;
    }
  }

  /**
   * 获取Firebase AI状态信息
   */
  getStatus(): {
    name: string;
    available: boolean;
    initialized: boolean;
    lastError?: string;
  } {
    return {
      name: 'Firebase AI Logic (Gemini 2.5 Pro)',
      available: this.isFirebaseAIAvailable,
      initialized: this.initializationPromise !== null,
      lastError: this.isFirebaseAIAvailable ? undefined : '认证失败或初始化错误'
    };
  }

  /**
   * 诊断Firebase AI连接问题
   */
  async diagnose(): Promise<{
    status: string;
    details: string[];
    recommendations: string[];
  }> {
    const details: string[] = [];
    const recommendations: string[] = [];
    
    // 检查初始化状态
    if (!this.initializationPromise) {
      details.push('❌ Firebase AI未开始初始化');
      recommendations.push('调用 reinitialize() 重新初始化');
    } else {
      details.push('✅ Firebase AI初始化已启动');
    }
    
    // 检查可用性
    if (this.isFirebaseAIAvailable) {
      details.push('✅ Firebase AI Logic可用');
    } else {
      details.push('❌ Firebase AI Logic不可用');
      recommendations.push('检查Firebase项目配置');
      recommendations.push('验证API权限和配额');
      recommendations.push('检查网络连接和代理设置');
    }
    
    // 尝试测试连接
    try {
      const testResult = await this.testFirebaseAI();
      if (testResult) {
        details.push('✅ 连接测试成功');
      } else {
        details.push('❌ 连接测试失败');
        recommendations.push('查看控制台错误日志');
      }
    } catch (error) {
      details.push(`❌ 连接测试异常: ${error}`);
    }
    
    const status = this.isFirebaseAIAvailable ? '正常' : '异常';
    
    return {
      status,
      details,
      recommendations
    };
  }
}

// 导出单例实例
export const firebaseAIManager = FirebaseAIManager.getInstance();

// 兼容性导出（保持向后兼容）
export const aiProviderManager = firebaseAIManager; 