import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/AppLayout';
import PerformanceMonitor from '@/components/shared/PerformanceMonitor';

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-inter antialiased bg-gray-900 min-h-screen">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
          <PerformanceMonitor />
        </AuthProvider>
      </body>
    </html>
  );
}
