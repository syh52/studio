# Lexicon 应用修改指南

本指南将帮助您了解如何修改 Lexicon 应用中的词汇、对话、图片和图标。

## 目录
1. [修改词汇](#修改词汇)
2. [修改对话](#修改对话)
3. [修改图片](#修改图片)
4. [修改图标](#修改图标)
5. [提交更改](#提交更改)

---

## 修改词汇

### 文件位置
`studio/src/lib/data.ts`

### 词汇数据结构
```typescript
{
  id: "vt001",                    // 唯一ID，格式：vt + 数字
  english: "Altitude",            // 英文单词
  chinese: "高度",                // 中文翻译
  exampleSentenceEn: "The aircraft is cruising at an altitude of 30,000 feet.",  // 英文例句
  exampleSentenceZh: "飞机正在30,000英尺的高度巡航。"                             // 中文例句
}
```

### 修改步骤

#### 1. 修改现有词汇
找到要修改的词汇，直接编辑对应字段：

```typescript
// 修改前
{ id: "vt001", english: "Altitude", chinese: "高度", ... }

// 修改后（例如：修正翻译）
{ id: "vt001", english: "Altitude", chinese: "飞行高度", ... }
```

#### 2. 添加新词汇
在相应词汇包的 `items` 数组中添加新词汇：

```typescript
{
  id: "basic-aviation-vocabulary",
  name: "基础航空英语词汇",
  items: [
    // ... 现有词汇
    // 添加新词汇
    { 
      id: "vt086",  // 确保ID唯一，递增编号
      english: "Departure", 
      chinese: "起飞/离港", 
      exampleSentenceEn: "The departure time is 10:30 AM.", 
      exampleSentenceZh: "起飞时间是上午10:30。" 
    },
  ],
}
```

#### 3. 删除词汇
直接删除对应的词汇对象，注意保持数组格式正确（逗号）。

---

## 修改对话

### 文件位置
`studio/src/lib/data.ts`

### 对话数据结构
```typescript
{
  id: "dl001",                                    // 唯一ID
  speaker: "Security Officer",                    // 说话人
  english: "Good morning, Captain.",              // 英文对话
  chinese: "早上好，机长。"                        // 中文对话
}
```

### 修改步骤

#### 1. 修改现有对话
找到要修改的对话行，编辑对应内容：

```typescript
// 修改前
{ id: "dl001", speaker: "Security Officer", english: "Good morning, Captain.", chinese: "早上好，机长。" }

// 修改后（例如：更正表达）
{ id: "dl001", speaker: "Security Officer", english: "Good morning, Captain.", chinese: "早上好，机长。准备就绪了吗？" }
```

#### 2. 添加新对话行
在对话的 `lines` 数组中添加：

```typescript
lines: [
  // ... 现有对话
  // 添加新对话行
  { 
    id: "dl-new-001",  // 确保ID唯一
    speaker: "Passenger", 
    english: "Thank you for your help.", 
    chinese: "谢谢您的帮助。" 
  },
]
```

#### 3. 添加全新对话场景
如需添加新的对话场景，修改对应的对话分类（日常执勤或紧急情况）：

```typescript
{
  id: "daily-operations-dialogues",
  lines: [
    // ... 现有对话
    // 添加新场景标注
    // 新场景：行李超重
    { id: "dl-baggage-001", speaker: "Security Officer", english: "Sir, your luggage is overweight.", chinese: "先生，您的行李超重了。" },
    { id: "dl-baggage-002", speaker: "Passenger", english: "How much is the excess?", chinese: "超重多少？" },
  ]
}
```

---

## 修改图片

### 图片存放位置
`studio/public/images/`

### 当前使用的图片

1. **主页横幅图片**
   - 位置：`studio/src/app/page.tsx` 第58行
   - 当前：`https://placehold.co/300x150.png?text=Lexicon`
   - 修改方法：
     ```typescript
     // 方法1：使用外部图片URL
     <Image src="https://your-image-url.com/banner.png" .../>
     
     // 方法2：使用本地图片
     // 1. 将图片放入 studio/public/images/lexicon-banner.png
     // 2. 修改代码：
     <Image src="/images/lexicon-banner.png" .../>
     ```

2. **用户头像**
   - 位置：`studio/src/app/profile/page.tsx` 第12行
   - 当前：`/images/dino-avatar.png`
   - 修改步骤：
     1. 准备新头像图片（建议尺寸：128x128px）
     2. 放入 `studio/public/images/` 目录
     3. 修改代码中的路径

### 添加新图片的步骤

1. **准备图片**
   - 格式：PNG 或 JPG
   - 建议使用像素艺术风格以保持一致性
   - 优化文件大小（使用工具如 TinyPNG）

2. **放置图片**
   ```
   studio/public/images/
   ├── lexicon-banner.png      # 主页横幅
   ├── dino-avatar.png         # 用户头像
   └── your-new-image.png      # 新添加的图片
   ```

3. **在代码中使用**
   ```typescript
   import Image from "next/image";
   
   <Image 
     src="/images/your-new-image.png" 
     alt="描述文字"
     width={300}
     height={150}
   />
   ```

---

## 修改图标

### 图标系统
应用使用 Lucide React 图标库。

### 查找可用图标
访问 [Lucide Icons](https://lucide.dev/icons) 查看所有可用图标。

### 修改词汇包/对话图标

1. **词汇包图标**
   ```typescript
   {
     id: "basic-aviation-vocabulary",
     name: "基础航空英语词汇",
     icon: "Plane",  // 修改这里，使用 Lucide 图标名称
   }
   ```

2. **对话图标**
   ```typescript
   {
     id: "daily-operations-dialogues",
     title: "日常执勤对话",
     icon: "ClipboardList",  // 修改这里
   }
   ```

### 常用航空相关图标
- `Plane` - 飞机
- `Shield` - 盾牌（安全）
- `AlertTriangle` - 警告三角
- `Users` - 用户群组
- `ClipboardList` - 检查清单
- `Battery` - 电池
- `Ban` - 禁止
- `CheckCircle` - 完成圆圈
- `AlertCircle` - 警告圆圈
- `UserX` - 用户X（乘客问题）

---

## 提交更改

### 使用 VS Code 或其他编辑器

1. **打开项目**
   ```bash
   cd I:\firebase\studio
   code .  # 如果安装了 VS Code
   ```

2. **编辑文件**
   - 找到 `src/lib/data.ts`
   - 进行修改
   - 保存文件（Ctrl+S）

3. **测试更改**
   ```bash
   npm run dev
   ```
   访问 http://localhost:9002 查看效果

4. **提交到 Git**
   ```bash
   git add .
   git commit -m "修改了XX词汇/对话"
   git push origin master
   ```

### 直接在 GitHub 上编辑

1. 访问 https://github.com/syh52/studio
2. 找到 `studio/src/lib/data.ts`
3. 点击编辑按钮（铅笔图标）
4. 进行修改
5. 在底部填写提交信息
6. 点击 "Commit changes"

---

## 注意事项

### 1. ID 唯一性
- 词汇ID格式：`vt001`, `vt002`, ...
- 对话ID格式：`dl-xxx-001`, `dl-xxx-002`, ...
- 确保新添加的ID不与现有ID重复

### 2. 格式规范
- 保持JSON格式正确（注意逗号）
- 使用UTF-8编码保存文件
- 英文使用半角标点
- 中文使用全角标点

### 3. 图片优化
- 像素艺术风格图片不要过度压缩
- 建议尺寸：
  - 横幅：300x150px
  - 头像：128x128px
  - 图标：使用 Lucide 图标而非图片

### 4. 测试修改
- 修改后先在本地测试
- 检查中英文显示是否正确
- 确认没有破坏应用功能

### 5. 备份
- 修改前可以备份 `data.ts` 文件
- 使用 Git 可以随时回滚更改

---

## 常见问题

### Q: 修改后看不到变化？
A: 
1. 确保保存了文件
2. 刷新浏览器（Ctrl+F5）
3. 重启开发服务器（Ctrl+C 后重新 npm run dev）

### Q: 添加的图标不显示？
A: 
1. 检查图标名称是否正确（区分大小写）
2. 确认图标在 Lucide 图标库中存在
3. 查看浏览器控制台是否有错误

### Q: 中文显示乱码？
A: 
1. 确保文件以 UTF-8 编码保存
2. 检查编辑器的编码设置

---

## 快速参考

### 添加一个词汇
```typescript
{ id: "vt087", english: "Terminal", chinese: "航站楼", exampleSentenceEn: "Please proceed to Terminal 2.", exampleSentenceZh: "请前往2号航站楼。" }
```

### 添加一句对话
```typescript
{ id: "dl-new-001", speaker: "Security Officer", english: "Please show your ID.", chinese: "请出示您的证件。" }
```

### 更换图标
```typescript
icon: "Plane"  // 改为其他 Lucide 图标名称，如 "Shield", "Users" 等
```

---

祝您修改顺利！如有问题，可以查看 Git 历史记录学习之前的修改方式。 