# Lexicon 快速参考卡片

## 🔧 文件位置
- **词汇和对话数据**: `studio/src/lib/data.ts`
- **主页**: `studio/src/app/page.tsx`
- **图片目录**: `studio/public/images/`

## 📝 数据结构

### 词汇
```typescript
{
  id: "vt001",
  english: "英文",
  chinese: "中文",
  exampleSentenceEn: "英文例句",
  exampleSentenceZh: "中文例句"
}
```

### 对话
```typescript
{
  id: "dl001",
  speaker: "说话人",
  english: "英文对话",
  chinese: "中文对话"
}
```

## 🚀 快速命令

### 本地开发
```bash
cd I:\firebase\studio
npm run dev
# 访问 http://localhost:9002
```

### 提交更改
```bash
git add .
git commit -m "描述您的更改"
git push origin master
```

## 🎨 常用图标名称
- `Plane` - 飞机
- `Shield` - 安全
- `AlertTriangle` - 警告
- `Users` - 用户
- `ClipboardList` - 清单
- `Ban` - 禁止
- `CheckCircle` - 完成

## 💡 修改示例

### 添加词汇
```typescript
{ 
  id: "vt086", 
  english: "Gate", 
  chinese: "登机口", 
  exampleSentenceEn: "Please go to Gate 12.", 
  exampleSentenceZh: "请前往12号登机口。" 
}
```

### 添加对话
```typescript
{ 
  id: "dl-new-001", 
  speaker: "Security Officer", 
  english: "Please remain seated.", 
  chinese: "请保持坐姿。" 
}
```

### 更换图片
```typescript
// 原来
<Image src="https://placehold.co/300x150.png" />

// 修改为
<Image src="/images/my-banner.png" />
```

## ⚠️ 注意事项
1. ID必须唯一
2. 保存文件编码为UTF-8
3. 注意JSON格式的逗号
4. 修改后刷新浏览器

## 🔗 资源链接
- GitHub仓库: https://github.com/syh52/studio
- Lucide图标: https://lucide.dev/icons
- 详细指南: [modification-guide.md](./modification-guide.md) 