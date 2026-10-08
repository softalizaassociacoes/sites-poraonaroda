/**
 * Auditoria do conteúdo migrado: npm run db:audit
 * Lista lives sem gravação/palestrante, palestrantes sem foto/bio e arquivos
 * referenciados no banco que não existem em public/uploads.
 */
import { existsSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function localExists(url: string | null | undefined) {
  if (!url || !url.startsWith("/")) return true;
  return existsSync(path.join(process.cwd(), "public", url.split("?")[0]));
}

async function main() {
  const editions = await db.edition.findMany({
    orderBy: { year: "asc" },
    include: {
      lectures: {
        orderBy: [{ date: "asc" }],
        include: { speakers: { include: { speaker: true } }, _count: { select: { questions: true } } },
      },
    },
  });
  const today = new Date();
  const problems: string[] = [];
  for (const e of editions) {
    console.log(`\n== ${e.name} (${e.lectures.length} lives)${e.current ? " · ATUAL" : ""}`);
    for (const l of e.lectures) {
      const past = l.date && l.date < today;
      const mats = Array.isArray(l.materials) ? (l.materials as { url?: string }[]) : [];
      const flags: string[] = [];
      if (!l.speakers.length) flags.push("SEM PALESTRANTE");
      if (past && !l.recordingUrl) flags.push("passada SEM GRAVAÇÃO");
      if (!past && !l.liveUrl) flags.push("futura sem Zoom");
      for (const m of mats) if (!localExists(m.url)) flags.push(`arquivo ausente ${m.url}`);
      console.log(
        `  ${l.dateLabel?.padEnd(5)} ${l.title.slice(0, 55).padEnd(55)} | ${l.speakers.map((s) => s.speaker.name).join(", ").slice(0, 40).padEnd(40)} | ${
          l.recordingUrl ? "vídeo" : "  -  "
        } | ${mats.length} mat | ${l._count.questions} quiz${flags.length ? " | !! " + flags.join("; ") : ""}`
      );
      if (flags.length) problems.push(`${e.year} ${l.title}: ${flags.join("; ")}`);
    }
  }
  const speakers = await db.speaker.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { lectures: true } } } });
  console.log(`\n== Palestrantes (${speakers.length})`);
  for (const s of speakers) {
    const flags: string[] = [];
    if (!s.photoUrl) flags.push("SEM FOTO");
    else if (!localExists(s.photoUrl)) flags.push(`foto ausente ${s.photoUrl}`);
    if (!s.bio) flags.push("SEM BIO");
    if (s._count.lectures === 0) flags.push("sem aula");
    console.log(`  ${s.name.padEnd(34)} | ${s._count.lectures} aula(s) | bio ${s.bio?.length ?? 0} chars${flags.length ? " | !! " + flags.join("; ") : ""}`);
    if (flags.length) problems.push(`Palestrante ${s.name}: ${flags.join("; ")}`);
  }
  const sponsors = await db.sponsor.findMany();
  for (const sp of sponsors) if (!localExists(sp.logoUrl)) problems.push(`Logo ausente: ${sp.name} ${sp.logoUrl}`);
  const [faq, questions, settings] = await Promise.all([db.faqItem.count(), db.quizQuestion.count(), db.setting.findMany()]);
  console.log(`\n== FAQ ${faq} · Quiz ${questions} questões · Logos ${sponsors.length} · Settings ${settings.map((s) => s.key).join(", ")}`);
  console.log(`\n== Problemas (${problems.length})`);
  for (const p of problems) console.log("  - " + p);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
