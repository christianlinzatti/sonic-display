import type { NextConfig } from "next";

// Vercel's standard build container has a fixed memory budget. Keep the
// developer build unchanged and use a controlled production-only profile.
const lowMemoryBuild = process.env.SONIC_LOW_MEMORY_BUILD === '1';
const lowMemoryWebpack: NonNullable<NextConfig['webpack']> = (config, { dev }) => {
  if (!dev) {
    // Avoid repeatedly serializing very large webpack cache strings on Vercel.
    // The production build does not need persistent compilation caching.
    config.cache = false;
  }
  return config;
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(lowMemoryBuild ? {
    experimental: {
      cpus: 1,
      webpackMemoryOptimizations: true,
      // Explicitly retain the build worker when adding a webpack override.
      webpackBuildWorker: true,
    },
    webpack: lowMemoryWebpack,
  } : {}),
};
export default nextConfig;
