/**
 * DeepSeek AI 服务提供商
 * 为中国大陆用户提供无需VPN的AI服务
 */

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DeepSeekProvider {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
    this.baseURL = 'https://api.deepseek.com/v1';
    this.model = 'deepseek-chat';
  }

  /**
   * 检查API密钥是否配置
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * 生成聊天回复
   */
  async generateChatResponse(messages: DeepSeekMessage[]): Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'DeepSeek API密钥未配置'
      };
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 4096,
          temperature: 0.7,
          top_p: 0.95,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
      }

      const data: DeepSeekResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('DeepSeek API返回空结果');
      }

      return {
        success: true,
        data: data.choices[0].message.content
      };
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 流式生成聊天回复
   */
  async* generateChatResponseStream(messages: DeepSeekMessage[]): AsyncGenerator<string> {
    if (!this.isConfigured()) {
      throw new Error('DeepSeek API密钥未配置');
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 4096,
          temperature: 0.7,
          top_p: 0.95,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue;
            
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6);
                const data = JSON.parse(jsonStr);
                
                if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                  yield data.choices[0].delta.content;
                }
              } catch (e) {
                console.warn('解析流数据失败:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('DeepSeek 流式API调用失败:', error);
      throw error;
    }
  }

  /**
   * 生成文本
   */
  async generateText(prompt: string): Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }> {
    return this.generateChatResponse([
      { role: 'user', content: prompt }
    ]);
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.generateText('Hello');
      return result.success;
    } catch (error) {
      console.error('DeepSeek API连接测试失败:', error);
      return false;
    }
  }
} 