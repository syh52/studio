import { getAIInstance } from './firebase';
import type { VocabularyItem, Dialogue } from './data';

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export class LexiconAIService {
  /**
   * 获取AI模型实例（延迟初始化）
   */
  private static getModel() {
    const { model } = getAIInstance();
    if (!model) {
      throw new Error('AI 模型未初始化');
    }
    return model;
  }

  /**
   * 多轮对话生成
   * @param conversationHistory 对话历史记录
   * @returns AI回复
   */
  static async generateChatResponse(conversationHistory: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>): Promise<AIResponse> {
    try {
      const model = this.getModel();
      
      // 验证对话历史格式
      if (conversationHistory.length === 0) {
        throw new Error('对话历史不能为空');
      }

      // 确保最后一条消息是用户消息
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage.role !== 'user') {
        throw new Error('最后一条消息必须是用户消息');
      }

      // 调试：打印角色序列
      const roleSequence = conversationHistory.map(msg => msg.role).join(' -> ');
      console.log('AI服务收到的角色序列:', roleSequence);

      // 如果只有一条用户消息（第一次对话），直接生成回复
      if (conversationHistory.length === 1) {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: lastMessage.parts[0].text }] }],
          generationConfig: {
            maxOutputTokens: 3000,  // 增加到3000，约2000-2500个中文字
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
      }

      // 多轮对话：创建聊天实例
      const history = conversationHistory.slice(0, -1);
      
      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 3000,  // 增加到3000，约2000-2500个中文字
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        },
      });

      // 发送最后一条用户消息
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      const response = result.response.text();

      return {
        success: true,
        data: response.trim()
      };
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
  static async* generateChatResponseStream(conversationHistory: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>): AsyncGenerator<string> {
    try {
      const model = this.getModel();
      
      // 使用 startChat 方法创建多轮对话
      const chat = model.startChat({
        history: conversationHistory.slice(0, -1), // 除了最后一条消息
        generationConfig: {
          maxOutputTokens: 3000,  // 增加到3000
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        },
      });

      // 发送最后一条用户消息并流式获取回复
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      const result = await chat.sendMessageStream(lastMessage.parts[0].text);
      
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error('流式多轮对话生成失败:', error);
      yield `抱歉，生成失败: ${error instanceof Error ? error.message : '未知错误'}`;
    }
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
    conversationHistory: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }>
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
   * 生成词汇学习建议
   */
  static async generateVocabularyTip(vocabulary: VocabularyItem): Promise<AIResponse> {
    try {
      const model = this.getModel();
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
          maxOutputTokens: 2500,  // 学习计划需要详细内容
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
   * 通用文本生成（支持流式传输）
   */
  static async generateText(prompt: string, stream: boolean = false): Promise<AIResponse> {
    try {
      const model = this.getModel();
      
      if (stream) {
        // 流式传输实现
        const result = await model.generateContentStream(prompt);
        let fullResponse = '';
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
        }

        return {
          success: true,
          data: fullResponse.trim()
        };
      } else {
        // 普通生成
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        return {
          success: true,
          data: response.trim()
        };
      }
    } catch (error) {
      console.error('AI文本生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 多模态生成（支持图片输入）
   */
  static async generateFromImage(imageFile: File, prompt: string): Promise<AIResponse> {
    try {
      const model = this.getModel();
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
   * 生成词汇学习建议
   */
  async generateVocabularySuggestions(
    vocabularyPack: { name: string; words: Array<{ english: string; chinese: string }> },
    learningHistory?: { masteredWords: string[]; difficultWords: string[] }
  ): Promise<string> {
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

    return this.generateText(prompt, generationConfig);
  }

  /**
   * 生成对话练习题
   */
  async generateDialogueQuestions(
    dialogue: { title: string; content: string; scenario: string }
  ): Promise<string> {
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

    return this.generateText(prompt, generationConfig);
  }

  /**
   * 生成个性化学习计划
   */
  async generateLearningPlan(userProfile: {
    level: string;
    goals: string[];
    availableTime: number;
    weakAreas?: string[];
  }): Promise<string> {
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

    return this.generateText(prompt, generationConfig);
  }

  /**
   * 通用文本生成方法
   */
  async generateText(prompt: string, config?: any): Promise<string> {
    try {
      const { model } = getAIInstance();
      if (!model) {
        throw new Error('AI 模型未初始化');
      }

      // 使用自定义配置时，直接传递给 generateContent
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config || {
          temperature: 0.7,
          maxOutputTokens: 2048, // 默认使用较大的值
          topK: 40,
          topP: 0.95,
        }
      });
      
      const response = await result.response;
      
      // 检查完成原因
      if (response.candidates && response.candidates[0]) {
        const finishReason = response.candidates[0].finishReason;
        if (finishReason === 'MAX_TOKENS') {
          console.warn('⚠️ 回复因达到 token 限制而截断');
        }
      }
      
      return response.text();
    } catch (error: any) {
      console.error('生成文本失败:', error);
      throw new Error(`生成失败: ${error.message || '未知错误'}`);
    }
  }

  /**
   * 流式生成文本
   */
  async *generateTextStream(prompt: string, config?: any): AsyncGenerator<string> {
    try {
      const { model } = getAIInstance();
      if (!model) {
        throw new Error('AI 模型未初始化');
      }

      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config || {
          temperature: 0.7,
          maxOutputTokens: 2048, // 流式生成也使用较大的默认值
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
   * AI智能解析词汇文本
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
      
      // 尝试解析JSON
      try {
        const parsed = JSON.parse(responseText);
        return {
          success: true,
          data: JSON.stringify(parsed)
        };
      } catch (jsonError) {
        // 如果不是完整JSON，尝试提取JSON部分
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            data: JSON.stringify(parsed)
          };
        }
        throw new Error('AI返回的格式不正确，请重试');
      }
    } catch (error) {
      console.error('AI词汇解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * AI智能解析对话文本
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
      
      // 尝试解析JSON
      try {
        const parsed = JSON.parse(responseText);
        return {
          success: true,
          data: JSON.stringify(parsed)
        };
      } catch (jsonError) {
        // 如果不是完整JSON，尝试提取JSON部分
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            data: JSON.stringify(parsed)
          };
        }
        throw new Error('AI返回的格式不正确，请重试');
      }
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
      
      // 尝试解析JSON
      try {
        const parsed = JSON.parse(responseText);
        return {
          success: true,
          data: JSON.stringify(parsed)
        };
      } catch (jsonError) {
        // 如果不是完整JSON，尝试提取JSON部分
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            data: JSON.stringify(parsed)
          };
        }
        throw new Error('AI返回的格式不正确，请重试');
      }
    } catch (error) {
      console.error('AI智能解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
} 