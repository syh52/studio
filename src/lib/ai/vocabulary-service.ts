import { getAIInstance } from '../firebase';
import type { AIResponse } from './types';
import type { VocabularyItem } from '../data';

/**
 * 词汇AI服务
 * 专门处理词汇学习相关的AI功能
 */
export class AIVocabularyService {
  /**
   * 获取AI模型实例
   */
  private static async getModel() {
    const { model } = await getAIInstance();
    if (!model) {
      throw new Error('AI 模型未初始化');
    }
    return model;
  }

  /**
   * 生成词汇学习建议
   */
  static async generateVocabularyTip(vocabulary: VocabularyItem): Promise<AIResponse> {
    try {
      const model = await this.getModel();
      const prompt = `
作为航空英语学习助手，为以下词汇生成一个简短的学习建议或记忆技巧：

词汇：${vocabulary.english} (${vocabulary.chinese})
例句：${vocabulary.exampleSentenceEn}
中文：${vocabulary.exampleSentenceZh}

请用中文回答，内容要简洁实用，不超过100字。重点是帮助航空安全员更好地记住和使用这个词汇。
      `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      return {
        success: true,
        data: response.trim()
      };
    } catch (error) {
      console.error('AI词汇建议生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 生成自然简短的例句（优化版本）
   * @param english 英文单词或短语
   * @param chinese 中文翻译
   * @param context 可选的上下文信息
   * @returns 包含英文和中文例句的对象
   */
  static async generateNaturalExampleSentences(
    english: string, 
    chinese: string, 
    context?: string
  ): Promise<AIResponse> {
    try {
      const model = await this.getModel();
      const prompt = `
作为英语学习助手，请为以下词汇生成简短自然的例句：

词汇：${english}
中文：${chinese}
${context ? `上下文：${context}` : ''}

要求：
1. 生成一个英文例句（15-25个词）和对应的中文例句（10-20个字）
2. 例句要自然流畅，避免僵硬的模板化表达
3. 语法正确，语义合理，符合日常使用习惯
4. 不需要特定的行业背景，重点是展示词汇的常见用法
5. 中文例句要地道自然，不要直译腔

请按以下JSON格式输出：

{
  "exampleSentenceEn": "英文例句",
  "exampleSentenceZh": "中文例句"
}

只输出JSON格式，不要其他内容。
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7, // 保持一定创意性
          topK: 40,
          topP: 0.9,
        }
      });
      
      const responseText = result.response.text();
      
      // 清理和解析JSON
      try {
        // 清理响应文本
        let cleanedText = responseText.trim();
        
        // 移除可能的markdown代码块标记
        cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // 尝试直接解析
        let parsed;
        try {
          parsed = JSON.parse(cleanedText);
        } catch (directParseError) {
          // 如果直接解析失败，尝试提取JSON部分
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            // 如果找不到JSON，尝试从第一个{到最后一个}
            const firstBrace = cleanedText.indexOf('{');
            const lastBrace = cleanedText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              const extractedJson = cleanedText.substring(firstBrace, lastBrace + 1);
              parsed = JSON.parse(extractedJson);
            } else {
              throw new Error(`无法解析AI响应: ${cleanedText.substring(0, 200)}...`);
            }
          }
        }
        
        // 验证必要字段
        if (!parsed.exampleSentenceEn || !parsed.exampleSentenceZh) {
          // 如果字段缺失，提供备用例句
          return {
            success: true,
            data: JSON.stringify({
              exampleSentenceEn: `Please check the ${english} carefully.`,
              exampleSentenceZh: `请仔细检查${chinese}。`
            })
          };
        }
        
        return {
          success: true,
          data: JSON.stringify(parsed)
        };
      } catch (error) {
        console.warn('AI例句生成失败，使用备用例句:', error);
        // 返回备用例句而不是抛出错误
        return {
          success: true,
          data: JSON.stringify({
            exampleSentenceEn: `Please check the ${english} carefully.`,
            exampleSentenceZh: `请仔细检查${chinese}。`
          })
        };
      }
    } catch (error) {
      console.error('AI例句生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 批量生成例句（后台处理版本）
   * @param vocabularyItems 词汇项数组
   * @param onProgress 进度回调函数
   * @returns 生成结果
   */
  static async generateBatchExampleSentences(
    vocabularyItems: Array<{ id: string; english: string; chinese: string; context?: string }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<{ 
    success: Array<{ id: string; exampleSentenceEn: string; exampleSentenceZh: string }>; 
    errors: Array<{ id: string; error: string }> 
  }> {
    const results = {
      success: [] as Array<{ id: string; exampleSentenceEn: string; exampleSentenceZh: string }>,
      errors: [] as Array<{ id: string; error: string }>
    };

    for (let i = 0; i < vocabularyItems.length; i++) {
      const item = vocabularyItems[i];
      
      try {
        const response = await this.generateNaturalExampleSentences(
          item.english, 
          item.chinese, 
          item.context
        );
        
        if (response.success && response.data) {
          const parsed = JSON.parse(response.data);
          results.success.push({
            id: item.id,
            exampleSentenceEn: parsed.exampleSentenceEn,
            exampleSentenceZh: parsed.exampleSentenceZh
          });
        } else {
          results.errors.push({
            id: item.id,
            error: response.error || '生成失败'
          });
        }
      } catch (error) {
        results.errors.push({
          id: item.id,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }

      // 调用进度回调
      if (onProgress) {
        onProgress(i + 1, vocabularyItems.length);
      }

      // 添加小延迟避免API频率限制
      if (i < vocabularyItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * 生成词汇学习建议
   */
  static async generateVocabularySuggestions(
    vocabularyPack: { name: string; words: Array<{ english: string; chinese: string }> },
    learningHistory?: { masteredWords: string[]; difficultWords: string[] }
  ): Promise<AIResponse> {
    const prompt = `作为航空英语学习助手，请为学习"${vocabularyPack.name}"词汇包提供学习建议。

词汇包包含${vocabularyPack.words.length}个词汇。
${learningHistory ? `
已掌握词汇：${learningHistory.masteredWords.length}个
困难词汇：${learningHistory.difficultWords.length}个
` : ''}

请提供：
1. 学习策略建议
2. 记忆技巧
3. 实际应用场景举例`;

    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 1500, // 学习建议通常需要中等长度
      topK: 40,
      topP: 0.95,
    };

    try {
      const model = await this.getModel();

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig
      });
      
      const response = await result.response;

      return {
        success: true,
        data: response.text()
      };
    } catch (error: any) {
      console.error('生成词汇建议失败:', error);
      return {
        success: false,
        error: error.message || '未知错误'
      };
    }
  }

  /**
   * 基于上下文生成词汇建议
   */
  static async generateContextualSuggestions(
    context: string,
    targetCount: number = 10
  ): Promise<AIResponse> {
    try {
      const { model } = await getAIInstance();
      const prompt = `
作为航空英语学习助手，请为以下上下文生成${targetCount}个相关的词汇建议：

上下文：${context}

请提供：
1. 词汇建议
2. 记忆技巧
3. 实际应用场景举例

每个建议不超过100字。
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });
      
      const response = await result.response;

      return {
        success: true,
        data: response.text()
      };
    } catch (error: any) {
      console.error('生成上下文相关词汇建议失败:', error);
      return {
        success: false,
        error: error.message || '未知错误'
      };
    }
  }
} 