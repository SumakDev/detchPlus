import type { NextConfig } from "next";
import path from "path/win32";

const nextConfig: NextConfig = {
turbopack: {
    root: path.resolve(__dirname), // define esta carpeta como raíz del proyecto Next.js
    
  },
  images: {
    // Opción 1 (recomendada): remotePatterns con puerto 4000 para /uploads/**
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/uploads/**",
      },
    ],
    // Si en producción sirves uploads desde otro host, puedes añadirlo mediante env:
    // remotePatterns: [
    //   ...,
    //   process.env.NEXT_PUBLIC_UPLOADS_HOST && {
    //     protocol: "https",
    //     hostname: process.env.NEXT_PUBLIC_UPLOADS_HOST,
    //     port: "",
    //     pathname: "/uploads/**",
    //   },
    // ].filter(Boolean),
  },
};



export default nextConfig;
