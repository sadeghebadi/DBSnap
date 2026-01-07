import { env } from "@dbsnap/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/:path*", // Dynamic Proxy
      },
    ];
  },
};

console.log("Environment validation active. PORT:", env.PORT);

export default nextConfig;
