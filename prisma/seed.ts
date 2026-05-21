import path from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

// Garante que o `.env` na raiz do projeto prevaleça (evita herdar DATABASE_URL
// de outra shell, p.ex. apontando para localhost).
loadEnv({
  path: path.resolve(process.cwd(), ".env"),
  override: true,
});

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("AdminCyber!2026", 12);
  const panelistPassword = await hash("PainelistaCyber!2026", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cyberseccast.local" },
    update: {
      name: "Produção CyberSec.CAST",
      role: "ADMIN",
      passwordHash: adminPassword,
    },
    create: {
      email: "admin@cyberseccast.local",
      name: "Produção CyberSec.CAST",
      role: "ADMIN",
      passwordHash: adminPassword,
    },
  });

  const panelist = await prisma.user.upsert({
    where: { email: "painelista@cyberseccast.local" },
    update: {
      name: "Executivo Convidado (demo)",
      role: "PANELIST",
      passwordHash: panelistPassword,
    },
    create: {
      email: "painelista@cyberseccast.local",
      name: "Executivo Convidado (demo)",
      role: "PANELIST",
      passwordHash: panelistPassword,
    },
  });

  await prisma.panelistProfile.upsert({
    where: { userId: panelist.id },
    update: {},
    create: {
      userId: panelist.id,
      fullName: "Executivo Convidado (demo)",
      contactEmail: panelist.email!,
      currentTitle: "Chief Information Security Officer",
      company: "Organização demonstrativa",
      executiveBio:
        "Perfil de demonstração para homologação do painel de painelistas.",
      interestTopics: ["Governança de dados", "Resposta a incidentes"],
      topicsToAvoid: ["Detalhes contratuais confidenciais"],
      profileCompletedAt: new Date(),
    },
  });

  // Garante que o admin exista sem perfil de painelista
  await prisma.panelistProfile.deleteMany({ where: { userId: admin.id } });

  const profile = await prisma.panelistProfile.findUnique({
    where: { userId: panelist.id },
  });

  if (profile) {
    await prisma.season.deleteMany({ where: { title: "Temporada 1 (demonstração)" } });
    await prisma.season.create({
      data: {
        number: 1,
        title: "Temporada 1 (demonstração)",
        synopsis: "Dados de exemplo para temporada, episódio e painel.",
        episodes: {
          create: {
            number: 1,
            title: "Episódio piloto (demonstração)",
            synopsis: "Episódio de homologação com o painelista de demo.",
            status: "PLANNED",
            panelists: {
              create: [{ panelistProfileId: profile.id }],
            },
          },
        },
      },
    });
  }

  console.log("");
  console.log("Seed concluído — utilizadores de demonstração:");
  console.log("");
  console.log("  ADMIN (produção)");
  console.log("    E-mail:  admin@cyberseccast.local");
  console.log("    Senha:   AdminCyber!2026");
  console.log("");
  console.log("  PAINELISTA");
  console.log("    E-mail:  painelista@cyberseccast.local");
  console.log("    Senha:   PainelistaCyber!2026");
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
