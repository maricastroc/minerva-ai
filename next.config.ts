import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ['page.tsx', 'api.ts', 'api.tsx'],
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

export default nextConfig;
