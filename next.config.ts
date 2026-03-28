import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  // Security headers will be added via middleware.ts
  // CORS is not needed (same-origin API only)
};

export default nextConfig;
