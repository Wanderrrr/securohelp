import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize for Bolt compatibility
  serverExternalPackages: ['pdf-parse', 'sharp'],
  // Ensure proper build output
  output: 'standalone',
  // Disable problematic features for Bolt
  poweredByHeader: false,
  // Disable experimental features that cause issues
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:3002']
    }
  },
  // Optimize bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
