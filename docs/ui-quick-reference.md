# Lexicon UI设计快速参考

## 常用样式类

### 毛玻璃卡片
```css
.glass-card          /* 常规：bg-white/10 backdrop-blur-xl border-white/20 */
.glass-card-strong   /* 强化：bg-white/15 backdrop-blur-2xl border-white/30 */
```

### 渐变按钮
```css
.gradient-primary    /* 主按钮：purple-600 to blue-600 */
.gradient-secondary  /* 次按钮：red-500/20 to pink-500/20 */
```

### 圆角系统
```css
rounded-lg     /* 8px  - 小元素 */
rounded-xl     /* 12px - 卡片 */
rounded-2xl    /* 16px - 主要模块 */
rounded-3xl    /* 24px - 英雄区域 */
```

### 动画
```css
.animate-blur-in           /* 入场动画 */
.animate-delay-200/300/400 /* 延迟动画 */
hover:scale-105            /* 悬停缩放 */
active:scale-95            /* 点击缩放 */
```

## 配色速查

### 品牌色
- **紫色**: `purple-600` `purple-500` `purple-400` `purple-500/20`
- **蓝色**: `blue-600` `blue-500` `blue-400` `blue-500/20`

### 功能色
- **成功**: `green-500` `green-400` `green-500/20`
- **警告**: `orange-500` `orange-400` `orange-500/20`
- **错误**: `red-500` `red-400` `red-500/20`

### 基础色
- **背景**: `bg-gray-900`
- **文字**: `text-white` `text-gray-400`

## 常用组件模板

### 模块卡片
```jsx
<div className="glass-card rounded-2xl p-6 perspective-element transform transition-all duration-200 ease-out hover:scale-105 cursor-pointer active:scale-95 btn-enhanced">
  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
    <Icon className="h-6 w-6 text-purple-400" />
  </div>
  <h4 className="text-lg font-semibold text-white mb-2 tracking-tight">标题</h4>
  <p className="text-sm text-gray-400 leading-relaxed">描述</p>
</div>
```

### 主要按钮
```jsx
<button className="gradient-primary text-white py-3.5 px-6 rounded-2xl text-base font-medium modern-focus cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg">
  按钮文字
</button>
```

### 页面容器
```jsx
<div className="space-y-6 sm:space-y-8 md:space-y-10 py-4 sm:py-6">
  {/* 页面内容 */}
</div>
```

### 标题
```jsx
<h3 className="text-2xl font-inter font-semibold text-white tracking-tight mb-6">
  区域标题
</h3>
```

## 响应式间距

### Padding
```css
p-4 sm:p-6 md:p-8     /* 16px → 24px → 32px */
p-6 sm:p-8 md:p-10    /* 24px → 32px → 40px */
```

### Margin
```css
space-y-6 sm:space-y-8 md:space-y-10  /* 模块间距 */
mb-4 sm:mb-6 md:mb-8                   /* 底边距 */
```

## 网格布局
```css
grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6  /* 移动2列，桌面4列 */
grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6  /* 移动1列，桌面2列 */
```

## 焦点样式
```css
.modern-focus {
  @apply focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900;
}
``` 