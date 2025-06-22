# Firebase AI Logic API 启用指南

## 🚀 快速设置步骤

### 步骤 1：登录 Firebase 控制台
1. 访问 [Firebase 控制台](https://console.firebase.google.com)
2. 选择你的项目: **aviation-lexicon-trainer**

### 步骤 2：启用 Firebase AI Logic
1. 在左侧菜单中找到 **"构建"** 部分
2. 点击 **"Firebase AI Logic"**（可能在"更多产品"中）
3. 如果看到"开始使用"按钮，点击它

### 步骤 3：选择 API 提供方
你会看到两个选项：

#### 选项 A：Gemini Developer API（推荐）✅
- **免费使用**（Spark 方案）
- 适合开发和测试
- 每分钟 15 个请求限制
- 每天 1500 个请求限制

#### 选项 B：Vertex AI Gemini API
- 需要升级到 Blaze 付费方案
- 更高的配额和性能
- 按使用量付费

**建议选择：Gemini Developer API**

### 步骤 4：获取或确认 API 密钥
1. 系统会自动生成一个 Gemini API 密钥
2. 复制这个密钥（如果需要）
3. **重要**：不要在代码中硬编码密钥

### 步骤 5：设置 API 限制（可选但推荐）
1. 进入 [Google Cloud Console](https://console.cloud.google.com)
2. 选择你的项目
3. 导航到 "API 和服务" > "凭据"
4. 找到你的 API 密钥
5. 点击编辑，设置以下限制：
   - **应用限制**：HTTP 引荐来源
   - 添加允许的网址：
     - `http://localhost:*`
     - `https://aviation-lexicon-trainer.firebaseapp.com/*`
     - `https://aviation-lexicon-trainer.web.app/*`

### 步骤 6：验证设置
1. 回到你的应用
2. 刷新页面（Ctrl+F5）
3. 打开浏览器控制台（F12）
4. 测试 AI 功能

## 🔍 常见问题

### 问题：仍然显示"生成失败"
**可能原因**：
1. API 还在启用中（可能需要几分钟）
2. 需要清理浏览器缓存
3. API 密钥权限问题

**解决方案**：
```bash
# 1. 清理 Next.js 缓存
Remove-Item -Path .next -Recurse -Force

# 2. 重启开发服务器
npm run dev

# 3. 使用无痕模式测试
```

### 问题：找不到 Firebase AI Logic
**解决方案**：
1. 确保你的 Firebase 项目是最新创建的
2. 尝试访问直接链接：
   ```
   https://console.firebase.google.com/project/aviation-lexicon-trainer/genkit
   ```

### 问题：配额限制
**Gemini Developer API 免费配额**：
- 每分钟 15 个请求
- 每天 1,500 个请求
- 每月 100 万个 token

对于学习应用来说，这些配额完全足够。

## 📊 监控使用情况

1. 在 Firebase 控制台查看使用统计
2. 设置配额警告避免意外费用
3. 在 [Google Cloud Console](https://console.cloud.google.com) 查看详细的 API 使用情况

## 🎯 下一步

API 启用后，你的应用应该可以正常使用 AI 功能了：
- 词汇学习建议
- 对话练习题生成
- 个性化学习计划

如果还有问题，请查看浏览器控制台的错误信息。 