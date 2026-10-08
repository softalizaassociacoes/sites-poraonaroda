/**
 * Promove (ou cria) administradores: npm run db:admin -- email1 "Nome 1" email2 "Nome 2" ...
 * Usuários criados aqui entram sem senha: use "Gerar nova senha" no admin ou "Esqueci minha senha".
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Uso: npm run db:admin -- email "Nome completo" [email2 "Nome 2" ...]');
    process.exit(1);
  }
  for (let i = 0; i < args.length; i += 2) {
    const email = args[i].toLowerCase().trim();
    const name = args[i + 1] ?? email.split("@")[0];
    const user = await db.user.upsert({
      where: { email },
      update: { role: "ADMIN", status: "ACTIVE", category: "Organização" },
      create: { email, name, role: "ADMIN", status: "ACTIVE", category: "Organização", source: "admin", approvedAt: new Date() },
    });
    console.log(`ADMIN ${user.email} (${user.name}) — ${user.passwordHash || user.legacyHash ? "com senha" : "SEM senha: gerar no painel"}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
