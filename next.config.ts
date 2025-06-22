import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* 性能优化配置 */
  
  // 开启实验性功能
  experimental: {
    optimizeCss: true, // 优化CSS
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'react-hook-form',
      'zod'
    ], // 优化包导入
    allowedDevOrigins: [
      '9003-firebase-studio-1748859126855.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
      '9000-firebase-studio-1748859126855.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
      '6000-firebase-studio-1748859126855.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
    ],
  },

  // 编译优化
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'], // 现代图片格式
    minimumCacheTTL: 86400, // 缓存24小时
  },

  // 压缩和优化
  compress: true, // 启用gzip压缩
  poweredByHeader: false, // 移除X-Powered-By头
  
  // Webpack优化
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev && !isServer) {
      // 代码分割优化
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // 将React相关包单独打包
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 20,
            },
            // 将UI组件库单独打包
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              priority: 15,
            },
            // 将Firebase相关包单独打包
            firebase: {
              name: 'firebase',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              priority: 10,
            },
            // 其他vendor包
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 5,
            },
          },
        },
      };
    }

    return config;
  },

  // 安全头部设置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 跨域设置
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          // 安全头部
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      // 静态资源缓存
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  // 重定向和重写
  async redirects() {
    return [
      // 添加必要的重定向规则
    ];
  },
};

export default nextConfig;
