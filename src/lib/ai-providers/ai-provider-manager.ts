/**
 * AI服务提供商管理器
 * 支持在Google AI和DeepSeek等不同AI服务之间切换
 */

import { DeepSeekProvider, DeepSeekMessage } from './deepseek-provider';
import { getAIInstance } from '../firebase';
import type { AIResponse, ConversationMessage } from '../ai/types';

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
  private currentProvider: AIProviderType = 'deepseek'; // 默认使用DeepSeek
  private deepSeekProvider: DeepSeekProvider;
  private isGoogleAvailable: boolean = false;

  private constructor() {
    this.deepSeekProvider = new DeepSeekProvider();
    // 异步初始化，避免阻塞页面加载
    this.initializeProvidersAsync();
  }

  static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager();
    }
    return AIProviderManager.instance;
  }

  private initializeProvidersAsync() {
    // 异步初始化，避免阻塞页面加载
    if (typeof window !== 'undefined') {
      // 立即检查DeepSeek配置
      const deepseekConfigured = this.deepSeekProvider.isConfigured();
      console.log('🤖 DeepSeek配置状态:', deepseekConfigured ? '✅ 已配置' : '❌ 未配置');

      // 优先选择DeepSeek（如果已配置）
      if (deepseekConfigured) {
        this.currentProvider = 'deepseek';
        console.log('🎯 自动选择AI服务: DeepSeek (中国大陆友好)');
      }

      // 异步检查Google AI（不阻塞初始化）
      this.checkGoogleAIAsync().catch(error => {
        console.log('🤖 Google AI异步检查失败:', error.message);
      });
    }
  }

  private async checkGoogleAIAsync() {
    try {
      // 设置超时避免长时间阻塞
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Google AI检查超时')), 5000);
      });
      
      const checkPromise = getAIInstance();
      
      await Promise.race([checkPromise, timeoutPromise]);
      
      this.isGoogleAvailable = true;
      console.log('🤖 Google AI状态: ✅ 可用');
      
      // 如果DeepSeek未配置，切换到Google AI
      if (!this.deepSeekProvider.isConfigured()) {
        this.currentProvider = 'google';
        console.log('🎯 切换AI服务为: Google AI (DeepSeek未配置)');
      }
    } catch (error) {
      this.isGoogleAvailable = false;
      console.log('🤖 Google AI状态: ❌ 不可用 (可能需要VPN)');
      
      // 如果DeepSeek也未配置，显示警告
      if (!this.deepSeekProvider.isConfigured()) {
        console.warn('⚠️ 没有可用的AI服务配置');
      }
    }
  }

  /**
   * 获取可用的AI服务提供商列表
   */
  getAvailableProviders(): AIProviderConfig[] {
    return [
      {
        type: 'deepseek',
        enabled: this.deepSeekProvider.isConfigured(),
        priority: 1,
        name: 'DeepSeek',
        description: '国产AI服务，中国大陆可直接访问'
      },
      {
        type: 'google',
        enabled: this.isGoogleAvailable,
        priority: 2,
        name: 'Google AI',
        description: 'Google Gemini服务，需要VPN访问'
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
   * 智能选择最佳AI服务
   */
  selectBestProvider(): AIProviderType {
    const available = this.getAvailableProviders()
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);
    
    if (available.length > 0) {
      this.currentProvider = available[0].type;
      console.log(`🎯 自动选择最佳AI服务: ${available[0].name}`);
      return this.currentProvider;
    } else {
      throw new Error('没有可用的AI服务');
    }
  }

  /**
   * 生成聊天回复（统一接口）
   */
  async generateChatResponse(conversationHistory: ConversationMessage[]): Promise<AIResponse> {
    switch (this.currentProvider) {
      case 'deepseek':
        return this.generateDeepSeekChatResponse(conversationHistory);
      case 'google':
        return this.generateGoogleChatResponse(conversationHistory);
      default:
        return {
          success: false,
          error: `不支持的AI服务: ${this.currentProvider}`
        };
    }
  }

  /**
   * 流式生成聊天回复（统一接口）
   */
  async* generateChatResponseStream(conversationHistory: ConversationMessage[]): AsyncGenerator<string> {
    switch (this.currentProvider) {
      case 'deepseek':
        yield* this.generateDeepSeekChatResponseStream(conversationHistory);
        break;
      case 'google':
        yield* this.generateGoogleChatResponseStream(conversationHistory);
        break;
      default:
        throw new Error(`不支持的AI服务: ${this.currentProvider}`);
    }
  }

  /**
   * 生成文本（统一接口）
   */
  async generateText(prompt: string): Promise<AIResponse> {
    switch (this.currentProvider) {
      case 'deepseek':
        return this.deepSeekProvider.generateText(prompt);
      case 'google':
        return this.generateGoogleText(prompt);
      default:
        return {
          success: false,
          error: `不支持的AI服务: ${this.currentProvider}`
        };
    }
  }

  /**
   * 使用DeepSeek生成聊天回复
   */
  private async generateDeepSeekChatResponse(conversationHistory: ConversationMessage[]): Promise<AIResponse> {
    const messages: DeepSeekMessage[] = conversationHistory.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.parts[0].text
    }));

    return this.deepSeekProvider.generateChatResponse(messages);
  }

  /**
   * 使用DeepSeek流式生成聊天回复
   */
  private async* generateDeepSeekChatResponseStream(conversationHistory: ConversationMessage[]): AsyncGenerator<string> {
    const messages: DeepSeekMessage[] = conversationHistory.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.parts[0].text
    }));

    yield* this.deepSeekProvider.generateChatResponseStream(messages);
  }

  /**
   * 使用Google AI生成聊天回复
   */
  private async generateGoogleChatResponse(conversationHistory: ConversationMessage[]): Promise<AIResponse> {
    try {
      const { model } = await getAIInstance();
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
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 使用Google AI流式生成聊天回复
   */
  private async* generateGoogleChatResponseStream(conversationHistory: ConversationMessage[]): AsyncGenerator<string> {
    try {
      const { model } = await getAIInstance();
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
      console.error('Google AI流式生成失败:', error);
      throw error;
    }
  }

  /**
   * 使用Google AI生成文本
   */
  private async generateGoogleText(prompt: string): Promise<AIResponse> {
    try {
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
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
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