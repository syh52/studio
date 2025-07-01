import { NextRequest, NextResponse } from 'next/server';
import { firebaseAIManager } from '../../../lib/ai-providers/ai-provider-manager';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    console.log(`🔍 Firebase AI Logic测试请求, 消息: "${message}"`);
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: '缺少测试消息'
      }, { status: 400 });
    }

    // 测试Firebase AI Logic
    try {
      const result = await firebaseAIManager.generateText(`测试消息: ${message}`);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          data: result.data,
          provider: 'firebase-ai',
          status: firebaseAIManager.getStatus()
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error || 'Firebase AI Logic测试失败',
          provider: 'firebase-ai',
          status: firebaseAIManager.getStatus()
        });
      }
    } catch (error) {
      console.error('Firebase AI Logic测试失败:', error);
      
      // 获取诊断信息
      const diagnosis = await firebaseAIManager.diagnose();
      
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Firebase AI Logic连接失败',
        provider: 'firebase-ai',
        status: firebaseAIManager.getStatus(),
        diagnosis
      });
    }

  } catch (error) {
    console.error('AI测试API错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 });
  }
} 