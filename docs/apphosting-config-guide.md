# Firebase App Hosting 配置指南

## 概述

本文档详细说明如何使用 `apphosting.yaml` 文件配置 Firebase App Hosting 后端的环境变量和运行参数。

## 配置文件结构

### 1. 运行配置 (runConfig)

```yaml
runConfig:
  cpu: 2                    # CPU数量（默认0）
  memoryMiB: 1024          # 内存大小（MB，默认512）
  concurrency: 100         # 并发请求数（默认80）
  maxInstances: 10         # 最大实例数（默认100）
  minInstances: 0          # 最小实例数（默认0）
```

#### CPU 和内存关系

- 超过 4GB 需要至少 2 个 CPU
- 超过 8GB 需要至少 4 个 CPU
- 超过 16GB 需要至少 6 个 CPU
- 超过 24GB 需要至少 8 个 CPU

### 2. 环境变量配置 (env)

#### 2.1 基础环境变量

```yaml
env:
  - variable: NODE_ENV
    value: production
    availability:
      - BUILD      # 构建时可用
      - RUNTIME    # 运行时可用
```

#### 2.2 Next.js 公共环境变量

以 `NEXT_PUBLIC_` 开头的变量会被包含在浏览器端：

```yaml
  - variable: NEXT_PUBLIC_APP_NAME
    value: Lexicon
    availability:
      - BUILD
      - RUNTIME
```

#### 2.3 Secret Manager 密钥

敏感信息应存储在 Cloud Secret Manager 中：

```yaml
  - variable: OPENAI_API_KEY
    secret: projects/your-project/secrets/openai-api-key/versions/latest
    availability:
      - RUNTIME
```

### 3. 可用性配置 (availability)

- `BUILD`: 变量仅在构建阶段可用
- `RUNTIME`: 变量仅在运行时可用
- `BUILD` + `RUNTIME`: 变量在两个阶段都可用

### 4. 构建输出配置 (outputFiles)

```yaml
outputFiles:
  serverApp:
    include: [dist, server.js]  # 包含的文件和目录
```

### 5. 自定义脚本 (scripts)

```yaml
scripts:
  buildCommand: npm run build   # 构建命令
  runCommand: npm start        # 运行命令
```

## 具体配置步骤

### 步骤 1: 更新项目配置

1. 将 `apphosting.yaml` 中的占位符替换为实际值：
   - `your-firebase-project-id` → 您的Firebase项目ID
   - `your-firebase-api-key` → 您的Firebase API密钥
   - `your-project.firebaseapp.com` → 您的项目域名

### 步骤 2: 配置 Secret Manager

对于敏感信息，使用Firebase CLI创建密钥：

```bash
# 设置代理（如果需要）
$env:http_proxy="http://127.0.0.1:7890"
$env:https_proxy="http://127.0.0.1:7890"

# 创建密钥
firebase apphosting:secrets:set OPENAI_API_KEY
firebase apphosting:secrets:set GEMINI_API_KEY
firebase apphosting:secrets:set DATABASE_URL
```

### 步骤 3: 更新应用代码

确保您的应用代码能够正确读取环境变量：

```typescript
// 运行时环境变量
const openaiApiKey = process.env.OPENAI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

// 浏览器端环境变量
const appName = process.env.NEXT_PUBLIC_APP_NAME;
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

### 步骤 4: 部署配置

```bash
# 创建或更新后端
firebase apphosting:backends:create --project PROJECT_ID

# 或者如果已存在
firebase deploy --only apphosting
```

## 最佳实践

### 1. 安全性

- ✅ 敏感数据（API密钥、数据库连接）使用 Secret Manager
- ✅ 公共配置可以直接在 yaml 中设置
- ❌ 避免在 yaml 中直接写入密钥

### 2. 性能优化

- ✅ 根据应用负载调整 `concurrency` 和 `maxInstances`
- ✅ 为高内存需求应用增加 `memoryMiB`
- ✅ 使用 `minInstances` 避免冷启动（但会增加成本）

### 3. 环境管理

- ✅ 使用不同的配置文件管理不同环境
- ✅ 通过 `availability` 精确控制变量可用性
- ✅ 为开发和生产环境使用不同的密钥

## 常见问题

### Q: 如何查看当前的环境变量？

A: 在应用中可以通过 `console.log(process.env)` 查看可用的环境变量。

### Q: 环境变量没有生效怎么办？

A: 检查以下几点：
1. `availability` 设置是否正确
2. 变量名是否拼写正确
3. Secret Manager 中的密钥是否存在
4. 是否重新部署了应用

### Q: NEXT_PUBLIC_ 变量在服务器端能访问吗？

A: 可以，NEXT_PUBLIC_ 变量在服务器端和客户端都可以访问。

## 相关资源

- [Firebase App Hosting 官方文档](https://firebase.google.com/docs/app-hosting)
- [Cloud Secret Manager 文档](https://cloud.google.com/secret-manager/docs)
- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables) 