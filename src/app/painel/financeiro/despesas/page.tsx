import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { createExpense, deleteExpense, updateExpenseStatus } from "@/actions/expenses";
import { prisma } from "@/lib/prisma";
import { formatBrl } from "@/lib/format";
import { ExpenseStatusBadge } from "@/components/payment-status-badges";
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

export default async function DespesasPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/painel");

  const [expenses, seasonsForForm] = await Promise.all([
    prisma.expense.findMany({
      orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
      take: 80,
      include: {
        season: { select: { title: true } },
        episode: { select: { title: true, number: true } },
      },
    }),
    prisma.season.findMany({
      orderBy: [{ number: "desc" }, { createdAt: "desc" }],
      include: {
        episodes: { orderBy: [{ number: "asc" }, { title: "asc" }], select: { id: true, title: true, number: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Despesas mensais</h1>
        <p className="text-sm text-muted-foreground">
          Controle custos operacionais: estúdio, edição, mídia paga e infraestrutura.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nova despesa</CardTitle>
          <CardDescription>
            Informe descrição, valor, vencimento e status de pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createExpense} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                required
                placeholder="Ex.: Edição de vídeo — episódio T1E04"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (BRL)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Vencimento</Label>
              <Input id="dueDate" name="dueDate" type="date" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue="PENDING"
              >
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago</option>
                <option value="OVERDUE">Atrasado</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="seasonId">Temporada (opcional)</Label>
              <select
                id="seasonId"
                name="seasonId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="">— Geral / não vinculada —</option>
                {seasonsForForm.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.number != null ? `T${s.number} · ` : ""}
                    {s.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Use para despesas da temporada inteira. Se escolher um episódio abaixo, a temporada
                é preenchida automaticamente.
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="episodeId">Episódio (opcional)</Label>
              <select
                id="episodeId"
                name="episodeId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="">— Nenhum episódio —</option>
                {seasonsForForm.flatMap((s) =>
                  s.episodes.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      {s.title}
                      {" · "}
                      {ep.number != null ? `E${ep.number} — ` : ""}
                      {ep.title}
                    </option>
                  )),
                )}
              </select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Cadastrar despesa</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lançamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Temporada</TableHead>
                <TableHead>Episódio</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[220px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.description}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.season?.title ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.episode
                      ? `${e.episode.number != null ? `E${e.episode.number} · ` : ""}${e.episode.title}`
                      : "—"}
                  </TableCell>
                  <TableCell>{e.dueDate.toISOString().slice(0, 10)}</TableCell>
                  <TableCell>{formatBrl(e.amount)}</TableCell>
                  <TableCell>
                    <ExpenseStatusBadge status={e.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <form
                        action={updateExpenseStatus}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="id" value={e.id} />
                        <select
                          name="status"
                          defaultValue={e.status}
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
                      <form action={deleteExpense}>
                        <input type="hidden" name="id" value={e.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          Excluir
                        </Button>
                      </form>
                    </div>
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
