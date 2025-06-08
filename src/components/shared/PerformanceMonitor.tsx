'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // 页面加载性能监控
    const measurePageLoad = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        console.log('📊 页面性能指标:', {
          加载时间: `${loadTime.toFixed(2)}ms`,
          渲染时间: `${renderTime.toFixed(2)}ms`,
          DOMContentLoaded: `${navigation.domContentLoadedEventEnd - navigation.fetchStart}ms`
        });
      }
    };

    // 交互响应时间监控
    const measureInteraction = (event: Event) => {
      const startTime = performance.now();
      
      // 延迟测量，确保DOM更新完成
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (responseTime > 16) { // 超过一帧的时间
          console.log(`⚡ 交互响应时间: ${responseTime.toFixed(2)}ms (${event.type})`);
        }
      });
    };

    // 监听页面加载完成
    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
    }

    // 监听用户交互
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(eventType => {
      document.addEventListener(eventType, measureInteraction, { passive: true });
    });

    // Cleanup
    return () => {
      window.removeEventListener('load', measurePageLoad);
      events.forEach(eventType => {
        document.removeEventListener(eventType, measureInteraction);
      });
    };
  }, []);

  // 组件渲染性能监控
  useEffect(() => {
    const renderStart = performance.now();
    
    return () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      if (renderTime > 16) {
        console.log(`🎨 组件渲染时间: ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  return null; // 这是一个隐形的监控组件
} 