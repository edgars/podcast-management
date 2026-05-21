import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { createSponsorPayment, updateSponsorPaymentStatus } from "@/actions/sponsors";
import { prisma } from "@/lib/prisma";
import { formatBrl } from "@/lib/format";
import { SponsorPaymentBadge } from "@/components/payment-status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function defaultMonthInput() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default async function ReceitasPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/painel");

  const [quotas, payments, seasons] = await Promise.all([
    prisma.sponsorshipQuota.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.sponsorPayment.findMany({
      include: { quota: true, season: { select: { title: true, number: true } } },
      orderBy: [{ billingMonth: "desc" }, { createdAt: "desc" }],
      take: 50,
    }),
    prisma.season.findMany({
      orderBy: [{ number: "desc" }, { createdAt: "desc" }],
      select: { id: true, title: true, number: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Receitas — patrocinadores
        </h1>
        <p className="text-sm text-muted-foreground">
          Vincule empresas patrocinadoras às cotas e acompanhe o status do ciclo
          de faturamento mensal. Opcionalmente associe o vínculo a uma temporada.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novo vínculo de patrocínio</CardTitle>
          <CardDescription>
            Informe a competência (mês de referência) e o valor acordado para o
            vínculo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quotas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Cadastre ao menos uma cota ativa em{" "}
              <Link className="text-accent underline" href="/painel/cotas">
                Cotas de patrocínio
              </Link>{" "}
              antes de registrar receitas.
            </p>
          ) : (
            <form action={createSponsorPayment} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="quotaId">Cota</Label>
              <select
                id="quotaId"
                name="quotaId"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue={quotas[0]?.id}
              >
                {quotas.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.name} — {formatBrl(q.monthlyAmount)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sponsorCompanyName">Empresa patrocinadora</Label>
              <Input
                id="sponsorCompanyName"
                name="sponsorCompanyName"
                required
                placeholder="Nome fantasia ou razão social"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agreedMonthlyAmount">Valor mensal acordado (BRL)</Label>
              <Input
                id="agreedMonthlyAmount"
                name="agreedMonthlyAmount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingMonth">Competência (mês)</Label>
              <Input
                id="billingMonth"
                name="billingMonth"
                type="month"
                required
                defaultValue={defaultMonthInput()}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="seasonId">Temporada (opcional)</Label>
              <select
                id="seasonId"
                name="seasonId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="">— Sem vínculo editorial —</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.number != null ? `T${s.number} · ` : ""}
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Registrar receita</Button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos lançamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Cota</TableHead>
                <TableHead>Temporada</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[200px]">Atualizar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.sponsorCompanyName}</TableCell>
                  <TableCell>{p.quota.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.season
                      ? `${p.season.number != null ? `T${p.season.number} · ` : ""}${p.season.title}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {p.billingMonth.toISOString().slice(0, 7)}
                  </TableCell>
                  <TableCell>{formatBrl(p.agreedMonthlyAmount)}</TableCell>
                  <TableCell>
                    <SponsorPaymentBadge status={p.status} />
                  </TableCell>
                  <TableCell>
                    <form
                      action={updateSponsorPaymentStatus}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <select
                        name="status"
                        defaultValue={p.status}
                        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="PAID">Pago</option>
                        <option value="OVERDUE">Atrasado</option>
                      </select>
                      <Button type="submit" size="sm" variant="secondary">
                        Salvar
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
