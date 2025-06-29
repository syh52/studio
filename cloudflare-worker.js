// Cloudflare Worker: lexicon-cn-proxy (CORS 修复版)
// 部署指南：将此代码部署到Cloudflare Worker，并绑定自定义域名 api.lexiconlab.cn

// 需要代理的 Firebase 服务域名（完整列表）
const FIREBASE_HOSTS = [
  'identitytoolkit.googleapis.com', // Firebase Auth (大部分功能)
  'securetoken.googleapis.com',     // Firebase Auth (Token刷新等)
  'firestore.googleapis.com',       // Firestore 数据库 + WebChannel  
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
  'http://localhost:9002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:9002',
  'file://'
];

// ✅ 统一的 CORS 头部生成函数
function createCORSHeaders(origin) {
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
  const corsOrigin = isAllowedOrigin ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Goog-Api-Client, X-Firebase-Gmpid, X-Goog-Api-Key, X-Client-Version, X-Firebase-AppCheck, x-firebase-client, x-firebase-client-log-type, x-firebase-client-version',
    'Access-Control-Allow-Credentials': 'true', // ⚡ 关键修复：强制设置为 true
    'Access-Control-Expose-Headers': 'Content-Length, Content-Type, X-Firebase-AppCheck, Grpc-Metadata-Debug',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    
    console.log(`🔄 请求: ${request.method} ${url.pathname} | 来源: ${origin}`);

    // ✅ 改进的 OPTIONS 预检请求处理
    if (request.method === 'OPTIONS') {
      console.log('🚀 处理 OPTIONS 预检请求');
      return new Response(null, {
        status: 204,
        headers: createCORSHeaders(origin)
      });
    }

    // 状态检查端点
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Lexicon Firebase CN Proxy (CORS 修复版)',
        timestamp: new Date().toISOString(),
        message: '🇨🇳 Firebase代理服务运行正常',
        corsTest: {
          origin: origin,
          allowedOrigins: ALLOWED_ORIGINS,
          corsHeaders: createCORSHeaders(origin)
        }
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...createCORSHeaders(origin)
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
          ...createCORSHeaders(origin)
        }
      });
    }

    let targetHost = pathParts[0];
    let targetPath = '/' + pathParts.slice(1).join('/');
    
    // 🔧 特殊处理 WebChannel 请求
    // WebChannel URL 格式: /google.firestore.v1.Firestore/Listen/channel
    // 应该转换为: firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel
    if (targetHost === 'google.firestore.v1.Firestore') {
      console.log('🔥 检测到 WebChannel 请求，重写主机名');
      targetHost = 'firestore.googleapis.com';
      targetPath = '/' + pathParts.join('/');  // 保持完整路径
    }

    // 验证目标主机
    if (!FIREBASE_HOSTS.includes(targetHost)) {
      return new Response(JSON.stringify({ 
        error: `Unsupported host: ${targetHost}`,
        supportedHosts: FIREBASE_HOSTS,
        originalPath: url.pathname,
        parsedHost: targetHost
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...createCORSHeaders(origin)
        }
      });
    }
    
    // 重建目标 URL
    const targetUrl = `https://${targetHost}${targetPath}${url.search}`;
    
    // ✅ 检测 WebChannel 请求
    const isWebChannel = targetPath.includes('/channel') && 
                        (targetPath.includes('Firestore/Write') || targetPath.includes('Firestore/Listen'));
    
    if (isWebChannel) {
      console.log(`🔥 WebChannel 请求: ${targetUrl}`);
    }

    try {
      // ✅ 正确构造代理请求
      const newRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        // ✅ 对于有 body 的请求，添加 duplex 参数
        ...(request.body ? { duplex: 'half' } : {})
      });
      
      console.log(`🌐 代理到: ${targetUrl}`);
      const response = await fetch(newRequest);
      
      // ✅ 创建响应时强制添加 CORS 头部
      const newHeaders = new Headers(response.headers);
      
      // 强制设置 CORS 头部，覆盖任何现有值
      const corsHeaders = createCORSHeaders(origin);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });
      
      // ✅ WebChannel 特殊处理
      if (isWebChannel) {
        // 确保 WebChannel 必需的头部
        newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        newHeaders.set('Pragma', 'no-cache');
        newHeaders.set('Expires', '0');
        
        console.log(`🔥 WebChannel 响应: ${response.status} | CORS: ${newHeaders.get('Access-Control-Allow-Credentials')}`);
      }

      console.log(`✅ 代理成功: ${response.status} ${response.statusText}`);
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (error) {
      console.error(`❌ 代理失败: ${error.message}`);
      
      return new Response(JSON.stringify({ 
        error: isWebChannel ? 'WebChannel proxy failed' : 'Proxy request failed', 
        message: error.message,
        targetUrl: targetUrl,
        timestamp: new Date().toISOString()
      }), {
        status: 502,
        headers: { 
          'Content-Type': 'application/json',
          ...createCORSHeaders(origin)
        }
      });
    }
  }
};
