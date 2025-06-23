import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // 最简配置以确保兼容性
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 基础图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 基础压缩
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
