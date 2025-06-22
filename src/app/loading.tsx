"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
      {/* 优化的加载动画 */}
      <div className="relative">
        {/* 主要旋转圆环 */}
        <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        
        {/* 内部脉冲圆点 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* 加载文本 */}
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-2xl font-inter font-semibold text-white">
          Lexicon 启动中
        </h2>
        <p className="text-sm text-gray-400 animate-pulse">
          正在初始化应用服务...
        </p>
      </div>
      
      {/* 进度指示器 */}
      <div className="mt-8 w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
} 