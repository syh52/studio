/**
 * Firebase AI Logic 诊断脚本
 * 专门检查Firebase AI Logic SDK相关问题
 */

console.log('🔍 Firebase AI Logic 诊断开始...\n');

// 1. 检查环境变量
console.log('1️⃣ 检查环境配置');
console.log('NODE_ENV:', process.env.NODE_ENV);
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

// 3. 检查Firebase AI Logic可用性
console.log('3️⃣ 检查Firebase AI Logic状态');
async function checkFirebaseAI() {
  try {
    // 检查Firebase AI Logic端点
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
      const result = await response.json();
      console.log('✅ Firebase AI Logic 可访问');
      console.log('📝 测试回复:', result.candidates?.[0]?.content?.parts?.[0]?.text || '无回复内容');
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Firebase AI Logic 响应错误:', response.status, response.statusText);
      console.log('📄 错误详情:', errorText);
      
      // 分析具体错误类型
      if (response.status === 401) {
        console.log('🔐 认证问题诊断:');
        console.log('   - 检查Firebase项目权限');
        console.log('   - 验证Firebase AI Logic API是否已启用');
        console.log('   - 检查项目配额和计费状态');
      } else if (response.status === 403) {
        console.log('🚫 权限问题诊断:');
        console.log('   - Firebase AI Logic API可能未启用');
        console.log('   - 检查项目权限配置');
        console.log('   - 验证地区限制');
      } else if (response.status >= 500) {
        console.log('🔧 服务器问题:');
        console.log('   - Firebase AI Logic服务暂时不可用');
        console.log('   - 稍后重试');
      }
      
      return false;
    }
  } catch (error) {
    console.log('❌ Firebase AI Logic 连接失败:', error.message);
    console.log('🔧 网络问题诊断:');
    console.log('   - 检查网络连接');
    console.log('   - 验证代理服务状态');
    console.log('   - 检查防火墙设置');
    return false;
  }
}

// 4. 检查Firebase项目配置
console.log('4️⃣ 检查Firebase项目配置');
async function checkFirebaseProject() {
  try {
    // 检查Firebase配置
    const projectId = 'aviation-lexicon-trainer';
    const region = 'us-central1';
    
    console.log('📋 项目信息:');
    console.log('   项目ID:', projectId);
    console.log('   地区:', region);
    console.log('   模型:', 'gemini-2.5-pro');
    
    // 尝试访问Firebase项目基础信息
    const projectUrl = `https://api.lexiconlab.cn/firebase.googleapis.com/v1beta1/projects/${projectId}`;
    
    try {
      const response = await fetch(projectUrl);
      if (response.ok) {
        console.log('✅ Firebase项目配置正常');
        return true;
      } else {
        console.log('⚠️ Firebase项目配置检查失败:', response.status);
        return false;
      }
    } catch (error) {
      console.log('⚠️ 无法检查Firebase项目配置:', error.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Firebase项目配置检查异常:', error.message);
    return false;
  }
}

// 5. 网络连接检查
console.log('5️⃣ 检查网络连接');
async function checkNetworkConnectivity() {
  const testUrls = [
    'https://firebase.googleapis.com',
    'https://aiplatform.googleapis.com',
    'https://www.googleapis.com'
  ];

  let reachableCount = 0;
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      console.log(`✅ ${new URL(url).hostname} 可访问`);
      reachableCount++;
    } catch (error) {
      console.log(`❌ ${new URL(url).hostname} 不可访问:`, error.message);
    }
  }
  
  return reachableCount > 0;
}

// 主诊断函数
async function runDiagnosis() {
  console.log('开始运行诊断...\n');
  
  const proxyOk = await checkProxy();
  console.log('');
  
  const firebaseAIok = await checkFirebaseAI();
  console.log('');
  
  const projectOk = await checkFirebaseProject();
  console.log('');
  
  const networkOk = await checkNetworkConnectivity();
  console.log('');
  
  // 诊断结果
  console.log('📊 诊断结果汇总:');
  console.log('================');
  console.log('代理服务:', proxyOk ? '✅ 正常' : '❌ 异常');
  console.log('Firebase AI Logic:', firebaseAIok ? '✅ 可用' : '❌ 不可用');
  console.log('Firebase项目:', projectOk ? '✅ 正常' : '⚠️ 未知');
  console.log('网络连接:', networkOk ? '✅ 正常' : '❌ 异常');
  console.log('');
  
  // 修复建议
  console.log('💡 修复建议:');
  console.log('==========');
  
  if (!proxyOk) {
    console.log('🔧 代理服务问题:');
    console.log('   - 检查Cloudflare Worker是否正常部署');
    console.log('   - 确认域名 api.lexiconlab.cn 可访问');
  }
  
  if (!firebaseAIok) {
    console.log('🔧 Firebase AI Logic问题:');
    console.log('   - 检查Firebase项目权限和配置');
    console.log('   - 验证Firebase AI Logic API是否已启用');
    console.log('   - 检查API配额和计费状态');
    console.log('   - 确认项目ID和地区设置正确');
    console.log('   - 查看Firebase控制台中的API使用情况');
  }
  
  if (!networkOk) {
    console.log('🔧 网络连接问题:');
    console.log('   - 检查网络连接状态');
    console.log('   - 验证防火墙和代理设置');
    console.log('   - 尝试使用VPN或其他网络');
  }
  
  if (firebaseAIok) {
    console.log('✅ Firebase AI Logic服务正常，智能对话功能应该可用');
  } else {
    console.log('❌ Firebase AI Logic服务不可用，需要解决上述问题');
  }
  
  console.log('\n🎯 下一步行动:');
  console.log('1. 访问 https://console.firebase.google.com/project/aviation-lexicon-trainer');
  console.log('2. 检查 Vertex AI 和 AI Logic API 状态');
  console.log('3. 验证项目计费和配额设置');
  console.log('4. 如问题持续，请联系技术支持');
  
  console.log('\n🔍 诊断完成！');
}

// 如果在Node.js环境中运行
if (typeof window === 'undefined') {
  runDiagnosis().catch(console.error);
}

// 导出给浏览器使用
if (typeof window !== 'undefined') {
  window.firebaseAIDiagnosis = {
    checkProxy,
    checkFirebaseAI,
    checkFirebaseProject,
    checkNetworkConnectivity,
    runDiagnosis
  };
} 