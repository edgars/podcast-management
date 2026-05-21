import type { NextConfig } from "next";

/**
 * Saída do build em `.next-local` (fora de `.next`) ajuda no Windows/OneDrive
 * com symlinks e evita artefactos corrompidos em `node_modules/.cache`.
 */
const nextConfig: NextConfig = {
  distDir: ".next-local",
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
