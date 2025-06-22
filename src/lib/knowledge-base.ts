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
        // PDF解析 - 这里先用简单的文本提取，实际项目中可能需要pdf.js
        content = await this.readTextFile(file); // 临时方案
      } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        // Word文档解析 - 这里先用简单的文本提取
        content = await this.readTextFile(file); // 临时方案
      } else {
        return {
          success: false,
          error: '不支持的文件格式。请上传 .txt、.pdf 或 .docx 文件'
        };
      }

      if (!content.trim()) {
        return {
          success: false,
          error: '文件内容为空或无法读取'
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
   * 使用AI分析文档内容并生成知识条目
   */
  private static async analyzeContentWithAI(content: string, fileName: string): Promise<KnowledgeItem[]> {
    try {
      // 动态导入AI服务以避免循环依赖
      const { LexiconAIService } = await import('./ai-service');
      
      // 检查AI服务是否可用
      console.log('🤖 检查AI服务状态...');
      const coreService = await import('./ai/core-service');
      const isAvailable = await coreService.LexiconAIService.isAvailable();
      
      if (!isAvailable) {
        console.log('🔥 AI服务未就绪，正在预热...');
        await coreService.LexiconAIService.warmup();
      }
      
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
      const result = await LexiconAIService.generateText(prompt);
      
      if (!result.success || !result.data) {
        throw new Error('AI解析失败: ' + (result.error || '未知错误'));
      }

      console.log('🤖 AI分析完成，正在解析结果...');
      
      // 解析AI返回的JSON
      const aiResponse = result.data.trim();
      let jsonStart = aiResponse.indexOf('[');
      let jsonEnd = aiResponse.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        console.error('AI返回内容:', aiResponse);
        throw new Error('AI返回的格式不正确，无法解析JSON');
      }

      const jsonStr = aiResponse.substring(jsonStart, jsonEnd);
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

      console.log(`✅ 成功解析出 ${knowledgeItems.length} 个知识条目`);
      return knowledgeItems;
      
    } catch (error) {
      console.error('AI分析内容失败:', error);
      
      // 根据错误类型提供更具体的错误信息
      if (error instanceof Error) {
        if (error.message.includes('AI 服务暂时不可用')) {
          throw new Error('AI服务暂时不可用，请稍后重试。如果问题持续，请检查网络连接或联系管理员。');
        } else if (error.message.includes('AI 模型未初始化')) {
          throw new Error('AI服务正在启动中，请稍等几秒后重试。');
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
}

// 页面卸载时清理资源
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    KnowledgeBase.cleanup();
  });
} 