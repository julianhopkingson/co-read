import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.31.*'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Allow larger file uploads
    },
  },
};

export default nextConfig;
