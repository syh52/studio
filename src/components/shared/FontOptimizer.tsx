'use client';

import { useEffect } from 'react';

export default function FontOptimizer() {
  useEffect(() => {
    // 在客户端动态优化字体加载
    const optimizeFontLoading = () => {
      // 检查字体是否已加载
      if (!document.fonts) return;

      // 预加载关键字体
      const fontFaces = [
        new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2)', {
          weight: '400',
          style: 'normal',
          display: 'swap'
        }),
        new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2)', {
          weight: '500',
          style: 'normal',
          display: 'swap'
        }),
        new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2)', {
          weight: '600',
          style: 'normal',
          display: 'swap'
        })
      ];

      // 加载并添加字体
      fontFaces.forEach(fontFace => {
        fontFace.load().then(loadedFont => {
          document.fonts.add(loadedFont);
        }).catch(error => {
          console.warn('字体加载失败:', error);
        });
      });

      // 字体加载完成后的优化
      document.fonts.ready.then(() => {
        console.log('✅ 字体加载完成');
        
        // 触发重新渲染以应用字体
        document.body.style.fontFamily = 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif';
      });
    };

    // 延迟执行，确保DOM已准备好
    const timer = setTimeout(optimizeFontLoading, 100);

    return () => clearTimeout(timer);
  }, []);

  return null; // 这是一个隐形的优化组件
} 