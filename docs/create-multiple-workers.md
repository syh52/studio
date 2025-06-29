# 🚀 创建多个 Cloudflare Workers 指南

## ⚠️ 注意：此方案已被更优方案替代

**✅ 当前推荐方案**：使用自定义域名 `api.lexiconlab.cn` 作为统一代理
- 更稳定：不受 workers.dev 域名封锁影响
- 更简单：无需管理多个 Worker
- 已部署：当前系统正在使用

**📋 本指南状态**：仅供参考和紧急备用，正常情况下无需执行

---

## 🎯 目标

创建 5 个不同名称的 Cloudflare Workers，增加在中国大陆的可访问性。

## 📋 需要创建的 Workers

1. `firebase-cn-proxy` - 主要代理
2. `firebase-proxy-backup` - 备用代理
3. `cn-firebase-api` - 中国专用API代理
4. `firebase-proxy-2024` - 年份标识代理
5. ~~`yellow-fire-20d4`~~ - ❌ 已弃用（原有的测试Worker）

## 🛠️ 创建步骤

### 步骤 1：访问 Cloudflare Dashboard

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录您的账户
3. 点击左侧菜单的 **"Workers & Pages"**

### 步骤 2：创建第一个 Worker

1. 点击 **"Create Application"**
2. 选择 **"Create Worker"**
3. 输入名称：`firebase-cn-proxy`
4. 点击 **"Deploy"**

### 步骤 3：编辑 Worker 代码

点击 **"Edit Code"**，删除所有默认代码，粘贴以下代码：

```javascript
// Firebase 代理 Worker - 中国大陆专用
const FIREBASE_HOSTS = [
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com', 
  'firestore.googleapis.com',
  'firebaseml.googleapis.com',
  'aiplatform.googleapis.com',
  'firebase.googleapis.com',
  'www.googleapis.com'
];

export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // 根路径访问 - 返回状态信息
    if (pathSegments.length === 0) {
      return new Response(JSON.stringify({
        status: 'online',
        message: 'Firebase 代理服务运行中 (中国大陆专用)',
        worker_name: 'firebase-cn-proxy',
        timestamp: new Date().toISOString(),
        supported_hosts: FIREBASE_HOSTS
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const targetHost = pathSegments[0];
    
    // 验证目标主机
    if (!FIREBASE_HOSTS.includes(targetHost)) {
      return new Response(JSON.stringify({
        error: '不支持的目标主机',
        requested_host: targetHost,
        supported_hosts: FIREBASE_HOSTS
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 构建目标URL
    const targetPath = '/' + pathSegments.slice(1).join('/');
    const targetUrl = `https://${targetHost}${targetPath}${url.search}`;

    try {
      console.log(`🔄 代理请求: ${targetUrl}`);
      
      // 转发请求到 Firebase
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      // 添加 CORS 头部并返回响应
      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        },
      });

      console.log(`✅ 代理成功: ${response.status} ${targetUrl}`);
      return modifiedResponse;
      
    } catch (error) {
      console.error(`❌ 代理失败: ${targetUrl}`, error);
      
      return new Response(JSON.stringify({
        error: '代理请求失败',
        message: error.message,
        target_url: targetUrl,
        worker_name: 'firebase-cn-proxy'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  },
};
```

### 步骤 4：保存并部署

1. 点击 **"Save and Deploy"**
2. 等待部署完成
3. 记录 Worker URL：`https://firebase-cn-proxy.beelzebub1949.workers.dev`

### 步骤 5：重复创建其他 Workers

重复步骤 2-4，分别创建：

- `firebase-proxy-backup`
- `cn-firebase-api`
- `firebase-proxy-2024`

**注意**：每个 Worker 使用相同的代码，只需要在代码中修改 `worker_name` 字段。

例如，对于 `firebase-proxy-backup`：
```javascript
worker_name: 'firebase-proxy-backup',
```

## ✅ 验证 Workers

创建完成后，访问每个 Worker 的根 URL，应该看到类似响应：

```json
{
  "status": "online",
  "message": "Firebase 代理服务运行中 (中国大陆专用)",
  "worker_name": "firebase-cn-proxy",
  "timestamp": "2024-12-19T10:30:00.000Z",
  "supported_hosts": ["identitytoolkit.googleapis.com", ...]
}
```

## 🎯 Worker URLs 清单

如果按照本指南创建，您将有以下 Worker URLs：

1. `https://firebase-cn-proxy.beelzebub1949.workers.dev`
2. `https://firebase-proxy-backup.beelzebub1949.workers.dev`
3. `https://cn-firebase-api.beelzebub1949.workers.dev`
4. `https://firebase-proxy-2024.beelzebub1949.workers.dev`
5. ~~`https://yellow-fire-20d4.beelzebub1949.workers.dev`~~ ❌ 已弃用，无需创建

**⚠️ 重要提醒**：当前系统使用 `https://api.lexiconlab.cn`，无需创建上述 Workers

## 🚀 完成后的步骤

1. **测试 Workers**：在浏览器中访问每个 URL，确认返回状态信息
2. **更新应用配置**：代码已经自动配置多 Worker 支持
3. **重新部署应用**：推送代码更改到生产环境
4. **验证功能**：在 lexiconlab.cn 上测试登录注册功能

## 📞 故障排除

**如果某个 Worker 创建失败**：
- 尝试不同的名称（可能已被占用）
- 确保名称只包含字母、数字和连字符
- 长度不超过 63 个字符

**如果 Worker 无法访问**：
- 检查代码是否正确粘贴
- 确认已点击 "Save and Deploy"
- 等待 1-2 分钟让全球 CDN 更新

**替代名称建议**：
如果推荐的名称不可用，可以尝试：
- `firebase-china-proxy`
- `fb-cn-proxy-2024`
- `firebase-api-cn`
- `china-firebase-gateway`
- `firebase-relay-cn`

## 🎉 预期结果

创建完成后，应用将：
1. 自动测试所有 5 个 Workers
2. 选择第一个可用的 Worker
3. 在控制台显示选择结果
4. 确保 Firebase 认证功能正常工作

**开始创建您的 Workers 吧！** 🚀 