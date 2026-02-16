import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "http://192.168.1.7:3000"], 
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;