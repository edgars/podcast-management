/**
 * Segredo para assinatura JWT (NextAuth / Auth.js).
 * Use `AUTH_SECRET` (preferido) ou `NEXTAUTH_SECRET` (legado).
 *
 * Se nenhum estiver definido, usa um placeholder **apenas** para o processo não
 * falhar (build local, testes). Em produção na Vercel, defina sempre
 * `AUTH_SECRET` nas variáveis de ambiente do projeto.
 */
export function getAuthSecret(): string {
  const fromEnv = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[auth] AUTH_SECRET / NEXTAUTH_SECRET não definidos — a usar placeholder inseguro. Configure AUTH_SECRET antes de expor a Internet.",
    );
  }

  return "dev-only-cybersec-cast-auth-secret-not-for-production";
}
