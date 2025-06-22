# Firebase App Hosting 部署指南

## 概述

本指南将帮助您将 Lexicon 应用部署到 Firebase App Hosting，并正确配置环境变量。

## 前提条件

1. ✅ Firebase CLI 已安装并登录
2. ✅ 项目已连接到 GitHub
3. ✅ Firebase 项目已升级到 Blaze 计划（App Hosting 需要）

## 部署步骤

### 1. 设置代理（如果需要）

```powershell
$env:http_proxy="http://127.0.0.1:7890"
$env:https_proxy="http://127.0.0.1:7890"
```

### 2. 验证 Firebase 登录

```powershell
firebase login
firebase projects:list
```

### 3. 初始化 App Hosting

如果还没有创建后端，运行：

```powershell
firebase apphosting:backends:create --project aviation-lexicon-trainer
```

按照提示配置：
- 🔗 **GitHub 连接**: 选择您的 GitHub 仓库
- 📁 **根目录**: 选择 `studio`（因为 Next.js 应用在 studio 子目录中）
- 🌿 **分支**: 选择 `main` 或您的主分支
- 🎯 **区域**: 推荐选择 `us-central1`

### 4. 验证配置文件

确保 `apphosting.yaml` 文件位于 `studio/apphosting.yaml`：

```yaml
# Settings to manage and configure a Firebase App Hosting backend.
runConfig:
  cpu: 2
  memoryMiB: 1024
  concurrency: 100
  maxInstances: 10
  minInstances: 0

env:
  - variable: NODE_ENV
    value: production
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    value: AIzaSyDtARFXghjPrzCOUYtucYkUJI22HzcmHcY
    availability:
      - BUILD
      - RUNTIME

  # ... 其他环境变量
```

### 5. 推送代码到 GitHub

```powershell
git add .
git commit -m "配置 App Hosting 环境变量"
git push origin main
```

### 6. 部署应用

App Hosting 会自动触发部署，您也可以手动触发：

```powershell
firebase apphosting:backends:rollout --project aviation-lexicon-trainer
```

### 7. 查看部署状态

```powershell
# 查看后端状态
firebase apphosting:backends:list --project aviation-lexicon-trainer

# 查看部署日志
firebase apphosting:backends:describe BACKEND_ID --project aviation-lexicon-trainer
```

## 环境变量管理

### 查看当前环境变量

在 Firebase 控制台 > App Hosting > 您的后端 > 配置 中查看。

### 添加新的环境变量

1. 编辑 `studio/apphosting.yaml`
2. 添加新变量：

```yaml
env:
  - variable: NEW_VARIABLE
    value: new_value
    availability:
      - RUNTIME
```

3. 提交并推送代码触发重新部署。

### 使用 Secret Manager（敏感信息）

对于敏感信息（如第三方 API 密钥），使用 Secret Manager：

```powershell
# 创建密钥
firebase apphosting:secrets:set API_KEY --project aviation-lexicon-trainer

# 在 apphosting.yaml 中引用
env:
  - variable: API_KEY
    secret: projects/aviation-lexicon-trainer/secrets/api-key/versions/latest
    availability:
      - RUNTIME
```

## 故障排除

### 1. 构建失败

**检查项目结构**:
```
studio/
├── apphosting.yaml
├── package.json
├── next.config.ts
└── src/
```

**常见问题**:
- ❌ `apphosting.yaml` 位置错误
- ❌ Node.js 版本不兼容
- ❌ 依赖安装失败

**解决方案**:
```yaml
# 在 apphosting.yaml 中指定 Node 版本
scripts:
  buildCommand: node --version && npm --version && npm ci && npm run build
```

### 2. 运行时错误

**检查环境变量**:
- 在应用代码中添加调试日志：

```typescript
console.log('环境变量检查:', {
  NODE_ENV: process.env.NODE_ENV,
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // 不要输出敏感信息
});
```

### 3. 内存不足

增加内存配置：

```yaml
runConfig:
  memoryMiB: 2048  # 增加到 2GB
  cpu: 4           # 相应增加 CPU
```

### 4. 冷启动问题

使用最小实例数：

```yaml
runConfig:
  minInstances: 1  # 保持至少 1 个实例运行
```

## 性能优化

### 1. 构建优化

```yaml
scripts:
  buildCommand: npm ci --production=false && npm run build && npm prune --production
```

### 2. 静态资源

对于静态资源，考虑使用 Firebase Hosting：

```yaml
# firebase.json
{
  "hosting": {
    "public": "studio/.next/static",
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "your-backend-id"
        }
      }
    ]
  }
}
```

### 3. 缓存策略

在 Next.js 中配置适当的缓存：

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

## 监控和日志

### 查看应用日志

```powershell
# 实时日志
firebase apphosting:backends:logs BACKEND_ID --project aviation-lexicon-trainer --follow

# 历史日志
firebase apphosting:backends:logs BACKEND_ID --project aviation-lexicon-trainer --limit 100
```

### 性能监控

在 Firebase 控制台中查看：
- 🔥 **App Hosting 仪表板**: 实例状态、CPU/内存使用
- 📊 **Cloud Logging**: 详细日志分析
- 📈 **Cloud Monitoring**: 性能指标

## 相关资源

- [Firebase App Hosting 文档](https://firebase.google.com/docs/app-hosting)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Cloud Secret Manager](https://cloud.google.com/secret-manager) 