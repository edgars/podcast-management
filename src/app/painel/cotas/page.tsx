import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { QuotasCrud } from "./quotas-crud";

export default async function CotasPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/painel");

  const quotas = await prisma.sponsorshipQuota.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Cotas de patrocínio
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastre cotas corporativas com valor mensal e contrapartidas editoriais
          acordadas com patrocinadores.
        </p>
      </div>
      <QuotasCrud
        quotas={quotas.map((q) => ({
          id: q.id,
          name: q.name,
          monthlyAmount: q.monthlyAmount.toString(),
          counterpartiesNotes: q.counterpartiesNotes,
        }))}
      />
    </div>
  );
}
