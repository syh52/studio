import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext'
import { Toaster } from "../components/ui/toaster"
import AppLayout from '../components/layout/AppLayout'
import PerformanceMonitor from '../components/shared/PerformanceMonitor'
import FontOptimizer from '../components/shared/FontOptimizer'
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
        
        {/* 优化字体加载策略 - 预连接到字体服务 */}
        <link 
          rel="preconnect" 
          href="https://fonts.googleapis.com" 
        />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous" 
        />
        
        {/* 简化字体加载，避免hydration问题 */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet"
        />
        
        {/* DNS预解析优化 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* 性能优化meta标签 */}
        <meta name="theme-color" content="#1f2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-inter antialiased bg-gray-900 min-h-screen">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
          
          {/* 客户端字体优化 */}
          <FontOptimizer />
          
          {/* AI服务状态检查器 */}
          <AIServiceChecker />
          
          {/* 仅在开发环境启用性能监控 */}
          {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        </AuthProvider>
      </body>
    </html>
  );
}
