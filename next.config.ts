import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    // 添加后端 API 使用的环境变量
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  },
  // 添加运行时配置
  serverRuntimeConfig: {
    // 仅在服务器端可用的配置
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  publicRuntimeConfig: {
    // 在客户端和服务器端都可用的配置
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  // 确保 images 域名配置正确
  images: {
    domains: ['maps.googleapis.com', 'openweathermap.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
