import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // api.dicebear.com is removed as it's no longer used
    ],
  },
  experimental: {
    allowedDevOrigins: [
      '9003-firebase-studio-1748859126855.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
      '9000-firebase-studio-1748859126855.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
      '6000-firebase-studio-1748859126855.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
        ],
      },
    ];
  },
};

export default nextConfig;
