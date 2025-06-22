# Lexicon - 航空安全英语学习应用

一个专为航空安全员设计的英语学习应用，帮助掌握日常执勤和紧急情况下所需的专业英语词汇与对话。

## ✨ 项目特色

- 🎯 **专业词汇体系**: 162个精选航空安全英语词汇，分为基础与安保两大类别
- 💬 **真实情景对话**: 10个完整对话场景，涵盖日常执勤到紧急处置全流程
- 🎮 **互动学习模式**: 词汇测验、对话练习等多样化学习方式
- 🌟 **积分签到系统**: 每日签到获取积分，激励持续学习
- 📱 **响应式设计**: 完美适配手机、平板、电脑等多种设备
- 🎨 **现代UI设计**: 精美的毛玻璃效果和流畅的动画体验
- 🤖 **AI智能助手**: 集成Google Genkit AI，提供智能学习辅助

## 🚀 快速开始

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- Firebase 项目（已配置 Authentication 和 Firestore）

### 安装步骤

```bash
# 克隆项目
git clone [your-repo-url]
cd studio

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### Firebase 配置

1. **启用 Authentication**
   - 在 Firebase Console 中启用"电子邮件/密码"登录方式
   - 配置邮件模板（可选）

2. **配置 Firestore**
   - 创建 Firestore 数据库
   - 应用安全规则（见 `firestore.rules`）

3. **环境配置**
   - 项目使用硬编码的 Firebase 配置（见 `src/lib/firebase.ts`）
   - 生产环境建议使用环境变量

详细配置说明请参考 [认证系统设置指南](./docs/authentication-setup.md)

应用将在 http://localhost:9002 启动

### Windows用户快速启动
- 双击 `启动Lexicon.bat` 文件
- 或右键运行 `启动Lexicon.ps1` 获得更好的启动体验

## 📚 核心功能

### 1. 词汇学习系统
- **飞行基础与客舱安全** (85个词汇)
  - 基础航空术语：Altitude, Runway, Cockpit, Turbulence等
  - 安全设备词汇：Life Vest, Oxygen Mask, Emergency Exit等
  - 机上物品管理：Power Bank, Mobile Phone, Boarding Pass等

- **安保操作与应急处理** (77个词汇)  
  - 安保操作：Security Officer, Surveillance, Confiscate等
  - 行为管理：Fighting, Intoxicated, Cooperate等
  - 紧急处置：Hijacking, Explosive, Mayday等

每个词汇包含：
- 英文单词和中文翻译
- 词性标注
- 实用例句（中英对照）
- 常用短语搭配
- 多个应用场景示例

### 2. 情景对话练习
涵盖10个完整对话场景：
- 打架斗殴处理
- 旅客吸烟事件
- 醉酒旅客管理
- 遣返旅客交接
- 与驾驶舱沟通
- 紧急设备使用
- 等等...

每个对话包含：
- 完整的中英文对照
- 真实的工作场景模拟
- 标准的专业术语使用

### 3. 测验学习系统
- 词汇配对测试
- 对话理解练习
- 学习进度追踪
- 个性化复习建议

### 4. 用户体验功能
- 用户注册登录系统
- 每日签到积分奖励
- 学习进度可视化
- 个人资料管理

## 🛠️ 技术架构

### 前端技术栈
- **框架**: Next.js 15.2.3 (App Router)
- **UI库**: React 18 + TypeScript
- **样式**: Tailwind CSS + 自定义CSS动画
- **组件库**: Radix UI (高质量无障碍组件)
- **图标**: Lucide React
- **状态管理**: React Context + Hook
- **数据存储**: 浏览器LocalStorage

### AI集成
- **AI框架**: Google Genkit
- **模型**: Gemini 2.0 Flash
- **功能**: 智能学习辅助和内容生成

### 开发工具
- **包管理**: npm
- **类型检查**: TypeScript
- **代码规范**: ESLint
- **构建工具**: Next.js内置（基于Turbopack）

## 📁 项目结构

```
studio/
├── src/
│   ├── app/                    # Next.js App Router页面
│   │   ├── vocabulary/         # 词汇学习模块
│   │   ├── dialogues/          # 对话练习模块  
│   │   ├── quizzes/           # 测验系统
│   │   ├── login/             # 用户登录
│   │   ├── register/          # 用户注册
│   │   └── profile/           # 个人资料
│   ├── components/            # React组件
│   │   ├── auth/              # 认证相关组件
│   │   ├── vocabulary/        # 词汇学习组件
│   │   ├── quiz/              # 测验组件
│   │   ├── layout/            # 布局组件
│   │   └── ui/                # 基础UI组件
│   ├── contexts/              # React Context
│   ├── hooks/                 # 自定义Hook
│   ├── lib/                   # 工具函数和数据
│   │   ├── data.ts            # 词汇和对话数据
│   │   └── utils.ts           # 工具函数
│   └── ai/                    # AI功能集成
├── public/                    # 静态资源
├── docs/                      # 项目文档
├── 启动Lexicon.bat           # Windows快速启动
├── 启动Lexicon.ps1           # PowerShell启动脚本
└── 快速启动指南.md           # 详细启动说明
```

## 🎨 设计亮点

- **毛玻璃效果**: 现代感的UI视觉体验
- **流畅动画**: 精心设计的页面切换和交互动画
- **响应式布局**: 完美适配各种屏幕尺寸
- **无障碍设计**: 基于Radix UI的高质量组件
- **深色主题**: 护眼的深色配色方案

## 🔧 开发指南

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- 现代浏览器（Chrome/Firefox/Safari/Edge）

### 开发命令
```bash
# 开发模式启动
npm run dev

# AI功能开发
npm run genkit:dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 类型检查
npm run typecheck
```

### 数据管理
- 词汇数据：`src/lib/data.ts`
- 对话数据：`src/lib/dialogue-categories.json`
- 用户数据：浏览器LocalStorage

## 📖 使用说明

### 注册新用户
1. 访问 `/register` 页面
2. 填写用户名、邮箱和密码
3. 系统会发送验证邮件到您的邮箱
4. 注册成功后自动跳转到登录页面

### 登录系统
1. 访问 `/login` 页面
2. 输入邮箱和密码
3. 如忘记密码，点击"忘记密码？"发送重置邮件
4. 登录成功后进入主页

### 管理个人资料
1. 登录后访问 `/profile` 页面
2. 可以编辑用户名和个人简介
3. 查看邮箱验证状态
4. 每日签到获取积分

### 默认测试账户
- 邮箱: `user@example.com`
- 密码: `password123`

### 学习流程
1. 注册/登录账户
2. 选择词汇包开始学习
3. 练习情景对话
4. 参与测验巩固
5. 每日签到获取积分

## 🔮 未来规划

- [ ] **音频功能**: 词汇发音和对话音频
- [ ] **云端同步**: Firebase集成，跨设备数据同步
- [ ] **社交功能**: 学习小组和排行榜
- [ ] **离线支持**: PWA应用，支持离线学习
- [ ] **更多内容**: 扩展词汇包和对话场景
- [ ] **AI增强**: 个性化学习路径推荐

## 🤝 贡献指南

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -m '添加新功能'`)
4. 推送分支 (`git push origin feature/新功能`)
5. 创建Pull Request

## 📄 许可协议

本项目采用 MIT 许可协议

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 [Issue](https://github.com/你的用户名/lexicon/issues)
- 发送邮件至：[你的邮箱]

---

**Lexicon** - 让航空安全英语学习更简单、更有趣！ ✈️
