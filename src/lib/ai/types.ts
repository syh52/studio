// AI服务通用类型定义

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface ConversationMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GenerationConfig {
  maxOutputTokens?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
}

export interface UserProfile {
  level: string;
  goals: string[];
  availableTime: number;
  weakAreas?: string[];
}

export interface VocabularyParseResult {
  vocabulary: Array<{
    english: string;
    chinese: string;
    explanation: string;
  }>;
}

export interface DialogueParseResult {
  dialogues: Array<{
    title: string;
    description: string;
    lines: Array<{
      speaker: string;
      english: string;
      chinese: string;
    }>;
  }>;
}

export interface SmartContentResult {
  contentType: 'vocabulary' | 'dialogue' | 'mixed';
  vocabulary: Array<{
    english: string;
    chinese: string;
    explanation: string;
  }>;
  dialogues: Array<{
    title: string;
    description: string;
    lines: Array<{
      speaker: string;
      english: string;
      chinese: string;
    }>;
  }>;
} 