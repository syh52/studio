// 知识库管理模块
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';

export interface KnowledgeItem {
  id: string;
  category: 'department' | 'position' | 'terminology' | 'procedure' | 'regulation';
  title: string;
  content: string;
  keywords: string[];
  importance: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentInfo {
  name: string;
  description: string;
  responsibilities: string[];
  positions: PositionInfo[];
}

export interface PositionInfo {
  title: string;
  description: string;
  duties: string[];
  qualifications: string[];
  englishTerms: string[];
}

export class KnowledgeBase {
  private static knowledgeItems: KnowledgeItem[] = [];
  private static isInitialized = false;
  private static unsubscribe: (() => void) | null = null;
  private static readonly COLLECTION_NAME = 'knowledge-base';

  // 全局请求控制 - 超保守策略
  private static lastRequestTime: number = 0;
  private static readonly MIN_REQUEST_INTERVAL = 15000; // 最少15秒间隔
  private static consecutiveFailures: number = 0;
  private static readonly MAX_CONSECUTIVE_FAILURES = 3;
  private static isAIServiceSuspended: boolean = false;
  private static suspensionEndTime: number = 0;

  /**
   * 检查AI服务配额状态
   */
  static async checkAIQuotaStatus(): Promise<{
    available: boolean;
    reason?: string;
    suspendedUntil?: Date;
    consecutiveFailures: number;
  }> {
    const now = Date.now();
    
    // 检查是否在暂停期
    if (this.isAIServiceSuspended && now < this.suspensionEndTime) {
      return {
        available: false,
        reason: 'AI服务临时暂停',
        suspendedUntil: new Date(this.suspensionEndTime),
        consecutiveFailures: this.consecutiveFailures
      };
    }
    
    // 如果暂停期结束，重置状态
    if (this.isAIServiceSuspended && now >= this.suspensionEndTime) {
      this.isAIServiceSuspended = false;
      this.consecutiveFailures = 0;
      console.log('🔄 AI服务暂停期结束，重新启用');
    }
    
    // 检查连续失败次数
    if (this.consecutiveFailures >= 10) {
      return {
        available: false,
        reason: 'AI配额可能已耗尽，连续失败次数过多',
        consecutiveFailures: this.consecutiveFailures
      };
    }
    
    return {
      available: true,
      consecutiveFailures: this.consecutiveFailures
    };
  }

  /**
   * 暂停AI服务
   */
  static suspendAIService(durationMinutes: number = 60): void {
    this.isAIServiceSuspended = true;
    this.suspensionEndTime = Date.now() + (durationMinutes * 60 * 1000);
    console.log(`⏸️ AI服务已暂停 ${durationMinutes} 分钟，将于 ${new Date(this.suspensionEndTime).toLocaleTimeString()} 恢复`);
  }

  /**
   * 手动解析文档内容（不使用AI）
   */
  static parseFileContentManually(content: string, fileName: string): {
    success: boolean;
    data?: KnowledgeItem[];
    error?: string;
  } {
    try {
      // 首先验证内容质量
      const validationResult = this.validateTextContent(content);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error || '文件内容格式不正确'
        };
      }

      // 简单的文本分割和预处理
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      const knowledgeItems: KnowledgeItem[] = [];
      
      let currentSection = '';
      let currentContent = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // 检测标题行（以#开头，或者全大写，或者很短且像标题）
        if (this.isLikelyTitle(trimmedLine)) {
          // 保存之前的内容
          if (currentSection && currentContent) {
            knowledgeItems.push(this.createManualKnowledgeItem(currentSection, currentContent));
          }
          
          // 开始新的章节
          currentSection = trimmedLine.replace(/^#+\s*/, ''); // 移除markdown标题符号
          currentContent = '';
        } else {
          // 累积内容
          if (currentContent) {
            currentContent += '\n' + trimmedLine;
          } else {
            currentContent = trimmedLine;
          }
        }
      }
      
      // 添加最后一个章节
      if (currentSection && currentContent) {
        knowledgeItems.push(this.createManualKnowledgeItem(currentSection, currentContent));
      }
      
      // 如果没有识别到章节，创建一个默认条目
      if (knowledgeItems.length === 0) {
        const summary = content.substring(0, 500) + (content.length > 500 ? '...' : '');
        knowledgeItems.push({
          id: `manual-${Date.now()}`,
          title: `${fileName} - 文档内容`,
          content: summary,
          category: 'terminology',
          keywords: this.extractSimpleKeywords(content),
          importance: 'medium',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log(`📝 手动解析完成，提取了 ${knowledgeItems.length} 个知识条目`);
      
      return {
        success: true,
        data: knowledgeItems
      };
    } catch (error) {
      console.error('手动解析失败:', error);
      return {
        success: false,
        error: '手动解析过程中发生错误'
      };
    }
  }

  /**
   * 判断是否像标题
   */
  private static isLikelyTitle(line: string): boolean {
    // 以#开头
    if (line.startsWith('#')) return true;
    
    // 很短且不包含句号
    if (line.length < 50 && !line.includes('。') && !line.includes('.')) {
      // 全大写（对于英文）
      if (line === line.toUpperCase() && /[A-Z]/.test(line)) return true;
      
      // 包含数字序号
      if (/^\d+[\.\)]\s*/.test(line)) return true;
      
      // 包含章节关键词
      if (/^(第|章节|部分|Chapter|Section|\d+\.|一、|二、|三、|四、|五、|六、|七、|八、|九、|十、)/.test(line)) return true;
    }
    
    return false;
  }

  /**
   * 创建手动知识条目
   */
  private static createManualKnowledgeItem(title: string, content: string): KnowledgeItem {
    // 简单的分类逻辑
    let category: KnowledgeItem['category'] = 'terminology';
    if (title.includes('部门') || title.includes('组织') || title.includes('机构')) {
      category = 'department';
    } else if (title.includes('职责') || title.includes('岗位') || title.includes('职位')) {
      category = 'position';
    } else if (title.includes('流程') || title.includes('步骤') || title.includes('程序')) {
      category = 'procedure';
    } else if (title.includes('规定') || title.includes('制度') || title.includes('规章')) {
      category = 'regulation';
    }
    
    // 简单的重要性判断
    let importance: KnowledgeItem['importance'] = 'medium';
    if (title.includes('重要') || title.includes('关键') || title.includes('核心')) {
      importance = 'high';
    } else if (title.includes('辅助') || title.includes('补充') || title.includes('附加')) {
      importance = 'low';
    }
    
    return {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title,
      content: content.length > 500 ? content.substring(0, 500) + '...' : content,
      category: category,
      keywords: this.extractSimpleKeywords(title + ' ' + content),
      importance: importance,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * 简单关键词提取
   */
  private static extractSimpleKeywords(text: string): string[] {
    // 移除标点符号，分割成词
    const words = text.replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
                     .split(/\s+/)
                     .filter(word => word.length > 1);
    
    // 简单的词频统计
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      const normalizedWord = word.toLowerCase();
      wordCount[normalizedWord] = (wordCount[normalizedWord] || 0) + 1;
    });
    
    // 返回出现频率最高的词作为关键词
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * 从文件中解析知识条目
   */
  static async parseFileContent(file: File): Promise<{
    success: boolean;
    data?: KnowledgeItem[];
    error?: string;
  }> {
    try {
      let content = '';
      
      // 根据文件类型解析内容
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        content = await this.readTextFile(file);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // PDF文件暂不支持，需要专门的PDF解析库
        return {
          success: false,
          error: 'PDF文件暂不支持直接解析。请将PDF内容复制到文本文件(.txt)后再上传，或使用支持PDF的工具先转换为文本格式。'
        };
      } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        // Word文档暂不支持，需要专门的解析库
        return {
          success: false,
          error: 'Word文档暂不支持直接解析。请将文档内容复制到文本文件(.txt)后再上传，或另存为文本格式。'
        };
      } else {
        return {
          success: false,
          error: '目前只支持纯文本文件(.txt)。PDF和Word文档请先转换为文本格式后上传。'
        };
      }

      // 验证文本内容质量
      const validationResult = this.validateTextContent(content);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error || '文件内容格式不正确'
        };
      }

      // 使用AI解析文件内容并生成知识条目
      const knowledgeItems = await this.analyzeContentWithAI(content, file.name);
      
      return {
        success: true,
        data: knowledgeItems
      };
    } catch (error) {
      console.error('文件解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '文件解析失败'
      };
    }
  }

  /**
   * 读取文本文件内容
   */
  private static readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * 估算文本的token数量（粗略估算：1 token ≈ 4 字符）
   */
  private static estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * 将大文档分块处理（超小块策略）
   */
  private static splitDocumentIntoChunks(content: string, maxTokensPerChunk: number = 200000): string[] {
    const estimatedTokens = this.estimateTokenCount(content);
    
    if (estimatedTokens <= maxTokensPerChunk) {
      return [content];
    }

    const chunks: string[] = [];
    const maxCharsPerChunk = maxTokensPerChunk * 4; // 粗略转换为字符数
    const lines = content.split('\n');
    
    let currentChunk = '';
    let currentChunkSize = 0;
    
    for (const line of lines) {
      const lineSize = line.length + 1; // +1 for newline
      
      // 如果单行就超过限制，需要强制分割
      if (lineSize > maxCharsPerChunk) {
        // 先提交当前块（如果有内容）
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
          currentChunkSize = 0;
        }
        
        // 将超长行分割成多个块
        const words = line.split(' ');
        let tempLine = '';
        for (const word of words) {
          if ((tempLine + word + ' ').length > maxCharsPerChunk) {
            if (tempLine.length > 0) {
              chunks.push(tempLine.trim());
              tempLine = word + ' ';
            } else {
              // 单个词就超长，强制截断
              const wordChunks = word.match(new RegExp(`.{1,${maxCharsPerChunk - 1}}`, 'g')) || [word];
              wordChunks.forEach((chunk, index) => {
                if (index === wordChunks.length - 1) {
                  tempLine = chunk + ' ';
                } else {
                  chunks.push(chunk);
                }
              });
            }
          } else {
            tempLine += word + ' ';
          }
        }
        if (tempLine.length > 0) {
          currentChunk = tempLine;
          currentChunkSize = tempLine.length;
        }
      } else {
        // 如果添加这一行会超出限制，开始新的块
        if (currentChunkSize + lineSize > maxCharsPerChunk && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = line + '\n';
          currentChunkSize = lineSize;
        } else {
          currentChunk += line + '\n';
          currentChunkSize += lineSize;
        }
      }
    }
    
    // 添加最后一个块
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * 使用AI分析文档内容并生成知识条目
   */
  private static async analyzeContentWithAI(content: string, fileName: string): Promise<KnowledgeItem[]> {
    try {
      // 动态导入AI服务以避免循环依赖
      const { LexiconAIService } = await import('./ai/core-service');
      
      // 检查AI服务是否可用
      console.log('🤖 检查AI服务状态...');
      const isAvailable = await LexiconAIService.isAvailable();
      
      if (!isAvailable) {
        console.log('🔥 AI服务未就绪，正在预热...');
        await LexiconAIService.warmup();
      }

      // 检查文档大小并分块处理
      const estimatedTokens = this.estimateTokenCount(content);
      console.log(`📄 文档大小估算: ${estimatedTokens.toLocaleString()} tokens`);
      
      if (estimatedTokens > 300000) { // 30万token时开始分块，超保守策略
        console.log('📝 文档较大，将分块处理...');
        return await this.analyzeDocumentInChunks(content, fileName);
      }

      // 小文档直接处理
      return await this.analyzeSingleDocument(content, fileName);
      
    } catch (error) {
      console.error('AI分析内容失败:', error);
      
      // 根据错误类型提供更具体的错误信息
      if (error instanceof Error) {
        if (error.message.includes('AI 服务暂时不可用')) {
          throw new Error('AI服务暂时不可用，请稍后重试。如果问题持续，请检查网络连接或联系管理员。');
        } else if (error.message.includes('AI 模型未初始化')) {
          throw new Error('AI服务正在启动中，请稍等几秒后重试。');
        } else if (error.message.includes('token count') && error.message.includes('exceeds')) {
          throw new Error('文档内容过大，请尝试上传较小的文档或将文档拆分成多个文件。');
        } else if (error.message.includes('429') || error.message.includes('Resource exhausted') || error.message.includes('rate limit')) {
          throw new Error('AI服务使用频率过高，请稍等几分钟后重试。如果是大文档，建议分批次上传。');
        } else if (error.message.includes('JSON') || error.message.includes('格式')) {
          throw new Error('AI分析结果格式异常，请尝试重新上传文档或检查文档内容是否清晰完整。');
        } else {
          throw new Error(`AI分析失败: ${error.message}`);
        }
      }
      
      throw new Error('AI分析过程中出现未知错误，请重试或联系技术支持。');
    }
  }

  /**
   * 分析单个文档（小文档）
   */
  private static async analyzeSingleDocument(content: string, fileName: string): Promise<KnowledgeItem[]> {
    const { LexiconAIService } = await import('./ai/core-service');
    
    const prompt = `
请分析以下文档内容，提取出重要的专业知识，并将其整理为结构化的知识条目。

文档名称：${fileName}
文档内容：
${content}

请按照以下JSON格式返回知识条目数组（请只返回JSON，不要包含其他解释文字）：

[
  {
    "title": "知识条目标题",
    "content": "详细的知识内容描述",
    "category": "department|position|terminology|procedure|regulation",
    "keywords": ["关键词1", "关键词2"],
    "importance": "high|medium|low"
  }
]

注意：
1. 每个知识条目应该是独立且完整的
2. 重点提取部门定义、岗位职责、专业术语、工作流程、规章制度等信息
3. 根据内容重要性合理设置importance级别
4. 关键词应该包含中英文术语
5. 最多提取20个最重要的知识条目
    `;

    console.log('🤖 开始AI文档分析...');
    
    try {
      const result = await LexiconAIService.generateText(prompt);
      
      if (!result.success || !result.data) {
        throw new Error('AI解析失败: ' + (result.error || '未知错误'));
      }
      
      return this.parseAIResponse(result.data, fileName);
    } catch (error) {
      console.error(`❌ 单文档分析失败 (${fileName}):`, error);
      throw error;
    }
  }

  /**
   * 超保守全局速率限制控制
   */
  private static async enforceGlobalRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // 如果连续失败次数过多，启用冷却期
    const coolingPeriod = this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES ? 60000 : 0; // 1分钟冷却
    const requiredInterval = this.MIN_REQUEST_INTERVAL + coolingPeriod;
    
    if (timeSinceLastRequest < requiredInterval) {
      const waitTime = requiredInterval - timeSinceLastRequest;
      const waitSeconds = Math.ceil(waitTime/1000);
      
      if (coolingPeriod > 0) {
        console.log(`❄️ 冷却期激活：等待 ${waitSeconds} 秒（连续失败 ${this.consecutiveFailures} 次）...`);
      } else {
        console.log(`🕐 全局速率控制：等待 ${waitSeconds} 秒...`);
      }
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * 超激进重试机制，处理API限制错误，支持AI服务暂停
   */
  private static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 6,
    baseDelay: number = 30000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 在每次尝试前执行全局速率限制
        await this.enforceGlobalRateLimit();
        const result = await operation();
        
        // 成功时重置连续失败计数
        this.consecutiveFailures = 0;
        return result;
      } catch (error: any) {
        const isRateLimitError = error.message?.includes('429') || 
                                error.message?.includes('Resource exhausted') ||
                                error.message?.includes('rate limit');
        
        if (isRateLimitError) {
          // 增加连续失败计数
          this.consecutiveFailures++;
          
          // 如果连续失败15次，暂停AI服务2小时
          if (this.consecutiveFailures >= 15) {
            console.warn(`🚨 连续失败 ${this.consecutiveFailures} 次，暂停AI服务2小时`);
            this.suspendAIService(120); // 暂停2小时
            throw new Error('AI服务因连续失败过多而暂停，请稍后再试或使用手动模式');
          }
          
          // 如果连续失败10次，强烈建议使用手动模式
          if (this.consecutiveFailures >= 10) {
            console.warn(`⚠️ 连续失败 ${this.consecutiveFailures} 次，建议使用手动模式`);
          }
          
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt - 1); // 指数退避
            const delayMinutes = Math.ceil(delay / 60000);
            const delaySeconds = Math.ceil(delay / 1000);
            
            if (delayMinutes >= 1) {
              console.log(`⚡ API限制触发，${delayMinutes}分钟后重试 (尝试 ${attempt}/${maxRetries}, 总失败 ${this.consecutiveFailures})...`);
            } else {
              console.log(`⚡ API限制触发，${delaySeconds}秒后重试 (尝试 ${attempt}/${maxRetries}, 总失败 ${this.consecutiveFailures})...`);
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        throw error;
      }
    }
    throw new Error('重试次数已用完');
  }

  /**
   * 分块分析大文档
   */
  private static async analyzeDocumentInChunks(content: string, fileName: string): Promise<KnowledgeItem[]> {
    const { LexiconAIService } = await import('./ai/core-service');
    
    // 将文档分块（超小块策略）
    const chunks = this.splitDocumentIntoChunks(content, 200000); // 20万token每块
    console.log(`📝 文档已分为 ${chunks.length} 个块进行处理`);
    
    // 调试：验证每个块的大小
    chunks.forEach((chunk, index) => {
      const chunkTokens = this.estimateTokenCount(chunk);
      console.log(`📋 块 ${index + 1} 大小: ${chunkTokens.toLocaleString()} tokens`);
      if (chunkTokens > 250000) { // 如果仍然超过安全限制，发出警告
        console.warn(`⚠️ 警告：块 ${index + 1} 可能仍然过大 (${chunkTokens.toLocaleString()} tokens)`);
      }
    });
    
    const allItems: KnowledgeItem[] = [];
    
    // 逐块处理
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkIndex = i + 1;
      
      console.log(`🤖 正在分析第 ${chunkIndex}/${chunks.length} 块...`);
      
      const chunkPrompt = `
请分析以下文档片段，提取出重要的专业知识，并将其整理为结构化的知识条目。

文档名称：${fileName} (第${chunkIndex}/${chunks.length}部分)
文档内容：
${chunk}

请按照以下JSON格式返回知识条目数组（请只返回JSON，不要包含其他解释文字）：

[
  {
    "title": "知识条目标题",
    "content": "详细的知识内容描述", 
    "category": "department|position|terminology|procedure|regulation",
    "keywords": ["关键词1", "关键词2"],
    "importance": "high|medium|low"
  }
]

注意：
1. 每个知识条目应该是独立且完整的
2. 重点提取部门定义、岗位职责、专业术语、工作流程、规章制度等信息
3. 根据内容重要性合理设置importance级别
4. 关键词应该包含中英文术语
5. 最多提取15个最重要的知识条目
6. 如果这部分内容不包含有价值的知识，可以返回空数组 []
      `;

      try {
        const result = await LexiconAIService.generateText(chunkPrompt);
        
        if (result.success && result.data) {
          const chunkItems = this.parseAIResponse(result.data, `${fileName}-part${chunkIndex}`);
          allItems.push(...chunkItems);
          console.log(`✅ 第 ${chunkIndex} 块分析完成，提取了 ${chunkItems.length} 个知识条目`);
        } else {
          console.warn(`⚠️ 第 ${chunkIndex} 块分析失败: ${result.error}`);
        }
      } catch (error) {
        console.warn(`⚠️ 第 ${chunkIndex} 块分析出错:`, error);
      }
      
      // 全局速率控制已经确保了足够的延迟，无需额外等待
    }
    
    console.log(`✅ 分块分析完成，总共提取了 ${allItems.length} 个知识条目`);
    
    // 如果提取的条目过多，进行去重和优先级筛选
    if (allItems.length > 50) {
      console.log('📋 知识条目较多，进行优化筛选...');
      return this.optimizeKnowledgeItems(allItems);
    }
    
    return allItems;
  }

  /**
   * 解析AI响应
   */
  private static parseAIResponse(aiResponse: string, fileName: string): KnowledgeItem[] {
    console.log('🤖 AI分析完成，正在解析结果...');
    
    // 解析AI返回的JSON
    const cleanResponse = aiResponse.trim();
    let jsonStart = cleanResponse.indexOf('[');
    let jsonEnd = cleanResponse.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      console.error('AI返回内容:', cleanResponse);
      throw new Error('AI返回的格式不正确，无法解析JSON');
    }

    const jsonStr = cleanResponse.substring(jsonStart, jsonEnd);
    let parsedItems;
    
    try {
      parsedItems = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON解析失败:', jsonStr);
      throw new Error('AI返回的JSON格式错误');
    }

    if (!Array.isArray(parsedItems)) {
      throw new Error('AI返回的数据不是数组格式');
    }

    // 转换为KnowledgeItem格式
    const knowledgeItems: KnowledgeItem[] = parsedItems.map((item: any, index: number) => ({
      id: `file-${Date.now()}-${index}`,
      title: item.title || '未命名知识条目',
      content: item.content || '',
      category: this.validateCategory(item.category) || 'terminology',
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      importance: this.validateImportance(item.importance) || 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return knowledgeItems;
  }

  /**
   * 优化知识条目（去重和筛选）
   */
  private static optimizeKnowledgeItems(items: KnowledgeItem[]): KnowledgeItem[] {
    // 按重要性排序
    const sortedItems = items.sort((a, b) => {
      const importanceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });
    
    // 去重（基于标题相似度）
    const uniqueItems: KnowledgeItem[] = [];
    const seenTitles = new Set<string>();
    
    for (const item of sortedItems) {
      const normalizedTitle = item.title.toLowerCase().replace(/[^\w\s]/g, '');
      
      // 检查是否有相似的标题
      let isDuplicate = false;
      for (const seenTitle of seenTitles) {
        if (this.calculateStringSimilarity(normalizedTitle, seenTitle) > 0.8) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        uniqueItems.push(item);
        seenTitles.add(normalizedTitle);
      }
      
      // 限制最大数量
      if (uniqueItems.length >= 30) {
        break;
      }
    }
    
    console.log(`📋 优化完成：从 ${items.length} 个条目中筛选出 ${uniqueItems.length} 个独特条目`);
    return uniqueItems;
  }

  /**
   * 计算字符串相似度
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 验证并标准化类别
   */
  private static validateCategory(category: string): KnowledgeItem['category'] | null {
    const validCategories: KnowledgeItem['category'][] = ['department', 'position', 'terminology', 'procedure', 'regulation'];
    return validCategories.includes(category as any) ? category as KnowledgeItem['category'] : null;
  }

  /**
   * 验证并标准化重要程度
   */
  private static validateImportance(importance: string): KnowledgeItem['importance'] | null {
    const validImportance: KnowledgeItem['importance'][] = ['high', 'medium', 'low'];
    return validImportance.includes(importance as any) ? importance as KnowledgeItem['importance'] : null;
  }

  /**
   * 批量添加知识条目到Firestore
   */
  static async addMultipleKnowledge(knowledgeItems: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<KnowledgeItem[]> {
    try {
      const batch = writeBatch(db);
      const newItems: KnowledgeItem[] = [];
      
      for (const item of knowledgeItems) {
        const docRef = doc(collection(db, this.COLLECTION_NAME));
        const newItem: KnowledgeItem = {
          ...item,
          id: docRef.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // 准备Firestore文档数据
        const firestoreData = {
          ...newItem,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        batch.set(docRef, firestoreData);
        newItems.push(newItem);
      }
      
      await batch.commit();
      console.log('✅ 批量添加知识条目到云端成功');
      
      // 更新本地缓存
      this.knowledgeItems.push(...newItems);
      
      return newItems;
    } catch (error) {
      console.error('❌ 批量添加知识条目失败:', error);
      throw new Error('添加知识条目失败，请检查网络连接');
    }
  }

  /**
   * 获取所有知识条目（从Firestore）
   */
  static async getAllKnowledge(): Promise<KnowledgeItem[]> {
    try {
      await this.ensureInitialized();
      return [...this.knowledgeItems];
    } catch (error) {
      console.error('❌ 获取知识条目失败:', error);
      return this.knowledgeItems; // 返回本地缓存
    }
  }

  /**
   * 获取所有知识条目（同步方法，返回缓存）
   */
  static getAllKnowledgeSync(): KnowledgeItem[] {
    return [...this.knowledgeItems];
  }

  /**
   * 根据类别获取知识条目
   */
  static getKnowledgeByCategory(category: KnowledgeItem['category']): KnowledgeItem[] {
    return this.knowledgeItems.filter(item => item.category === category);
  }

  /**
   * 搜索知识条目
   */
  static searchKnowledge(query: string): KnowledgeItem[] {
    const lowercaseQuery = query.toLowerCase();
    return this.knowledgeItems.filter(item => 
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.content.toLowerCase().includes(lowercaseQuery) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * 确保数据已初始化
   */
  private static async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.loadFromFirestore();
    }
  }

  /**
   * 从Firestore加载所有知识条目
   */
  private static async loadFromFirestore(): Promise<void> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const items: KnowledgeItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          category: data.category,
          keywords: data.keywords || [],
          importance: data.importance,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      this.knowledgeItems = items;
      this.isInitialized = true;
      
      console.log(`✅ 从云端加载了 ${items.length} 条知识条目`);
      
      // 设置实时监听
      this.setupRealtimeListener();
      
    } catch (error) {
      console.error('❌ 从Firestore加载知识条目失败:', error);
      this.isInitialized = true; // 标记为已初始化，避免重复尝试
    }
  }

  /**
   * 设置实时监听器
   */
  private static setupRealtimeListener(): void {
    if (this.unsubscribe) {
      this.unsubscribe(); // 清除现有监听器
    }

    const q = query(
      collection(db, this.COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const items: KnowledgeItem[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          category: data.category,
          keywords: data.keywords || [],
          importance: data.importance,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      this.knowledgeItems = items;
      console.log('🔄 知识库已实时同步');
    }, (error) => {
      console.error('❌ 实时监听失败:', error);
    });
  }

  /**
   * 添加新的知识条目到Firestore
   */
  static async addKnowledge(knowledge: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeItem> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...knowledge,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const newItem: KnowledgeItem = {
        ...knowledge,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('✅ 知识条目已添加到云端');
      return newItem;
    } catch (error) {
      console.error('❌ 添加知识条目失败:', error);
      throw new Error('添加知识条目失败，请检查网络连接');
    }
  }

  /**
   * 更新知识条目到Firestore
   */
  static async updateKnowledge(id: string, updates: Partial<Omit<KnowledgeItem, 'id' | 'createdAt'>>): Promise<boolean> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ 知识条目已更新到云端');
      return true;
    } catch (error) {
      console.error('❌ 更新知识条目失败:', error);
      return false;
    }
  }

  /**
   * 删除知识条目从Firestore
   */
  static async deleteKnowledge(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
      
      console.log('✅ 知识条目已从云端删除');
      return true;
    } catch (error) {
      console.error('❌ 删除知识条目失败:', error);
      return false;
    }
  }

  /**
   * 获取AI系统提示的知识库上下文
   */
  static async getSystemContext(): Promise<string> {
    await this.ensureInitialized();
    
    const highImportanceItems = this.knowledgeItems.filter(item => item.importance === 'high');
    const context = highImportanceItems.map(item => `${item.title}: ${item.content}`).join('\n\n');
    
    return `
重要专业知识库：

${context}

请基于以上专业知识库回答问题，确保信息的准确性。如果涉及具体的部门、岗位或专业术语，请参考知识库中的定义。
    `;
  }

  /**
   * 获取AI系统提示的知识库上下文（同步版本，使用缓存）
   */
  static getSystemContextSync(): string {
    const highImportanceItems = this.knowledgeItems.filter(item => item.importance === 'high');
    const context = highImportanceItems.map(item => `${item.title}: ${item.content}`).join('\n\n');
    
    return `
重要专业知识库：

${context}

请基于以上专业知识库回答问题，确保信息的准确性。如果涉及具体的部门、岗位或专业术语，请参考知识库中的定义。
    `;
  }

  /**
   * 初始化知识库（从Firestore加载）
   */
  static async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      await this.loadFromFirestore();
    } catch (error) {
      console.error('❌ 初始化知识库失败:', error);
    }
  }

  /**
   * 清理资源
   */
  static cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.isInitialized = false;
  }

  /**
   * 验证文本内容质量，避免处理二进制数据
   */
  private static validateTextContent(content: string): { isValid: boolean; error?: string } {
    if (!content || !content.trim()) {
      return { isValid: false, error: '文件内容为空或无法读取' };
    }

    // 检查文本长度
    if (content.length < 50) {
      return { isValid: false, error: '文件内容过少，请确保文档包含足够的文本内容' };
    }

    // 检查是否包含大量控制字符或二进制数据
    const controlCharCount = (content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g) || []).length;
    const controlCharRatio = controlCharCount / content.length;
    
    if (controlCharRatio > 0.1) {
      return { isValid: false, error: '文件似乎包含二进制数据或损坏。请确保上传的是纯文本文件，或将PDF/Word文档转换为文本格式后再上传。' };
    }

    // 检查是否包含过多特殊字符（可能是编码问题）
    const specialCharCount = (content.match(/[^\w\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef.,;:!?()[\]{}"'`~@#$%^&*+=|\\/<>-]/g) || []).length;
    const specialCharRatio = specialCharCount / content.length;
    
    if (specialCharRatio > 0.3) {
      return { isValid: false, error: '文件包含过多特殊字符，可能是编码问题或文件损坏。请检查文件编码是否为UTF-8。' };
    }

    // 检查是否包含典型的PDF标记（说明可能是PDF二进制内容）
    const pdfMarkers = ['endstream', 'endobj', 'xref', '%%EOF', '/Length', '/Filter'];
    const hasPdfMarkers = pdfMarkers.some(marker => content.includes(marker));
    
    if (hasPdfMarkers) {
      return { isValid: false, error: '检测到PDF格式标记。请不要直接上传PDF文件，而是将PDF内容复制为文本或使用PDF转文本工具。' };
    }

    // 检查是否包含Word文档标记
    const wordMarkers = ['Microsoft Office', 'Content-Type:', 'application/vnd'];
    const hasWordMarkers = wordMarkers.some(marker => content.includes(marker));
    
    if (hasWordMarkers) {
      return { isValid: false, error: '检测到Word文档格式标记。请将Word文档内容复制为纯文本，或另存为.txt格式。' };
    }

    return { isValid: true };
  }

  /**
   * 清理可能的乱码知识条目
   */
  static async cleanupCorruptedEntries(): Promise<{
    success: boolean;
    deletedCount: number;
    error?: string;
  }> {
    try {
      await this.ensureInitialized();
      
      const corruptedItems: string[] = [];
      
      for (const item of this.knowledgeItems) {
        // 检查标题是否包含大量特殊字符
        const titleSpecialChars = (item.title.match(/[^\w\s\u4e00-\u9fff.,;:!?()\[\]{}"'\-]/g) || []).length;
        const titleSpecialRatio = titleSpecialChars / item.title.length;
        
        // 检查内容是否包含PDF标记
        const hasPdfMarkers = ['endstream', 'endobj', 'xref', '%%EOF', '/Length', '/Filter'].some(marker => 
          item.content.includes(marker) || item.title.includes(marker)
        );
        
        // 检查是否包含大量控制字符
        const controlCharCount = (item.content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g) || []).length;
        const controlCharRatio = controlCharCount / item.content.length;
        
        // 如果符合乱码特征，标记为需要删除
        if (titleSpecialRatio > 0.3 || hasPdfMarkers || controlCharRatio > 0.1) {
          corruptedItems.push(item.id);
          console.log(`🗑️ 发现疑似乱码条目: ${item.title.substring(0, 50)}...`);
        }
      }
      
      if (corruptedItems.length === 0) {
        return {
          success: true,
          deletedCount: 0
        };
      }
      
      console.log(`🧹 开始清理 ${corruptedItems.length} 个乱码条目...`);
      
      // 批量删除乱码条目
      let successCount = 0;
      for (const itemId of corruptedItems) {
        try {
          const success = await this.deleteKnowledge(itemId);
          if (success) {
            successCount++;
          }
        } catch (error) {
          console.error(`删除条目 ${itemId} 失败:`, error);
        }
      }
      
      console.log(`✅ 清理完成，成功删除 ${successCount} 个乱码条目`);
      
      return {
        success: true,
        deletedCount: successCount
      };
      
    } catch (error) {
      console.error('清理乱码条目失败:', error);
      return {
        success: false,
        deletedCount: 0,
        error: error instanceof Error ? error.message : '清理失败'
      };
    }
  }
}

// 页面卸载时清理资源
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    KnowledgeBase.cleanup();
  });
} 