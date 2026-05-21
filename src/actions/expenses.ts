"use server";

import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ExpensePaymentStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function createExpense(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "").replace(",", "."));
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const status = String(formData.get("status") ?? "PENDING") as ExpensePaymentStatus;

  if (!description || !Number.isFinite(amount) || !dueDateRaw) {
    return;
  }

  const dueDate = new Date(`${dueDateRaw}T00:00:00.000Z`);

  let seasonId = String(formData.get("seasonId") ?? "").trim() || undefined;
  let episodeId = String(formData.get("episodeId") ?? "").trim() || undefined;

  if (episodeId) {
    const ep = await prisma.episode.findUnique({
      where: { id: episodeId },
      select: { seasonId: true },
    });
    if (!ep) {
      episodeId = undefined;
    } else {
      seasonId = ep.seasonId;
    }
  } else if (seasonId) {
    const s = await prisma.season.findUnique({ where: { id: seasonId }, select: { id: true } });
    if (!s) seasonId = undefined;
  }

  await prisma.expense.create({
    data: {
      description,
      amount: new Decimal(amount),
      dueDate,
      status: ["PENDING", "PAID", "OVERDUE"].includes(status) ? status : "PENDING",
      seasonId,
      episodeId,
    },
  });

  revalidatePath("/painel/financeiro/despesas");
  revalidatePath("/painel/financeiro/fluxo");
  revalidatePath("/painel/temporadas");
  revalidatePath("/painel");
}

export async function updateExpenseStatus(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ExpensePaymentStatus;
  if (!id || !["PAID", "PENDING", "OVERDUE"].includes(status)) {
    return;
  }

  await prisma.expense.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/painel/financeiro/despesas");
  revalidatePath("/painel/financeiro/fluxo");
  revalidatePath("/painel/temporadas");
  revalidatePath("/painel");
}

export async function deleteExpense(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.expense.delete({ where: { id } });
  revalidatePath("/painel/financeiro/despesas");
  revalidatePath("/painel/financeiro/fluxo");
  revalidatePath("/painel/temporadas");
  revalidatePath("/painel");
}
