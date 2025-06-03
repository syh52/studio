# Lexicon - 航空安全英语学习应用

Lexicon 是一个专为航空安全员设计的英语学习应用，帮助他们掌握日常执勤和紧急情况下所需的专业英语。

## 项目特点

- 🎯 **专业词汇学习**：涵盖航空安全执勤的核心词汇
- 💬 **情景对话练习**：真实的工作场景对话
- 🎮 **互动测验**：通过游戏化方式巩固学习
- 📱 **响应式设计**：支持手机、平板和电脑
- 🎨 **像素艺术风格**：独特的视觉体验

## 快速开始

```bash
# 进入项目目录
cd I:\firebase\studio

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:9002 查看应用

## 项目结构

```
studio/
├── src/                    # 源代码
│   ├── app/               # Next.js 应用路由
│   ├── components/        # React 组件
│   └── lib/              # 工具函数和数据
├── docs/                  # 项目文档
│   ├── modification-guide.md  # 修改指南
│   ├── blueprint.md          # 项目蓝图
│   └── quick-reference.md    # 快速参考
└── public/               # 静态资源
```

## 功能模块

### 1. 词汇学习
- 基础航空英语词汇（85个词汇）
- 航空安全执勤专业词汇（77个词汇）
- 每个词汇包含：
  - 英文单词和中文翻译
  - 实用例句
  - 发音指导（即将推出）

### 2. 对话练习
- **日常执勤对话**：
  - 飞行前检查
  - 旅客管理
  - 机组协同
- **紧急情况对话**：
  - 安全事件处理
  - 紧急通信
  - 危机管理

### 3. 互动测验
- 词汇配对游戏
- 对话理解测试
- 学习进度追踪

## 修改内容

如需修改词汇或对话内容，请查看 [docs/modification-guide.md](docs/modification-guide.md)

## 技术栈

- **前端框架**: Next.js 14
- **UI库**: React 18
- **样式**: Tailwind CSS
- **类型**: TypeScript
- **图标**: Lucide React

## 文档

- [应用修改指南](docs/modification-guide.md) - 如何修改词汇和对话
- [项目蓝图](docs/blueprint.md) - 了解项目愿景
- [快速参考](docs/quick-reference.md) - 常用信息查询

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 未来计划

- [ ] 音频发音功能
- [ ] 用户进度保存
- [ ] 更多词汇包
- [ ] 离线使用支持
- [ ] 多语言界面

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/syh52/studio/issues)
- 发送邮件至：[您的邮箱]

---

**Lexicon** - 让航空安全英语学习更简单、更有趣！ ✈️
