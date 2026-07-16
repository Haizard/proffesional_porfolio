import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.janeway.replit.dev',
    '*.repl.co',
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.replit.dev', '*.repl.co'],
    },
  },
};

export default nextConfig;
