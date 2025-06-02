
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
};

export default nextConfig;
