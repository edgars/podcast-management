import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";
import { Shield } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/painel");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 cc-radial-hero" />
      <div className="pointer-events-none absolute inset-0 cc-grid-bg opacity-[0.35] dark:opacity-[0.55]" />
      <div className="relative z-10 mb-8 flex max-w-lg flex-col items-center gap-4 text-center">
        <div className="cc-glow-violet flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/35 to-accent/25 text-primary ring-1 ring-primary/40">
          <Shield className="h-8 w-8" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-accent/85">
            Inteligência executiva
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            <span className="tracking-tight">CyberSec</span>
            <span className="font-brand-script text-[1.2em] font-normal leading-none text-primary">
              .Cast
            </span>
          </h1>
          <p className="text-sm font-medium text-muted-foreground md:text-base">
            Inteligência para quem decide.
          </p>
          <p className="text-xs text-muted-foreground/90 md:text-sm">
            Plataforma interna de gestão — alinhada ao posicionamento editorial do
            programa para líderes de tecnologia, risco e segurança.
          </p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
            Temporada 1 em produção · Belo Horizonte + São Paulo
          </p>
        </div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <Suspense
          fallback={
            <div className="h-48 animate-pulse rounded-xl border border-border/60 bg-card/40" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
