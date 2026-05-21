import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { savePanelistProfile } from "@/actions/profile";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PANELIST") redirect("/painel");

  const profile = await prisma.panelistProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Perfil executivo
        </h1>
        <p className="text-sm text-muted-foreground">
          Dados de inteligência de mercado e preferências editoriais para a
          curadoria do CyberSec.CAST. As informações são tratadas com
          confidencialidade operacional.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cadastro e preferências</CardTitle>
          <CardDescription>
            Campos marcados como obrigatórios sustentam o briefing de gravação.
            Temas de interesse e restrições podem ser listados separados por
            vírgula.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={savePanelistProfile} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  defaultValue={profile?.fullName ?? session.user.name ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">E-mail de contato *</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  defaultValue={profile?.contactEmail ?? session.user.email ?? ""}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentTitle">Cargo atual *</Label>
                <Input
                  id="currentTitle"
                  name="currentTitle"
                  required
                  defaultValue={profile?.currentTitle ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa *</Label>
                <Input
                  id="company"
                  name="company"
                  required
                  defaultValue={profile?.company ?? ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="executiveBio">Mini-biografia executiva *</Label>
              <Textarea
                id="executiveBio"
                name="executiveBio"
                required
                rows={5}
                defaultValue={profile?.executiveBio ?? ""}
                placeholder="Trajetória, domínios de atuação e ângulo de contribuição para o episódio."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedInUrl">LinkedIn</Label>
                <Input
                  id="linkedInUrl"
                  name="linkedInUrl"
                  type="url"
                  placeholder="https://www.linkedin.com/in/…"
                  defaultValue={profile?.linkedInUrl ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherProfessionalUrl">Outro link profissional</Label>
                <Input
                  id="otherProfessionalUrl"
                  name="otherProfessionalUrl"
                  type="url"
                  placeholder="Site, Medium, etc."
                  defaultValue={profile?.otherProfessionalUrl ?? ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestTopics">Temas de interesse *</Label>
              <Textarea
                id="interestTopics"
                name="interestTopics"
                rows={3}
                required
                defaultValue={profile?.interestTopics.join(", ") ?? ""}
                placeholder="LGPD, ransomware, IA aplicada à segurança…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topicsToAvoid">Temas a evitar *</Label>
              <Textarea
                id="topicsToAvoid"
                name="topicsToAvoid"
                rows={3}
                required
                defaultValue={profile?.topicsToAvoid.join(", ") ?? ""}
                placeholder="Assuntos sensíveis, confidenciais ou fora do escopo editorial."
              />
            </div>
            <Button type="submit">Salvar perfil</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
