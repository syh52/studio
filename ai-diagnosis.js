/**
 * AI 智能对话功能诊断脚本
 * 检查各种可能导致对话功能失效的问题
 */

console.log('🔍 AI 智能对话功能诊断开始...\n');

// 1. 检查环境变量
console.log('1️⃣ 检查环境变量配置');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_DEEPSEEK_API_KEY:', process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ? '已配置' : '❌ 未配置');
console.log('');

// 2. 检查代理配置
console.log('2️⃣ 检查代理服务状态');
const proxyUrl = 'https://api.lexiconlab.cn/';

async function checkProxy() {
  try {
    const response = await fetch(proxyUrl);
    const data = await response.json();
    console.log('✅ 代理服务状态:', data.status);
    console.log('📡 代理服务:', data.service);
    console.log('🕐 时间戳:', data.timestamp);
    return true;
  } catch (error) {
    console.log('❌ 代理服务连接失败:', error.message);
    return false;
  }
}

// 3. 检查Google AI可用性
console.log('3️⃣ 检查Google AI状态');
async function checkGoogleAI() {
  try {
    // 模拟检查Google AI
    const endpoint = 'https://api.lexiconlab.cn/aiplatform.googleapis.com/v1/projects/aviation-lexicon-trainer/locations/us-central1/publishers/google/models/gemini-2.5-pro:generateContent';
    
    const testPayload = {
      contents: [{
        role: 'user',
        parts: [{ text: '测试连接' }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    if (response.ok) {
      console.log('✅ Google AI (Gemini) 可访问');
      return true;
    } else {
      console.log('❌ Google AI 响应错误:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Google AI 连接失败:', error.message);
    return false;
  }
}

// 4. 检查DeepSeek可用性
console.log('4️⃣ 检查DeepSeek状态');
async function checkDeepSeek() {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.log('❌ DeepSeek API密钥未配置');
    return false;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: '测试连接' }],
        max_tokens: 50,
      }),
    });

    if (response.ok) {
      console.log('✅ DeepSeek API 可访问');
      return true;
    } else {
      console.log('❌ DeepSeek API 响应错误:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ DeepSeek API 连接失败:', error.message);
    return false;
  }
}

// 5. 网络连接检查
console.log('5️⃣ 检查网络连接');
async function checkNetworkConnectivity() {
  const testUrls = [
    'https://www.google.com',
    'https://api.deepseek.com',
    'https://firebase.googleapis.com'
  ];

  for (const url of testUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      console.log(`✅ ${new URL(url).hostname} 可访问`);
    } catch (error) {
      console.log(`❌ ${new URL(url).hostname} 不可访问:`, error.message);
    }
  }
}

// 主诊断函数
async function runDiagnosis() {
  console.log('开始运行诊断...\n');
  
  const proxyOk = await checkProxy();
  console.log('');
  
  const googleAIok = await checkGoogleAI();
  console.log('');
  
  const deepSeekOk = await checkDeepSeek();
  console.log('');
  
  await checkNetworkConnectivity();
  console.log('');
  
  // 诊断结果
  console.log('📊 诊断结果汇总:');
  console.log('================');
  console.log('代理服务:', proxyOk ? '✅ 正常' : '❌ 异常');
  console.log('Google AI:', googleAIok ? '✅ 可用' : '❌ 不可用');
  console.log('DeepSeek:', deepSeekOk ? '✅ 可用' : '❌ 不可用');
  console.log('');
  
  // 建议
  console.log('💡 修复建议:');
  console.log('==========');
  
  if (!proxyOk) {
    console.log('🔧 代理服务问题:');
    console.log('   - 检查Cloudflare Worker是否正常部署');
    console.log('   - 确认域名 api.lexiconlab.cn 可访问');
  }
  
  if (!googleAIok && !deepSeekOk) {
    console.log('🔧 所有AI服务不可用:');
    console.log('   - 检查网络连接');
    console.log('   - 配置DeepSeek API密钥作为备用');
    console.log('   - 检查Firebase项目权限');
  } else if (!googleAIok) {
    console.log('🔧 Google AI不可用:');
    console.log('   - DeepSeek可用，系统会自动切换');
    console.log('   - 检查Firebase AI权限和配额');
  } else if (!deepSeekOk) {
    console.log('🔧 DeepSeek不可用:');
    console.log('   - Google AI可用，无需处理');
    console.log('   - 如需备用，请配置NEXT_PUBLIC_DEEPSEEK_API_KEY');
  }
  
  if (googleAIok || deepSeekOk) {
    console.log('✅ 至少有一个AI服务可用，智能对话功能应该正常');
  } else {
    console.log('❌ 没有可用的AI服务，智能对话功能将无法使用');
  }
  
  console.log('\n🔍 诊断完成！');
}

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  // 在浏览器中，这些函数会被调用
  runDiagnosis().catch(console.error);
}

// 导出给浏览器使用
if (typeof window !== 'undefined') {
  window.aiDiagnosis = {
    checkProxy,
    checkGoogleAI,
    checkDeepSeek,
    checkNetworkConnectivity,
    runDiagnosis
  };
} 