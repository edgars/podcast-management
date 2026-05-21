import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { createEpisode, deleteEpisode } from "@/actions/episodes";
import { updateSeason } from "@/actions/seasons";
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

const episodeStatusLabels: Record<string, string> = {
  PLANNED: "Planejado",
  RECORDED: "Gravado",
  PUBLISHED: "Publicado",
  CANCELLED: "Cancelado",
};

export default async function TemporadaDetailPage({
  params,
}: {
  params: Promise<{ seasonId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/painel");

  const { seasonId } = await params;

  const [season, panelists] = await Promise.all([
    prisma.season.findUnique({
      where: { id: seasonId },
      include: {
        episodes: {
          orderBy: [{ number: "asc" }, { title: "asc" }],
          include: {
            _count: { select: { panelists: true } },
          },
        },
        _count: { select: { expenses: true, sponsorPayments: true } },
      },
    }),
    prisma.panelistProfile.findMany({
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, company: true },
    }),
  ]);

  if (!season) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">
            <Link href="/painel/temporadas" className="text-accent hover:underline">
              Temporadas
            </Link>
            <span className="mx-1">/</span>
            <span>{season.title}</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{season.title}</h1>
          <p className="text-sm text-muted-foreground">
            {season._count.expenses} despesas · {season._count.sponsorPayments} receitas vinculadas
            nesta temporada
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Editar temporada</CardTitle>
          <CardDescription>Atualize metadados e período da temporada.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateSeason} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={season.id} />
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required defaultValue={season.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número (opcional)</Label>
              <Input
                id="number"
                name="number"
                type="number"
                inputMode="numeric"
                defaultValue={season.number ?? ""}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="synopsis">Sinopse (opcional)</Label>
              <Textarea
                id="synopsis"
                name="synopsis"
                rows={3}
                defaultValue={season.synopsis ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Início (opcional)</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={
                  season.startDate ? season.startDate.toISOString().slice(0, 10) : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fim (opcional)</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={season.endDate ? season.endDate.toISOString().slice(0, 10) : ""}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Salvar temporada</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novo episódio</CardTitle>
          <CardDescription>
            Associe um ou mais painelistas ao episódio. Você pode ajustar tudo depois na página do
            episódio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createEpisode} className="space-y-4">
            <input type="hidden" name="seasonId" value={season.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ep-title">Título do episódio</Label>
                <Input id="ep-title" name="title" required placeholder="Ex.: Risco e governança em nuvem" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-number">Número na temporada (opcional)</Label>
                <Input id="ep-number" name="number" type="number" inputMode="numeric" min={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-scheduled">Data prevista (opcional)</Label>
                <Input id="ep-scheduled" name="scheduledAt" type="date" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ep-synopsis">Sinopse (opcional)</Label>
                <Textarea id="ep-synopsis" name="synopsis" rows={2} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ep-status">Status</Label>
                <select
                  id="ep-status"
                  name="status"
                  defaultValue="PLANNED"
                  className="flex h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {Object.entries(episodeStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Painelistas neste episódio</Label>
              {panelists.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum perfil de painelista cadastrado. Convide em{" "}
                  <Link href="/painel/painelistas" className="text-accent underline">
                    Painelistas
                  </Link>
                  .
                </p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {panelists.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        id={`np-${p.id}`}
                        name="panelistId"
                        value={p.id}
                        className="h-4 w-4 rounded border-input"
                      />
                      <label htmlFor={`np-${p.id}`} className="cursor-pointer leading-tight">
                        <span className="font-medium">{p.fullName}</span>
                        <span className="block text-xs text-muted-foreground">{p.company}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button type="submit">Criar episódio</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Episódios</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {season.episodes.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Nenhum episódio nesta temporada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Painelistas</TableHead>
                  <TableHead className="w-[220px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {season.episodes.map((ep) => (
                  <TableRow key={ep.id}>
                    <TableCell>{ep.number ?? "—"}</TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/painel/temporadas/${season.id}/episodios/${ep.id}`}
                        className="text-accent underline-offset-4 hover:underline"
                      >
                        {ep.title}
                      </Link>
                    </TableCell>
                    <TableCell>{episodeStatusLabels[ep.status] ?? ep.status}</TableCell>
                    <TableCell>{ep._count.panelists}</TableCell>
                    <TableCell>
                      <form action={deleteEpisode}>
                        <input type="hidden" name="id" value={ep.id} />
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
