import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateInviteDialog } from "@/components/create-invite-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = { searchParams?: Promise<{ q?: string }> };

export default async function PainelistasPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/painel");

  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? "").trim();

  const profiles = await prisma.panelistProfile.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
            { currentTitle: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      user: { select: { email: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Painelistas</h1>
          <p className="text-sm text-muted-foreground">
            Curadoria executiva: busque por cargo, empresa ou nome e convide
            novos participantes com link seguro.
          </p>
        </div>
        <CreateInviteDialog />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Busca rápida</CardTitle>
          <CardDescription>
            Filtre por palavras-chave presentes no perfil profissional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-2 sm:flex-row" method="get">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Ex.: ransomware, LGPD, nome da empresa…"
              className="sm:max-w-md"
            />
            <div className="flex gap-2">
              <Button type="submit" variant="secondary">
                Filtrar
              </Button>
              {q ? (
                <Button type="button" variant="ghost" asChild>
                  <Link href="/painel/painelistas">Limpar</Link>
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Executivos cadastrados</CardTitle>
          <CardDescription>
            {profiles.length} perfil(is) encontrado(s).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Temas de interesse</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Nenhum perfil localizado com os critérios informados.
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div>{p.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.user.email}
                      </div>
                    </TableCell>
                    <TableCell>{p.currentTitle}</TableCell>
                    <TableCell>{p.company}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {p.interestTopics.slice(0, 4).map((t) => (
                          <Badge key={t} variant="outline" className="font-normal">
                            {t}
                          </Badge>
                        ))}
                        {p.interestTopics.length > 4 ? (
                          <Badge variant="muted">+{p.interestTopics.length - 4}</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.profileCompletedAt ? (
                        <Badge variant="success">Completo</Badge>
                      ) : (
                        <Badge variant="warning">Pendente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
