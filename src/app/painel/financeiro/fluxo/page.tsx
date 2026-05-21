import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  endOfUtcMonth,
  formatBrl,
  parseYearMonthParam,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { searchParams?: Promise<{ ym?: string }> };

function ymKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function shiftYm(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return ymKey(d);
}

export default async function FluxoPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/painel");

  const sp = (await searchParams) ?? {};
  const monthStart = parseYearMonthParam(sp.ym);
  const monthEnd = endOfUtcMonth(monthStart);
  const currentYm = ymKey(monthStart);

  const [revenuePaid, expensesPaid] = await Promise.all([
    prisma.sponsorPayment.aggregate({
      where: { billingMonth: monthStart, status: "PAID" },
      _sum: { agreedMonthlyAmount: true },
    }),
    prisma.expense.aggregate({
      where: {
        dueDate: { gte: monthStart, lte: monthEnd },
        status: "PAID",
      },
      _sum: { amount: true },
    }),
  ]);

  const receita = Number(revenuePaid._sum.agreedMonthlyAmount ?? 0);
  const despesas = Number(expensesPaid._sum.amount ?? 0);
  const saldo = receita - despesas;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Fluxo de caixa
          </h1>
          <p className="text-sm text-muted-foreground">
            Demonstrativo sintético do mês: receitas realizadas, despesas pagas e
            saldo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/painel/financeiro/fluxo?ym=${shiftYm(currentYm, -1)}`}>
              Mês anterior
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/painel/financeiro/fluxo?ym=${shiftYm(currentYm, 1)}`}>
              Próximo mês
            </Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/painel/financeiro/fluxo">Mês atual</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Competência {currentYm} (UTC)
          </CardTitle>
          <CardDescription>
            Receitas consideram patrocínios com status{" "}
            <span className="text-foreground">Pago</span> na competência
            selecionada. Despesas consideram títulos com vencimento no mês e
            status <span className="text-foreground">Pago</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border/80 bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Receitas
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {formatBrl(receita)}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Despesas
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">
              {formatBrl(despesas)}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Saldo
            </p>
            <p
              className={
                saldo >= 0
                  ? "mt-2 text-2xl font-semibold text-accent"
                  : "mt-2 text-2xl font-semibold text-destructive"
              }
            >
              {formatBrl(saldo)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
