# Porão na Roda — plataforma em código

Site + área restrita + painel admin do **Porão na Roda** (poraonaroda.softaliza.com.br), substituindo o WordPress.
Stack: Next.js 16 (App Router) · Prisma 6 · Postgres (Neon) · Tailwind 4 · deploy na Vercel.

O Porão na Roda é o ciclo formativo gratuito do Festival Porão do Rock sobre carreira, mercado e
produção musical.

## O que tem

- **Site público**: home/programação (edição atual e anteriores), palestrantes, passo a passo, FAQ,
  políticas/termos, inscrição e login.
- **Área restrita (login)**: salas das aulas (`/sala/<slug>`) com Zoom embutido ao vivo, gravação
  (YouTube/Vimeo), materiais em PDF e quiz; credencial; minha conta.
- **Admin (`/admin`)**: visão geral, métricas de acesso (views, visitantes, páginas, origens, países,
  dispositivos, novos cadastros, logins), usuários (CRUD, importação CSV/WordPress, exportação CSV,
  senha), solicitações de inscrição (aprovar/recusar, aprovação automática), categorias, edições,
  aulas/salas (+ quiz), palestrantes, FAQ, parceiros/logos, conteúdo e configurações.
- **Senhas do WordPress**: usuários importados com o hash original (`$P$…`) entram com a mesma senha;
  o hash é migrado para bcrypt no primeiro login.
- **E-mails** (opcional, SendGrid): redefinição de senha, aviso de inscrição recebida/aprovada,
  aviso ao admin.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL e AUTH_SECRET
npx prisma db push     # cria as tabelas
npm run db:seed        # admin + todo o conteúdo migrado (prisma/content.json)
npm run dev
```

Importar usuários do WordPress (exportação do plugin *Import and Export Users*):

```bash
npx tsx scripts/import-wp-users.ts "caminho/user-export.csv"
npx tsx scripts/import-wp-users.ts "caminho/inscricoes.csv" --status=PENDING
```

## Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Postgres (Neon via Vercel Marketplace) |
| `AUTH_SECRET` | assinatura das sessões (`openssl rand -base64 32`) |
| `SEED_ADMIN_PASSWORD` | senha do admin criado pelo seed (opcional) |
| `SENDGRID_API_KEY`, `MAIL_FROM` | e-mails transacionais (opcional) |
| `SITE_URL` | URL pública (links nos e-mails, sitemap) |

## Estrutura

- `src/app/(site)` — páginas públicas e área do participante
- `src/app/admin` — painel (server actions em `admin/actions/*`)
- `src/app/api/track` — coleta de métricas (uma linha por visualização)
- `src/lib` — auth (JWT em cookie httpOnly), phpass (senhas do WP), e-mail, CSV, analytics, conteúdo
- `src/proxy.ts` — protege `/sala`, `/quiz`, `/credencial`, `/conta`, `/admin`
- `prisma/content.json` — conteúdo extraído do WordPress (edições 2025 e 2026)
- `public/uploads` — mídias do WordPress (fotos do line up, logo, fontes Meltow), nos mesmos caminhos
- `next.config.ts` — redirects das URLs antigas (`/programacao/salaNN`, `/formulario-de-cadastro`, …)
