/**
 * 统一日志记录工具
 * 提供结构化的日志记录功能，支持不同级别和环境控制
 */
export class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  
  /**
   * 信息日志
   */
  static info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, data || '');
    }
  }

  /**
   * 成功日志
   */
  static success(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`✅ ${message}`, data || '');
    }
  }

  /**
   * 警告日志
   */
  static warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.warn(`⚠️ ${message}`, data || '');
    }
  }

  /**
   * 错误日志
   */
  static error(message: string, error?: any): void {
    if (this.isDevelopment) {
      console.error(`❌ ${message}`, error || '');
    }
  }

  /**
   * 调试日志
   */
  static debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(`🔧 ${message}`, data || '');
    }
  }

  /**
   * AI操作日志
   */
  static ai(operation: string, status: 'start' | 'success' | 'error', data?: any): void {
    if (this.isDevelopment) {
      const emoji = status === 'start' ? '🤖' : status === 'success' ? '✨' : '🚨';
      console.log(`${emoji} AI ${operation} - ${status}`, data || '');
    }
  }

  /**
   * 性能计时器
   */
  static time(label: string): void {
    if (this.isDevelopment) {
      console.time(`⏱️ ${label}`);
    }
  }

  /**
   * 结束性能计时
   */
  static timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(`⏱️ ${label}`);
    }
  }

  /**
   * 组日志开始
   */
  static group(title: string): void {
    if (this.isDevelopment) {
      console.group(`📁 ${title}`);
    }
  }

  /**
   * 组日志结束
   */
  static groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
} 