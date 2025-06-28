# AI 服务提供者设置指南

Lexicon航空英语学习平台支持多个AI服务提供者，确保在任何环境下都能提供稳定的AI功能。

## 🎯 服务优先级

### 1. Google AI (Gemini) - 首选服务
- **优势**: 功能强大的多模态AI，支持文本、图像等多种输入
- **模型**: Gemini 2.5 Pro
- **特点**: 
  - 无需担心Token余额问题
  - 响应质量高
  - 支持长文本生成
  - 多模态能力强

### 2. DeepSeek AI - 备用服务
- **用途**: 仅作为备用选项，当Google AI不可用时使用
- **特点**:
  - 成本相对较低
  - 需要管理API余额
  - 主要支持文本生成

## 🔧 配置方法

### Google AI 配置 (推荐)

1. **获取API密钥**:
   - 访问 [Google AI Studio](https://aistudio.google.com/)
   - 创建新的API密钥
   - 或使用现有的Firebase Vertex AI配置

2. **环境变量配置**:
   ```bash
   # 方法1: 直接使用Gemini API密钥
   GOOGLE_GENAI_API_KEY=your-gemini-api-key
   
   # 方法2: 使用Google Cloud服务账号
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   GCLOUD_PROJECT=your-gcp-project-id
   ```

3. **Firebase配置**:
   确保Firebase项目已启用Vertex AI服务

### DeepSeek AI 配置 (可选)

⚠️ **注意**: DeepSeek现在仅作为备用服务，不是必需的配置。

1. **获取API密钥** (可选):
   - 访问 [DeepSeek平台](https://platform.deepseek.com/)
   - 注册账号并获取API密钥
   - 充值账户余额

2. **环境变量配置** (可选):
   ```bash
   # 可选：仅在需要备用服务时配置
   NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here
   ```

## 🚀 自动切换机制

系统具有智能的错误处理和服务切换机制：

1. **优先使用Google AI**: 系统默认使用Google AI (Gemini)
2. **自动故障切换**: 当主要服务出现问题时，自动切换到可用的备用服务
3. **错误恢复**: 提供友好的错误信息和重试机制
4. **余额监控**: 检测DeepSeek余额不足错误，自动切换服务

## 📊 服务状态监控

在应用的**管理页面 → AI服务状态**中，您可以：

- 查看当前使用的AI服务
- 测试各个服务的连接状态
- 手动切换AI服务提供者
- 查看服务的优先级和状态

## 🔍 故障排除

### Google AI 问题
- 检查API密钥是否正确
- 确认Firebase项目配置
- 验证网络连接

### DeepSeek API 问题
- 检查账户余额
- 验证API密钥有效性
- 确认服务地区可用性

### 通用问题
- 检查网络连接
- 查看浏览器控制台错误信息
- 确认环境变量配置正确

## 📝 最佳实践

1. **主要依赖Google AI**: 确保Google AI配置正确，这是系统的主要服务
2. **备用服务可选**: DeepSeek配置是可选的，仅在需要额外冗余时配置
3. **监控服务状态**: 定期检查AI服务状态页面
4. **保持API密钥更新**: 定期轮换和更新API密钥以确保安全

## 🎯 推荐配置

对于大多数用户，我们推荐：

```bash
# 必需：Google AI配置
GOOGLE_GENAI_API_KEY=your-gemini-api-key

# 可选：备用服务（仅在需要额外冗余时配置）
# NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here
```

这样的配置确保了系统的稳定性，同时避免了不必要的复杂性。 