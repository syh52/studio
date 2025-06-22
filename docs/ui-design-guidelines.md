# Lexicon UI设计规范指南

## 概述

本文档基于Lexicon主页的设计风格，定义了整个应用的UI设计规范。所有新的界面设计都应严格遵循这些规范，以确保用户体验的一致性。

## 设计理念

Lexicon采用现代毛玻璃设计风格（Glass Morphism），结合暗色主题，营造沉浸式、专业的学习环境。设计理念强调**简洁、现代、优雅**。

## 颜色体系

### 主色调
- **背景色**：`bg-gray-900` / `hsl(222.2, 84%, 4.9%)` - 深蓝黑色主背景
- **前景色**：`text-white` / `hsl(210, 40%, 98%)` - 近白色主文字

### 品牌色彩
- **紫色系**：
  - Primary: `purple-600` - 主要品牌色
  - Accent: `purple-500` - 强调色
  - Light: `purple-400` - 浅色变体
  - Background: `purple-500/20` - 透明背景

- **蓝色系**：
  - Primary: `blue-600` - 主要辅助色
  - Accent: `blue-500` - 强调色
  - Light: `blue-400` - 浅色变体
  - Background: `blue-500/20` - 透明背景

### 功能色彩
- **成功**：`green-500`, `green-400`, `green-500/20`
- **警告**：`orange-500`, `orange-400`, `orange-500/20`
- **错误**：`red-500`, `red-400`, `red-500/20`
- **中性**：`gray-400`, `gray-500`, `gray-700`

### 渐变系统
```css
/* 主要渐变 */
.gradient-primary {
  background: linear-gradient(to right, #7c3aed, #2563eb); /* purple-600 to blue-600 */
}

/* 次要渐变 */
.gradient-secondary {
  background: linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(236, 72, 153, 0.2));
}
```

## 毛玻璃效果系统

### 基础毛玻璃卡片
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 强化毛玻璃卡片
```css
.glass-card-strong {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### 使用场景
- **glass-card**：常规内容卡片、模块容器
- **glass-card-strong**：重要内容、弹窗、导航栏

## 圆角系统

- **小圆角**：`rounded-lg` (8px) - 小元素、按钮
- **中圆角**：`rounded-xl` (12px) - 卡片、输入框
- **大圆角**：`rounded-2xl` (16px) - 主要模块
- **超大圆角**：`rounded-3xl` (24px) - 英雄区域、特殊容器

## 字体规范

### 主字体
- **英文**：`font-inter` (Inter)
- **中文**：系统默认中文字体
- **特殊**：`font-zpix` (Zpix像素字体，用于特殊场景)

### 字体大小系统
```css
/* 标题系统 */
.text-3xl    /* 30px - 主标题 */
.text-2xl    /* 24px - 二级标题 */
.text-xl     /* 20px - 三级标题 */
.text-lg     /* 18px - 四级标题 */

/* 正文系统 */
.text-base   /* 16px - 标准正文 */
.text-sm     /* 14px - 小号正文 */
.text-xs     /* 12px - 辅助文字 */
```

### 字重系统
- `font-semibold` - 标题文字
- `font-medium` - 重要内容
- `font-normal` - 常规文字

## 间距系统

### 内边距 (Padding)
- **小间距**：`p-4` (16px) - 小元素
- **中间距**：`p-6` (24px) - 常规卡片
- **大间距**：`p-8` (32px) - 主要容器
- **超大间距**：`p-10` (40px) - 英雄区域

### 外边距 (Margin)
- **模块间距**：`space-y-6` (24px) - 移动端
- **模块间距**：`sm:space-y-8` (32px) - 平板端
- **模块间距**：`md:space-y-10` (40px) - 桌面端

### 响应式间距
始终采用移动优先设计：
```css
/* 基础 → 小屏 → 中屏 → 大屏 */
p-4 sm:p-6 md:p-8
mb-4 sm:mb-6 md:mb-8
```

## 按钮设计规范

### 主要按钮
```css
.primary-button {
  @apply gradient-primary text-white py-3.5 px-6 rounded-2xl font-medium;
  @apply transition-all duration-200 hover:scale-105 active:scale-95;
  @apply shadow-lg modern-focus;
}
```

### 次要按钮
```css
.secondary-button {
  @apply glass-card text-white py-3 px-5 rounded-xl font-medium;
  @apply transition-all duration-200 hover:bg-white/15;
  @apply modern-focus;
}
```

### 图标按钮
```css
.icon-button {
  @apply w-12 h-12 bg-color/20 rounded-xl flex items-center justify-center;
  @apply transition-all duration-200 hover:scale-105;
}
```

## 动画规范

### 入场动画
```css
.animate-blur-in {
  animation: blur-in 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes blur-in {
  from {
    filter: blur(8px);
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    filter: blur(0px);
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 交互动画
- **悬停缩放**：`hover:scale-105`
- **点击缩放**：`active:scale-95`
- **颜色过渡**：`transition-colors duration-200`
- **全属性过渡**：`transition-all duration-200`

### 延迟动画
使用阶梯式动画延迟创建层次感：
- `animate-delay-200` (0.2s)
- `animate-delay-300` (0.3s)
- `animate-delay-400` (0.4s)
- `animate-delay-500` (0.5s)
- `animate-delay-600` (0.6s)

## 图标系统

### 图标库
使用 **Lucide React** 图标库

### 图标大小
- **小图标**：`h-4 w-4` (16px)
- **中图标**：`h-6 w-6` (24px)
- **大图标**：`h-8 w-8` (32px)
- **超大图标**：`h-12 w-12` (48px)

### 图标容器
```css
.icon-container {
  @apply w-12 h-12 bg-color/20 rounded-xl flex items-center justify-center;
}
```

## 卡片设计规范

### 模块卡片
```css
.module-card {
  @apply glass-card rounded-2xl p-6 perspective-element;
  @apply transform transition-all duration-200 ease-out;
  @apply hover:scale-105 cursor-pointer active:scale-95;
  @apply btn-enhanced; /* 点击波纹效果 */
}
```

### 内容卡片
```css
.content-card {
  @apply glass-card rounded-xl p-6;
  @apply hover:bg-white/12 transition-all duration-200;
}
```

## 响应式设计规范

### 断点系统
- **sm**: 640px+ (平板竖屏)
- **md**: 768px+ (平板横屏)
- **lg**: 1024px+ (桌面)
- **xl**: 1280px+ (大屏桌面)

### 网格系统
```css
/* 移动端：2列 | 桌面端：4列 */
.module-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6;
}

/* 移动端：1列 | 桌面端：2列 */
.content-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6;
}
```

## 状态设计

### 加载状态
```css
.loading-spinner {
  @apply w-16 h-16 border-4 border-purple-500 border-t-transparent;
  @apply rounded-full animate-spin;
}
```

### 禁用状态
```css
.disabled-state {
  @apply opacity-50 cursor-not-allowed pointer-events-none;
}
```

### 悬停状态
```css
.hover-enhanced {
  @apply hover:bg-white/12 transition-all duration-200;
}
```

## 表单设计规范

### 输入框
```css
.form-input {
  @apply glass-card rounded-xl p-4 text-white placeholder-gray-400;
  @apply border-white/20 focus:border-purple-500/50;
  @apply modern-focus transition-all duration-200;
}
```

### 标签
```css
.form-label {
  @apply text-sm font-medium text-white mb-2 block;
}
```

## 导航设计规范

### 顶部导航
```css
.top-nav {
  @apply glass-card-strong rounded-2xl p-4;
  @apply flex items-center justify-between;
}
```

### 侧边导航
```css
.side-nav {
  @apply glass-card-strong h-full p-6;
  @apply space-y-4;
}
```

## 文字层级规范

### 标题层级
1. **页面主标题**：`text-3xl font-semibold text-white tracking-tight`
2. **区域标题**：`text-2xl font-semibold text-white tracking-tight`
3. **卡片标题**：`text-lg font-semibold text-white tracking-tight`
4. **子标题**：`text-base font-medium text-white`

### 正文层级
1. **主要正文**：`text-base text-white leading-relaxed`
2. **次要正文**：`text-sm text-gray-400 leading-relaxed`
3. **辅助文字**：`text-xs text-gray-400`

## 阴影和光效

### 发光效果
```css
.shadow-glow {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); /* 紫色发光 */
}

.shadow-glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); /* 蓝色发光 */
}
```

## 实施指南

### 1. 新页面设计检查清单
- [ ] 使用暗色背景 (`bg-gray-900`)
- [ ] 应用毛玻璃卡片 (`glass-card`)
- [ ] 使用品牌色彩系统
- [ ] 实现响应式布局
- [ ] 添加适当的动画效果
- [ ] 确保可访问性 (`modern-focus`)

### 2. 组件复用
- 优先使用已有的UI组件
- 保持设计token一致性
- 遵循命名规范

### 3. 设计验证
- 在多种设备上测试
- 验证动画性能
- 确保颜色对比度符合可访问性标准

## 总结

这套设计规范确保Lexicon在所有界面上保持一致的视觉体验。通过严格遵循这些规范，我们能够：

1. **提升用户体验**：一致的设计语言降低学习成本
2. **提高开发效率**：标准化的组件和样式减少重复工作
3. **保证品牌一致性**：统一的视觉风格强化品牌认知
4. **便于维护**：规范化的代码结构易于维护和扩展

所有新的UI设计都必须严格遵循本规范，如有特殊需求需要偏离规范，必须经过设计评审。 