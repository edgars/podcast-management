import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { deleteEpisode, updateEpisode } from "@/actions/episodes";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const episodeStatusLabels: Record<string, string> = {
  PLANNED: "Planejado",
  RECORDED: "Gravado",
  PUBLISHED: "Publicado",
  CANCELLED: "Cancelado",
};

export default async function EpisodioEditPage({
  params,
}: {
  params: Promise<{ seasonId: string; episodeId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/painel");

  const { seasonId, episodeId } = await params;

  const [episode, panelists] = await Promise.all([
    prisma.episode.findFirst({
      where: { id: episodeId, seasonId },
      include: {
        season: true,
        panelists: { select: { panelistProfileId: true } },
      },
    }),
    prisma.panelistProfile.findMany({
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, company: true },
    }),
  ]);

  if (!episode) notFound();

  const selected = new Set(episode.panelists.map((p) => p.panelistProfileId));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground">
          <Link href="/painel/temporadas" className="text-accent hover:underline">
            Temporadas
          </Link>
          <span className="mx-1">/</span>
          <Link href={`/painel/temporadas/${seasonId}`} className="text-accent hover:underline">
            {episode.season.title}
          </Link>
          <span className="mx-1">/</span>
          <span>{episode.title}</span>
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{episode.title}</h1>
        <p className="text-sm text-muted-foreground">Edição do episódio e composição do painel.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do episódio</CardTitle>
          <CardDescription>Atualize título, agenda, status e painelistas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateEpisode} className="space-y-4">
            <input type="hidden" name="id" value={episode.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" required defaultValue={episode.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número na temporada (opcional)</Label>
                <Input
                  id="number"
                  name="number"
                  type="number"
                  inputMode="numeric"
                  defaultValue={episode.number ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Data prevista (opcional)</Label>
                <Input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="date"
                  defaultValue={
                    episode.scheduledAt ? episode.scheduledAt.toISOString().slice(0, 10) : ""
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="synopsis">Sinopse (opcional)</Label>
                <Textarea id="synopsis" name="synopsis" rows={3} defaultValue={episode.synopsis ?? ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={episode.status}
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
              <Label>Painelistas</Label>
              {panelists.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum painelista cadastrado.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {panelists.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        id={`ep-${p.id}`}
                        name="panelistId"
                        value={p.id}
                        defaultChecked={selected.has(p.id)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <label htmlFor={`ep-${p.id}`} className="cursor-pointer leading-tight">
                        <span className="font-medium">{p.fullName}</span>
                        <span className="block text-xs text-muted-foreground">{p.company}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Salvar episódio</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Zona de risco</CardTitle>
          <CardDescription>Excluir remove o episódio e vínculos com painelistas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={deleteEpisode}>
            <input type="hidden" name="id" value={episode.id} />
            <Button type="submit" variant="destructive" size="sm">
              Excluir episódio
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
