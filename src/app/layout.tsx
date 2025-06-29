import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext'
import { Toaster } from "../components/ui/toaster"
import AppLayout from '../components/layout/AppLayout'
import PerformanceMonitor from '../components/shared/PerformanceMonitor'
import AIServiceChecker from '../components/shared/AIServiceChecker'

export const metadata: Metadata = {
  title: 'Lexicon - 部门英语学习',
  description: '学习基础航空英语词汇和对话。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* 🚀 性能优化：使用系统字体，移除Google Fonts依赖 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* 优化的字体堆栈，优先使用系统字体 */
            :root {
              --font-inter: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
                          "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", 
                          sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", 
                          "Noto Color Emoji";
            }
            
            .font-inter {
              font-family: var(--font-inter);
            }
            
            /* 字体预载加速渲染 */
            body {
              font-family: var(--font-inter);
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          `
        }} />
        
        {/* 性能优化meta标签 */}
        <meta name="theme-color" content="#1f2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* 预加载关键资源 */}
        <link rel="preload" href="/fonts/zpix.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body className="font-inter antialiased bg-gray-900 min-h-screen">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
          
          {/* AI服务状态检查器 - 延迟初始化 */}
          <AIServiceChecker />
          
          {/* 仅在开发环境启用性能监控 */}
          {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        </AuthProvider>
      </body>
    </html>
  );
}
