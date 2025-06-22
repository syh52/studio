# Firebase AI Logic SDK 故障排除指南

## 🚨 常见问题与解决方案

### 问题 1：AI 功能无响应
**症状**：点击AI按钮后没有任何反应或显示错误

**可能原因 & 解决方案**：

1. **Firebase配置问题**
   ```bash
   # 检查环境变量文件
   Get-Content .env.local
   ```
   确保所有配置项都正确填写

2. **网络连接问题**
   - 检查网络连接
   - 确认可以访问 Firebase 服务

3. **API 配额限制**
   - 检查 Firebase 控制台的使用量
   - 免费版有调用次数限制

### 问题 2：Firebase 初始化失败
**错误信息**：`Firebase configuration object is invalid`

**解决方案**：
1. 确认 `.env.local` 文件在正确位置（项目根目录）
2. 重启开发服务器：
   ```bash
   npm run dev
   ```
3. 检查浏览器控制台是否有详细错误信息

### 问题 3：模型不可用
**错误信息**：`Model not found` 或 `Model not available`

**解决方案**：
1. 在 Firebase 控制台确认已启用 AI Logic API
2. 尝试切换模型（在 `src/lib/firebase.ts` 中）：
   ```typescript
   // 尝试其他可用模型
   model: "gemini-1.5-flash"  // 替代选项
   ```

### 问题 4：权限错误
**错误信息**：`Permission denied` 或 `Unauthorized`

**解决方案**：
1. 在 Firebase 控制台检查项目权限
2. 确认 API 密钥权限设置正确
3. 检查是否启用了必要的 API

### 问题 5：开发服务器无法启动
**可能原因**：端口被占用或依赖问题

**解决方案**：
```bash
# 清理并重装依赖
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install

# 使用不同端口启动
npm run dev -- -p 3000
```

## 🔍 调试技巧

### 1. 检查浏览器控制台
- 按 F12 打开开发者工具
- 查看 Console 标签页的错误信息
- 检查 Network 标签页的请求状态

### 2. 查看详细错误信息
在 `src/lib/ai-service.ts` 中临时添加调试信息：
```typescript
catch (error) {
  console.error('详细错误信息:', error);
  console.error('错误堆栈:', error.stack);
  // ... 现有代码
}
```

### 3. 测试 Firebase 连接
创建简单测试文件 `test-firebase.js`：
```javascript
import { firebaseApp } from './src/lib/firebase.js';
console.log('Firebase 项目 ID:', firebaseApp.options.projectId);
```

### 4. 分步测试
1. 先测试 Firebase 基础连接
2. 再测试 AI 模型初始化
3. 最后测试 AI 内容生成

## 📊 性能监控

### 监控 API 使用量
1. 登录 [Firebase 控制台](https://console.firebase.google.com)
2. 选择你的项目 "aviation-lexicon-trainer"
3. 查看 AI Logic 使用统计

### 设置使用警告
- 在 Firebase 控制台设置配额警告
- 避免意外超出免费额度

## 🆘 获取帮助

### 官方资源
- [Firebase AI Logic 文档](https://firebase.google.com/docs/ai)
- [Firebase 支持中心](https://firebase.google.com/support)
- [Google Gemini API 文档](https://docs.gemini.google.com)

### 社区资源
- [Firebase GitHub Issues](https://github.com/firebase/firebase-js-sdk/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Discord 社区](https://discord.gg/firebase)

### 联系开发者
如果问题持续存在，请：
1. 收集完整的错误信息
2. 记录复现步骤
3. 提交 Issue 或寻求帮助

---

💡 **提示**：大多数问题都是配置相关的，仔细检查环境变量和 Firebase 控制台设置通常能解决问题。

## 目录
- [API 密钥问题](#api-密钥问题)
- [生成内容失败](#生成内容失败)
- [初始化错误](#初始化错误)
- [Vertex AI 问题](#vertex-ai-问题)
- [环境变量问题](#环境变量问题)
- [运行时错误](#运行时错误)

## API 密钥问题

### 错误：The "apiKey" field is empty
**原因**：Firebase 配置中缺少 API 密钥。

**解决方案**：
1. 检查 `.env.local` 文件中的配置
2. 确保环境变量名称正确（需要 `NEXT_PUBLIC_` 前缀）
3. 重启开发服务器使环境变量生效
4. 如果问题仍然存在，检查 `src/lib/firebase.ts` 中的硬编码后备配置

### 错误：auth/invalid-api-key
**原因**：提供的 API 密钥无效。

**解决方案**：
1. 在 Firebase 控制台验证 API 密钥
2. 确保使用的是正确项目的密钥
3. 检查是否有多余的空格或字符

## 生成内容失败

### 错误：Generation Failed: undefined
**原因**：通常是因为 API 未启用或权限问题。

**解决方案**：
1. 检查控制台的详细错误信息
2. 确保已启用所需的 API
3. 验证项目的计费状态

## 初始化错误

### 错误：Firebase AI Logic 初始化失败
**原因**：可能是配置错误或 API 未启用。

**解决方案**：
1. 检查浏览器控制台的详细错误信息
2. 确保 Firebase 项目已正确配置
3. 验证是否选择了正确的 AI 提供商

## Vertex AI 问题

### 错误：404 - Publisher Model was not found
**完整错误**：
```
FirebaseError: AI: Error fetching from https://firebasevertexai.googleapis.com/v1beta/projects/aviation-lexicon-trainer/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent: [404 ] Publisher Model `projects/aviation-lexicon-trainer/locations/us-central1/publishers/google/models/gemini-1.5-flash` was not found or your project does not have access to it.
```

**原因**：
1. Vertex AI API 未启用
2. 项目未升级到 Blaze 计划
3. API 正在启用中（需要等待）
4. 模型版本不正确

**解决方案**：

#### 步骤 1：启用 Vertex AI API
1. 访问 [Google Cloud Console - Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=aviation-lexicon-trainer)
2. 点击"启用"按钮
3. 等待 API 启用完成（通常需要 2-5 分钟）

#### 步骤 2：升级到 Blaze 计划
1. 访问 [Firebase 控制台 - 升级计划](https://console.firebase.google.com/project/aviation-lexicon-trainer/usage/details)
2. 选择"升级"到 Blaze 计划
3. 添加计费信息（注意：Vertex AI 是付费服务）

#### 步骤 3：在 Firebase 控制台配置 AI
1. 访问 [Firebase 控制台](https://console.firebase.google.com/project/aviation-lexicon-trainer)
2. 导航到"构建" > "AI"
3. 选择"Vertex AI"作为提供商
4. 确保区域设置为 `us-central1`

#### 步骤 4：等待 API 完全激活
- API 启用后可能需要额外的 5-10 分钟才能完全激活
- 在此期间可能仍会看到 404 错误

#### 步骤 5：验证配置
在 `src/lib/firebase.ts` 中，确保：
- 使用正确的模型版本：`gemini-1.5-flash-001`
- 区域设置为：`us-central1`

### 错误：需要启用计费
**原因**：Vertex AI 需要 Blaze 计划（付费）。

**解决方案**：
1. 升级到 Firebase Blaze 计划
2. 添加有效的付款方式
3. 注意 Vertex AI 的使用费用

### 错误：权限被拒绝
**原因**：服务账户缺少必要的权限。

**解决方案**：
1. 检查项目的 IAM 设置
2. 确保 Firebase 服务账户有 Vertex AI 访问权限
3. 等待权限更改生效（可能需要几分钟）

## 环境变量问题

### 错误：环境变量未加载
**原因**：Next.js 未正确读取 `.env.local` 文件。

**解决方案**：
1. 确保文件名是 `.env.local`（不是 `.env`）
2. 重启开发服务器
3. 清除 Next.js 缓存：`rm -rf .next`
4. 使用硬编码配置作为后备方案

## 运行时错误

### 错误：Cannot read properties of null
**原因**：尝试在初始化完成前使用 AI 服务。

**解决方案**：
1. 确保使用 `getAIInstance()` 函数
2. 在使用前检查 AI 实例是否存在
3. 实现适当的错误处理

## 调试技巧

1. **检查浏览器控制台**
   - 查看详细的错误信息和堆栈跟踪
   - 注意配置状态日志

2. **使用测试页面**
   - 访问 `/test-ai` 页面进行快速测试
   - 查看详细的错误信息

3. **验证配置**
   - 在控制台中运行：`console.log(firebaseConfig)`
   - 确保所有必需字段都有值

4. **网络请求**
   - 使用浏览器开发工具的网络标签
   - 查看失败请求的详细信息

## 获取帮助

如果问题仍然存在：
1. 收集错误信息和日志
2. 检查 [Firebase 文档](https://firebase.google.com/docs/ai)
3. 在 Firebase 社区论坛寻求帮助

## 常见配置检查清单

- [ ] Firebase 项目已创建
- [ ] 已升级到 Blaze 计划（Vertex AI 需要）
- [ ] Vertex AI API 已启用
- [ ] Firebase 控制台中已选择 Vertex AI 作为提供商
- [ ] API 密钥正确配置
- [ ] 环境变量文件名正确（`.env.local`）
- [ ] 开发服务器已重启
- [ ] 浏览器控制台无错误 