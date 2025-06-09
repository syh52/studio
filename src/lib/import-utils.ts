import { VocabularyItem, VocabularyPack, Dialogue, DialogueLine } from './data';

// 支持的文件类型
export const SUPPORTED_FILE_TYPES = {
  EXCEL: '.xlsx',
  CSV: '.csv',
  JSON: '.json'
};

// 词汇数据验证
export interface VocabularyValidationResult {
  isValid: boolean;
  errors: string[];
  data?: VocabularyItem;
}

// 对话数据验证
export interface DialogueValidationResult {
  isValid: boolean;
  errors: string[];
  data?: Dialogue;
}

// 导入结果
export interface ImportResult {
  success: boolean;
  message: string;
  details: {
    successful: number;
    failed: number;
    duplicates: number;
    errors: string[];
  };
}

// 生成唯一ID
export function generateId(prefix: string, existingIds: string[]): string {
  let counter = 1;
  let newId: string;
  
  do {
    newId = `${prefix}${counter.toString().padStart(3, '0')}`;
    counter++;
  } while (existingIds.includes(newId));
  
  return newId;
}

// 验证词汇数据
export function validateVocabularyItem(item: any, index: number): VocabularyValidationResult {
  const errors: string[] = [];
  
  // 必填字段验证
  if (!item.english || typeof item.english !== 'string' || item.english.trim() === '') {
    errors.push(`第${index + 1}行: 英文单词不能为空`);
  }
  
  if (!item.chinese || typeof item.chinese !== 'string' || item.chinese.trim() === '') {
    errors.push(`第${index + 1}行: 中文翻译不能为空`);
  }
  
  if (!item.exampleSentenceEn || typeof item.exampleSentenceEn !== 'string' || item.exampleSentenceEn.trim() === '') {
    errors.push(`第${index + 1}行: 英文例句不能为空`);
  }
  
  if (!item.exampleSentenceZh || typeof item.exampleSentenceZh !== 'string' || item.exampleSentenceZh.trim() === '') {
    errors.push(`第${index + 1}行: 中文例句不能为空`);
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // 构建标准化的词汇项
  const vocabularyItem: VocabularyItem = {
    id: item.id || generateId('vt', []), // 如果没有ID则生成
    english: item.english.trim(),
    chinese: item.chinese.trim(),
    partOfSpeech: item.partOfSpeech || '',
    exampleSentenceEn: item.exampleSentenceEn.trim(),
    exampleSentenceZh: item.exampleSentenceZh.trim(),
    pronunciationAudio: item.pronunciationAudio || '',
    additionalExamples: parseAdditionalExamples(item.additionalExamples),
    commonUsages: parseCommonUsages(item.commonUsages)
  };
  
  return { isValid: true, errors: [], data: vocabularyItem };
}

// 验证对话数据
export function validateDialogue(item: any, index: number): DialogueValidationResult {
  const errors: string[] = [];
  
  // 必填字段验证
  if (!item.title || typeof item.title !== 'string' || item.title.trim() === '') {
    errors.push(`对话${index + 1}: 标题不能为空`);
  }
  
  if (!item.description || typeof item.description !== 'string' || item.description.trim() === '') {
    errors.push(`对话${index + 1}: 描述不能为空`);
  }
  
  if (!item.lines || !Array.isArray(item.lines) || item.lines.length === 0) {
    errors.push(`对话${index + 1}: 对话行不能为空`);
  } else {
    // 验证每一行对话
    item.lines.forEach((line: any, lineIndex: number) => {
      if (!line.speaker || typeof line.speaker !== 'string' || line.speaker.trim() === '') {
        errors.push(`对话${index + 1}第${lineIndex + 1}行: 说话人不能为空`);
      }
      if (!line.english || typeof line.english !== 'string' || line.english.trim() === '') {
        errors.push(`对话${index + 1}第${lineIndex + 1}行: 英文不能为空`);
      }
      if (!line.chinese || typeof line.chinese !== 'string' || line.chinese.trim() === '') {
        errors.push(`对话${index + 1}第${lineIndex + 1}行: 中文不能为空`);
      }
    });
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // 构建标准化的对话
  const dialogue: Dialogue = {
    id: item.id || generateId('dialogue-', []),
    title: item.title.trim(),
    description: item.description.trim(),
    icon: item.icon || 'MessageCircle',
    lines: item.lines.map((line: any, lineIndex: number) => ({
      id: line.id || `d${index + 1}-line-${lineIndex + 1}`,
      speaker: line.speaker.trim(),
      english: line.english.trim(),
      chinese: line.chinese.trim(),
      audio: line.audio || ''
    }))
  };
  
  return { isValid: true, errors: [], data: dialogue };
}

// 解析附加例句
function parseAdditionalExamples(examples: any): Array<{english: string, chinese: string}> {
  if (!examples) return [];
  
  if (typeof examples === 'string') {
    try {
      return JSON.parse(examples);
    } catch {
      return [];
    }
  }
  
  if (Array.isArray(examples)) {
    return examples.filter(ex => ex.english && ex.chinese);
  }
  
  return [];
}

// 解析常用搭配
function parseCommonUsages(usages: any): Array<{phrase: string, translation: string, example?: string}> {
  if (!usages) return [];
  
  if (typeof usages === 'string') {
    try {
      return JSON.parse(usages);
    } catch {
      return [];
    }
  }
  
  if (Array.isArray(usages)) {
    return usages.filter(usage => usage.phrase && usage.translation);
  }
  
  return [];
}

// CSV解析
export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const item: any = {};
    
    headers.forEach((header, index) => {
      item[header] = values[index] || '';
    });
    
    data.push(item);
  }
  
  return data;
}

// 解析CSV行（处理引号和逗号）
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Excel解析（使用SheetJS库）
export async function parseExcel(file: File): Promise<any[]> {
  try {
    // 动态导入xlsx库
    const XLSX = await import('xlsx');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // 读取第一个工作表
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // 转换为JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Excel文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`));
        }
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    throw new Error('Excel解析功能不可用，请使用CSV或JSON格式。如需Excel支持，请确保xlsx包已正确安装。');
  }
}

// 检测重复项
export function findDuplicates(newItems: VocabularyItem[], existingItems: VocabularyItem[]): string[] {
  const existingEnglish = new Set(existingItems.map(item => item.english.toLowerCase()));
  const duplicates: string[] = [];
  
  newItems.forEach(item => {
    if (existingEnglish.has(item.english.toLowerCase())) {
      duplicates.push(item.english);
    }
  });
  
  return duplicates;
}

// 生成导入模板数据
export function generateVocabularyTemplate(): VocabularyItem[] {
  return [
    {
      id: 'vt001',
      english: 'Example Word',
      chinese: '示例单词',
      partOfSpeech: 'noun',
      exampleSentenceEn: 'This is an example sentence.',
      exampleSentenceZh: '这是一个示例句子。',
      pronunciationAudio: '',
      additionalExamples: [
        {
          english: 'Another example sentence.',
          chinese: '另一个示例句子。'
        }
      ],
      commonUsages: [
        {
          phrase: 'example phrase',
          translation: '示例短语',
          example: 'This is how you use the phrase.'
        }
      ]
    }
  ];
}

export function generateDialogueTemplate(): Dialogue[] {
  return [
    {
      id: 'dialogue-example',
      title: '示例对话',
      description: '这是一个示例对话，展示如何格式化对话数据。',
      icon: 'MessageCircle',
      lines: [
        {
          id: 'line-1',
          speaker: 'Security Officer',
          english: 'Good morning, may I help you?',
          chinese: '早上好，我可以帮助您吗？',
          audio: ''
        },
        {
          id: 'line-2',
          speaker: 'Passenger',
          english: 'Yes, I have a question about my seat.',
          chinese: '是的，我对我的座位有个问题。',
          audio: ''
        }
      ]
    }
  ];
}

// 将数据转换为CSV格式（支持中文，添加UTF-8 BOM）
export function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      let value = row[header];
      
      // 处理数组和对象类型（如additionalExamples, commonUsages）
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        value = JSON.stringify(value);
      }
      
      // 转换为字符串
      value = String(value || '');
      
      // 处理包含逗号、引号或换行符的值
      if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  // 添加UTF-8 BOM以确保在Windows Excel中正确显示中文
  const csvContent = csvRows.join('\n');
  return '\uFEFF' + csvContent;
}

// 下载文件（通用函数）
export function downloadFile(content: string, filename: string, mimeType: string) {
  // 为CSV文件使用特殊的MIME类型和编码
  if (filename.endsWith('.csv')) {
    downloadCSVFile(content, filename);
    return;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 专门的CSV文件下载函数（确保UTF-8编码）
export function downloadCSVFile(csvContent: string, filename: string) {
  // 确保内容包含UTF-8 BOM
  const content = csvContent.startsWith('\uFEFF') ? csvContent : '\uFEFF' + csvContent;
  
  // 使用正确的MIME类型和UTF-8编码
  const blob = new Blob([content], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 