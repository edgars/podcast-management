"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { getPublicBaseUrl } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export async function createPanelistInvite(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false as const, error: "Acesso restrito a administradores." };
  }

  const targetEmailRaw = (formData.get("targetEmail") as string | null)?.trim();
  const targetEmail = targetEmailRaw ? targetEmailRaw : null;

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await prisma.panelistInvite.create({
    data: {
      token,
      targetEmail,
      expiresAt,
      createdById: session.user.id,
    },
  });

  const url = `${getPublicBaseUrl()}/convite/${token}`;
  revalidatePath("/painel/painelistas");
  return { ok: true as const, url };
}
