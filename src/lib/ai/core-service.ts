import { getAIInstance } from '../firebase';
import { KnowledgeBase } from '../knowledge-base';
import { aiProviderManager } from '../ai-providers/ai-provider-manager';
import type { AIResponse, ConversationMessage, GenerationConfig } from './types';

/**
 * 核心AI服务类
 * 提供基础的AI对话生成和通用功能
 */
export class LexiconAIService {
  /**
   * 获取AI模型实例（异步初始化）
   */
  private static async getModel() {
    try {
      const { model } = await getAIInstance();
      if (!model) {
        throw new Error('AI 模型未初始化');
      }
      return model;
    } catch (error) {
      console.error('获取AI模型失败:', error);
      throw new Error('AI 服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 多轮对话生成
   * @param conversationHistory 对话历史记录
   * @returns AI回复
   */
  static async generateChatResponse(conversationHistory: ConversationMessage[]): Promise<AIResponse> {
    try {
      // 验证对话历史格式
      if (conversationHistory.length === 0) {
        throw new Error('对话历史不能为空');
      }

      // 确保最后一条消息是用户消息
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage.role !== 'user') {
        throw new Error('最后一条消息必须是用户消息');
      }

      // 调试：打印角色序列和当前AI服务
      const roleSequence = conversationHistory.map(msg => msg.role).join(' -> ');
      console.log('AI服务收到的角色序列:', roleSequence);
      console.log('当前使用的AI服务:', aiProviderManager.getCurrentProvider());

      // 如果只有一条用户消息（第一次对话），尝试添加知识库上下文
      if (conversationHistory.length === 1) {
        // 懒加载知识库上下文，避免阻塞应用启动
        const hasKnowledge = KnowledgeBase.getAllKnowledgeSync().length > 0;
        const knowledgeContext = hasKnowledge ? KnowledgeBase.getSystemContextSync() : '';
        const enhancedPrompt = knowledgeContext 
          ? `${knowledgeContext}\n\n用户问题：${lastMessage.parts[0].text}`
          : `你是一个专业的航空英语学习助手。请用中文回答，内容要准确、实用，适合航空安全员学习。\n\n用户问题：${lastMessage.parts[0].text}`;

        // 使用增强的对话历史
        const enhancedHistory: ConversationMessage[] = [
          { role: 'user', parts: [{ text: enhancedPrompt }] }
        ];
        
        return aiProviderManager.generateChatResponse(enhancedHistory);
      }

      // 多轮对话：检查并添加知识库上下文
      let history = [...conversationHistory];
      
      // 如果历史记录的第一条消息不包含知识库上下文，尝试添加
      if (history.length > 0 && !history[0].parts[0].text.includes('重要专业知识库')) {
        // 检查知识库是否已初始化
        const hasKnowledge = KnowledgeBase.getAllKnowledgeSync().length > 0;
        if (hasKnowledge) {
          const knowledgeContext = KnowledgeBase.getSystemContextSync();
          history[0] = {
            ...history[0],
            parts: [{ text: `${knowledgeContext}\n\n${history[0].parts[0].text}` }]
          };
        }
      }

      return aiProviderManager.generateChatResponse(history);
    } catch (error) {
      console.error('多轮对话生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 流式多轮对话生成
   * @param conversationHistory 对话历史记录
   * @returns 流式AI回复
   */
  static async* generateChatResponseStream(conversationHistory: ConversationMessage[]): AsyncGenerator<string> {
    try {
      console.log('开始流式生成，使用AI服务:', aiProviderManager.getCurrentProvider());
      yield* aiProviderManager.generateChatResponseStream(conversationHistory);
    } catch (error) {
      console.error('流式多轮对话生成失败:', error);
      yield `抱歉，生成失败: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  }

  /**
   * 通用文本生成
   * @param prompt 提示词
   * @param config 生成配置
   * @returns AI回复
   */
  static async generateText(prompt: string, config?: GenerationConfig): Promise<AIResponse> {
    try {
      console.log('生成文本，使用AI服务:', aiProviderManager.getCurrentProvider());
      return aiProviderManager.generateText(prompt);
    } catch (error: any) {
      console.error('生成文本失败:', error);
      return {
        success: false,
        error: error.message || '未知错误'
      };
    }
  }

  /**
   * 流式生成文本
   * @param prompt 提示词
   * @param config 生成配置
   * @returns 流式AI回复
   */
  static async* generateTextStream(prompt: string, config?: GenerationConfig): AsyncGenerator<string> {
    try {
      const model = await this.getModel();

      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config || {
          temperature: 0.7,
          maxOutputTokens: 4096, // 流式生成也使用Gemini 2.5 Pro的强大能力
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
      
      // 检查最终的完成原因
      const response = await result.response;
      if (response.candidates && response.candidates[0]) {
        const finishReason = response.candidates[0].finishReason;
        if (finishReason === 'MAX_TOKENS') {
          console.warn('⚠️ 流式回复因达到 token 限制而截断');
        }
      }
    } catch (error: any) {
      console.error('流式生成失败:', error);
      throw new Error(`流式生成失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * 多模态生成（支持图片输入）
   */
  static async generateFromImage(imageFile: File, prompt: string): Promise<AIResponse> {
    try {
      const model = await this.getModel();
      // 将图片转换为base64
      const imageBase64 = await this.fileToBase64(imageFile);
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: imageFile.type
          }
        }
      ]);

      const response = result.response.text();

      return {
        success: true,
        data: response.trim()
      };
    } catch (error) {
      console.error('AI图片分析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 检查AI服务是否可用
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await this.getModel();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 预热AI服务
   */
  static async warmup(): Promise<void> {
    try {
      console.log('🔥 预热AI服务...');
      await this.getModel();
      console.log('✅ AI服务预热完成');
    } catch (error) {
      console.warn('⚠️ AI服务预热失败:', error);
    }
  }

  /**
   * 文件转Base64辅助方法
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // 移除data:image/xxx;base64,前缀
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }
} 