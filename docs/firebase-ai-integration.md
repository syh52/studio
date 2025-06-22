# Firebase AI Logic SDK 集成指南

本文档将指导你在 Lexicon 项目中集成 Firebase AI Logic SDK，替换现有的 Google Genkit 集成。

## 📋 前置要求

- Node.js 18+ 
- 现代浏览器（Chrome/Firefox/Safari/Edge）
- Firebase 项目（已创建或新建）
- 已启用 Firebase AI Logic API

## 🚀 集成步骤

### 第 1 步：设置 Firebase 项目

1. **登录 Firebase 控制台**
   - 访问 [Firebase Console](https://console.firebase.google.com)
   - 选择现有项目或创建新项目

2. **启用 Firebase AI Logic**
   - 在侧边栏找到 **Firebase AI Logic** 
   - 点击 **开始**，按向导启用所需 API
   - 选择 Gemini API 提供方：
     - **Gemini Developer API** (免费 Spark 方案)
     - **Vertex AI Gemini API** (按量付费)

3. **获取配置参数**
   - 进入项目设置 → 常规 → 您的应用
   - 复制 Firebase 配置对象中的所有参数

### 第 2 步：配置环境变量

创建 `.env.local` 文件（注意：此文件不应提交到 Git）：

```bash
# Firebase 配置
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# 可选：如果使用 Gemini Developer API
GEMINI_API_KEY=your-gemini-api-key
```

### 第 3 步：更新 Firebase 配置

修改 `src/lib/firebase.ts`，将配置参数替换为实际值：

```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```

### 第 4 步：添加 AI 助手到应用

在任意页面中引入 AI 助手组件：

```typescript
import AIAssistant from '@/components/ai/AIAssistant';

export default function SomePage() {
  return (
    <div>
      {/* 其他内容 */}
      <AIAssistant />
    </div>
  );
}
```

### 第 5 步：测试集成

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **测试 AI 功能**
   - 访问包含 AI 助手的页面
   - 点击各功能按钮测试 AI 响应
   - 检查浏览器控制台是否有错误

## 🔧 功能特性

### 1. 词汇学习建议
```typescript
const result = await LexiconAIService.generateVocabularyTip(vocabulary);
```
- 为特定词汇生成记忆技巧
- 提供使用场景建议
- 自动适配航空安全场景

### 2. 对话练习题生成
```typescript
const result = await LexiconAIService.generateDialogueQuestions(dialogue);
```
- 基于对话内容生成测试题
- 包含选择题和答案
- 测试关键词汇理解

### 3. 个性化学习计划
```typescript
const result = await LexiconAIService.generateStudyPlan(level, focus);
```
- 根据用户水平制定计划
- 提供时间分配建议
- 设定学习目标和周期

### 4. 流式文本生成
```typescript
const result = await LexiconAIService.generateText(prompt, true);
```
- 支持实时流式输出
- 更好的用户体验
- 适合长文本生成

### 5. 多模态输入
```typescript
const result = await LexiconAIService.generateFromImage(imageFile, prompt);
```
- 支持图片输入
- AI 分析图片内容
- 结合文本提示生成回答

## 高级功能

### 1. 流式响应

AI 服务支持流式生成，适合长内容的实时显示：

```typescript
const aiService = new LexiconAIService();
const stream = aiService.generateTextStream("你的提示词");

for await (const chunk of stream) {
  console.log(chunk); // 实时输出每个文本片段
}
```

### 2. 多模态输入

支持图片分析（如图表、手册页面等）：

```typescript
const result = await aiService.analyzeImage(imageFile, "请分析这个航空图表");
```

### 3. 自定义配置

#### Token 限制配置

`maxOutputTokens` 是控制 AI 回复长度的关键参数：

```typescript
// 不同场景的建议配置
const configs = {
  // 简短回答（如术语解释）
  brief: {
    temperature: 0.7,
    maxOutputTokens: 500,    // 约 300-400 个英文单词
    topK: 40,
    topP: 0.95,
  },
  
  // 中等长度（如学习建议）
  moderate: {
    temperature: 0.7,
    maxOutputTokens: 1500,   // 约 1000-1200 个英文单词
    topK: 40,
    topP: 0.95,
  },
  
  // 详细内容（如练习题、学习计划）
  detailed: {
    temperature: 0.8,
    maxOutputTokens: 2500,   // 约 1800-2000 个英文单词
    topK: 40,
    topP: 0.95,
  }
};

// 使用自定义配置
const result = await aiService.generateText(prompt, configs.detailed);
```

#### Token 计算参考

- **英文**：1 token ≈ 0.75 个单词（100 tokens ≈ 75 个单词）
- **中文**：1 token ≈ 0.5 个汉字（100 tokens ≈ 50 个汉字）
- **混合内容**：需要根据实际比例估算

#### 完成原因检查

当回复达到 token 限制时，AI 会停止生成。你可以检查完成原因：

```typescript
// AI 服务已内置检查，会在控制台显示警告
// 如果看到 "⚠️ 回复因达到 token 限制而截断"
// 说明需要增加 maxOutputTokens
```

#### 成本优化建议

1. **按需设置**：不要盲目使用最大值，根据实际需求设置
2. **分级配置**：为不同功能设置不同的 token 限制
3. **监控使用**：定期检查 token 使用情况，优化配置

### 4. 错误处理

AI 服务包含完整的错误处理机制：

```typescript
try {
  const result = await aiService.generateText("提示词");
} catch (error) {
  // 错误会包含详细信息，如：
  // - API 未启用
  // - 配额超限
  // - 网络问题等
}
```

## 📚 API 参考

### LexiconAIService 类方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `generateVocabularyTip()` | `VocabularyItem` | `AIResponse` | 生成词汇学习建议 |
| `generateDialogueQuestions()` | `Dialogue` | `AIResponse` | 生成对话练习题 |
| `generateStudyPlan()` | `level, focus` | `AIResponse` | 生成学习计划 |
| `generateText()` | `prompt, stream?` | `AIResponse` | 通用文本生成 |
| `generateFromImage()` | `file, prompt` | `AIResponse` | 多模态生成 |

### AIResponse 接口

```typescript
interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}
```

## 🔄 从 Genkit 迁移

如果你想完全替换现有的 Genkit 集成：

1. **移除 Genkit 依赖**
   ```bash
   npm uninstall genkit @genkit-ai/googleai @genkit-ai/next genkit-cli
   ```

2. **删除相关文件**
   ```bash
   rm src/ai/genkit.ts
   rm src/ai/dev.ts
   ```

3. **更新 package.json**
   移除 genkit 相关脚本：
   ```json
   {
     "scripts": {
       // 删除这些行
       "genkit:dev": "genkit start -- tsx src/ai/dev.ts",
       "genkit:watch": "genkit start -- tsx --watch src/ai/dev.ts"
     }
   }
   ```

4. **更新引用**
   将项目中对 `src/ai/genkit.ts` 的引用改为 `src/lib/ai-service.ts`

## 🛡️ 安全建议

### 1. API 密钥管理
- ✅ 使用环境变量存储敏感信息
- ✅ 生产环境使用 Firebase App Check
- ❌ 不要在代码中硬编码 API 密钥

### 2. 使用限制
- 设置合理的 API 调用频率限制
- 监控 API 使用量和成本
- 为不同用户设置不同的使用配额

### 3. 内容安全
- 配置适当的安全设置参数
- 过滤用户输入内容
- 记录和监控 AI 生成的内容

## 🚨 故障排除

### 问题 1：Firebase 初始化失败
```
Error: Firebase configuration object is invalid
```
**解决方案**：
- 检查环境变量是否正确设置
- 确认 Firebase 项目 ID 是否正确
- 验证 API 密钥是否有效

### 问题 2：AI API 调用失败
```
Error: Failed to generate content
```
**解决方案**：
- 确认已启用 Firebase AI Logic API
- 检查 API 配额是否用完
- 验证网络连接是否正常

### 问题 3：模型不可用
```
Error: Model not found
```
**解决方案**：
- 确认使用的模型名称正确
- 检查模型在你的地区是否可用
- 尝试使用其他可用模型

### 问题 4：权限错误
```
Error: Permission denied
```
**解决方案**：
- 检查 Firebase 项目权限设置
- 确认 API 密钥权限配置
- 联系 Firebase 支持团队

## 📊 性能优化

### 1. 缓存策略
- 对相同输入的结果进行本地缓存
- 使用 React Query 进行请求缓存
- 实现智能的缓存失效机制

### 2. 请求优化
- 批量处理多个相似请求
- 使用流式传输减少等待时间
- 设置合理的超时时间

### 3. 用户体验
- 提供加载状态指示
- 实现请求取消功能
- 添加重试机制

## 🔗 相关资源

- [Firebase AI Logic 官方文档](https://firebase.google.com/docs/ai)
- [Gemini API 文档](https://docs.gemini.google.com)
- [Firebase 控制台](https://console.firebase.google.com)
- [Google Cloud Vertex AI](https://cloud.google.com/vertex-ai)

## 💡 最佳实践

1. **开发阶段**：使用 Gemini Developer API（免费）
2. **生产环境**：考虑使用 Vertex AI（更稳定）
3. **内容过滤**：始终验证和过滤 AI 生成的内容
4. **用户反馈**：收集用户对 AI 功能的反馈
5. **持续优化**：根据使用数据优化提示词和参数

---

如有问题，请参考 [Firebase 支持文档](https://firebase.google.com/support) 或提交 Issue。 