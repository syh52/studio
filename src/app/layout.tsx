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
        {/* Zpix is now primary, loaded via @font-face in globals.css.
            VT323 and Press Start 2P are fallbacks defined in tailwind.config.ts,
            and do not need direct import here if Zpix covers Latin characters well.
        */}
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
