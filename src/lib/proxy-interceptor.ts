// 代理拦截器 - 强制劫持所有Firebase网络请求
// 必须在Firebase初始化前调用

interface ProxyConfig {
  workers: string[];
  currentWorkerIndex: number;
  maxRetries: number;
  timeout: number;
}

class FirebaseProxyInterceptor {
  private config: ProxyConfig = {
    workers: [
      'https://firebase-cn-proxy.beelzebub1949.workers.dev',
      'https://firebase-proxy-backup.beelzebub1949.workers.dev', 
      'https://cn-firebase-api.beelzebub1949.workers.dev',
      'https://firebase-proxy-2024.beelzebub1949.workers.dev',
      'https://yellow-fire-20d4.beelzebub1949.workers.dev'
    ],
    currentWorkerIndex: 0,
    maxRetries: 3,
    timeout: 10000
  };

  private originalFetch: typeof fetch;
  private originalXMLHttpRequest: typeof XMLHttpRequest;
  private isInitialized = false;

  constructor() {
    this.originalFetch = window.fetch.bind(window);
    this.originalXMLHttpRequest = window.XMLHttpRequest;
  }

  // 检查是否是Firebase相关的请求
  private isFirebaseRequest(url: string): boolean {
    const firebaseHosts = [
      'identitytoolkit.googleapis.com',
      'securetoken.googleapis.com',
      'accounts.google.com',
      'www.googleapis.com',
      'oauth2.googleapis.com',
      'firebaseapp.com',
      'firebase.googleapis.com'
    ];
    
    return firebaseHosts.some(host => url.includes(host));
  }

  // 获取当前可用的代理Worker
  private getCurrentWorker(): string {
    return this.config.workers[this.config.currentWorkerIndex];
  }

  // 切换到下一个Worker
  private switchToNextWorker(): void {
    this.config.currentWorkerIndex = (this.config.currentWorkerIndex + 1) % this.config.workers.length;
    console.log(`🔄 切换到Worker ${this.config.currentWorkerIndex + 1}: ${this.getCurrentWorker()}`);
  }

  // 通过代理发送请求
  private async proxyRequest(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const worker = this.getCurrentWorker();
        
        // 解析原始URL，构造代理URL（与Firebase配置中的格式保持一致）
        const urlObj = new URL(url);
        const proxyUrl = `${worker}/${urlObj.hostname}${urlObj.pathname}${urlObj.search}`;
        
        console.log(`🌐 代理请求 (尝试 ${attempt + 1}/${this.config.maxRetries}): ${urlObj.hostname}${urlObj.pathname}`);
        console.log(`📡 使用Worker: ${worker}`);
        
        const proxyOptions: RequestInit = {
          ...options,
          mode: 'cors',
          credentials: 'omit'
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        try {
          const response = await this.originalFetch(proxyUrl, {
            ...proxyOptions,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok || response.status < 500) { // 接受4xx错误，可能是Firebase正常的错误响应
            console.log(`✅ 代理请求成功: ${response.status}`);
            return response;
          } else {
            throw new Error(`代理响应错误: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Worker ${this.config.currentWorkerIndex + 1} 失败:`, error);
        
        if (attempt < this.config.maxRetries - 1) {
          this.switchToNextWorker();
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // 递增延迟
        }
      }
    }
    
    throw new Error(`所有代理Worker都失败了。最后错误: ${lastError?.message}`);
  }

  // 劫持fetch方法
  private setupFetchInterceptor(): void {
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = input instanceof Request ? input.url : input.toString();
      
      if (this.isFirebaseRequest(url)) {
        console.log(`🎯 拦截Firebase请求: ${url}`);
        try {
          return await this.proxyRequest(url, init);
        } catch (error) {
          console.error(`🚨 代理请求失败，回退到直连: ${url}`, error);
          return this.originalFetch(input, init);
        }
      }
      
      return this.originalFetch(input, init);
    };
  }

  // 劫持XMLHttpRequest
  private setupXMLHttpRequestInterceptor(): void {
    const self = this;
    
    window.XMLHttpRequest = class extends self.originalXMLHttpRequest {
      private _url: string = '';
      private _method: string = 'GET';
      private _headers: Record<string, string> = {};
      private _body: any = null;

      open(method: string, url: string | URL, async: boolean = true, user?: string | null, password?: string | null): void {
        this._method = method;
        this._url = url.toString();
        
        if (self.isFirebaseRequest(this._url)) {
          console.log(`🎯 拦截XMLHttpRequest: ${this._method} ${this._url}`);
          // 不调用原始的open，我们将完全代理这个请求
          return;
        }
        
        super.open(method, url, async, user, password);
      }

      setRequestHeader(name: string, value: string): void {
        this._headers[name] = value;
        
        if (!self.isFirebaseRequest(this._url)) {
          super.setRequestHeader(name, value);
        }
      }

      send(body?: Document | XMLHttpRequestBodyInit | null): void {
        if (self.isFirebaseRequest(this._url)) {
          this._body = body;
          this._proxyXMLHttpRequest();
          return;
        }
        
        super.send(body);
      }

      private async _proxyXMLHttpRequest(): Promise<void> {
        try {
          const response = await self.proxyRequest(this._url, {
            method: this._method,
            headers: this._headers,
            body: this._body
          });
          
          // 模拟XMLHttpRequest的响应
          Object.defineProperty(this, 'status', { value: response.status, writable: false });
          Object.defineProperty(this, 'statusText', { value: response.statusText, writable: false });
          Object.defineProperty(this, 'readyState', { value: 4, writable: false });
          
          const responseText = await response.text();
          Object.defineProperty(this, 'responseText', { value: responseText, writable: false });
          Object.defineProperty(this, 'response', { value: responseText, writable: false });
          
          // 触发事件 - 使用正确的ProgressEvent类型
          if (this.onreadystatechange) {
            const event = new Event('readystatechange') as any;
            this.onreadystatechange.call(this, event);
          }
          if (this.onload) {
            const progressEvent = new ProgressEvent('load', {
              lengthComputable: false,
              loaded: 0,
              total: 0
            });
            this.onload.call(this, progressEvent);
          }
          
        } catch (error) {
          console.error('XMLHttpRequest代理失败:', error);
          
          // 触发错误事件 - 使用正确的ProgressEvent类型
          if (this.onerror) {
            const progressEvent = new ProgressEvent('error', {
              lengthComputable: false,
              loaded: 0,
              total: 0
            });
            this.onerror.call(this, progressEvent);
          }
        }
      }
    };
  }

  // 初始化拦截器 - 必须在Firebase初始化前调用
  public initialize(): void {
    if (this.isInitialized) {
      console.warn('代理拦截器已经初始化过了');
      return;
    }

    console.log('🚀 初始化Firebase代理拦截器...');
    console.log('📋 可用代理Workers:', this.config.workers);
    
    this.setupFetchInterceptor();
    this.setupXMLHttpRequestInterceptor();
    
    this.isInitialized = true;
    console.log('✅ 代理拦截器初始化完成');
  }

  // 恢复原始请求方法
  public restore(): void {
    if (!this.isInitialized) {
      return;
    }

    window.fetch = this.originalFetch;
    window.XMLHttpRequest = this.originalXMLHttpRequest;
    
    this.isInitialized = false;
    console.log('🔄 代理拦截器已恢复');
  }

  // 测试代理连接
  public async testProxyConnection(): Promise<boolean> {
    try {
      const testUrl = 'https://identitytoolkit.googleapis.com/v1/projects';
      await this.proxyRequest(testUrl, { method: 'GET' });
      return true;
    } catch (error) {
      console.error('代理连接测试失败:', error);
      return false;
    }
  }
}

// 创建全局实例
export const firebaseProxyInterceptor = new FirebaseProxyInterceptor();

// 导出初始化函数
export const initializeFirebaseProxy = () => {
  if (typeof window !== 'undefined') {
    firebaseProxyInterceptor.initialize();
  }
}; 