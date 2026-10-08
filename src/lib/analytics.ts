import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function isBot(ua: string) {
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|vercel-screenshot|whatsapp|telegram|curl|wget|python-requests/i.test(
    ua
  );
}

export function parseUserAgent(ua: string) {
  const device = /ipad|tablet|kindle|silk/i.test(ua)
    ? "tablet"
    : /mobi|android|iphone|ipod|windows phone/i.test(ua)
      ? "mobile"
      : "desktop";
  let browser = "Outro";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  let os = "Outro";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  return { device, browser, os };
}

export type DailyRow = { day: string; views: number; visitors: number };
export type CountRow = { label: string; count: number };

const TZ = "America/Sao_Paulo";

export async function getDaily(from: Date, to: Date, excludeAdmin: boolean) {
  const adminFilter = excludeAdmin ? Prisma.sql`AND "path" NOT LIKE '/admin%'` : Prisma.empty;
  const rows = await db.$queryRaw<{ day: Date; views: bigint; visitors: bigint }[]>`
    SELECT date_trunc('day', "createdAt" AT TIME ZONE ${TZ}) AS day,
           COUNT(*) AS views,
           COUNT(DISTINCT "visitorId") AS visitors
    FROM "PageView"
    WHERE "createdAt" >= ${from} AND "createdAt" < ${to} ${adminFilter}
    GROUP BY 1 ORDER BY 1`;
  const map = new Map(
    rows.map((r) => [r.day.toISOString().slice(0, 10), { views: Number(r.views), visitors: Number(r.visitors) }])
  );
  // preenche todos os dias do período
  const out: DailyRow[] = [];
  const cursor = new Date(from.getTime() - 3 * 3600 * 1000);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(to.getTime() - 3 * 3600 * 1000);
  while (cursor < end) {
    const key = cursor.toISOString().slice(0, 10);
    const v = map.get(key);
    out.push({ day: key, views: v?.views ?? 0, visitors: v?.visitors ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export async function getNewUsersDaily(from: Date, to: Date) {
  const rows = await db.$queryRaw<{ day: Date; n: bigint }[]>`
    SELECT date_trunc('day', "createdAt" AT TIME ZONE ${TZ}) AS day, COUNT(*) AS n
    FROM "User"
    WHERE "createdAt" >= ${from} AND "createdAt" < ${to}
    GROUP BY 1 ORDER BY 1`;
  return new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.n)]));
}

export async function getLoginsDaily(from: Date, to: Date) {
  const rows = await db.$queryRaw<{ day: Date; n: bigint }[]>`
    SELECT date_trunc('day', "createdAt" AT TIME ZONE ${TZ}) AS day, COUNT(*) AS n
    FROM "AuthEvent"
    WHERE "type" = 'LOGIN' AND "createdAt" >= ${from} AND "createdAt" < ${to}
    GROUP BY 1 ORDER BY 1`;
  return new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.n)]));
}

async function countBy(
  column: "path" | "referrerHost" | "country" | "device" | "browser" | "os",
  from: Date,
  to: Date,
  excludeAdmin: boolean,
  limit = 12
): Promise<CountRow[]> {
  // coluna vem de uma lista fixa (acima), por isso pode entrar como SQL cru
  const col = Prisma.raw(`"${column}"`);
  const adminFilter = excludeAdmin ? Prisma.sql`AND "path" NOT LIKE '/admin%'` : Prisma.empty;
  const rows = await db.$queryRaw<{ label: string | null; count: bigint }[]>`
    SELECT ${col} AS label, COUNT(*) AS count
    FROM "PageView"
    WHERE "createdAt" >= ${from} AND "createdAt" < ${to} ${adminFilter}
    GROUP BY 1 ORDER BY 2 DESC LIMIT ${limit}`;
  return rows.map((r) => ({
    label: r.label ?? "(direto / desconhecido)",
    count: Number(r.count),
  }));
}

export async function getBreakdowns(from: Date, to: Date, excludeAdmin: boolean) {
  const [pages, referrers, countries, devices, browsers, os] = await Promise.all([
    countBy("path", from, to, excludeAdmin, 15),
    countBy("referrerHost", from, to, excludeAdmin),
    countBy("country", from, to, excludeAdmin),
    countBy("device", from, to, excludeAdmin, 5),
    countBy("browser", from, to, excludeAdmin, 8),
    countBy("os", from, to, excludeAdmin, 8),
  ]);
  return { pages, referrers, countries, devices, browsers, os };
}

export async function getTotals(from: Date, to: Date, excludeAdmin: boolean) {
  const where = {
    createdAt: { gte: from, lt: to },
    ...(excludeAdmin ? { NOT: { path: { startsWith: "/admin" } } } : {}),
  };
  const [views, visitorsRaw, loggedViews] = await Promise.all([
    db.pageView.count({ where }),
    db.pageView.findMany({ where, distinct: ["visitorId"], select: { visitorId: true } }),
    db.pageView.count({ where: { ...where, userId: { not: null } } }),
  ]);
  const loggedUsers = await db.pageView.findMany({
    where: { ...where, userId: { not: null } },
    distinct: ["userId"],
    select: { userId: true },
  });
  return {
    views,
    visitors: visitorsRaw.length,
    loggedViews,
    loggedUsers: loggedUsers.length,
  };
}
