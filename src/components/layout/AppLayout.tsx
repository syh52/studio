"use client";
import React from 'react';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noHeaderPaths = ['/login', '/register']; // Paths where header should not be shown

  const showHeader = !noHeaderPaths.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {showHeader && <Header />}
      <main className="flex-grow container mx-auto px-2 py-4 md:px-4 md:py-8">
        {children}
      </main>
      {showHeader && (
        <footer className="text-center p-4 text-xs text-muted-foreground border-t-2 border-primary">
          © {new Date().getFullYear()} 航空词汇教练。保留所有像素。
        </footer>
      )}
    </div>
  );
}
