/**
 * DeepSeek AI Provider - 简化备用版本
 * 仅保留基础功能，作为Google AI的备用服务
 */

export interface DeepSeekMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class DeepSeekProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.deepseek.com/v1';
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generateChatResponse(messages: DeepSeekMessage[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('DeepSeek API未配置');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API错误: ${response.status} - ${errorText}`);
      }

      const data: DeepSeekResponse = await response.json();
      return data.choices[0]?.message?.content || '抱歉，生成内容失败。';
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      throw error;
    }
  }
} 