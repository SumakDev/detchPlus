import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
turbopack: {
    root: path.resolve(__dirname), // define esta carpeta como raíz del proyecto Next.js
    
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
