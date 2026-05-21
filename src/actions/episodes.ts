"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { EpisodeStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

function parseOptionalInt(raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

function parseOptionalDate(raw: string): Date | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  return new Date(`${t}T00:00:00.000Z`);
}

const EPISODE_STATUSES: EpisodeStatus[] = ["PLANNED", "RECORDED", "PUBLISHED", "CANCELLED"];

function parseStatus(raw: string): EpisodeStatus {
  const s = String(raw ?? "").trim() as EpisodeStatus;
  return EPISODE_STATUSES.includes(s) ? s : "PLANNED";
}

async function replaceEpisodePanelists(episodeId: string, panelistProfileIds: string[]) {
  const unique = [...new Set(panelistProfileIds.filter(Boolean))];
  await prisma.$transaction([
    prisma.episodePanelist.deleteMany({ where: { episodeId } }),
    ...(unique.length
      ? [
          prisma.episodePanelist.createMany({
            data: unique.map((panelistProfileId) => ({ episodeId, panelistProfileId })),
          }),
        ]
      : []),
  ]);
}

export async function createEpisode(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const seasonId = String(formData.get("seasonId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const synopsis = String(formData.get("synopsis") ?? "").trim() || undefined;
  const number = parseOptionalInt(String(formData.get("number") ?? ""));
  const scheduledAt = parseOptionalDate(String(formData.get("scheduledAt") ?? ""));
  const status = parseStatus(String(formData.get("status") ?? "PLANNED"));
  const panelistIds = formData.getAll("panelistId").map(String).filter(Boolean);

  if (!seasonId || !title) return;

  const season = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!season) return;

  const episode = await prisma.episode.create({
    data: {
      seasonId,
      title,
      synopsis,
      number,
      scheduledAt,
      status,
    },
  });

  if (panelistIds.length) {
    await replaceEpisodePanelists(episode.id, panelistIds);
  }

  revalidatePath(`/painel/temporadas/${seasonId}`);
  revalidatePath(`/painel/temporadas/${seasonId}/episodios/${episode.id}`);
  revalidatePath("/painel/temporadas");
  revalidatePath("/painel/financeiro/despesas");
  revalidatePath("/painel");
}

export async function updateEpisode(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const synopsis = String(formData.get("synopsis") ?? "").trim() || undefined;
  const number = parseOptionalInt(String(formData.get("number") ?? ""));
  const scheduledAt = parseOptionalDate(String(formData.get("scheduledAt") ?? ""));
  const status = parseStatus(String(formData.get("status") ?? "PLANNED"));
  const panelistIds = formData.getAll("panelistId").map(String).filter(Boolean);

  if (!id || !title) return;

  const existing = await prisma.episode.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.episode.update({
    where: { id },
    data: { title, synopsis, number, scheduledAt, status },
  });

  await replaceEpisodePanelists(id, panelistIds);

  revalidatePath(`/painel/temporadas/${existing.seasonId}`);
  revalidatePath(`/painel/temporadas/${existing.seasonId}/episodios/${id}`);
  revalidatePath("/painel/temporadas");
  revalidatePath("/painel/financeiro/despesas");
  revalidatePath("/painel");
}

export async function deleteEpisode(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.episode.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.episode.delete({ where: { id } });

  revalidatePath(`/painel/temporadas/${existing.seasonId}`);
  revalidatePath("/painel/temporadas");
  revalidatePath("/painel/financeiro/despesas");
  revalidatePath("/painel");
}
