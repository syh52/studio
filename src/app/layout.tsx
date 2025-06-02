import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Lexicon',
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
        {/* Removed Google Fonts for Press Start 2P and VT323 as Zpix will be primary */}
        {/* If specific English pixel fonts are still desired for certain elements, they can be re-added */}
      </head>
      <body className="font-body antialiased font-pixelated">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
