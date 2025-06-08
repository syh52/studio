const fs = require('fs');
const path = require('path');

// 模拟配置内容
const mockConfig = `# Firebase 配置
# 这是模拟配置，仅用于让应用启动。请替换为真实的 Firebase 配置。
# 
# 要获取真实配置：
# 1. 访问 https://console.firebase.google.com/
# 2. 创建新项目或选择现有项目
# 3. 在项目设置中找到 Web 应用配置
# 4. 将下面的值替换为真实值

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDMOCKLINVALIDKEYFORTESTING12345678
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lexicon-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lexicon-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lexicon-demo.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
`;

const envPath = path.join(__dirname, '.env.local');

// 检查文件是否已存在
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local 文件已存在！');
  console.log('当前内容：');
  console.log(fs.readFileSync(envPath, 'utf8'));
} else {
  // 创建文件
  fs.writeFileSync(envPath, mockConfig);
  console.log('✅ 已创建 .env.local 文件（模拟配置）');
  console.log('\n文件内容：');
  console.log(mockConfig);
  console.log('\n⚠️  注意：这是模拟配置，只能让应用启动，无法使用真实的 Firebase 功能。');
  console.log('\n🚀 请重启开发服务器以应用配置：');
  console.log('   按 Ctrl+C 停止服务器');
  console.log('   然后运行: npm run dev');
} 