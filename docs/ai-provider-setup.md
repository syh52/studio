# AI服务配置指南

## 概述

Lexicon项目支持多种AI服务提供商，解决了中国大陆用户访问AI功能的问题。

## 🇨🇳 中国大陆用户推荐：DeepSeek AI

### 为什么选择DeepSeek？
- ✅ **无需VPN**：可在中国大陆直接访问
- ✅ **高性能**：基于先进的大语言模型
- ✅ **成本低廉**：比OpenAI更便宜的价格
- ✅ **中文优化**：对中文支持更好

### 配置步骤

#### 1. 获取API密钥
1. 访问 [DeepSeek平台](https://platform.deepseek.com)
2. 注册账号并登录
3. 前往 [API密钥页面](https://platform.deepseek.com/api_keys)
4. 点击"创建新密钥"
5. 复制生成的API密钥（格式：`sk-xxxxxxxxxxxxxxxx`）

#### 2. 配置项目
1. 在项目根目录创建 `.env.local` 文件
2. 添加以下配置：
```bash
# DeepSeek AI 配置
NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-your_deepseek_api_key
```

#### 3. 重启开发服务器
```bash
npm run dev
```

#### 4. 验证配置
- 访问 `/test-admin` 页面
- 查看"AI服务状态"卡片
- 确认DeepSeek显示为"已配置"和"当前使用"

## 🌍 国际用户：Google AI (Vertex AI)

### 注意事项
- ⚠️ **需要VPN**：在中国大陆需要VPN才能访问
- ⚠️ **配置复杂**：需要Google Cloud项目配置

### 使用条件
如果没有配置DeepSeek API密钥，系统会自动尝试使用Google AI服务。Google AI通过Firebase Vertex AI提供，使用项目的Firebase配置。

### 验证Google AI可用性
1. 确保你的Firebase项目已启用Vertex AI
2. 检查网络连接（中国大陆用户需要VPN）
3. 查看浏览器控制台是否有错误信息

## AI服务切换机制

### 自动选择逻辑
系统会按照以下优先级自动选择AI服务：

1. **DeepSeek** (优先级1)
   - 如果配置了有效的DeepSeek API密钥
   - 自动选择为主要AI服务

2. **Google AI** (优先级2)
   - 如果DeepSeek不可用
   - 且Google AI可以正常访问

### 手动切换
在 `/test-admin` 页面的"AI服务状态"卡片中，你可以：
- 查看所有可用的AI服务
- 手动切换between不同的服务
- 实时查看服务状态

## 故障排查

### DeepSeek相关问题

#### 问题：DeepSeek显示"未配置"
**解决方案：**
1. 检查 `.env.local` 文件是否存在
2. 确认API密钥格式正确（以 `sk-` 开头）
3. 重启开发服务器

#### 问题：DeepSeek API调用失败
**解决方案：**
1. 检查API密钥是否有效
2. 确认账户余额充足
3. 检查网络连接

### Google AI相关问题

#### 问题：Google AI显示"不可用"
**解决方案：**
1. 检查是否需要VPN（中国大陆用户）
2. 确认Firebase项目配置正确
3. 检查Vertex AI是否已启用

## 费用说明

### DeepSeek费用
- 按Token使用量计费
- 比OpenAI便宜约50-70%
- 支持预付费充值

### Google AI费用
- 使用Firebase Vertex AI计费
- 需要升级到Blaze计划
- 按使用量付费

## 开发者注意事项

### 添加新的AI服务提供商
1. 创建新的Provider类（参考 `DeepSeekProvider`）
2. 在 `AIProviderManager` 中注册新服务
3. 更新类型定义和配置

### API兼容性
项目使用统一的API接口，所有AI服务提供商都实现相同的接口：
- `generateChatResponse()` - 单次对话
- `generateChatResponseStream()` - 流式对话
- `generateText()` - 文本生成

## 推荐配置

### 生产环境
- **中国大陆**：DeepSeek
- **海外**：Google AI 或 DeepSeek
- **开发测试**：DeepSeek（成本更低）

### 环境变量示例
```bash
# .env.local
# DeepSeek配置（推荐）
NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-your_deepseek_api_key

# Firebase配置（可选，有默认值）
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... 其他Firebase配置
```

## 技术支持

如果遇到配置问题：
1. 检查浏览器控制台错误信息
2. 访问 `/test-admin` 查看详细状态
3. 查看项目文档 `/docs` 目录 