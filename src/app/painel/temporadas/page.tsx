import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { createSeason, deleteSeason } from "@/actions/seasons";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function TemporadasPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/painel");

  const seasons = await prisma.season.findMany({
    orderBy: [{ number: "desc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { episodes: true, expenses: true, sponsorPayments: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Temporadas e episódios</h1>
        <p className="text-sm text-muted-foreground">
          Organize o calendário editorial: cada temporada agrupa episódios, despesas e vínculos de
          patrocínio. Episódios podem reunir um ou mais painelistas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nova temporada</CardTitle>
          <CardDescription>
            Defina título, número editorial (opcional) e período aproximado da temporada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSeason} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required placeholder="Ex.: Temporada 2026" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número (opcional)</Label>
              <Input id="number" name="number" type="number" inputMode="numeric" placeholder="1" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="synopsis">Sinopse / notas (opcional)</Label>
              <Textarea id="synopsis" name="synopsis" rows={3} placeholder="Linha editorial..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Início (opcional)</Label>
              <Input id="startDate" name="startDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fim (opcional)</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Cadastrar temporada</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Temporadas cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {seasons.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              Nenhuma temporada ainda. Crie a primeira acima.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Nº</TableHead>
                  <TableHead>Episódios</TableHead>
                  <TableHead>Despesas</TableHead>
                  <TableHead>Receitas</TableHead>
                  <TableHead className="w-[200px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {seasons.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <Link
                        className="text-accent underline-offset-4 hover:underline"
                        href={`/painel/temporadas/${s.id}`}
                      >
                        {s.title}
                      </Link>
                    </TableCell>
                    <TableCell>{s.number ?? "—"}</TableCell>
                    <TableCell>{s._count.episodes}</TableCell>
                    <TableCell>{s._count.expenses}</TableCell>
                    <TableCell>{s._count.sponsorPayments}</TableCell>
                    <TableCell>
                      <form action={deleteSeason}>
                        <input type="hidden" name="id" value={s.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          Excluir
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
