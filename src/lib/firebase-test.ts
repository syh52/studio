// Firebase 配置测试文件
// 这个文件用于测试 Firebase 配置是否正确

export function testFirebaseConfig() {
  console.log('🔍 Firebase 配置测试');
  console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ 已设置' : '❌ 未设置');
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ 已设置' : '❌ 未设置');
  console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ 已设置' : '❌ 未设置');
  console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ 已设置' : '❌ 未设置');
  console.log('Messaging Sender ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ 已设置' : '❌ 未设置');
  console.log('App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ 已设置' : '❌ 未设置');
  
  // 返回配置对象（隐藏敏感信息）
  return {
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    apiKeyPreview: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10) + '...' : 'N/A'
  };
} 