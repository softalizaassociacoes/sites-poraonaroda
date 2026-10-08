/**
 * Importa usuários a partir de CSVs (exportação do WordPress, do Forminator ou simples).
 *
 *   npx tsx scripts/import-wp-users.ts <arquivo.csv> [--status=ACTIVE|PENDING] [--category=Participante] [--update] [--password=senha]
 *
 * Exemplos:
 *   npx tsx scripts/import-wp-users.ts "C:/Users/marco/Downloads/user-export-14-6a8f35c664f7a.csv"
 *   npx tsx scripts/import-wp-users.ts "C:/Users/marco/Downloads/forminator-....csv" --status=PENDING
 */
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { mapRows, parseCsv } from "../src/lib/csv";
import { importUsers } from "../src/lib/import-users";

const db = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error("Uso: npx tsx scripts/import-wp-users.ts <arquivo.csv> [--status=ACTIVE|PENDING] [--category=X] [--update] [--password=senha]");
    process.exit(1);
  }
  const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
  const defaultStatus = opt("status") === "PENDING" ? "PENDING" : "ACTIVE";
  const defaultCategory = opt("category") || "Participante";
  const updateExisting = args.includes("--update");
  const defaultPassword = opt("password");

  const raw = readFileSync(file);
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(raw);
  } catch {
    text = new TextDecoder("latin1").decode(raw);
  }
  const rows = parseCsv(text);
  const { format, users, invalid } = mapRows(rows, { defaultCategory, defaultStatus });
  console.log(`Formato: ${format} · ${users.length} usuário(s) válido(s) · ${invalid} inválido(s)`);

  const summary = await importUsers(db, users, { defaultPassword, defaultCategory, defaultStatus, updateExisting });
  console.log(`Concluído: ${summary.created} criado(s), ${summary.updated} atualizado(s), ${summary.skipped} já existiam.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
