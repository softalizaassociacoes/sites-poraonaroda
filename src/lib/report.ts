import "server-only";
import { db } from "@/lib/db";
import { getBreakdowns, getDaily, getLoginsDaily, getNewUsersDaily, getTotals } from "@/lib/analytics";

export type ReportPeriod = { de: string; ate: string; from: Date; to: Date };

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Converte dias (Brasília) em instantes; padrão: da última live realizada até hoje. */
export async function resolvePeriod(deRaw?: string, ateRaw?: string): Promise<ReportPeriod> {
  const todayBr = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
  let de = DAY_RE.test(deRaw ?? "") ? deRaw! : "";
  const ate = DAY_RE.test(ateRaw ?? "") ? ateRaw! : todayBr;
  if (!de) {
    const edition = await db.edition.findFirst({ where: { current: true }, select: { id: true } });
    const past = edition
      ? await db.lecture.findMany({
          where: { editionId: edition.id, active: true, date: { not: null, lte: new Date() } },
          orderBy: { date: "desc" },
          take: 2,
          select: { date: true },
        })
      : [];
    de = past[0]?.date ? past[0].date.toISOString().slice(0, 10) : new Date(Date.now() - 33 * 86400000).toISOString().slice(0, 10);
  }
  if (de > ate) de = ate;
  return { de, ate, from: new Date(`${de}T00:00:00-03:00`), to: new Date(`${ate}T23:59:59.999-03:00`) };
}

/** Presets "entre palestras" da edição atual (da mais recente para trás). */
export async function lecturePresets() {
  const edition = await db.edition.findFirst({ where: { current: true }, select: { id: true, year: true } });
  if (!edition) return [];
  const lectures = await db.lecture.findMany({
    where: { editionId: edition.id, active: true, date: { not: null } },
    orderBy: { date: "asc" },
    select: { date: true, dateLabel: true, title: true },
  });
  const now = new Date();
  const presets: { label: string; de: string; ate: string }[] = [];
  for (let i = 0; i < lectures.length; i++) {
    const start = lectures[i].date!;
    if (start > now) break;
    const next = lectures[i + 1]?.date ?? null;
    const end = next && next <= now ? next : now;
    presets.push({
      label: next && next <= now ? `Entre as lives de ${lectures[i].dateLabel} e ${lectures[i + 1].dateLabel}` : `Da live de ${lectures[i].dateLabel} até hoje`,
      de: start.toISOString().slice(0, 10),
      ate: end.toISOString().slice(0, 10),
    });
  }
  return presets.reverse().slice(0, 6);
}

export async function buildReport(period: ReportPeriod) {
  const { from, to } = period;
  const [totals, daily, newUsersDaily, loginsDaily, breakdowns, newUsers, quizAttempts, pendingCount, loginUsers] = await Promise.all([
    getTotals(from, to, true),
    getDaily(from, to, true),
    getNewUsersDaily(from, to),
    getLoginsDaily(from, to),
    getBreakdowns(from, to, true),
    db.user.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "asc" },
      select: { name: true, email: true, phone: true, city: true, state: true, institution: true, profession: true, status: true, source: true, createdAt: true },
    }),
    db.quizAttempt.count({ where: { createdAt: { gte: from, lte: to } } }),
    db.user.count({ where: { status: "PENDING" } }),
    db.authEvent.findMany({
      where: { type: "LOGIN", createdAt: { gte: from, lte: to } },
      distinct: ["userId"],
      select: { userId: true },
    }),
  ]);
  const newUsersTotal = [...newUsersDaily.values()].reduce((a, b) => a + b, 0);
  const loginsTotal = [...loginsDaily.values()].reduce((a, b) => a + b, 0);
  return {
    totals,
    daily: daily.map((d) => ({ ...d, newUsers: newUsersDaily.get(d.day) ?? 0, logins: loginsDaily.get(d.day) ?? 0 })),
    breakdowns,
    newUsers,
    kpis: {
      views: totals.views,
      visitors: totals.visitors,
      loggedUsers: totals.loggedUsers,
      newUsers: newUsersTotal,
      logins: loginsTotal,
      uniqueLoginUsers: loginUsers.length,
      quizAttempts,
      pendingCount,
    },
  };
}

export type ReportData = Awaited<ReturnType<typeof buildReport>>;
