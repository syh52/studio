#!/usr/bin/env node
/**
 * 修复项目中的别名路径导入问题
 * 将 @/ 别名路径转换为相对路径
 */

const fs = require('fs');
const path = require('path');

// 需要修复的文件扩展名
const extensions = ['.tsx', '.ts', '.js', '.jsx'];

// 需要跳过的目录
const skipDirs = ['node_modules', '.next', 'build', 'dist'];

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !skipDirs.includes(item)) {
      getAllFiles(fullPath, files);
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function getRelativePath(fromFile, toPath) {
  // fromFile: src/app/admin/page.tsx
  // toPath: contexts/AuthContext 或 components/ui/card
  
  const fromDir = path.dirname(fromFile);
  const fromParts = fromDir.split(path.sep);
  
  // 计算需要返回多少级目录到 src
  const srcIndex = fromParts.indexOf('src');
  if (srcIndex === -1) return toPath; // 如果不在src目录中，保持原样
  
  const levelsUp = fromParts.length - srcIndex - 1;
  const relativeParts = new Array(levelsUp).fill('..');
  
  return relativeParts.length > 0 
    ? relativeParts.join('/') + '/' + toPath
    : './' + toPath;
}

function fixImports(filePath, content) {
  const lines = content.split('\n');
  let modified = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const importMatch = line.match(/^(\s*import\s+.*?from\s+['"`])(@\/[^'"`]+)(['"`])/);
    
    if (importMatch) {
      const [, prefix, aliasPath, suffix] = importMatch;
      const relativePath = aliasPath.replace('@/', '');
      const newPath = getRelativePath(filePath, relativePath);
      
      lines[i] = `${prefix}${newPath}${suffix}`;
      modified = true;
      
      console.log(`  ${aliasPath} -> ${newPath}`);
    }
  }
  
  return { content: lines.join('\n'), modified };
}

function main() {
  console.log('🔧 开始修复别名路径导入...\n');
  
  const srcDir = path.join(__dirname, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ 未找到 src 目录');
    process.exit(1);
  }
  
  const files = getAllFiles(srcDir);
  let totalFixed = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes("from '@/")) {
      console.log(`\n📝 修复文件: ${path.relative(__dirname, file)}`);
      
      const { content: newContent, modified } = fixImports(file, content);
      
      if (modified) {
        fs.writeFileSync(file, newContent, 'utf8');
        totalFixed++;
      }
    }
  }
  
  console.log(`\n✅ 完成！共修复 ${totalFixed} 个文件`);
  
  if (totalFixed > 0) {
    console.log('\n📋 请运行以下命令提交更改：');
    console.log('git add .');
    console.log('git commit -m "批量修复别名路径导入问题"');
    console.log('git push origin studio02-backup');
  }
}

if (require.main === module) {
  main();
} 