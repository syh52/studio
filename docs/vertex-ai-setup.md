# Vertex AI 设置指南

## ⚠️ 重要提示

使用 Vertex AI Backend 需要：
1. **Firebase Blaze 计划**（按量付费）
2. **启用 Vertex AI API**
3. **Google Cloud 项目计费账户**

## 📋 设置步骤

### 步骤 1：升级到 Blaze 计划

1. 访问 [Firebase 控制台](https://console.firebase.google.com)
2. 选择你的项目：`aviation-lexicon-trainer`
3. 点击左下角的 **"升级"** 按钮
4. 选择 **Blaze 计划**（按使用量付费）
5. 添加付款方式

> 💡 提示：Blaze 计划包含免费额度，小规模使用通常不会产生费用

### 步骤 2：启用 Vertex AI API

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 确保选择了正确的项目：`aviation-lexicon-trainer`
3. 在搜索栏搜索 "Vertex AI API"
4. 点击 **"Vertex AI API"**
5. 点击 **"启用"** 按钮

或直接访问：
```
https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=aviation-lexicon-trainer
```

### 步骤 3：在 Firebase 控制台配置

1. 回到 [Firebase 控制台](https://console.firebase.google.com)
2. 导航到 **Firebase AI Logic**
3. 选择 **"Vertex AI Gemini API"** 作为提供方
4. 确认配置

### 步骤 4：验证设置

刷新你的应用并测试 AI 功能。你应该看到：
```
🤖 正在初始化 Firebase AI Logic (Vertex AI)...
✅ Firebase AI Logic (Vertex AI) 初始化成功
```

## 💰 成本估算

### Vertex AI 定价（Gemini 1.5 Flash）
- **输入**：$0.00001875 / 1K 字符
- **输出**：$0.000075 / 1K 字符

### 示例成本计算
假设每天：
- 100 个请求
- 每个请求 500 字符输入 + 1000 字符输出

月度成本 = 30 × 100 × ($0.00001875 × 0.5 + $0.000075 × 1) ≈ **$0.25**

## 🆚 Vertex AI vs Gemini Developer API

| 特性 | Vertex AI | Gemini Developer API |
|------|-----------|---------------------|
| **费用** | 按使用量付费 | 免费（有限额） |
| **性能** | 更快更稳定 | 一般 |
| **限制** | 几乎无限制 | 15 QPM / 1500 QPD |
| **模型选择** | 更多选项 | 有限 |
| **企业功能** | 支持 | 不支持 |
| **适用场景** | 生产环境 | 开发/测试 |

## 🚨 常见问题

### 错误：需要启用计费
```
Error: Vertex AI requires billing to be enabled
```
**解决**：升级到 Blaze 计划

### 错误：权限被拒绝
```
Error: Permission denied on resource project
```
**解决**：
1. 确保你是项目所有者
2. 启用 Vertex AI API
3. 等待 2-5 分钟生效

### 错误：API 未启用
```
Error: Vertex AI API has not been enabled
```
**解决**：按照步骤 2 启用 API

## 🔄 切换回免费方案

如果你想切换回 Gemini Developer API（免费）：

1. 编辑 `src/lib/firebase.ts`
2. 移除 `VertexAIBackend` 导入
3. 更改初始化代码：
   ```typescript
   // 从
   ai = getAI(firebaseApp, { backend: new VertexAIBackend() });
   
   // 改为
   ai = getAI(firebaseApp);
   ```

## 📊 监控使用量

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 导航到 "计费" > "报告"
3. 筛选 "Vertex AI" 服务
4. 设置预算警报避免意外费用

## 💡 最佳实践

1. **开发阶段**：使用 Gemini Developer API（免费）
2. **生产环境**：使用 Vertex AI（更稳定）
3. **设置预算警报**：避免意外费用
4. **实现缓存**：减少 API 调用
5. **监控使用量**：定期查看使用统计

---

需要帮助？查看 [Vertex AI 文档](https://cloud.google.com/vertex-ai/docs) 或提交 Issue。 