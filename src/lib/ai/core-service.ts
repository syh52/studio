import { getAIInstance } from '../firebase';
import { KnowledgeBase } from '../knowledge-base';
import { firebaseAIManager } from '../ai-providers/ai-provider-manager';
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

      // 调试：打印角色序列和Firebase AI状态
      const roleSequence = conversationHistory.map(msg => msg.role).join(' -> ');
      console.log('AI服务收到的角色序列:', roleSequence);
      console.log('Firebase AI Logic状态:', firebaseAIManager.getStatus());

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
        
        // 转换为AI Provider Manager格式
        const providerMessages = enhancedHistory.map(msg => ({
          role: (msg.role === 'model' ? 'assistant' : msg.role) as 'user' | 'assistant' | 'system',
          content: msg.parts[0].text
        }));
        
        return firebaseAIManager.generateChatResponse(providerMessages);
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

      // 转换为AI Provider Manager格式
      const providerMessages = history.map(msg => ({
        role: (msg.role === 'model' ? 'assistant' : msg.role) as 'user' | 'assistant' | 'system',
        content: msg.parts[0].text
      }));
      
      return firebaseAIManager.generateChatResponse(providerMessages);
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
      console.log('开始流式生成，使用Firebase AI Logic');
      // 转换为Firebase AI Manager格式
      const providerMessages = conversationHistory.map(msg => ({
        role: (msg.role === 'model' ? 'assistant' : msg.role) as 'user' | 'assistant' | 'system',
        content: msg.parts[0].text
      }));
      
      yield* firebaseAIManager.generateStreamingResponse(providerMessages);
    } catch (error) {
      console.error('Firebase AI Logic流式生成失败:', error);
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

  /**
   * 生成词汇学习提示
   */
  static async generateVocabularyTip(vocabulary: any): Promise<AIResponse> {
    try {
      const prompt = `为以下航空英语词汇生成学习提示和用法建议：
词汇：${vocabulary.english} - ${vocabulary.chinese}
请提供：
1. 记忆技巧
2. 使用场景
3. 相关搭配
4. 注意事项`;

      return await this.generateText(prompt);
    } catch (error) {
      console.error('生成词汇提示失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 生成对话问题
   */
  static async generateDialogueQuestions(dialogue: any): Promise<AIResponse> {
    try {
      const prompt = `基于以下航空英语对话，生成5个理解问题：
对话标题：${dialogue.title}
对话内容：${dialogue.lines?.map((line: any) => `${line.speaker}: ${line.english} (${line.chinese})`).join('\n')}

请生成：
1. 场景理解问题
2. 关键词汇问题
3. 程序流程问题
4. 应用场景问题
5. 扩展思考问题`;

      return await this.generateText(prompt);
    } catch (error) {
      console.error('生成对话问题失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 生成学习计划
   */
  static async generateStudyPlan(userProfile: any, selectedContent: string[]): Promise<AIResponse> {
    try {
      const prompt = `为航空安全员制定个性化学习计划：
用户信息：
- 等级：${userProfile.level}
- 学习目标：${userProfile.goals?.join(', ')}
- 可用时间：${userProfile.availableTime}分钟/天

学习内容：${selectedContent.join(', ')}

请制定：
1. 每日学习安排
2. 重点学习内容
3. 练习建议
4. 进度检查要点`;

      return await this.generateText(prompt);
    } catch (error) {
      console.error('生成学习计划失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 智能解析内容
   */
  static async parseSmartContent(inputText: string): Promise<AIResponse> {
    try {
      const prompt = `请分析以下内容，判断是词汇还是对话，并按格式整理：
${inputText}

如果是词汇，返回JSON格式：
{
  "type": "vocabulary",
  "items": [{"english": "...", "chinese": "...", "explanation": "..."}]
}

如果是对话，返回JSON格式：
{
  "type": "dialogue", 
  "items": [{"title": "...", "description": "...", "lines": [{"speaker": "...", "english": "...", "chinese": "..."}]}]
}`;

      return await this.generateText(prompt);
    } catch (error) {
      console.error('智能解析内容失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 批量生成例句
   */
  static async generateBatchExampleSentences(vocabularyItems: any[], progressCallback?: (completed: number, total: number) => void): Promise<{success: any[], failed: any[]}> {
    const results: {success: any[], failed: any[]} = { success: [], failed: [] };
    
    for (let i = 0; i < vocabularyItems.length; i++) {
      const item = vocabularyItems[i];
      try {
        const response = await this.generateNaturalExampleSentences(item.english, item.chinese);
        if (response.success) {
          results.success.push({ id: item.id, data: response.data });
        } else {
          results.failed.push({ id: item.id, error: response.error });
        }
      } catch (error) {
        results.failed.push({ id: item.id, error: error instanceof Error ? error.message : '未知错误' });
      }
      
      if (progressCallback) {
        progressCallback(i + 1, vocabularyItems.length);
      }
      
      // 添加延迟避免API限制
      if (i < vocabularyItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }

  /**
   * 生成自然例句
   */
  static async generateNaturalExampleSentences(english: string, chinese: string): Promise<AIResponse> {
    try {
      const prompt = `为航空英语词汇生成3个自然的例句：
词汇：${english} - ${chinese}

要求：
1. 例句应该符合航空安全员的工作场景
2. 语言自然流畅
3. 包含中英文对照
4. 体现词汇的实际用法

格式：
1. 英文例句 - 中文翻译
2. 英文例句 - 中文翻译  
3. 英文例句 - 中文翻译`;

      return await this.generateText(prompt);
    } catch (error) {
      console.error('生成自然例句失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
} 