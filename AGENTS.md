# Notas para agentes

- Next.js 16: middleware chama-se `src/proxy.ts`; tipos `PageProps<"/rota">` e `LayoutProps` são globais (gerados pelo `next typegen`/build). Leia `node_modules/next/dist/docs/` antes de usar APIs que mudaram.
- Identidade: festival de rock, fundo **preto** (`ink-950`) com amarelo-sinal `#FFF100` como cor principal (`brand-*`). Acentos da arte oficial em `punk-*`: azul `#0000EB`, ciano `#0094EF`, rosa `#FF99CE`, laranja `#FF5F2F`, verde `#00B746`, roxo `#8E00FF`, lilás `#D983FF`, menta `#B2FCBE`. Títulos na fonte **Meltow** (`font-display`, servida de `/uploads/2026/06`), corpo em Archivo.
- **Amarelo nunca leva texto branco**: botões/badges `bg-brand-*` usam `text-black`.
- O site público é escuro; o **painel admin continua claro** (`bg-sand-50 text-ink-900` no `admin/layout.tsx`). As escalas `sand-*` e `lime-*` existem só para o admin.
- Todo o site é público; só `/sala`, `/quiz`, `/credencial`, `/conta` e `/admin` exigem login (ver `src/proxy.ts`).
- Horários digitados no admin são sempre Brasília (GMT-3): `new Date(raw + ":00-03:00")`. Datas de aula são meia-noite UTC do dia.
- Conteúdo migrado vive em `prisma/content.json` (extraído da REST API do WordPress). O seed é idempotente e não sobrescreve edições manuais das aulas.
- As salas de 2026 mantêm os slugs do WordPress (`sala01`…`sala06`); as de 2025 têm slug descritivo e `next.config.ts` redireciona as URLs antigas dos palestrantes.
- Datas de 2025: a listagem do WordPress trazia 14/05 e 15/05 trocadas entre Marina Mattoso e Arthur Fitzgibbon. Vale o que está nos banners oficiais (14/05 Marina, 15/05 Arthur), que é o que está no `content.json`.
- Ficha do participante: `phone`, `cpf`, `city`, `state`, `profession` (atuação) e `institution` (banda/projeto). A inscrição pede nome, sobrenome, telefone, e-mail e senha — o resto é opcional.
- Importação de usuários: `src/lib/csv.ts` detecta o formato (simples / WordPress / Forminator) e `src/lib/import-users.ts` grava. Hash `$P$` do WP é aceito no login (`src/lib/phpass.ts`).
