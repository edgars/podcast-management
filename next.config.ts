import type { NextConfig } from "next";

/**
 * Saída em `.next-local` ajuda no Windows/OneDrive (symlinks / `.next` corrompido).
 * Na Vercel (`VERCEL=1`) o output tem de ser o default `.next` — caso contrário o deploy falha.
 */
const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  ...(!isVercel ? { distDir: ".next-local" } : {}),
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
