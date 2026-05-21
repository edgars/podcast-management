import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: Promise<{ token: string }> };

export default async function ConvitePage({ params }: Props) {
  const { token } = await params;
  const invite = await prisma.panelistInvite.findUnique({
    where: { token },
  });

  if (!invite) notFound();

  const now = new Date();
  const expired = invite.expiresAt < now;
  const consumed = Boolean(invite.consumedAt);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-lg border-border/80">
        <CardHeader>
          <CardTitle>Convite CyberSec.CAST</CardTitle>
          <CardDescription>
            Canal seguro para executivos convidados ao programa de inteligência
            executiva.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {consumed ? (
            <p>Este convite já foi utilizado. Utilize o acesso padrão com seu e-mail cadastrado.</p>
          ) : expired ? (
            <p>
              Este convite expirou. Solicite à produção um novo link de
              convite.
            </p>
          ) : (
            <>
              <p>
                Convite válido até{" "}
                <span className="font-medium text-foreground">
                  {invite.expiresAt.toLocaleString("pt-BR", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </span>
                .
              </p>
              {invite.targetEmail ? (
                <p>
                  Endereço associado:{" "}
                  <span className="font-medium text-foreground">
                    {invite.targetEmail}
                  </span>
                </p>
              ) : null}
              <p>
                Na próxima etapa, este fluxo permitirá aceitar o convite e
                concluir o cadastro. Por ora, utilize o login com a conta
                criada pela produção ou siga as instruções enviadas por e-mail.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
