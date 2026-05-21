import { PrismaClient } from "@prisma/client";

/**
 * Singleton do PrismaClient para ambientes serverless (Vercel).
 * Evita múltiplas instâncias em hot-reload (dev) e reduz pressão sobre o pool do Neon.
 *
 * @see https://www.prisma.io/docs/guides/database/neon
 * @see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
