const fs = require('fs');
const path = require('path');

// 模拟配置（用于快速启动）
const mockConfig = `# Firebase 配置
# 这是模拟配置，仅用于让应用启动。请替换为真实的 Firebase 配置。

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDMOCKLINVALIDKEYFORTESTING12345678
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lexicon-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lexicon-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lexicon-demo.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
`;

// 真实配置模板
const realConfigTemplate = `# Firebase 配置
# 请将下面的值替换为您的真实 Firebase 配置

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain-here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket-here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id-here
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here
`;

const envPath = path.join(__dirname, '.env.local');

// 检查文件是否已存在
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local 文件已存在！');
  console.log('如果您想重新创建，请先删除现有文件。');
  process.exit(0);
}

// 询问用户选择
console.log('🔧 Firebase 配置设置\n');
console.log('请选择配置类型：');
console.log('1. 使用模拟配置（快速启动，但功能受限）');
console.log('2. 创建真实配置模板（需要您填写 Firebase 信息）');
console.log('\n请输入选项 (1 或 2):');

// 读取用户输入
process.stdin.once('data', (data) => {
  const choice = data.toString().trim();
  
  if (choice === '1') {
    // 创建模拟配置
    fs.writeFileSync(envPath, mockConfig);
    console.log('\n✅ 已创建 .env.local 文件（模拟配置）');
    console.log('\n⚠️  注意：这是模拟配置，只能让应用启动，无法使用真实的 Firebase 功能。');
    console.log('\n📝 要使用完整功能，请：');
    console.log('1. 访问 https://console.firebase.google.com/');
    console.log('2. 创建项目并获取配置');
    console.log('3. 编辑 .env.local 文件，替换为真实值');
  } else if (choice === '2') {
    // 创建真实配置模板
    fs.writeFileSync(envPath, realConfigTemplate);
    console.log('\n✅ 已创建 .env.local 文件模板');
    console.log('\n📝 下一步：');
    console.log('1. 访问 https://console.firebase.google.com/');
    console.log('2. 创建新项目或选择现有项目');
    console.log('3. 在项目设置中找到 Web 应用配置');
    console.log('4. 将配置值复制到 .env.local 文件中');
  } else {
    console.log('\n❌ 无效的选项。请运行脚本并选择 1 或 2。');
    process.exit(1);
  }
  
  console.log('\n🚀 完成后，请重启开发服务器：');
  console.log('   npm run dev');
  
  process.exit(0);
}); 