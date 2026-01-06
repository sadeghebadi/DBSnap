import { env } from "@dbsnap/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

console.log("Environment validation active. PORT:", env.PORT);

export default nextConfig;
