import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // App Hosting 支持实验性功能
  experimental: {
    // 移除serverComponentsExternalPackages，因为这可能导致Windows上的构建问题
    
    // 简化实验性配置，提高Windows兼容性
    optimizePackageImports: ['lucide-react']
  },
  
  // Webpack配置优化，解决Windows符号链接问题
  webpack: (config, { isServer }) => {
    // 解决Windows平台的符号链接问题
    config.resolve.symlinks = false;
    
    // 优化模块解析
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // 配置文件监听，忽略非必要文件以消除警告
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/*.bat',           // 忽略批处理文件
        '**/*.cmd',           // 忽略命令文件
        '**/.git/**',         // 忽略 git 目录
        '**/node_modules/**', // 忽略 node_modules
        '**/.next/**',        // 忽略 Next.js 构建目录
      ],
    };
    
    return config;
  },

  // 输出配置 - 针对 Firebase App Hosting
  output: 'standalone',
  
  // 图片优化配置 - 合并所有设置
  images: {
    unoptimized: true, // 简化图片处理，避免构建问题
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // TypeScript配置
  typescript: {
    ignoreBuildErrors: false
  },

  // ESLint配置
  eslint: {
    ignoreDuringBuilds: false
  },
  
  // 基础配置
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
