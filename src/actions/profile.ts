"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseCommaList } from "@/lib/format";

export async function savePanelistProfile(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    return;
  }

  if (session.user.role !== "PANELIST") {
    return;
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const currentTitle = String(formData.get("currentTitle") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const executiveBio = String(formData.get("executiveBio") ?? "").trim();
  const linkedInUrl = String(formData.get("linkedInUrl") ?? "").trim() || null;
  const otherProfessionalUrl =
    String(formData.get("otherProfessionalUrl") ?? "").trim() || null;
  const interestTopics = parseCommaList(
    String(formData.get("interestTopics") ?? ""),
  );
  const topicsToAvoid = parseCommaList(String(formData.get("topicsToAvoid") ?? ""));

  if (!fullName || !contactEmail || !currentTitle || !company || !executiveBio) {
    return;
  }

  if (interestTopics.length === 0 || topicsToAvoid.length === 0) {
    return;
  }

  await prisma.panelistProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      fullName,
      contactEmail,
      currentTitle,
      company,
      executiveBio,
      linkedInUrl,
      otherProfessionalUrl,
      interestTopics,
      topicsToAvoid,
      profileCompletedAt: new Date(),
    },
    update: {
      fullName,
      contactEmail,
      currentTitle,
      company,
      executiveBio,
      linkedInUrl,
      otherProfessionalUrl,
      interestTopics,
      topicsToAvoid,
      profileCompletedAt: new Date(),
    },
  });

  revalidatePath("/painel/perfil");
  revalidatePath("/painel");
}
