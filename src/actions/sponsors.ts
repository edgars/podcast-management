"use server";

import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfUtcMonth } from "@/lib/format";
import type { MonthlyPaymentStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function createSponsorPayment(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const quotaId = String(formData.get("quotaId") ?? "");
  const sponsorCompanyName = String(formData.get("sponsorCompanyName") ?? "").trim();
  const agreedMonthlyAmount = Number(
    String(formData.get("agreedMonthlyAmount") ?? "").replace(",", "."),
  );
  const billingMonthRaw = String(formData.get("billingMonth") ?? "").trim();

  if (!quotaId || !sponsorCompanyName || !Number.isFinite(agreedMonthlyAmount)) {
    return;
  }

  const billingMonth = billingMonthRaw
    ? new Date(`${billingMonthRaw}T00:00:00.000Z`)
    : startOfUtcMonth();

  let seasonId = String(formData.get("seasonId") ?? "").trim() || undefined;
  if (seasonId) {
    const s = await prisma.season.findUnique({ where: { id: seasonId }, select: { id: true } });
    if (!s) seasonId = undefined;
  }

  await prisma.sponsorPayment.create({
    data: {
      quotaId,
      sponsorCompanyName,
      agreedMonthlyAmount: new Decimal(agreedMonthlyAmount),
      billingMonth,
      status: "PENDING",
      seasonId,
    },
  });

  revalidatePath("/painel/financeiro/receitas");
  revalidatePath("/painel/financeiro/fluxo");
  revalidatePath("/painel/temporadas");
  revalidatePath("/painel");
}

export async function updateSponsorPaymentStatus(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as MonthlyPaymentStatus;
  if (!id || !["PAID", "PENDING", "OVERDUE"].includes(status)) {
    return;
  }

  await prisma.sponsorPayment.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/painel/financeiro/receitas");
  revalidatePath("/painel/financeiro/fluxo");
  revalidatePath("/painel/temporadas");
  revalidatePath("/painel");
}
