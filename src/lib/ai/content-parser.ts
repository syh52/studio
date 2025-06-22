import { getAIInstance } from '../firebase';
import type { AIResponse, VocabularyParseResult, DialogueParseResult, SmartContentResult } from './types';

/**
 * AI内容解析服务
 * 专门处理文本的智能解析，包括词汇、对话等内容的提取和结构化
 */
export class AIContentParser {
  /**
   * 获取AI模型实例
   */
  private static getModel() {
    const { model } = getAIInstance();
    if (!model) {
      throw new Error('AI 模型未初始化');
    }
    return model;
  }

  /**
   * 智能解析词汇文本
   * @param text 用户输入的文本
   * @returns 解析后的词汇数据
   */
  static async parseVocabularyText(text: string): Promise<AIResponse> {
    try {
      const model = this.getModel();
      const prompt = `
你是一个专业的英语学习内容解析助手。请分析以下文本，提取出所有的英语词汇、短语或术语，并自动匹配中文翻译。

原始文本：
${text}

请按以下JSON格式输出，确保每个词汇都有英文和中文：

{
  "vocabulary": [
    {
      "english": "altitude",
      "chinese": "高度",
      "explanation": "The height of an aircraft above sea level / 飞机相对于海平面的高度"
    }
  ]
}

要求：
1. 识别所有英语词汇、短语、专业术语
2. 提供准确的中文翻译
3. 如果文本中已有中英文对照，直接使用
4. 如果没有中文，请提供专业的翻译
5. explanation字段包含英文解释和中文解释，用"/"分隔
6. 只输出JSON格式，不要其他内容
7. 特别关注航空、安全相关的专业术语
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.3, // 降低温度确保格式准确
          topK: 40,
          topP: 0.95,
        }
      });
      
      const responseText = result.response.text();
      const parsedData = this.parseJSONResponse(responseText);
      
      return {
        success: true,
        data: JSON.stringify(parsedData)
      };
    } catch (error) {
      console.error('AI词汇解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 智能解析对话文本
   * @param text 用户输入的文本
   * @returns 解析后的对话数据
   */
  static async parseDialogueText(text: string): Promise<AIResponse> {
    try {
      const model = this.getModel();
      const prompt = `
你是一个专业的英语对话内容解析助手。请分析以下文本，识别和提取对话内容，并组织成结构化格式。

原始文本：
${text}

请按以下JSON格式输出：

{
  "dialogues": [
    {
      "title": "机场安检对话",
      "description": "乘客通过机场安检的标准对话流程",
      "lines": [
        {
          "speaker": "Security Officer",
          "english": "Good morning. May I see your boarding pass and ID?",
          "chinese": "早上好。我可以看一下您的登机牌和身份证吗？"
        },
        {
          "speaker": "Passenger",
          "english": "Here you are.",
          "chinese": "给您。"
        }
      ]
    }
  ]
}

要求：
1. 自动识别对话场景，生成合适的标题和描述
2. 识别说话人角色（如Security Officer, Passenger, Flight Attendant等）
3. 提取英文对话内容
4. 如果有中文翻译就使用，没有的话请提供准确的翻译
5. 如果文本包含多个独立对话，分别组织
6. 只输出JSON格式，不要其他内容
7. 重点关注航空、安全、服务等场景
8. speaker字段使用英文角色名称
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.3, // 降低温度确保格式准确
          topK: 40,
          topP: 0.95,
        }
      });
      
      const responseText = result.response.text();
      const parsedData = this.parseJSONResponse(responseText);
      
      return {
        success: true,
        data: JSON.stringify(parsedData)
      };
    } catch (error) {
      console.error('AI对话解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * AI智能混合解析文本（自动识别词汇和对话）
   * @param text 用户输入的文本
   * @returns 解析后的混合数据
   */
  static async parseSmartContent(text: string): Promise<AIResponse> {
    try {
      const model = this.getModel();
      const prompt = `
你是一个智能英语学习内容分析助手。请分析以下文本，自动识别其中包含的英语学习内容类型（词汇、对话，或两者都有），并提取组织成结构化格式。

原始文本：
${text}

请按以下JSON格式输出：

{
  "contentType": "vocabulary|dialogue|mixed",
  "vocabulary": [
    {
      "english": "词汇",
      "chinese": "中文翻译",
      "explanation": "详细解释"
    }
  ],
  "dialogues": [
    {
      "title": "对话标题",
      "description": "对话场景描述",
      "lines": [
        {
          "speaker": "说话人",
          "english": "英文内容",
          "chinese": "中文翻译"
        }
      ]
    }
  ]
}

分析要求：
1. 自动判断内容类型：
   - "vocabulary": 主要是单词、短语、术语列表
   - "dialogue": 主要是对话内容
   - "mixed": 既有词汇又有对话
2. 提取所有有价值的英语学习内容
3. 自动补充缺失的中文翻译
4. 生成合适的标题和描述
5. 特别关注航空、安全、旅行相关内容
6. 只输出JSON格式，不要其他内容
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 5000,
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
        }
      });
      
      const responseText = result.response.text();
      const parsedData = this.parseJSONResponse(responseText);
      
      return {
        success: true,
        data: JSON.stringify(parsedData)
      };
    } catch (error) {
      console.error('AI智能解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 清理和解析JSON响应的通用方法
   * @param responseText AI返回的原始文本
   * @returns 解析后的JSON对象
   */
  private static parseJSONResponse(responseText: string): any {
    try {
      // 清理响应文本
      let cleanedText = responseText.trim();
      
      // 移除可能的markdown代码块标记
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // 尝试直接解析
      try {
        return JSON.parse(cleanedText);
      } catch (directParseError) {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          // 如果找不到JSON，尝试从第一个{到最后一个}
          const firstBrace = cleanedText.indexOf('{');
          const lastBrace = cleanedText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const extractedJson = cleanedText.substring(firstBrace, lastBrace + 1);
            return JSON.parse(extractedJson);
          } else {
            throw new Error(`无法解析AI响应: ${cleanedText.substring(0, 200)}...`);
          }
        }
      }
    } catch (error) {
      console.warn('JSON解析失败:', error);
      throw new Error('AI返回的格式不正确，请重试');
    }
  }
} 