import type { NextConfig } from "next";
import path from "path/win32";

const nextConfig: NextConfig = {
turbopack: {
    root: path.resolve(__dirname), // define esta carpeta como raíz del proyecto Next.js
    
  },
};

export default nextConfig;
