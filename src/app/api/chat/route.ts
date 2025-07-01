import { NextRequest, NextResponse } from 'next/server';
import { LexiconAIService } from '../../../lib/ai/core-service';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    console.log('🔍 AI聊天测试请求:', messages?.length || 0, '条消息');
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({
        success: false,
        error: '无效的消息格式'
      }, { status: 400 });
    }

    // 转换消息格式为ConversationMessage
    const conversationHistory = messages.map((msg, index) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    console.log('转换后的对话历史:', conversationHistory.map(m => `${m.role}: ${m.parts[0].text.substring(0, 50)}...`));

    // 使用LexiconAIService生成回复
    const result = await LexiconAIService.generateChatResponse(conversationHistory);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'AI对话生成失败'
      });
    }

  } catch (error) {
    console.error('聊天API错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 });
  }
} 