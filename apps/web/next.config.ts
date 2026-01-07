import { env } from "@dbsnap/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3333/:path*", // Proxy to Backend
      },
      // Keep existing rewrites if any
    ];
  },
};

console.log("Environment validation active. PORT:", env.PORT);

export default nextConfig;
