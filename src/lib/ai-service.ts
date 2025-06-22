// 向后兼容性适配器 - 重构后的AI服务入口
// 新代码应该使用 ./ai/ 模块中的专门服务
import { LexiconAIService as CoreAIService } from './ai/core-service';
import { AIContentParser } from './ai/content-parser';
import { AIVocabularyService } from './ai/vocabulary-service';
import { AIDialogueService } from './ai/dialogue-service';
import { AILearningAssistant } from './ai/learning-assistant';
import type { VocabularyItem, Dialogue } from './data';

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * @deprecated 使用新的模块化AI服务：./ai/core-service, ./ai/content-parser 等
 * 这个类保留用于向后兼容，新功能请使用专门的AI服务模块
 */
export class LexiconAIService {
  /**
   * 多轮对话生成
   * @deprecated 使用 CoreAIService.generateChatResponse
   */
  static async generateChatResponse(conversationHistory: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>): Promise<AIResponse> {
    return CoreAIService.generateChatResponse(conversationHistory);
  }

  /**
   * 流式多轮对话生成
   * @deprecated 使用 CoreAIService.generateChatResponseStream
   */
  static async* generateChatResponseStream(conversationHistory: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>): AsyncGenerator<string> {
    yield* CoreAIService.generateChatResponseStream(conversationHistory);
  }

  /**
   * 角色扮演对话生成
   * @deprecated 使用 AIDialogueService.generateRolePlayResponse
   */
  static async generateRolePlayResponse(
    scenario: string,
    userRole: string,
    aiRole: string,
    conversationHistory: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }>
  ): Promise<AIResponse> {
    return AIDialogueService.generateRolePlayResponse(scenario, userRole, aiRole, conversationHistory);
  }

  /**
   * 生成词汇学习建议
   * @deprecated 使用 AIVocabularyService.generateVocabularyTip
   */
  static async generateVocabularyTip(vocabulary: VocabularyItem): Promise<AIResponse> {
    return AIVocabularyService.generateVocabularyTip(vocabulary);
  }

  /**
   * 生成对话练习问题
   * @deprecated 使用 AIDialogueService.generateDialogueQuestions
   */
  static async generateDialogueQuestions(dialogue: Dialogue): Promise<AIResponse> {
    return AIDialogueService.generateDialogueQuestions(dialogue);
  }

  /**
   * 生成个性化学习计划
   * @deprecated 使用 AILearningAssistant.generateStudyPlan
   */
  static async generateStudyPlan(userLevel: string, focusArea: string): Promise<AIResponse> {
    return AILearningAssistant.generateStudyPlan(userLevel, focusArea);
  }

  /**
   * 通用文本生成（支持流式传输）
   * @deprecated 使用 CoreAIService.generateText
   */
  static async generateText(prompt: string, stream: boolean = false): Promise<AIResponse> {
    if (stream) {
      // 流式生成需要收集所有内容后返回
      let fullResponse = '';
      for await (const chunk of CoreAIService.generateTextStream(prompt)) {
        fullResponse += chunk;
      }
      return {
        success: true,
        data: fullResponse
      };
    } else {
      return CoreAIService.generateText(prompt);
    }
  }

  /**
   * 多模态生成（支持图片输入）
   * @deprecated 使用 CoreAIService.generateFromImage
   */
  static async generateFromImage(imageFile: File, prompt: string): Promise<AIResponse> {
    return CoreAIService.generateFromImage(imageFile, prompt);
  }

  /**
   * 生成自然简短的例句
   * @deprecated 使用 AIVocabularyService.generateNaturalExampleSentences
   */
  static async generateNaturalExampleSentences(
    english: string, 
    chinese: string, 
    context?: string
  ): Promise<AIResponse> {
    return AIVocabularyService.generateNaturalExampleSentences(english, chinese, context);
  }

  /**
   * 批量生成例句
   * @deprecated 使用 AIVocabularyService.generateBatchExampleSentences
   */
  static async generateBatchExampleSentences(
    vocabularyItems: Array<{ id: string; english: string; chinese: string; context?: string }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<{ 
    success: Array<{ id: string; exampleSentenceEn: string; exampleSentenceZh: string }>; 
    errors: Array<{ id: string; error: string }> 
  }> {
    return AIVocabularyService.generateBatchExampleSentences(vocabularyItems, onProgress);
  }

  /**
   * AI智能解析词汇文本
   * @deprecated 使用 AIContentParser.parseVocabularyText
   */
  static async parseVocabularyText(text: string): Promise<AIResponse> {
    return AIContentParser.parseVocabularyText(text);
  }

  /**
   * AI智能解析对话文本
   * @deprecated 使用 AIContentParser.parseDialogueText
   */
  static async parseDialogueText(text: string): Promise<AIResponse> {
    return AIContentParser.parseDialogueText(text);
  }

  /**
   * AI智能混合解析文本
   * @deprecated 使用 AIContentParser.parseSmartContent
   */
  static async parseSmartContent(text: string): Promise<AIResponse> {
    return AIContentParser.parseSmartContent(text);
  }

  // 兼容旧版本的实例方法
  /**
   * @deprecated 使用静态方法
   */
  async generateVocabularySuggestions(
    vocabularyPack: { name: string; words: Array<{ english: string; chinese: string }> },
    learningHistory?: { masteredWords: string[]; difficultWords: string[] }
  ): Promise<string> {
    const response = await AIVocabularyService.generateVocabularySuggestions(vocabularyPack, learningHistory);
    if (response.success) {
      return response.data || '';
    }
    throw new Error(response.error || '生成失败');
  }

  /**
   * @deprecated 使用静态方法
   */
  async generateDialogueQuestions(
    dialogue: { title: string; content: string; scenario: string }
  ): Promise<string> {
    const response = await AIDialogueService.generateDialogueExerciseQuestions(dialogue);
    if (response.success) {
      return response.data || '';
    }
    throw new Error(response.error || '生成失败');
  }

  /**
   * @deprecated 使用静态方法
   */
  async generateLearningPlan(userProfile: {
    level: string;
    goals: string[];
    availableTime: number;
    weakAreas?: string[];
  }): Promise<string> {
    const response = await AILearningAssistant.generateDetailedLearningPlan(userProfile);
    if (response.success) {
      return response.data || '';
    }
    throw new Error(response.error || '生成失败');
  }

  /**
   * @deprecated 使用静态方法
   */
  async generateText(prompt: string, config?: any): Promise<string> {
    const response = await CoreAIService.generateText(prompt, config);
    if (response.success) {
      return response.data || '';
    }
    throw new Error(response.error || '生成失败');
  }

  /**
   * @deprecated 使用静态方法
   */
  async *generateTextStream(prompt: string, config?: any): AsyncGenerator<string> {
    yield* CoreAIService.generateTextStream(prompt, config);
  }
} 