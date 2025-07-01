import { NextRequest, NextResponse } from 'next/server';
import { aiProviderManager } from '../../../lib/ai-providers/ai-provider-manager';

export async function POST(req: NextRequest) {
  try {
    const { provider, message } = await req.json();
    
    console.log(`🔍 AI测试请求: ${provider}, 消息: "${message}"`);
    
    if (!provider || !message) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 });
    }

    // 根据提供商类型进行测试
    if (provider === 'google') {
      try {
        // 测试Google AI
        const result = await aiProviderManager.generateText(`测试消息: ${message}`);
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            data: result.data,
            provider: 'google'
          });
        } else {
          return NextResponse.json({
            success: false,
            error: result.error || 'Google AI测试失败',
            provider: 'google'
          });
        }
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Google AI连接失败',
          provider: 'google'
        });
      }
    } else if (provider === 'deepseek') {
      try {
        // 临时切换到DeepSeek进行测试
        const originalProvider = aiProviderManager.getCurrentProvider();
        const switched = aiProviderManager.setProvider('deepseek');
        
        if (!switched) {
          return NextResponse.json({
            success: false,
            error: 'DeepSeek服务不可用或未配置',
            provider: 'deepseek'
          });
        }

        const result = await aiProviderManager.generateText(`测试消息: ${message}`);
        
        // 恢复原提供商
        aiProviderManager.setProvider(originalProvider);
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            data: result.data,
            provider: 'deepseek'
          });
        } else {
          return NextResponse.json({
            success: false,
            error: result.error || 'DeepSeek测试失败',
            provider: 'deepseek'
          });
        }
      } catch (error) {
        // 确保恢复原提供商
        try {
          const originalProvider = aiProviderManager.getCurrentProvider();
          aiProviderManager.setProvider(originalProvider);
        } catch (e) {
          // 忽略恢复错误
        }
        
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'DeepSeek连接失败',
          provider: 'deepseek'
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: `不支持的提供商: ${provider}`
      }, { status: 400 });
    }

  } catch (error) {
    console.error('AI测试API错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 });
  }
} 