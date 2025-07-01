var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var FIREBASE_HOSTS = [
  "identitytoolkit.googleapis.com",
  // Firebase Auth (大部分功能)
  "securetoken.googleapis.com",
  // Firebase Auth (Token刷新等)
  "firestore.googleapis.com",
  // Firestore 数据库 + WebChannel  
  "firebasestorage.googleapis.com",
  // Firebase Storage
  "www.googleapis.com",
  // Google APIs
  "aiplatform.googleapis.com",
  // Vertex AI
  "firebase.googleapis.com",
  // Firebase Management
  "fcm.googleapis.com",
  // Firebase Cloud Messaging
  "storage.googleapis.com",
  // Google Cloud Storage
  "us-central1-aviation-lexicon-trainer.cloudfunctions.net"
  // 🔥 Cloud Functions - 解决WebChannel问题的核心架构
];
var ALLOWED_ORIGINS = [
  "https://lexiconlab.cn",
  "https://www.lexiconlab.cn",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:9002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:9002",
  "file://"
];
var webChannelSessions = /* @__PURE__ */ new Map();
var ConnectionManager = class {
  constructor() {
    this.activeConnections = 0;
    this.maxConnections = 5;
    this.pendingRequests = [];
  }
  async acquireConnection() {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      return true;
    }
    return new Promise((resolve) => {
      this.pendingRequests.push(resolve);
    });
  }
  releaseConnection() {
    this.activeConnections--;
    if (this.pendingRequests.length > 0) {
      const next = this.pendingRequests.shift();
      this.activeConnections++;
      next(true);
    }
  }
  getStats() {
    return {
      active: this.activeConnections,
      max: this.maxConnections,
      pending: this.pendingRequests.length
    };
  }
};
__name(ConnectionManager, "ConnectionManager");
var connectionManager = new ConnectionManager();
var WebChannelSessionManager = class {
  static storeSession(sessionId, sessionData) {
    if (!sessionId) return;
    
    webChannelSessions.set(sessionId, {
      ...sessionData,
      timestamp: Date.now(),
      ttl: 30 * 60 * 1000,
      lastUsed: Date.now()
    });
    console.log(`🔥 存储WebChannel会话: ${sessionId}`);
  }
  
  static getSession(sessionId) {
    if (!sessionId) return null;
    
    const session = webChannelSessions.get(sessionId);
    if (session && Date.now() - session.timestamp < session.ttl) {
      session.lastUsed = Date.now();
      webChannelSessions.set(sessionId, session);
      return session;
    }
    if (session) {
      webChannelSessions.delete(sessionId);
      console.log(`🔥 清理过期WebChannel会话: ${sessionId}`);
    }
    return null;
  }
  
  static cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of webChannelSessions.entries()) {
      if (now - session.timestamp >= session.ttl) {
        webChannelSessions.delete(sessionId);
        console.log(`🔥 自动清理过期会话: ${sessionId}`);
      }
    }
  }
  
  static isSessionActive(sessionId) {
    const session = this.getSession(sessionId);
    return session !== null;
  }
};
__name(WebChannelSessionManager, "WebChannelSessionManager");
function createCORSHeaders(origin) {
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);
  const corsOrigin = isAllowedOrigin ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Goog-Api-Client, X-Firebase-Gmpid, X-Goog-Api-Key, X-Client-Version, X-Firebase-AppCheck, x-firebase-client, x-firebase-client-log-type, x-firebase-client-version, X-Goog-Spatula, X-Goog-Encode-Response-If-Executable",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "Content-Length, Content-Type, X-Firebase-AppCheck, Grpc-Metadata-Debug, X-Goog-Spatula",
    "Access-Control-Max-Age": "86400"
  };
}
__name(createCORSHeaders, "createCORSHeaders");
function analyzeWebChannelRequest(url, headers, method) {
  const urlParams = new URLSearchParams(url.search);
  const analysis = {
    isWebChannel: false,
    operation: null,
    sessionId: null,
    parameters: {},
    specialHeaders: {}
  };
  if (url.pathname.includes("/channel") && (url.pathname.includes("Firestore/Write") || url.pathname.includes("Firestore/Listen"))) {
    analysis.isWebChannel = true;
    if (url.pathname.includes("/Write/")) {
      analysis.operation = "Write";
    } else if (url.pathname.includes("/Listen/")) {
      analysis.operation = "Listen";
    }
    analysis.sessionId = urlParams.get("SID") || urlParams.get("gsessionid") || urlParams.get("RID");
    analysis.parameters = {
      SID: urlParams.get("SID"),
      gsessionid: urlParams.get("gsessionid"),
      RID: urlParams.get("RID"),
      AID: urlParams.get("AID"),
      CI: urlParams.get("CI"),
      TYPE: urlParams.get("TYPE"),
      VER: urlParams.get("VER"),
      t: urlParams.get("t"),
      OSID: urlParams.get("OSID"),
      OAID: urlParams.get("OAID")
    };
    for (const [key, value] of headers.entries()) {
      if (key.toLowerCase().includes("goog") || key.toLowerCase().includes("firebase") || key.toLowerCase().includes("spatula")) {
        analysis.specialHeaders[key] = value;
      }
    }
  }
  return analysis;
}
__name(analyzeWebChannelRequest, "analyzeWebChannelRequest");
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    WebChannelSessionManager.cleanupExpiredSessions();
    console.log(`🔄 请求: ${request.method} ${url.pathname} | 来源: ${origin}`);
    if (request.method === "OPTIONS") {
              console.log("🚀 处理 OPTIONS 预检请求");
      return new Response(null, {
        status: 204,
        headers: createCORSHeaders(origin)
      });
    }
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(JSON.stringify({
        status: "online",
        service: "Lexicon Firebase CN Proxy (WebChannel\u589E\u5F3A\u7248)",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        message: "\u{1F1E8}\u{1F1F3} Firebase\u4EE3\u7406\u670D\u52A1\u8FD0\u884C\u6B63\u5E38 - WebChannel\u589E\u5F3A\u652F\u6301",
        webChannelStats: {
          activeSessions: webChannelSessions.size,
          sessionIds: Array.from(webChannelSessions.keys())
        },
        connectionStats: connectionManager.getStats(),
        corsTest: {
          origin,
          allowedOrigins: ALLOWED_ORIGINS,
          corsHeaders: createCORSHeaders(origin)
        },
        officialDocs: {
          webSocketSupport: "https://developers.cloudflare.com/workers/runtime-apis/websockets/",
          connectionLimits: "Max 6 TCP connections per Worker",
          messageLimit: "1MB per WebSocket message"
        }
      }), {
        headers: {
          "Content-Type": "application/json",
          ...createCORSHeaders(origin)
        }
      });
    }
    const pathParts = url.pathname.split("/").filter((part) => part.length > 0);
    if (pathParts.length === 0) {
      return new Response(JSON.stringify({
        error: "No target host specified",
        usage: "https://api.lexiconlab.cn/{firebase-host}/{path}"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...createCORSHeaders(origin)
        }
      });
    }
    let targetHost = pathParts[0];
    let targetPath = "/" + pathParts.slice(1).join("/");
    if (targetHost === "google.firestore.v1.Firestore") {
      console.log("🔥 检测到 WebChannel 请求，完全透传到Firebase");
      targetHost = "firestore.googleapis.com";
      targetPath = url.pathname;
      console.log(`🔥 WebChannel完全透传: Host=${targetHost}, Path=${targetPath}`);
      console.log(`🔥 WebChannel查询参数: ${url.search}`);
    }
    if (!FIREBASE_HOSTS.includes(targetHost)) {
      return new Response(JSON.stringify({
        error: `Unsupported host: ${targetHost}`,
        supportedHosts: FIREBASE_HOSTS,
        originalPath: url.pathname,
        parsedHost: targetHost
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...createCORSHeaders(origin)
        }
      });
    }
    const targetUrl = `https://${targetHost}${targetPath}${url.search}`;
    const webChannelAnalysis = analyzeWebChannelRequest(url, request.headers, request.method);
    if (webChannelAnalysis.isWebChannel) {
      console.log("🔥 WebChannel请求详细分析:", JSON.stringify(webChannelAnalysis, null, 2));
      console.log(`🔥 WebChannel透明代理: ${request.method} ${webChannelAnalysis.operation || "Unknown"}`);
      
      if (webChannelAnalysis.sessionId) {
        console.log(`🔥 检查会话ID: ${webChannelAnalysis.sessionId}`);
        
        // 检查是否是已知会话
        const existingSession = WebChannelSessionManager.getSession(webChannelAnalysis.sessionId);
        if (!existingSession && webChannelAnalysis.parameters.SID) {
          // 如果是新的SID，记录会话信息
          WebChannelSessionManager.storeSession(webChannelAnalysis.sessionId, {
            operation: webChannelAnalysis.operation,
            parameters: webChannelAnalysis.parameters,
            userAgent: request.headers.get('User-Agent'),
            origin: request.headers.get('Origin')
          });
          console.log(`🔥 创建新WebChannel会话: ${webChannelAnalysis.sessionId}`);
        } else if (existingSession) {
          console.log(`🔥 继续现有WebChannel会话: ${webChannelAnalysis.sessionId}`);
        }
      } else {
        console.log(`🔥 新会话建立请求 (无SID)`);
      }
    }
    try {
      await connectionManager.acquireConnection();
              console.log(`📡 获取连接 - 当前连接状态:`, connectionManager.getStats());
      try {
        const enhancedHeaders = new Headers(request.headers);
        
        // WebSocket升级检查
        const isWebSocketUpgrade = request.headers.get("Upgrade")?.toLowerCase() === "websocket";
        if (isWebSocketUpgrade) {
          console.log("🔄 WebSocket升级请求检测到");
          // 确保WebSocket升级头部完整传递
          if (request.headers.get("Connection")) {
            enhancedHeaders.set("Connection", request.headers.get("Connection"));
          }
          if (request.headers.get("Sec-WebSocket-Key")) {
            enhancedHeaders.set("Sec-WebSocket-Key", request.headers.get("Sec-WebSocket-Key"));
          }
          if (request.headers.get("Sec-WebSocket-Version")) {
            enhancedHeaders.set("Sec-WebSocket-Version", request.headers.get("Sec-WebSocket-Version"));
          }
        }
        
        if (webChannelAnalysis.isWebChannel) {
          // 设置WebChannel必需的头部
          if (!enhancedHeaders.has("X-Goog-Encode-Response-If-Executable")) {
            enhancedHeaders.set("X-Goog-Encode-Response-If-Executable", "base64");
          }
          
          // 确保连接保持活跃
          enhancedHeaders.set("Connection", "keep-alive");
          
          // 设置适当的缓存控制
          enhancedHeaders.set("Cache-Control", "no-cache");
          
          console.log("🔥 WebChannel请求头部:", Array.from(enhancedHeaders.entries()));
        }
        const newRequest = new Request(targetUrl, {
          method: request.method,
          headers: enhancedHeaders,
          body: request.body,
          ...request.body ? { duplex: "half" } : {}
        });
        console.log(`🌐 代理到: ${targetUrl}`);
        const controller = new AbortController();
        
        // 为WebChannel连接设置更长的超时时间
        const timeoutDuration = webChannelAnalysis.isWebChannel ? 120000 : 30000; // WebChannel: 2分钟, 普通请求: 30秒
        const timeoutId = setTimeout(() => {
          console.log(`⏰ 请求超时 (${timeoutDuration}ms): ${targetUrl}`);
          controller.abort();
        }, timeoutDuration);
        
        const response = await fetch(newRequest, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const newHeaders = new Headers(response.headers);
        const corsHeaders = createCORSHeaders(origin);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value);
        });
        if (webChannelAnalysis.isWebChannel) {
          newHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
          newHeaders.set("Pragma", "no-cache");
          newHeaders.set("Expires", "0");
          if (response.headers.has("X-Goog-Spatula")) {
            newHeaders.set("X-Goog-Spatula", response.headers.get("X-Goog-Spatula"));
          }
          console.log(`🔥 WebChannel响应: ${response.status} ${response.statusText}`);
          console.log(`🔥 响应头部:`, Array.from(newHeaders.entries()));
          if (response.status >= 400) {
            const responseText = await response.text();
            
            // 特殊处理"Unknown SID"错误
            if (response.status === 400 && responseText.includes("Unknown SID")) {
              console.error(`❌ Firebase WebChannel会话丢失:`, {
                sessionId: webChannelAnalysis.sessionId,
                status: response.status,
                statusText: response.statusText,
                analysis: webChannelAnalysis
              });
              
              // 清理本地会话记录
              if (webChannelAnalysis.sessionId) {
                webChannelSessions.delete(webChannelAnalysis.sessionId);
                console.log(`🧹 清理丢失的会话: ${webChannelAnalysis.sessionId}`);
              }
              
              // 返回更有意义的错误信息
              return new Response(JSON.stringify({
                error: "WebChannel_Session_Lost",
                message: "WebChannel会话已丢失，请重新连接",
                sessionId: webChannelAnalysis.sessionId,
                suggestion: "客户端应该重新初始化Firestore连接",
                timestamp: new Date().toISOString()
              }), {
                status: 400,
                statusText: "WebChannel Session Lost",
                headers: {
                  ...Object.fromEntries(newHeaders.entries()),
                  'Content-Type': 'application/json'
                }
              });
            }
            
            console.error(`❌ WebChannel错误响应:`, {
              status: response.status,
              statusText: response.statusText,
              body: responseText,
              analysis: webChannelAnalysis
            });
            
            return new Response(responseText, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders
            });
          }
        }
        console.log(`✅ 代理成功: ${response.status} ${response.statusText}`);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      } finally {
        connectionManager.releaseConnection();
        console.log(`📡 释放连接 - 当前连接状态:`, connectionManager.getStats());
      }
    } catch (error) {
      console.error(`❌ 代理失败:`, {
        error: error.message,
        stack: error.stack,
        targetUrl,
        webChannelAnalysis
      });
      return new Response(JSON.stringify({
        error: webChannelAnalysis.isWebChannel ? "WebChannel proxy failed" : "Proxy request failed",
        message: error.message,
        targetUrl,
        webChannelDebug: webChannelAnalysis,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        officialDocsRef: {
          connectionLimits: "https://developers.cloudflare.com/workers/platform/limits/",
          webSocketAPI: "https://developers.cloudflare.com/workers/runtime-apis/websockets/"
        }
      }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          ...createCORSHeaders(origin)
        }
      });
    }
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
