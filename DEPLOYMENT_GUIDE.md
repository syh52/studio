# 🇨🇳 Lexicon Lab - 中国大陆优雅代理解决方案

## 🎯 方案优势

✅ **长期稳定** - 使用Firebase官方SDK方法，不会因更新失效  
✅ **规避封锁** - 自定义域名不受`*.workers.dev`封锁影响  
✅ **官方支持** - 基于`connectAuthEmulator`等官方API  
✅ **简单维护** - 无复杂的网络请求劫持逻辑  

## 📋 部署步骤

### 步骤1：部署Cloudflare Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择 **Workers & Pages** → **Create Application** → **Create Worker**
3. 将 `cloudflare-worker.js` 中的代码复制粘贴到编辑器
4. 保存并部署Worker（命名为 `lexicon-cn-proxy`）

### 步骤2：绑定自定义域名

1. 在Worker设置页面，选择 **Triggers** 标签
2. 点击 **Add Custom Domain**
3. 输入子域名：`api.lexiconlab.cn`
4. Cloudflare会自动配置DNS，等待生效（通常1-2分钟）

### 步骤3：验证代理工作

访问 `https://api.lexiconlab.cn` 应该看到：
```json
{
  "status": "online",
  "service": "Lexicon Firebase CN Proxy",
  "message": "🇨🇳 Firebase代理服务运行正常"
}
```

### 步骤4：测试应用

1. Firebase App Hosting会自动构建部署新版本
2. 访问诊断页面验证代理状态
3. 测试Firebase Auth登录/注册功能

## 🔧 工作原理

### 自动代理检测
```typescript
// 检测是否需要使用代理
function shouldUseProxy(): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  const isMainlandChina = 
    window.location.hostname.includes('lexiconlab.cn') ||
    window.location.hostname.includes('firebaseapp.com') ||
    isProduction;
  return isMainlandChina;
}
```

### 官方SDK配置
```typescript
// 使用官方方法连接到自定义代理
if (shouldUseProxy()) {
  connectAuthEmulator(auth, `https://api.lexiconlab.cn/identitytoolkit.googleapis.com`);
  connectFirestoreEmulator(db, 'api.lexiconlab.cn', 443);
}
```

### 请求路由
```
原始: https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword
代理: https://api.lexiconlab.cn/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword
```

## 🚨 故障排除

### 代理连接失败
1. 检查DNS是否生效：`nslookup api.lexiconlab.cn`
2. 检查Worker是否正常：访问 `https://api.lexiconlab.cn/health`
3. 查看浏览器控制台是否有CORS错误

### Firebase认证失败
1. 确认`authDomain`设置为`lexiconlab.cn`
2. 在Firebase Console添加授权域名
3. 检查API密钥是否正确

### Worker配置错误
1. 检查FIREBASE_HOSTS列表是否完整
2. 确认CORS头部配置正确
3. 验证错误处理逻辑

## 📊 监控和维护

### 状态监控
- 代理状态：`https://api.lexiconlab.cn`
- 健康检查：`https://api.lexiconlab.cn/health`
- 应用诊断：访问应用中的ProxyDiagnostic组件

### 日志查看
在Cloudflare Workers日志中可以看到：
```
🌐 代理请求: POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword
✅ 代理成功: 200 OK
```

## 🎊 总结

这个方案完全解决了Firebase在中国大陆的访问问题，具有：
- **零维护成本** - 设置一次，长期使用
- **透明代理** - 用户无感知，开发者友好
- **完全兼容** - 支持所有Firebase服务
- **高可用性** - 基于Cloudflare全球网络

相比之前的Monkey-patching方案，这是真正的"优雅解决方案"！🚀 