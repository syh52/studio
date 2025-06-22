import { getAIInstance } from '../firebase';
import type { AIResponse, UserProfile } from './types';

/**
 * 学习助手AI服务
 * 专门处理学习计划和个性化学习建议的AI功能
 */
export class AILearningAssistant {
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
   * 生成个性化学习计划
   */
  static async generateStudyPlan(userLevel: string, focusArea: string): Promise<AIResponse> {
    try {
      const model = this.getModel();
      const prompt = `
作为航空英语学习顾问，为用户制定一个个性化的学习计划：

用户水平：${userLevel}
关注领域：${focusArea}

基于我们的词汇库（162个航空安全英语词汇）和对话库（10个真实工作场景），请生成：

1. 每日学习建议（时间分配）
2. 重点学习领域推荐
3. 练习顺序建议
4. 预期学习周期

要求：
- 用中文回答
- 切合航空安全员的实际工作需求
- 提供具体可执行的建议
- 详细说明每个阶段的学习重点
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 4096,  // 提升到4096，支持更详细的学习计划
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });
      const response = result.response.text();

      return {
        success: true,
        data: response.trim()
      };
    } catch (error) {
      console.error('AI学习计划生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 生成详细的学习计划
   */
  static async generateDetailedLearningPlan(userProfile: UserProfile): Promise<AIResponse> {
    const prompt = `作为航空英语学习顾问，请为以下用户制定个性化学习计划：

水平：${userProfile.level}
学习目标：${userProfile.goals.join('、')}
每天可用时间：${userProfile.availableTime}分钟
${userProfile.weakAreas ? `薄弱环节：${userProfile.weakAreas.join('、')}` : ''}

请制定一个详细的4周学习计划，包括：
1. 每周学习重点
2. 每日任务安排
3. 复习策略
4. 进度评估方法`;

    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 2500, // 学习计划需要详细内容
      topK: 40,
      topP: 0.95,
    };

    try {
      const model = this.getModel();

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
      console.error('生成学习计划失败:', error);
      return {
        success: false,
        error: error.message || '未知错误'
      };
    }
  }
} 