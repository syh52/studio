# 🇨🇳 中国大陆代理解决方案

## 问题描述

当前 Worker 域名 `yellow-fire-20d4.beelzebub1949.workers.dev` 在中国大陆无法访问，导致 Firebase 认证失败。

## 🛠️ 解决方案

### 方案 1：创建新的 Cloudflare Worker（推荐）

1. **创建新 Worker**：
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Workers & Pages → Create Application → Create Worker
   - 使用不同名称，如：`firebase-cn-proxy` 或 `cn-firebase-proxy`

2. **复制现有代码**：
   ```javascript
   // 完整的 Worker 代码（已验证正确）
   const FIREBASE_HOSTS = [
     'identitytoolkit.googleapis.com',
     'securetoken.googleapis.com', 
     'firestore.googleapis.com',
     'firebaseml.googleapis.com',
     'aiplatform.googleapis.com'
   ];

   export default {
     async fetch(request, env, ctx) {
       // [完整代码见之前的Worker配置]
     }
   };
   ```

3. **更新应用配置**：
   ```typescript
   // 在 src/lib/firebase.ts 中更新：
   const PROXY_URL = 'https://你的新Worker名称.你的用户名.workers.dev';
   
   // 在 src/lib/ai-providers/ai-provider-manager.ts 中同步更新：
   const proxyUrl = 'https://你的新Worker名称.你的用户名.workers.dev';
   ```

### 方案 2：绑定自定义域名（最稳定）

1. **准备自定义域名**：
   - 使用您自己的域名，如：`proxy.yourdomain.com`
   - 确保域名在中国大陆可访问

2. **在 Cloudflare 中绑定**：
   - Worker 设置 → Triggers → Custom Domains → Add Custom Domain
   - 添加：`proxy.yourdomain.com`

3. **更新代码**：
   ```typescript
   // 使用自定义域名
   const PROXY_URL = 'https://proxy.yourdomain.com';
   const proxyUrl = 'https://proxy.yourdomain.com';
   ```

### 方案 3：测试多个 Worker 域名

尝试创建多个不同名称的 Worker，测试哪个在中国大陆可访问：

```
firebase-proxy-1.username.workers.dev
firebase-proxy-2.username.workers.dev  
firebase-proxy-3.username.workers.dev
cn-firebase-api.username.workers.dev
firebase-cn.username.workers.dev
```

## 🚀 部署步骤

1. **更新代理 URL**：
   ```bash
   # 编辑 firebase.ts
   # 取消注释并更新新的代理 URL
   const PROXY_URL = 'https://your-new-worker.your-username.workers.dev';
   ```

2. **同步更新 AI Provider**：
   ```bash
   # 编辑 ai-provider-manager.ts
   # 同步更新代理 URL
   const proxyUrl = 'https://your-new-worker.your-username.workers.dev';
   ```

3. **提交并部署**：
   ```bash
   git add .
   git commit -m "feat: 更新中国大陆可用的代理URL"
   git push origin studio02-backup
   ```

## ✅ 验证方法

1. **本地测试**：
   ```bash
   # 测试新 Worker 连接性
   curl -I https://your-new-worker.your-username.workers.dev
   ```

2. **浏览器测试**：
   - 访问 `https://lexiconlab.cn`
   - 尝试注册/登录功能
   - 检查控制台日志是否显示 `🇨🇳 强制代理 Firebase 请求`

## 🎯 推荐方案

**最佳选择：方案2（自定义域名）**
- 稳定性最高
- 完全可控
- 避免 workers.dev 域名限制

**备选方案：方案1（新Worker）**  
- 快速实施
- 无需额外域名
- 可能仍有网络限制风险

## 📞 技术支持

如遇问题，请检查：
1. Worker 代码是否部署成功
2. 代理 URL 是否在中国大陆可访问
3. Firebase Console 中授权域名是否正确
4. 控制台是否显示代理请求日志 