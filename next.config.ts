import type { NextConfig } from "next";
const nextConfig: NextConfig = { poweredByHeader: false,
  ...(process.env.SONIC_LOW_MEMORY_BUILD === '1' ? {experimental:{cpus:1,webpackMemoryOptimizations:true}} : {}),
};
export default nextConfig;
