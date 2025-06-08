"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { User, ChevronLeft } from 'lucide-react';

export default function MobileHeader() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="pt-6 pr-6 pl-6">
      <div className="flex justify-between items-center animate-blur-in">
        <div className="flex items-center space-x-3">
          {isHomePage ? (
            // 首页显示Logo
            <>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                  <path d="M8.5 8.5v.01"></path>
                  <path d="M16 15.5v.01"></path>
                  <path d="M12 12v.01"></path>
                </svg>
              </div>
              <h1 className="text-xl font-inter font-semibold text-white tracking-tight">Lexicon</h1>
            </>
          ) : (
            // 子页面显示返回按钮
            <button
              onClick={handleBack}
              className="flex items-center space-x-3 group cursor-pointer hover:bg-white/5 active:bg-white/10 rounded-xl p-2 -ml-2 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <ChevronLeft className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-inter font-medium text-white tracking-tight group-hover:text-purple-200 transition-colors duration-200">返回</span>
            </button>
          )}
        </div>
        <div 
          className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-all duration-200 active:scale-95"
          onClick={() => {
            if (isAuthenticated) {
              router.push('/profile');
            } else {
              router.push('/login');
            }
          }}
        >
          {isAuthenticated && user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="用户头像" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-gray-300" />
          )}
        </div>
      </div>
    </div>
  );
} 