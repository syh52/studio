import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认配置
      staleTime: 5 * 60 * 1000, // 5分钟
      gcTime: 10 * 60 * 1000, // 10分钟（v5中 cacheTime 改为 gcTime）
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // 防止频繁请求
      refetchOnReconnect: 'always', // 网络恢复时重新获取
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
}); 