# Lexicon - 航空安全英语学习应用

Lexicon 是一个专为航空安全员设计的智能英语学习平台，集成了AI技术和现代化用户体验，帮助航空安全专业人员掌握日常执勤和紧急情况下所需的专业英语技能。

## ✨ 项目特点

- 🎯 **专业词汇学习**：162个核心航空安全词汇，分为基础与安保两大模块
- 💬 **情景对话练习**：10个真实工作场景对话，涵盖日常执勤和应急处理
- 🎮 **智能测验系统**：多维度能力评估，个性化学习报告
- 🤖 **AI驱动学习**：基于Google Genkit的智能推荐和内容生成
- 📱 **响应式设计**：完美支持手机、平板和桌面设备
- 🎨 **现代玻璃拟态设计**：深色主题配合毛玻璃效果的优雅视觉体验
- 🔐 **完整用户系统**：Firebase身份验证和数据管理
- ⚡ **高性能优化**：经过专业性能调优，流畅的交互体验

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- Firebase项目配置

### 安装和运行

```bash
# 克隆项目
git clone [项目地址]

# 进入项目目录
cd studio

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动AI开发环境 (可选)
npm run genkit:dev
```

访问 http://localhost:9002 查看应用

### 生产环境部署

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 📁 项目结构

```
studio/
├── src/                           # 源代码目录
│   ├── app/                      # Next.js App Router
│   │   ├── admin/               # 管理员页面
│   │   ├── dialogues/           # 对话练习模块
│   │   ├── login/               # 登录页面
│   │   ├── profile/             # 用户档案
│   │   ├── quizzes/             # 测验系统
│   │   ├── register/            # 注册页面
│   │   ├── vocabulary/          # 词汇学习模块
│   │   └── layout.tsx           # 应用布局
│   ├── components/              # React 组件库
│   │   ├── auth/               # 认证相关组件
│   │   ├── layout/             # 布局组件
│   │   ├── quiz/               # 测验组件
│   │   ├── shared/             # 共享组件
│   │   ├── ui/                 # UI基础组件
│   │   └── vocabulary/         # 词汇学习组件
│   ├── contexts/               # React Context
│   │   └── AuthContext.tsx    # 用户认证上下文
│   ├── hooks/                  # 自定义Hooks
│   ├── lib/                    # 工具库和数据
│   │   ├── firebase/           # Firebase配置和服务
│   │   ├── data.ts            # 核心学习数据（162个词汇+10个对话）
│   │   └── utils.ts           # 通用工具函数
│   └── ai/                     # AI功能模块
├── public/                     # 静态资源
│   ├── fonts/                 # 字体文件
│   └── images/                # 图片资源
├── docs/                      # 项目文档
│   ├── modification-guide.md  # 内容修改指南
│   ├── blueprint.md          # 项目蓝图
│   └── quick-reference.md    # 快速参考
├── functions/                 # Firebase Cloud Functions
├── firebase.json             # Firebase配置
├── firestore.rules          # Firestore安全规则
├── next.config.ts          # Next.js配置
├── tailwind.config.ts      # Tailwind CSS配置
└── package.json           # 项目依赖
```

## 🎯 核心功能模块

### 1. 词汇学习系统
- **飞行基础与客舱安全**：85个基础词汇，涵盖航空术语、安全设备等
- **安保操作与应急处理**：77个专业词汇，专注于安保操作和应急处理
- 每个词汇包含：
  - 英文单词和中文翻译
  - 词性标注和发音指导
  - 实用例句和扩展例句
  - 常用短语和搭配

### 2. 情景对话练习
- **日常执勤对话**：
  - 与驾驶舱沟通
  - 旅客行为管理
  - 安保检查程序
- **紧急情况对话**：
  - 打架斗殴处理
  - 吸烟事件处置
  - 遣返旅客管理
  - 醉酒旅客处理

### 3. 智能测验系统
- 词汇配对测试
- 情景对话理解
- 个性化学习报告
- 进度追踪和分析

### 4. 用户管理系统
- Firebase身份验证
- 个人学习档案
- 签到积分系统
- 学习进度同步

### 5. 批量导入系统
- 多格式支持：Excel (.xlsx)、CSV (.csv)、JSON (.json)
- 智能数据验证和错误检测
- 词汇库和对话库批量更新
- 模板生成和下载功能
- 重复数据检测和处理
- **一键直达**：主页面集成管理入口，无需手动输入URL

## 🛠️ 技术栈

### 前端技术
- **框架**: Next.js 15 (App Router)
- **UI库**: React 18
- **类型系统**: TypeScript 5
- **样式**: Tailwind CSS 3.4
- **UI组件**: Radix UI + 自定义组件
- **状态管理**: React Context + Hooks
- **图标**: Lucide React

### 后端服务
- **数据库**: Firebase Firestore
- **身份验证**: Firebase Auth
- **文件存储**: Firebase Storage
- **云函数**: Firebase Functions
- **分析**: Firebase Analytics

### AI功能
- **AI引擎**: Google Genkit 1.8
- **模型**: Gemini Pro
- **功能**: 智能推荐、内容生成

### 开发工具
- **包管理**: npm
- **构建工具**: Next.js + Turbopack
- **代码质量**: ESLint + TypeScript
- **样式**: PostCSS + Tailwind CSS

## 📊 性能优化

根据最新的性能优化报告，项目已完成以下优化：

### 已完成优化
- ✅ **动画性能提升50%**：优化CSS动画时长和复杂度
- ✅ **交互响应优化**：解决动画阻挡按钮问题
- ✅ **React性能优化**：使用memo、useMemo、useCallback
- ✅ **图片懒加载**：自定义LazyImage组件
- ✅ **性能监控系统**：实时性能指标追踪
- ✅ **批量导入系统**：完整的数据管理功能，支持多格式导入
- ✅ **管理功能集成**：主页面一键直达，无需手动输入URL

### 性能指标
| 指标 | 数值 | 状态 |
|------|------|------|
| 页面加载时间 | 423ms | 优秀 |
| DOM内容加载 | 377.7ms | 优秀 |
| 渲染时间 | <16ms | 流畅 |
| 热重载时间 | 28-44ms | 快速 |

## 🎮 学习数据

### 词汇统计
- 总词汇量：162个专业词汇
- 基础模块：85个词汇（飞行基础与客舱安全）
- 安保模块：77个词汇（安保操作与应急处理）
- 每个词汇包含完整的学习材料

### 对话练习
- 总对话数：10个情景对话
- 涵盖场景：日常执勤、紧急处理、沟通协调
- 每个对话包含完整的中英文对照

## 📖 使用指南

### 学习流程
1. **注册登录**：创建个人学习账户
2. **选择模块**：词汇学习或情景对话
3. **开始学习**：按照个人节奏进行学习
4. **参与测验**：检验学习效果
5. **查看进度**：追踪学习成果

### 管理员功能
- **一键直达**：主页面"数据管理"卡片直接进入
- **批量导入**：支持Excel、CSV、JSON格式的词汇和对话数据导入
- **模板下载**：提供标准化的导入模板文件
- **数据验证**：智能检测数据格式和重复项
- 用户管理和数据统计
- 学习内容更新和维护
- 系统配置和安全管理

## 🔧 开发指南

### 内容修改
查看 [docs/modification-guide.md](docs/modification-guide.md) 了解如何修改词汇和对话内容。

### 添加新功能
1. 在相应的组件目录中创建新组件
2. 更新路由配置（如需要）
3. 添加必要的类型定义
4. 更新文档

### 数据结构
```typescript
interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  partOfSpeech?: string;
  exampleSentenceEn: string;
  exampleSentenceZh: string;
  additionalExamples?: Array<{
    english: string;
    chinese: string;
  }>;
  commonUsages?: Array<{
    phrase: string;
    translation: string;
    example?: string;
  }>;
}
```

## 📚 相关文档

- [应用修改指南](docs/modification-guide.md) - 如何修改学习内容
- [项目蓝图](docs/blueprint.md) - 了解项目愿景和规划
- [快速参考](docs/quick-reference.md) - 常用信息和API参考
- [性能优化报告](PERFORMANCE_OPTIMIZATION_REPORT.md) - 详细的性能优化记录

## 🚀 部署指南

### Firebase配置
1. 创建Firebase项目
2. 配置Firestore数据库
3. 设置身份验证
4. 更新Firebase配置文件

### 生产部署
```bash
# 构建优化版本
npm run build

# 部署到Firebase Hosting
firebase deploy

# 或部署到其他平台
npm start
```

## 🔮 未来规划

### 短期目标
- [ ] 🎵 语音发音功能
- [ ] 📊 学习分析报告
- [ ] 🎯 个性化推荐
- [ ] 📱 PWA离线支持

### 长期目标
- [ ] 🤖 AI语音评估
- [ ] 🎮 游戏化学习
- [ ] 👥 协作学习功能
- [ ] 🌍 多语言界面支持
- [ ] 📈 企业级数据分析

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint配置的代码风格
- 为新功能编写测试用例
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 🐛 提交 [Issue](https://github.com/syh52/studio/issues)
- 💬 参与 [Discussions](https://github.com/syh52/studio/discussions)
- 📧 发送邮件至：[项目邮箱]

## 🙏 致谢

感谢所有为Lexicon项目做出贡献的开发者和用户。特别感谢：

- Firebase团队提供的优秀后端服务
- Next.js团队的前端框架
- Google Genkit团队的AI功能支持
- 航空安全专业人员提供的宝贵建议

---

**Lexicon** - 让航空安全英语学习更智能、更高效！ ✈️🚀

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-15+-black)]()
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
