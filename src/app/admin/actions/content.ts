"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

function revalidateAll() {
  revalidatePath("/", "layout");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string, d = 0) => parseInt(str(fd, k), 10) || d;

/* ============================= EDIÇÕES ============================= */

export async function adminSaveEdition(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const year = int(formData, "year");
  const name = str(formData, "name") || `Porão na Roda ${year}`;
  const description = str(formData, "description") || null;
  const current = formData.get("current") === "on";
  const active = formData.get("active") === "on";
  const order = int(formData, "order");
  if (!year || year < 2000) return;

  if (current) await db.edition.updateMany({ data: { current: false } });
  if (id) {
    await db.edition.update({ where: { id }, data: { year, name, description, current, active, order } });
  } else {
    if (await db.edition.findUnique({ where: { year } })) return;
    await db.edition.create({ data: { year, name, slug: String(year), description, current, active, order } });
  }
  revalidateAll();
}

export async function adminDeleteEdition(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const count = await db.lecture.count({ where: { editionId: id } });
  if (count > 0) return; // protege edições com aulas
  await db.edition.delete({ where: { id } }).catch(() => {});
  revalidateAll();
}

/* ============================= PALESTRANTES ============================= */

export async function adminSaveSpeaker(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (name.length < 2) return;
  const data = {
    name,
    title: str(formData, "title") || null,
    bio: str(formData, "bio") || null,
    photoUrl: str(formData, "photoUrl") || null,
    order: int(formData, "order"),
    active: formData.get("active") === "on",
  };
  let speaker;
  if (id) {
    speaker = await db.speaker.update({ where: { id }, data });
  } else {
    let slug = slugify(name);
    if (await db.speaker.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    speaker = await db.speaker.create({ data: { ...data, slug } });
  }
  revalidateAll();
  const back = str(formData, "back");
  redirect(back.startsWith("/admin") ? back : `/admin/palestrantes/${speaker.id}`);
}

export async function adminDeleteSpeaker(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await db.speaker.delete({ where: { id } }).catch(() => {});
  revalidateAll();
  redirect("/admin/palestrantes");
}

/* ============================= LIVES / SALAS ============================= */

function parseMaterials(raw: string) {
  const items = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [a, b] = line.split("|").map((c) => c.trim());
      if (b) return { title: a, url: b };
      return { title: "Material da aula", url: a };
    })
    .filter((m) => /^(https?:\/\/|\/)/.test(m.url));
  return items.length ? items : [];
}

export async function adminSaveLecture(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const title = str(formData, "title");
  const editionId = str(formData, "editionId");
  if (title.length < 3 || !editionId) return;

  const dateRaw = str(formData, "date");
  const date = dateRaw ? new Date(`${dateRaw}T00:00:00.000Z`) : null;
  const startsRaw = str(formData, "startsAt");
  // horário digitado no admin é sempre Brasília (GMT-3)
  const startsAt = startsRaw ? new Date(`${startsRaw}:00-03:00`) : null;
  const statusRaw = str(formData, "status");
  const status = statusRaw === "LIVE" || statusRaw === "RECORDED" ? statusRaw : "SCHEDULED";
  const speakerIds = formData.getAll("speakerIds").map(String).filter(Boolean);

  const data = {
    title,
    editionId,
    subtitle: str(formData, "subtitle") || null,
    description: str(formData, "description") || null,
    date,
    dateLabel: date ? `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}` : str(formData, "dateLabel") || null,
    timeLabel: str(formData, "timeLabel") || null,
    startsAt,
    status,
    liveUrl: str(formData, "liveUrl") || null,
    recordingUrl: str(formData, "recordingUrl") || null,
    materials: parseMaterials(str(formData, "materials")),
    order: int(formData, "order"),
    active: formData.get("active") === "on",
  } as const;

  let lecture;
  if (id) {
    lecture = await db.lecture.update({ where: { id }, data });
    await db.lectureSpeaker.deleteMany({ where: { lectureId: id } });
  } else {
    let slug = slugify(str(formData, "slug") || title);
    if (await db.lecture.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    lecture = await db.lecture.create({ data: { ...data, slug } });
  }
  if (speakerIds.length) {
    await db.lectureSpeaker.createMany({
      data: speakerIds.map((speakerId, i) => ({ lectureId: lecture.id, speakerId, order: i })),
      skipDuplicates: true,
    });
  }
  revalidateAll();
  redirect(`/admin/lives/${lecture.id}?ok=1`);
}

export async function adminDeleteLecture(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await db.lecture.delete({ where: { id } }).catch(() => {});
  revalidateAll();
  redirect("/admin/lives");
}

/** Atalho da lista: muda o status da live (agendada / ao vivo / gravação). */
export async function adminSetLectureStatus(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const statusRaw = str(formData, "status");
  const status = statusRaw === "LIVE" || statusRaw === "RECORDED" ? statusRaw : "SCHEDULED";
  await db.lecture.update({ where: { id }, data: { status } }).catch(() => {});
  revalidateAll();
}

/* ============================= QUIZ ============================= */

function parseOptions(raw: string, correctIndex: number) {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((text, i) => ({ text, order: i, correct: i === correctIndex }));
}

export async function adminSaveQuestion(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const lectureId = str(formData, "lectureId");
  const text = str(formData, "text");
  const description = str(formData, "description") || null;
  const correctIndex = parseInt(str(formData, "correct"), 10);
  const options = parseOptions(str(formData, "options"), Number.isNaN(correctIndex) ? -1 : correctIndex);
  if (!lectureId || text.length < 3 || options.length < 2) return;
  const order = int(formData, "order");

  if (id) {
    await db.quizQuestion.update({ where: { id }, data: { text, description, order } });
    await db.quizOption.deleteMany({ where: { questionId: id } });
    await db.quizOption.createMany({ data: options.map((o) => ({ ...o, questionId: id })) });
  } else {
    await db.quizQuestion.create({
      data: { lectureId, text, description, order, options: { create: options } },
    });
  }
  revalidateAll();
  redirect(`/admin/lives/${lectureId}#quiz`);
}

export async function adminDeleteQuestion(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const q = await db.quizQuestion.findUnique({ where: { id } });
  if (!q) return;
  await db.quizQuestion.delete({ where: { id } });
  revalidateAll();
  redirect(`/admin/lives/${q.lectureId}#quiz`);
}
