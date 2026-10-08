import "server-only";
import { cache } from "react";
import type { Lecture, LectureStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const getEditions = cache(async () => {
  return db.edition.findMany({
    where: { active: true },
    orderBy: [{ year: "desc" }],
  });
});

export const getCurrentEdition = cache(async () => {
  const current = await db.edition.findFirst({ where: { current: true, active: true } });
  if (current) return current;
  return db.edition.findFirst({ where: { active: true }, orderBy: { year: "desc" } });
});

export const getEditionByYear = cache(async (year: number) => {
  return db.edition.findFirst({ where: { year, active: true } });
});

export type LectureWithSpeakers = Prisma.LectureGetPayload<{
  include: {
    edition: true;
    speakers: { include: { speaker: true }; orderBy: { order: "asc" } };
    _count: { select: { questions: true } };
  };
}>;

export const getLecturesForEdition = cache(async (editionId: string) => {
  return db.lecture.findMany({
    where: { editionId, active: true },
    orderBy: [{ date: "asc" }, { order: "asc" }],
    include: {
      edition: true,
      speakers: { include: { speaker: true }, orderBy: { order: "asc" } },
      _count: { select: { questions: true } },
    },
  });
});

export const getSpeakersForEdition = cache(async (editionId: string) => {
  const lectures = await getLecturesForEdition(editionId);
  const seen = new Set<string>();
  const out: { speaker: LectureWithSpeakers["speakers"][number]["speaker"]; lecture: LectureWithSpeakers }[] = [];
  for (const l of lectures) {
    for (const ls of l.speakers) {
      if (seen.has(ls.speakerId) || !ls.speaker.active) continue;
      seen.add(ls.speakerId);
      out.push({ speaker: ls.speaker, lecture: l });
    }
  }
  return out;
});

export const getLectureBySlug = cache(async (slug: string) => {
  return db.lecture.findUnique({
    where: { slug },
    include: {
      edition: true,
      speakers: { include: { speaker: true }, orderBy: { order: "asc" } },
      questions: { include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
    },
  });
});

export type EffectiveStatus = LectureStatus | "SOON";

/**
 * Estado exibido da live: gravação disponível, ao vivo (manual ou por janela de
 * horário com link do Zoom), agendada (futura) ou "em breve" (passou, sem gravação).
 */
export function effectiveStatus(
  l: Pick<Lecture, "status" | "liveUrl" | "recordingUrl" | "startsAt" | "date">,
  now = new Date()
): EffectiveStatus {
  if (l.status === "RECORDED" && l.recordingUrl) return "RECORDED";
  if (l.status === "LIVE") return "LIVE";
  const start = l.startsAt ?? null;
  if (start && l.liveUrl) {
    const diff = now.getTime() - start.getTime();
    if (diff >= -15 * 60 * 1000 && diff <= 3 * 3600 * 1000) return "LIVE";
  }
  const day = l.date ?? start;
  if (day && day.getTime() + 24 * 3600 * 1000 < now.getTime()) {
    return l.recordingUrl ? "RECORDED" : "SOON";
  }
  return "SCHEDULED";
}

export type Material = { title?: string; url?: string };

export function materialsOf(l: Pick<Lecture, "materials">): Material[] {
  const raw = l.materials;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (m): m is Material => !!m && typeof m === "object" && typeof (m as Material).url === "string"
  );
}
