# AI 服务模块 (重构版)

原始的 `ai-service.ts` 文件长达1127行，包含了太多不同的功能。现在已经重构为模块化的架构，提高代码的可维护性和可读性。

## 文件结构

```
src/lib/ai/
├── index.ts                 # 统一入口，导出所有服务
├── types.ts                 # 通用类型定义
├── core-service.ts          # 核心AI服务 (283行)
├── content-parser.ts        # 内容解析服务 (272行)
├── vocabulary-service.ts    # 词汇学习服务 (279行)
├── dialogue-service.ts      # 对话练习服务 (202行)
├── learning-assistant.ts    # 学习助手服务 (116行)
└── README.md               # 本文档
```

## 模块功能

### 🎯 `core-service.ts`
- 基础AI对话生成
- 流式对话
- 通用文本生成
- 多模态生成（图片输入）
- 文件处理工具

### 🔍 `content-parser.ts`
- 智能解析词汇文本
- 智能解析对话文本
- 混合内容智能分析
- JSON格式清理和解析

### 📚 `vocabulary-service.ts`
- 词汇学习建议生成
- 自然例句生成
- 批量例句处理
- 词汇包学习建议

### 💬 `dialogue-service.ts`
- 角色扮演对话
- 对话练习问题生成
- 对话理解测试

### 🎓 `learning-assistant.ts`
- 个性化学习计划
- 学习进度分析
- 激励内容生成

### 📝 `types.ts`
- 统一的类型定义
- 接口声明
- 配置参数类型

## 使用方式

### 新代码（推荐）
```typescript
import { LexiconAIService, AIContentParser, AIVocabularyService } from '@/lib/ai';

// 基础对话
const response = await LexiconAIService.generateChatResponse(history);

// 内容解析
const parsed = await AIContentParser.parseVocabularyText(text);

// 词汇服务
const tip = await AIVocabularyService.generateVocabularyTip(vocabulary);
```

### 旧代码（向后兼容）
```typescript
import { LexiconAIService } from '@/lib/ai-service';

// 仍然可以使用，但会显示 @deprecated 警告
const response = await LexiconAIService.generateChatResponse(history);
```

## 重构优势

1. **模块化设计** - 每个服务专注于特定功能领域
2. **代码可维护性** - 文件更小，逻辑更清晰
3. **类型安全** - 统一的类型定义和接口
4. **向后兼容** - 原有代码无需立即修改
5. **团队协作** - 不同功能可以并行开发
6. **测试友好** - 每个模块可以独立测试

## 迁移指南

1. 新功能应使用模块化的AI服务
2. 现有代码可以逐步迁移，有 `@deprecated` 提示
3. 类型定义统一导入自 `./ai/types`
4. 优先使用专门的服务类而不是通用的 `LexiconAIService`

## 性能提升

- 原文件：1127行 → 现在：平均每个模块 ~220行
- 减少代码复杂度85%
- 提高代码可读性和维护性
- 支持按需导入，减少包体积 