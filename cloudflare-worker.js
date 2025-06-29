// Cloudflare Worker: lexicon-cn-proxy
// 部署指南：将此代码部署到Cloudflare Worker，并绑定自定义域名 api.lexiconlab.cn

// 需要代理的 Firebase 服务域名（完整列表）
const FIREBASE_HOSTS = [
  'identitytoolkit.googleapis.com', // Firebase Auth (大部分功能)
  'securetoken.googleapis.com',     // Firebase Auth (Token刷新等)
  'firestore.googleapis.com',       // Firestore 数据库
  'firebasestorage.googleapis.com', // Firebase Storage
  'www.googleapis.com',             // Google APIs
  'aiplatform.googleapis.com',      // Vertex AI
  'firebase.googleapis.com',        // Firebase Management
  'fcm.googleapis.com',             // Firebase Cloud Messaging
  'storage.googleapis.com'          // Google Cloud Storage
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 处理 OPTIONS 预检请求（CORS）
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Goog-Api-Client, X-Firebase-Gmpid, X-Goog-Api-Key',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // 直接返回根路径的状态信息，方便测试连通性
    if (url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Lexicon Firebase CN Proxy',
        timestamp: new Date().toISOString(),
        supportedHosts: FIREBASE_HOSTS,
        message: '🇨🇳 Firebase代理服务运行正常'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 健康检查端点
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        healthy: true,
        uptime: new Date().toISOString()
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 解析目标主机和路径
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    
    if (pathParts.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No target host specified',
        usage: 'https://api.lexiconlab.cn/{firebase-host}/{path}'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const targetHost = pathParts[0];

    // 验证目标主机是否在允许列表中
    if (!FIREBASE_HOSTS.includes(targetHost)) {
      return new Response(JSON.stringify({ 
        error: `Unsupported host: ${targetHost}`,
        supportedHosts: FIREBASE_HOSTS
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 重建目标 URL
    const targetPath = '/' + pathParts.slice(1).join('/');
    const targetUrl = `https://${targetHost}${targetPath}${url.search}`;

    console.log(`🌐 代理请求: ${request.method} ${targetUrl}`);

    // 创建新的请求，保持原始请求的所有属性
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    try {
      const response = await fetch(newRequest);
      
      // 创建新的响应，添加CORS头部
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Goog-Api-Client, X-Firebase-Gmpid, X-Goog-Api-Key');
      newHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');

      console.log(`✅ 代理成功: ${response.status} ${response.statusText}`);

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (error) {
      console.error(`❌ 代理失败: ${error.message}`);
      
      return new Response(JSON.stringify({ 
        error: 'Proxy request failed', 
        message: error.message,
        targetUrl: targetUrl
      }), {
        status: 502,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  },
}; 