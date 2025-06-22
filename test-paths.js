// 简单的路径测试
const fs = require('fs');
const path = require('path');

console.log('测试项目路径结构...\n');

const testPaths = [
  './src/contexts/AuthContext.tsx',
  './src/components/ui/card.tsx',
  './src/components/ui/button.tsx', 
  './src/components/ui/table.tsx',
  './src/lib/data.ts'
];

testPaths.forEach(testPath => {
  const exists = fs.existsSync(testPath);
  const fullPath = path.resolve(testPath);
  console.log(`${exists ? '✅' : '❌'} ${testPath}`);
  if (exists) {
    console.log(`   -> ${fullPath}`);
  }
});

console.log('\n路径测试完成！'); 