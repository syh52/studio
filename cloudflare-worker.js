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
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Goog-Api-Client, X-Firebase-Gmpid, X-Goog-Api-Key, X-Client-Version, X-Firebase-AppCheck',
          'Access-Control-Allow-Credentials': 'true',
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
    
    // 🔥 检测WebChannel连接（Firestore实时连接）
    const isWebChannel = targetPath.includes('/channel') && 
                        (targetPath.includes('Firestore/Write') || targetPath.includes('Firestore/Listen'));
    
    if (isWebChannel) {
      console.log(`🔥 WebChannel请求: ${targetUrl}`);
    } else {
      console.log(`🌐 代理请求: ${request.method} ${targetUrl}`);
    }

    // 🔧 修复Request构造，特别处理WebChannel连接
    const requestOptions = {
      method: request.method,
      headers: new Headers(request.headers) // 使用Headers对象确保正确复制
    };
    
    // 🔥 WebChannel特殊处理
    if (isWebChannel) {
      // 确保WebChannel必需的头部存在
      if (!requestOptions.headers.has('Cache-Control')) {
        requestOptions.headers.set('Cache-Control', 'no-cache');
      }
      if (!requestOptions.headers.has('Connection')) {
        requestOptions.headers.set('Connection', 'keep-alive');
      }
      
      console.log('🔥 WebChannel头部:', Object.fromEntries(requestOptions.headers.entries()));
    }
    
    // 仅在有body时添加body和duplex参数
    if (request.body) {
      requestOptions.body = request.body;
      requestOptions.duplex = 'half'; // 必需的Web标准参数
    }
    
    const newRequest = new Request(targetUrl, requestOptions);
    
    try {
      const response = await fetch(newRequest);
      
      // 创建新的响应，添加完整的CORS头部
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Goog-Api-Client, X-Firebase-Gmpid, X-Goog-Api-Key, X-Client-Version, X-Firebase-AppCheck');
      newHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type, X-Firebase-AppCheck');
      newHeaders.set('Access-Control-Allow-Credentials', 'true');
      newHeaders.set('Access-Control-Max-Age', '86400');
      
      // 🔥 WebChannel特殊响应处理
      if (isWebChannel) {
        // 保持WebChannel的流式特性
        newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        newHeaders.set('Pragma', 'no-cache');
        newHeaders.set('Expires', '0');
        
        // 确保Content-Type正确传递
        if (response.headers.has('Content-Type')) {
          newHeaders.set('Content-Type', response.headers.get('Content-Type'));
        }
        
        console.log(`🔥 WebChannel响应: ${response.status} ${response.statusText}`);
        console.log('🔥 响应头部:', Object.fromEntries(newHeaders.entries()));
      } else {
        console.log(`✅ 代理成功: ${response.status} ${response.statusText}`);
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (error) {
      if (isWebChannel) {
        console.error(`🔥 WebChannel代理失败: ${error.message}`);
        console.error(`🔥 目标URL: ${targetUrl}`);
        console.error(`🔥 请求方法: ${request.method}`);
      } else {
        console.error(`❌ 代理失败: ${error.message}`);
      }
      
      return new Response(JSON.stringify({ 
        error: isWebChannel ? 'WebChannel proxy failed' : 'Proxy request failed', 
        message: error.message,
        targetUrl: targetUrl,
        isWebChannel: isWebChannel,
        troubleshooting: isWebChannel ? 
          'WebChannel连接失败可能是由于流式协议兼容性问题。尝试刷新页面或检查网络连接。' :
          '代理请求失败。请检查网络连接和目标服务状态。'
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