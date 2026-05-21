import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { endOfUtcMonth, formatBrl, startOfUtcMonth } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PainelHomePage() {
  const session = await auth();
  if (!session?.user) return null;

  const isAdmin = session.user.role === "ADMIN";
  const monthStart = startOfUtcMonth();
  const monthEnd = endOfUtcMonth();

  let revenuePaid: { _sum: { agreedMonthlyAmount: unknown | null } } = {
    _sum: { agreedMonthlyAmount: null },
  };
  let expensesPaid: { _sum: { amount: unknown | null } } = {
    _sum: { amount: null },
  };
  let pendingPanelists = 0;
  let profile: Awaited<ReturnType<typeof prisma.panelistProfile.findUnique>> = null;
  let dbUnavailable = false;

  try {
    [revenuePaid, expensesPaid, pendingPanelists, profile] = await Promise.all([
      isAdmin
        ? prisma.sponsorPayment.aggregate({
            where: { billingMonth: monthStart, status: "PAID" },
            _sum: { agreedMonthlyAmount: true },
          })
        : Promise.resolve({ _sum: { agreedMonthlyAmount: null } }),
      isAdmin
        ? prisma.expense.aggregate({
            where: {
              dueDate: { gte: monthStart, lte: monthEnd },
              status: "PAID",
            },
            _sum: { amount: true },
          })
        : Promise.resolve({ _sum: { amount: null } }),
      isAdmin
        ? prisma.user.count({
            where: {
              role: "PANELIST",
              OR: [
                { panelistProfile: null },
                { panelistProfile: { profileCompletedAt: null } },
              ],
            },
          })
        : Promise.resolve(0),
      !isAdmin
        ? prisma.panelistProfile.findUnique({
            where: { userId: session.user.id },
          })
        : Promise.resolve(null),
    ]);
  } catch (error) {
    dbUnavailable = true;
    console.error("[painel] Falha ao carregar métricas do banco:", error);
  }

  const receita = Number(revenuePaid._sum.agreedMonthlyAmount ?? 0);
  const despesas = Number(expensesPaid._sum.amount ?? 0);
  const saldo = receita - despesas;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Painel executivo
          </h1>
          <Badge variant="secondary" className="uppercase">
            {isAdmin ? "Produção" : "Painelista"}
          </Badge>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          Visão consolidada do CyberSec.CAST: finanças do mês, cadastros
          pendentes e preparação editorial com linguagem corporativa e foco em
          decisão.
        </p>
        {dbUnavailable ? (
          <p className="text-sm text-destructive">
            Nao foi possivel consultar o banco agora. Exibindo dados parciais.
          </p>
        ) : null}
      </header>

      {isAdmin ? (
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Receita de patrocínios (mês)</CardDescription>
              <CardTitle className="text-2xl text-emerald-400">
                {formatBrl(receita)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Considera pagamentos com status{" "}
              <span className="font-medium text-foreground">Pago</span> na
              competência atual (UTC).
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Despesas pagas (mês)</CardDescription>
              <CardTitle className="text-2xl text-amber-300">
                {formatBrl(despesas)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Soma de despesas com vencimento no mês corrente e status{" "}
              <span className="font-medium text-foreground">Pago</span>.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saldo operacional</CardDescription>
              <CardTitle
                className={
                  saldo >= 0 ? "text-2xl text-accent" : "text-2xl text-destructive"
                }
              >
                {formatBrl(saldo)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Receitas realizadas menos despesas quitadas no período.
            </CardContent>
          </Card>
        </section>
      ) : null}

      {isAdmin ? (
        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Cadastros pendentes</CardTitle>
              <CardDescription>
                Executivos convidados com perfil ainda não concluído.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-4">
              <p className="text-4xl font-semibold tabular-nums">
                {pendingPanelists}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/painel/painelistas">Abrir gestão</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Próximos episódios</CardTitle>
              <CardDescription>
                O agendamento editorial será integrado neste painel nas próximas
                entregas.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Enquanto isso, utilize a gestão de painelistas para alinhar
              preferências de gravação e sensibilidades de mercado.
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Seu perfil executivo</CardTitle>
              <CardDescription>
                Mantenha biografia, temas de interesse e restrições editoriais
                atualizados para a equipe de produção.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>
                Status:{" "}
                <span className="font-medium text-foreground">
                  {profile?.profileCompletedAt
                    ? "Perfil enviado à produção"
                    : "Perfil pendente de conclusão"}
                </span>
              </p>
              <Button asChild>
                <Link href="/painel/perfil">Editar perfil</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Boas-vindas ao CyberSec.CAST</CardTitle>
              <CardDescription>
                Ambiente reservado a líderes convidados para alinhar conteúdo
                com curadoria independente.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Em caso de dúvidas sobre o convite ou prazos de gravação,
              contate diretamente a produção pelo canal oficial do programa.
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
