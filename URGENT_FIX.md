# 🚨 紧急修复：CORS和连接问题

## 问题诊断

从您的DevTools截图发现：
1. ❌ CORS策略阻止了从`lexiconlab.cn`到`api.lexiconlab.cn`的请求
2. ❌ Firebase连接失败："Could not reach Cloud Firestore backend"  
3. ❌ WebChannel RPC连接错误

## 🔧 立即修复步骤

### 步骤1：更新Cloudflare Worker（立即执行）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 找到您的`lexicon-cn-proxy` Worker
3. 点击 **Quick Edit**
4. **完全替换**代码为最新的`cloudflare-worker.js`内容
5. 点击 **Save and Deploy**

### 步骤2：验证Worker修复

访问 `https://api.lexiconlab.cn` 应该返回：
```json
{
  "status": "online",
  "service": "Lexicon Firebase CN Proxy",
  "message": "🇨🇳 Firebase代理服务运行正常"
}
```

### 步骤3：清除浏览器缓存

1. 在Chrome中按 `Ctrl+Shift+R` 强制刷新
2. 或者在DevTools中右键刷新按钮选择"Empty Cache and Hard Reload"

### 步骤4：检查Firebase Console设置

确保在 [Firebase Console](https://console.firebase.google.com/) 中：
1. **Authentication** → **Settings** → **Authorized domains**
2. 添加以下域名：
   - `lexiconlab.cn`
   - `api.lexiconlab.cn` 
   - 您的Firebase App Hosting域名

## 🔍 修复详情

### CORS头部增强
```javascript
// 新增的CORS头部
'Access-Control-Allow-Credentials': 'true',
'Access-Control-Allow-Headers': '..., X-Client-Version, X-Firebase-AppCheck',
'Access-Control-Expose-Headers': '..., X-Firebase-AppCheck',
```

### Firebase配置优化
- 改用轻量级fetch拦截而非emulator连接
- 移除可能导致混淆的authDomain设置
- 优化请求重定向逻辑

## 🚀 预期效果

修复后应该看到：
- ✅ 控制台无CORS错误
- ✅ Firebase请求成功通过代理
- ✅ 登录/注册功能正常工作
- ✅ 控制台显示"🌐 代理Firebase请求"日志

## ⚡ 如果问题仍然存在

1. **检查Worker日志**：在Cloudflare Dashboard查看Worker的实时日志
2. **测试直接访问**：`https://api.lexiconlab.cn/identitytoolkit.googleapis.com/v1/projects`
3. **DNS检查**：确认`api.lexiconlab.cn`解析到Cloudflare

需要我协助进一步诊断，请提供：
- Worker访问测试结果
- 更新后的DevTools网络面板截图
- Firebase Console授权域名配置截图 