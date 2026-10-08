/**
 * Seed: categorias, admin inicial e TODO o conteúdo migrado do WordPress
 * (edições 2025/2026, palestrantes, aulas com as salas do Zoom, FAQ, logos de
 * parceiros e textos). Pode ser executado mais de uma vez.
 */
import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

type Content = {
  editions: { year: number; name: string; current: boolean }[];
  speakers: { name: string; slug: string; bio: string | null; photoUrl: string | null; years: number[] }[];
  lectures: {
    year: number;
    title: string;
    slug: string;
    dateLabel: string;
    date: string;
    time: string | null;
    endLabel?: string | null;
    description?: string | null;
    speakers: string[];
    recordingUrl: string | null;
    liveUrl: string | null;
    materials: { title: string; url: string }[];
    order: number;
  }[];
  quizzes: { title: string; lectureSlug: string | null; questions: { text: string; description: string | null; options: string[] }[] }[];
  faq: { group: string | null; question: string; answer: string }[];
  sponsors: { name: string; group: string; logoUrl: string; url?: string }[];
  settings: Record<string, string>;
};

async function main() {
  const content: Content = JSON.parse(readFileSync(path.join(__dirname, "content.json"), "utf-8"));

  /* ---------- Categorias ---------- */
  const categories = ["Participante", "Palestrante", "Organização", "Imprensa"];
  for (let i = 0; i < categories.length; i++) {
    await db.category.upsert({ where: { name: categories[i] }, update: { order: i }, create: { name: categories[i], order: i } });
  }

  /* ---------- Admin inicial ---------- */
  const adminEmail = "marcos@softaliza.com.br";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "poraonaroda@2026";
  await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", status: "ACTIVE" },
    create: {
      name: "Marcos Softaliza",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
      status: "ACTIVE",
      category: "Organização",
      institution: "Softaliza",
      source: "seed",
      approvedAt: new Date(),
    },
  });

  /* ---------- Edições ---------- */
  const editionByYear = new Map<number, string>();
  for (let i = 0; i < content.editions.length; i++) {
    const e = content.editions[i];
    const row = await db.edition.upsert({
      where: { year: e.year },
      update: { name: e.name },
      create: { year: e.year, name: e.name, slug: String(e.year), current: e.current, order: i },
    });
    editionByYear.set(e.year, row.id);
  }

  /* ---------- Palestrantes ---------- */
  const speakerBySlug = new Map<string, string>();
  for (const s of content.speakers) {
    const row = await db.speaker.upsert({
      where: { slug: s.slug },
      update: { bio: s.bio ?? undefined, photoUrl: s.photoUrl ?? undefined },
      create: { name: s.name, slug: s.slug, bio: s.bio, photoUrl: s.photoUrl },
    });
    speakerBySlug.set(s.slug, row.id);
  }

  /* ---------- Lives ---------- */
  const lectureBySlug = new Map<string, string>();
  for (const l of content.lectures) {
    const editionId = editionByYear.get(l.year);
    if (!editionId) continue;
    const date = new Date(`${l.date}T00:00:00.000Z`);
    const start = l.time ? l.time.replace(":00", "h").replace(":", "h") : null;
    const timeLabel = start ? `${start}${l.endLabel ? ` às ${l.endLabel}` : ""} (Brasília)` : null;
    const startsAt = l.time ? new Date(`${l.date}T${l.time}:00-03:00`) : null;
    const status = l.recordingUrl ? "RECORDED" : "SCHEDULED";
    const data = {
      title: l.title,
      editionId,
      date,
      dateLabel: l.dateLabel,
      timeLabel,
      startsAt,
      status,
      description: l.description ?? null,
      liveUrl: l.liveUrl,
      recordingUrl: l.recordingUrl,
      materials: l.materials,
      order: l.order,
    } as const;
    const row = await db.lecture.upsert({
      where: { slug: l.slug },
      update: {
        // mantém edições manuais: só preenche o que ainda está vazio
        ...(l.recordingUrl ? { recordingUrl: l.recordingUrl, status: "RECORDED" as const } : {}),
      },
      create: { ...data, slug: l.slug },
    });
    lectureBySlug.set(l.slug, row.id);
    for (let i = 0; i < l.speakers.length; i++) {
      const speakerId = speakerBySlug.get(l.speakers[i]);
      if (!speakerId) continue;
      await db.lectureSpeaker.upsert({
        where: { lectureId_speakerId: { lectureId: row.id, speakerId } },
        update: { order: i },
        create: { lectureId: row.id, speakerId, order: i },
      });
    }
  }

  /* ---------- Quiz (opcional, por aula) ---------- */
  for (const q of content.quizzes) {
    if (!q.lectureSlug) continue;
    const lectureId = lectureBySlug.get(q.lectureSlug);
    if (!lectureId) continue;
    const existing = await db.quizQuestion.count({ where: { lectureId } });
    if (existing > 0) continue;
    for (let i = 0; i < q.questions.length; i++) {
      const qq = q.questions[i];
      await db.quizQuestion.create({
        data: {
          lectureId,
          text: qq.text,
          description: qq.description,
          order: i,
          options: { create: qq.options.map((text, j) => ({ text, order: j, correct: false })) },
        },
      });
    }
  }

  /* ---------- FAQ ---------- */
  if ((await db.faqItem.count()) === 0) {
    await db.faqItem.createMany({
      data: content.faq.map((f, i) => ({ group: f.group, question: f.question, answer: f.answer, order: i })),
    });
  }

  /* ---------- Parceiros ---------- */
  if ((await db.sponsor.count()) === 0) {
    await db.sponsor.createMany({
      data: content.sponsors.map((s, i) => ({ name: s.name, group: s.group, logoUrl: s.logoUrl, url: s.url ?? null, order: i })),
    });
  }

  /* ---------- Textos / configurações ---------- */
  for (const [key, value] of Object.entries(content.settings)) {
    const exists = await db.setting.findUnique({ where: { key } });
    if (!exists) await db.setting.create({ data: { key, value } });
  }

  console.log("Seed concluído.");
  console.log(`Admin: ${adminEmail} / senha: ${adminPassword}`);
  console.log(`Edições: ${editionByYear.size} · Palestrantes: ${speakerBySlug.size} · Aulas: ${lectureBySlug.size}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
