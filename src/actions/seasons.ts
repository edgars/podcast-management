"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

export async function createSeason(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const title = String(formData.get("title") ?? "").trim();
  const synopsis = String(formData.get("synopsis") ?? "").trim() || undefined;
  const number = parseOptionalInt(String(formData.get("number") ?? ""));
  const startDate = parseOptionalDate(String(formData.get("startDate") ?? ""));
  const endDate = parseOptionalDate(String(formData.get("endDate") ?? ""));

  if (!title) return;

  await prisma.season.create({
    data: {
      title,
      synopsis,
      number,
      startDate,
      endDate,
    },
  });

  revalidatePath("/painel/temporadas");
  revalidatePath("/painel");
}

export async function updateSeason(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const synopsis = String(formData.get("synopsis") ?? "").trim() || undefined;
  const number = parseOptionalInt(String(formData.get("number") ?? ""));
  const startDate = parseOptionalDate(String(formData.get("startDate") ?? ""));
  const endDate = parseOptionalDate(String(formData.get("endDate") ?? ""));

  if (!id || !title) return;

  await prisma.season.update({
    where: { id },
    data: { title, synopsis, number, startDate, endDate },
  });

  revalidatePath("/painel/temporadas");
  revalidatePath(`/painel/temporadas/${id}`);
  revalidatePath("/painel");
}

export async function deleteSeason(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.season.delete({ where: { id } });

  revalidatePath("/painel/temporadas");
  revalidatePath("/painel/financeiro/despesas");
  revalidatePath("/painel/financeiro/receitas");
  revalidatePath("/painel");
}
