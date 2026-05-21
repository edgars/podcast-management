# CyberSec.CAST — gestão interna

Plataforma **Next.js (App Router)** com **TypeScript**, **Tailwind CSS**, componentes estilo **Shadcn**, **Prisma** + **PostgreSQL (Neon)** e **NextAuth.js (Credentials + JWT)** para gestão de painelistas, cotas de patrocínio e finanças.

## Requisitos

- Node.js 20+
- Projeto e credenciais no [Neon](https://neon.tech/)

## Configuração

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` e `AUTH_URL`.
2. Instale dependências: `npm install`
3. Aplique o schema: `npx prisma migrate dev` (ou `npx prisma db push` em ambiente de testes).
4. Crie os usuários de demonstração: `npm run db:seed`

## Usuários de demonstração (após seed)

| Perfil     | E-mail                         | Senha                 |
|-----------|--------------------------------|------------------------|
| Admin     | `admin@cyberseccast.local`     | `AdminCyber!2026`      |
| Painelista | `painelista@cyberseccast.local` | `PainelistaCyber!2026` |

Altere as senhas em produção e rode o seed apenas em ambiente controlado.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` / `npm start` — produção
- `npm run clean` — remove artefactos de build (resolver erros `readlink` / `.next` corrompido)
- `npm run lint` — ESLint (no build, o lint está `ignoreDuringBuilds` até configurarmos flat config estável com `eslint-config-next`)
- `npm run db:studio` — Prisma Studio

## Estrutura principal

- `src/app/painel/*` — área autenticada (dashboard, temporadas/episódios, painelistas, cotas, financeiro, perfil)
- `src/actions/*` — Server Actions (mutações)
- `src/auth.ts` — NextAuth
- `prisma/schema.prisma` — modelo de dados

### Temporadas e episódios

- **Temporada** (`Season`): agrupa episódios; despesas e receitas de patrocínio podem ser associadas à temporada.
- **Episódio** (`Episode`): pertence a uma temporada; pode ter **vários painelistas** via `EpisodePanelist` (perfil `PanelistProfile`).
- **Despesa** (`Expense`): campos opcionais `seasonId` e `episodeId` (se o episódio for indicado, a temporada é inferida automaticamente na criação).

## Windows / OneDrive

Se aparecer **`EINVAL: readlink`** em `.next\server\app\...`, costuma ser **sincronização do OneDrive** a interferir com symlinks do Next.js. Este projeto usa **`distDir: ".next-local"`** (em vez de `.next` na raiz) para reduzir conflitos com o OneDrive. Em caso de erro, corra **`npm run clean`** e volte a `npm run dev` / `npm run build`.

## Identidade visual

Paleta e tipografia inspiradas no **hero** do site [CyberSec.CAST](https://cyberseccast.com/): fundo **#050507**, **violeta** (~`#7C3AED`), **lavanda** (~`#818CF8`), botões em **pílula** com gradiente, brilho suave e marca **CyberSec** em **Poppins** + **`.Cast`** em **Great Vibes**. Corpo em **Inter**; código em **JetBrains Mono**.
