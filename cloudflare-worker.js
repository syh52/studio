// Cloudflare Worker: lexicon-cn-proxy (Optimized Version)
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

// 允许的来源域名列表
const ALLOWED_ORIGINS = [
  'https://lexiconlab.cn',
  'https://www.lexiconlab.cn',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:9002',   // Next.js开发服务器常用端口
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:9002',
  'file://'                  // 支持本地文件直接访问
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // 检查来源是否在允许列表中
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
    const corsOrigin = isAllowedOrigin ? origin : ALLOWED_ORIGINS[0]; // 默认使用生产域名

    // 处理 OPTIONS 预检请求（CORS）
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204, // 使用 204 No Content 更标准
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Goog-Api-Client, X-Firebase-Gmpid, X-Goog-Api-Key, X-Client-Version, X-Firebase-AppCheck, x-firebase-client, x-firebase-client-log-type, x-firebase-client-version',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // 直接返回根路径的状态信息，方便测试连通性
    if (url.pathname === '/' || url.pathname === '/health') {
        return new Response(JSON.stringify({
            status: 'online',
            service: 'Lexicon Firebase CN Proxy',
            timestamp: new Date().toISOString(),
            message: '🇨🇳 Firebase代理服务运行正常'
        }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // 状态页允许所有来源访问
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
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
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
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin }
      });
    }
    
    // 重建目标 URL
    const targetPath = '/' + pathParts.slice(1).join('/');
    const targetUrl = `https://${targetHost}${targetPath}${url.search}`;
    
    // 关键改动：直接复用原始请求来构造新请求，以保证所有属性被完整克隆
    // This is the most important change. It ensures that method, headers, body, and duplex information
    // are all correctly carried over to the new request.
    const newRequest = new Request(targetUrl, request);
    
    try {
      const response = await fetch(newRequest);
      
      // 创建新的响应，添加完整的CORS头部
      const newHeaders = new Headers(response.headers);
      
      // 设置CORS头部
      newHeaders.set('Access-Control-Allow-Origin', corsOrigin);
      newHeaders.set('Access-Control-Allow-Credentials', 'true');
      // 可以暴露一些通常被CORS策略隐藏的头部
      newHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type, X-Firebase-AppCheck, Grpc-Metadata-Debug');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (error) {
      console.error(`❌ Proxy failed: ${error.message}`);
      return new Response(JSON.stringify({ 
        error: 'Proxy request failed', 
        message: error.message,
      }), {
        status: 502,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin
        }
      });
    }
  },
};
