import { getAIInstance } from '../firebase';
import type { AIResponse, ConversationMessage, Dialogue } from '../data';

/**
 * 对话AI服务
 * 专门处理对话练习和角色扮演相关的AI功能
 */
export class AIDialogueService {
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
   * 角色扮演对话生成
   * @param scenario 对话场景
   * @param userRole 用户角色
   * @param aiRole AI角色
   * @param conversationHistory 对话历史
   * @returns AI回复
   */
  static async generateRolePlayResponse(
    scenario: string,
    userRole: string,
    aiRole: string,
    conversationHistory: ConversationMessage[]
  ): Promise<AIResponse> {
    try {
      const model = this.getModel();
      
      // 构建角色设定
      const systemPrompt = `
你正在参与一个航空英语学习的角色扮演对话练习：

场景：${scenario}
你的角色：${aiRole}
学习者角色：${userRole}

请用英文回复，语言要符合航空行业标准，对话要自然流畅。每次回复后，用中文简要解释关键词汇或表达方式。

格式：
[英文对话]

📝 关键词汇：[中文解释]
      `;

      const fullHistory = [
        {
          role: 'user' as const,
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model' as const,
          parts: [{ text: 'Ready to start the role-play conversation. I will speak as the ' + aiRole + '.' }]
        },
        ...conversationHistory
      ];

      const chat = model.startChat({
        history: fullHistory.slice(0, -1),
        generationConfig: {
          maxOutputTokens: 2000,  // 角色扮演可以稍微短一些
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
        },
      });

      // 发送最后一条用户消息
      const lastMessage = fullHistory[fullHistory.length - 1];
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      const response = result.response.text();

      return {
        success: true,
        data: response.trim()
      };
    } catch (error) {
      console.error('角色扮演对话生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 生成对话练习问题
   */
  static async generateDialogueQuestions(dialogue: Dialogue): Promise<AIResponse> {
    try {
      const model = this.getModel();
      const dialogueText = dialogue.lines
        .map(line => `${line.speaker}: ${line.english} (${line.chinese})`)
        .join('\n');

      const prompt = `
基于以下航空安全对话，生成3个理解测试问题，用于检验学习者对对话内容的掌握：

对话场景：${dialogue.title}
${dialogueText}

请用中文生成3个选择题，每题包含4个选项（A、B、C、D），并在最后标注正确答案。
题目应该测试：
1. 关键词汇理解
2. 对话情境把握  
3. 专业术语应用

格式要求：
问题1：...
A. ...
B. ...  
C. ...
D. ...
正确答案：X

问题2：...
（以此类推）

请确保问题完整，包含所有选项和答案。
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 2000,  // 练习题需要足够空间
          temperature: 0.8,
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
      console.error('AI对话问题生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 生成对话练习题
   */
  static async generateDialogueExerciseQuestions(
    dialogue: { title: string; content: string; scenario: string }
  ): Promise<AIResponse> {
    const prompt = `基于以下航空对话场景，生成5个理解性问题：

标题：${dialogue.title}
场景：${dialogue.scenario}
对话内容：
${dialogue.content}

请生成：
1. 2个细节理解题
2. 2个情境应用题
3. 1个专业术语解释题

每个问题都要包含4个选项，并标明正确答案。`;

    const generationConfig = {
      temperature: 0.8,
      maxOutputTokens: 2000, // 练习题需要较长的内容
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
      console.error('生成对话练习题失败:', error);
      return {
        success: false,
        error: error.message || '未知错误'
      };
    }
  }
} 