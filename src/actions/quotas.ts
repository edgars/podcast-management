"use server";

import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function createQuota(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const name = String(formData.get("name") ?? "").trim();
  const monthlyAmount = Number(String(formData.get("monthlyAmount") ?? "").replace(",", "."));
  const counterpartiesNotes = String(formData.get("counterpartiesNotes") ?? "").trim();

  if (!name || !Number.isFinite(monthlyAmount) || monthlyAmount <= 0) {
    return;
  }

  await prisma.sponsorshipQuota.create({
    data: {
      name,
      monthlyAmount: new Decimal(monthlyAmount),
      counterpartiesNotes: counterpartiesNotes || "—",
      isActive: true,
    },
  });

  revalidatePath("/painel/cotas");
  revalidatePath("/painel/financeiro/receitas");
}

export async function deleteQuota(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const payments = await prisma.sponsorPayment.count({ where: { quotaId: id } });
  if (payments > 0) {
    return;
  }

  await prisma.sponsorshipQuota.delete({ where: { id } });
  revalidatePath("/painel/cotas");
  revalidatePath("/painel/financeiro/receitas");
}

export async function updateQuota(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const monthlyAmount = Number(
    String(formData.get("monthlyAmount") ?? "").replace(",", "."),
  );
  const counterpartiesNotes = String(formData.get("counterpartiesNotes") ?? "").trim();

  if (!id || !name || !Number.isFinite(monthlyAmount) || monthlyAmount <= 0) {
    return;
  }

  await prisma.sponsorshipQuota.update({
    where: { id },
    data: {
      name,
      monthlyAmount: new Decimal(monthlyAmount),
      counterpartiesNotes: counterpartiesNotes || "—",
    },
  });

  revalidatePath("/painel/cotas");
  revalidatePath("/painel/financeiro/receitas");
}
