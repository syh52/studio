/**
 * AI服务提供商管理器
 * 支持在Google AI和DeepSeek等不同AI服务之间切换
 */

import { DeepSeekProvider, DeepSeekMessage } from './deepseek-provider';
import { getAIInstance } from '../firebase';
import type { AIResponse, ConversationMessage } from '../ai/types';

// ！！！代理配置 - 与 firebase.ts 保持一致 ！！！
const proxyUrl = "https://yellow-fire-20d4.beelzebub1949.workers.dev"; // 您的 Worker 地址
const isProduction = process.env.NODE_ENV === 'production';

/**
 * AI 服务代理说明：
 * - 在生产环境且域名包含 'lexiconlab.cn' 时，所有 AI 请求将通过 Cloudflare Worker 透明代理
 * - 代理在网络层工作，无需修改 Vertex AI SDK 的具体配置
 * - 真正的 AI 初始化在 firebase.ts 中完成，这里主要添加代理状态提示
 */

export type AIProviderType = 'google' | 'deepseek';

export interface AIProviderConfig {
  type: AIProviderType;
  enabled: boolean;
  priority: number;
  name: string;
  description: string;
}

export class AIProviderManager {
  private static instance: AIProviderManager;
  private currentProvider: AIProviderType = 'google'; // 默认使用Google AI (Gemini)
  private deepSeekProvider: DeepSeekProvider;
  private isGoogleAvailable: boolean = false;

  private constructor() {
    this.deepSeekProvider = new DeepSeekProvider();
    // 异步初始化，优先检查Google AI
    this.initializeProvidersAsync();
  }

  static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager();
    }
    return AIProviderManager.instance;
  }

  private initializeProvidersAsync() {
    // 异步初始化，优先检查Google AI
    if (typeof window !== 'undefined') {
      // --- ★ AI 代理确认逻辑 ★ ---
      if (isProduction && window.location.hostname.includes('lexiconlab.cn')) {
        console.log('🚀 AI服务代理状态: 所有 AI 请求将通过 Cloudflare Worker 透明代理');
        console.log(`🔗 代理服务器: ${new URL(proxyUrl).host}`);
      }
      
      console.log('🤖 优先初始化 Google AI (Gemini)...');
      
      // 优先检查Google AI
      this.checkGoogleAIAsync().then(() => {
        if (this.isGoogleAvailable) {
          this.currentProvider = 'google';
          console.log('🎯 使用AI服务: Google AI (Gemini) - 首选');
        } else {
          // 如果Google AI不可用，检查DeepSeek作为备用
          const deepseekConfigured = this.deepSeekProvider.isConfigured();
          console.log('🤖 DeepSeek配置状态:', deepseekConfigured ? '✅ 已配置' : '❌ 未配置');
          
          if (deepseekConfigured) {
            this.currentProvider = 'deepseek';
            console.log('🎯 备用AI服务: DeepSeek (Google AI不可用)');
          } else {
            console.warn('⚠️ 没有可用的AI服务配置');
          }
        }
      }).catch(error => {
        console.log('🤖 Google AI初始化失败:', error.message);
        // 尝试使用DeepSeek作为备用
        if (this.deepSeekProvider.isConfigured()) {
          this.currentProvider = 'deepseek';
          console.log('🎯 备用AI服务: DeepSeek');
        }
      });
    }
  }

  private async checkGoogleAIAsync() {
    try {
      // 设置较短超时，快速检测
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Google AI检查超时')), 3000);
      });
      
      const checkPromise = getAIInstance();
      
      await Promise.race([checkPromise, timeoutPromise]);
      
      this.isGoogleAvailable = true;
      console.log('🤖 Google AI状态: ✅ 可用');
    } catch (error) {
      this.isGoogleAvailable = false;
      console.log('🤖 Google AI状态: ❌ 不可用 -', error instanceof Error ? error.message : '未知错误');
    }
  }

  /**
   * 获取可用的AI服务提供商列表
   */
  getAvailableProviders(): AIProviderConfig[] {
    return [
      {
        type: 'google',
        enabled: this.isGoogleAvailable,
        priority: 1, // Google AI优先级最高
        name: 'Google AI (Gemini)',
        description: 'Google Gemini 2.5 Pro - 强大的多模态AI'
      },
      {
        type: 'deepseek',
        enabled: this.deepSeekProvider.isConfigured(),
        priority: 2, // DeepSeek作为备用
        name: 'DeepSeek (备用)',
        description: '国产AI服务 - 仅作为备用选项'
      }
    ];
  }

  /**
   * 获取当前使用的AI服务
   */
  getCurrentProvider(): AIProviderType {
    return this.currentProvider;
  }

  /**
   * 设置AI服务提供商
   */
  setProvider(provider: AIProviderType): boolean {
    const available = this.getAvailableProviders();
    const providerConfig = available.find(p => p.type === provider && p.enabled);
    
    if (providerConfig) {
      this.currentProvider = provider;
      console.log(`🔄 切换AI服务为: ${providerConfig.name}`);
      return true;
    } else {
      console.error(`❌ AI服务 ${provider} 不可用`);
      return false;
    }
  }

  /**
   * 智能选择最佳AI服务 - 优先选择Google AI
   */
  selectBestProvider(): AIProviderType {
    const available = this.getAvailableProviders()
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);
    
    if (available.length > 0) {
      this.currentProvider = available[0].type;
      console.log(`🎯 自动选择AI服务: ${available[0].name}`);
      return this.currentProvider;
    } else {
      throw new Error('没有可用的AI服务');
    }
  }

  /**
   * 生成文本回复（使用当前可用的提供者）
   */
  async generateText(prompt: string): Promise<AIResponse> {
    try {
      // 首先尝试Google AI
      if (this.isGoogleAvailable) {
        try {
          // AI 代理状态提示
          if (isProduction && typeof window !== 'undefined' && window.location.hostname.includes('lexiconlab.cn')) {
            console.log('🤖 Google AI 请求将通过代理发送...');
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
          console.warn('Google AI 调用失败，尝试切换到DeepSeek:', error);
          this.isGoogleAvailable = false;
        }
      }

      // 如果Google AI不可用，尝试DeepSeek
      if (this.deepSeekProvider.isConfigured()) {
        try {
          const result = await this.deepSeekProvider.generateChatResponse([
            { role: 'user', content: prompt }
          ]);
          return {
            success: true,
            data: result
          };
        } catch (error) {
          console.error('DeepSeek调用失败:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : '生成失败'
          };
        }
      }

      throw new Error('所有AI服务都不可用');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成失败'
      };
    }
  }

  /**
   * 生成对话回复
   */
  async generateChatResponse(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>): Promise<AIResponse> {
    try {
      // 首先尝试Google AI
      if (this.isGoogleAvailable) {
        try {
          // AI 代理状态提示
          if (isProduction && typeof window !== 'undefined' && window.location.hostname.includes('lexiconlab.cn')) {
            console.log('🤖 Google AI 对话请求将通过代理发送...');
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
          console.warn('Google AI 调用失败，尝试切换到DeepSeek:', error);
          this.isGoogleAvailable = false;
        }
      }

      // 如果Google AI不可用，尝试DeepSeek
      if (this.deepSeekProvider.isConfigured()) {
        try {
          const deepSeekMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          const result = await this.deepSeekProvider.generateChatResponse(deepSeekMessages);
          return {
            success: true,
            data: result
          };
        } catch (error) {
          console.error('DeepSeek调用失败:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : '对话生成失败'
          };
        }
      }

      throw new Error('所有AI服务都不可用');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '对话生成失败'
      };
    }
  }

  /**
   * 流式生成（仅支持Google AI）
   */
  async* generateStreamingResponse(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>): AsyncGenerator<string> {
    try {
      if (this.isGoogleAvailable) {
        // AI 代理状态提示
        if (isProduction && typeof window !== 'undefined' && window.location.hostname.includes('lexiconlab.cn')) {
          console.log('🤖 Google AI 流式响应将通过代理发送...');
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
        return;
      }
      
      // DeepSeek暂不支持流式响应，使用普通响应
      const response = await this.generateChatResponse(messages);
      if (response.success && response.data) {
        yield response.data;
      } else {
        throw new Error(response.error || '流式响应生成失败');
      }
    } catch (error) {
      console.error('流式响应生成失败:', error);
      throw error;
    }
  }

  /**
   * 测试当前AI服务是否可用
   */
  async testCurrentProvider(): Promise<boolean> {
    try {
      const result = await this.generateText('测试消息');
      return result.success;
    } catch (error) {
      console.error(`当前AI服务 ${this.currentProvider} 测试失败:`, error);
      return false;
    }
  }

  /**
   * 获取AI服务状态信息
   */
  getProviderStatus(): {
    current: AIProviderType;
    available: AIProviderConfig[];
    isWorking: boolean;
  } {
    return {
      current: this.currentProvider,
      available: this.getAvailableProviders(),
      isWorking: this.getAvailableProviders().some(p => p.type === this.currentProvider && p.enabled)
    };
  }
}

// 导出单例实例
export const aiProviderManager = AIProviderManager.getInstance(); 