import Link from "next/link";
import type { Metadata } from "next";
import { clsx } from "clsx";
import { db } from "@/lib/db";
import { getBreakdowns, getDaily, getLoginsDaily, getNewUsersDaily, getTotals, type CountRow } from "@/lib/analytics";
import { dateBr, dateTimeBr } from "@/lib/format";
import { BarChart } from "@/components/bar-chart";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Métricas | Admin" };

const PERIODS = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
  { days: 365, label: "12 meses" },
];

function BreakdownTable({ title, rows, total, labelMap }: { title: string; rows: CountRow[]; total: number; labelMap?: (l: string) => string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <h3 className="text-sm font-bold uppercase tracking-wider text-ink-500">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-400">Sem dados no período.</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <tbody>
            {rows.map((r) => {
              const pct = total ? Math.round((r.count / total) * 100) : 0;
              return (
                <tr key={r.label} className="border-t border-ink-50">
                  <td className="max-w-0 truncate py-1.5 pr-2 text-ink-800" title={r.label}>
                    {labelMap ? labelMap(r.label) : r.label}
                  </td>
                  <td className="w-24 py-1.5">
                    <div className="h-1.5 w-full rounded-full bg-ink-100">
                      <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="w-14 py-1.5 text-right font-semibold tabular-nums text-ink-900">{r.count}</td>
                  <td className="w-10 py-1.5 text-right text-xs tabular-nums text-ink-400">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const COUNTRY: Record<string, string> = { BR: "Brasil", UY: "Uruguai", AR: "Argentina", PT: "Portugal", US: "Estados Unidos" };
const DEVICE: Record<string, string> = { desktop: "Computador", mobile: "Celular", tablet: "Tablet" };

export default async function AdminMetricasPage({ searchParams }: PageProps<"/admin/metricas">) {
  const sp = await searchParams;
  const days = PERIODS.some((p) => p.days === Number(sp.dias)) ? Number(sp.dias) : 30;
  const includeAdmin = sp.admin === "1";
  const now = new Date();
  const to = new Date(now.getTime() + 60 * 1000);
  const from = new Date(now.getTime() - days * 24 * 3600 * 1000);
  from.setUTCHours(3, 0, 0, 0); // meia-noite em Brasília

  const [daily, newUsers, logins, breakdowns, totals, pendingCount, registrations, recentLogins, quizAttempts, activeUsers] = await Promise.all([
    getDaily(from, to, !includeAdmin),
    getNewUsersDaily(from, to),
    getLoginsDaily(from, to),
    getBreakdowns(from, to, !includeAdmin),
    getTotals(from, to, !includeAdmin),
    db.user.count({ where: { status: "PENDING" } }),
    db.user.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, name: true, email: true, city: true, state: true, status: true, source: true, createdAt: true },
    }),
    db.authEvent.findMany({
      where: { type: "LOGIN", createdAt: { gte: from } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.quizAttempt.count({ where: { createdAt: { gte: from } } }),
    db.user.count({ where: { lastLoginAt: { gte: from } } }),
  ]);

  const fmt = (key: string) => `${key.slice(8, 10)}/${key.slice(5, 7)}`;
  const viewsData = daily.map((d) => ({ label: fmt(d.day), value: d.views, sub: d.day.split("-").reverse().join("/") }));
  const visitorsData = daily.map((d) => ({ label: fmt(d.day), value: d.visitors, sub: d.day.split("-").reverse().join("/") }));
  const newUsersData = daily.map((d) => ({ label: fmt(d.day), value: newUsers.get(d.day) ?? 0, sub: d.day.split("-").reverse().join("/") }));
  const loginsData = daily.map((d) => ({ label: fmt(d.day), value: logins.get(d.day) ?? 0, sub: d.day.split("-").reverse().join("/") }));
  const newUsersTotal = [...newUsers.values()].reduce((a, b) => a + b, 0);
  const loginsTotal = [...logins.values()].reduce((a, b) => a + b, 0);

  const kpis = [
    { label: "Visualizações de página", value: totals.views },
    { label: "Visitantes únicos", value: totals.visitors },
    { label: "Usuários logados que acessaram", value: totals.loggedUsers },
    { label: "Novos cadastros", value: newUsersTotal },
    { label: "Logins", value: loginsTotal },
    { label: "Usuários ativos (fizeram login)", value: activeUsers },
    { label: "Quizzes respondidos", value: quizAttempts },
    { label: "Solicitações pendentes", value: pendingCount },
  ];

  const qs = (d: number, a: boolean) => `?dias=${d}${a ? "&admin=1" : ""}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl text-ink-900">Métricas</h1>
          <p className="mt-1 text-sm text-ink-600">
            Acessos por página, visitantes, novos usuários e logins. Período: {dateBr(from)} a {dateBr(now)}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p.days}
              href={qs(p.days, includeAdmin)}
              className={clsx(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
                p.days === days ? "bg-brand-600 text-white" : "border border-ink-200 bg-white text-ink-700 hover:border-brand-300"
              )}
            >
              {p.label}
            </Link>
          ))}
          <Link
            href={qs(days, !includeAdmin)}
            className={clsx(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              includeAdmin ? "bg-lime-300 text-ink-900" : "border border-ink-200 bg-white text-ink-500 hover:border-brand-300"
            )}
            title="Incluir ou não as páginas do painel admin nas contagens"
          >
            {includeAdmin ? "Incluindo /admin" : "Sem /admin"}
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-card">
            <p className="text-3xl font-bold tabular-nums text-ink-900">{k.value}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-ink-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {[
          { title: "Visualizações por dia", data: viewsData, unit: "visualizações" },
          { title: "Visitantes por dia", data: visitorsData, unit: "visitantes" },
          { title: "Novos cadastros por dia", data: newUsersData, unit: "cadastros" },
          { title: "Logins por dia", data: loginsData, unit: "logins" },
        ].map((c) => (
          <section key={c.title} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-ink-900">{c.title}</h2>
            <p className="mb-4 text-xs text-ink-500">Total no período: {c.data.reduce((a, b) => a + b.value, 0)}</p>
            <BarChart data={c.data} valueLabel={c.unit} />
          </section>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <BreakdownTable title="Páginas mais vistas" rows={breakdowns.pages} total={totals.views} />
        <BreakdownTable title="Origens do tráfego" rows={breakdowns.referrers} total={totals.views} />
        <BreakdownTable title="Países" rows={breakdowns.countries} total={totals.views} labelMap={(l) => COUNTRY[l] ?? l} />
        <BreakdownTable title="Dispositivos" rows={breakdowns.devices} total={totals.views} labelMap={(l) => DEVICE[l] ?? l} />
        <BreakdownTable title="Navegadores" rows={breakdowns.browsers} total={totals.views} />
        <BreakdownTable title="Sistemas" rows={breakdowns.os} total={totals.views} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink-100 bg-white shadow-card">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-base font-bold text-ink-900">Quem se cadastrou no período</h2>
            <Link href="/admin/usuarios" className="text-xs font-semibold text-brand-700 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="max-h-[420px] overflow-auto border-t border-ink-100">
            <table className="w-full text-left text-sm">
              <tbody>
                {registrations.map((u) => (
                  <tr key={u.id} className="border-b border-ink-50 last:border-0">
                    <td className="px-5 py-2.5">
                      <p className="font-medium text-ink-900">{u.name}</p>
                      <p className="text-xs text-ink-500">
                        {u.email}
                        {u.city ? ` · ${[u.city, u.state].filter(Boolean).join("/")}` : ""}
                      </p>
                    </td>
                    <td className="px-2 py-2.5">
                      <Badge color={u.status === "ACTIVE" ? "green" : u.status === "PENDING" ? "gold" : "red"}>
                        {u.status === "ACTIVE" ? "Ativo" : u.status === "PENDING" ? "Pendente" : u.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-2.5 text-right text-xs text-ink-500">
                      {dateTimeBr(u.createdAt)}
                      <span className="block text-ink-400">{u.source ?? ""}</span>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-center text-ink-500">Nenhum cadastro no período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-100 bg-white shadow-card">
          <div className="px-5 py-4">
            <h2 className="text-base font-bold text-ink-900">Últimos logins</h2>
          </div>
          <div className="max-h-[420px] overflow-auto border-t border-ink-100">
            <table className="w-full text-left text-sm">
              <tbody>
                {recentLogins.map((e) => (
                  <tr key={e.id} className="border-b border-ink-50 last:border-0">
                    <td className="px-5 py-2.5">
                      <p className="font-medium text-ink-900">{e.user?.name ?? e.email}</p>
                      <p className="text-xs text-ink-500">{e.user?.email ?? ""}</p>
                    </td>
                    <td className="px-5 py-2.5 text-right text-xs text-ink-500">{dateTimeBr(e.createdAt)}</td>
                  </tr>
                ))}
                {recentLogins.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-center text-ink-500">Nenhum login no período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <details className="mt-8 rounded-2xl border border-ink-100 bg-white shadow-card">
        <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-ink-900">Tabela diária (visualizações, visitantes, cadastros, logins)</summary>
        <div className="max-h-96 overflow-auto border-t border-ink-100">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-sand-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-2">Dia</th>
                <th className="px-5 py-2 text-right">Views</th>
                <th className="px-5 py-2 text-right">Visitantes</th>
                <th className="px-5 py-2 text-right">Cadastros</th>
                <th className="px-5 py-2 text-right">Logins</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.day} className="border-t border-ink-50">
                  <td className="px-5 py-1.5">{d.day.split("-").reverse().join("/")}</td>
                  <td className="px-5 py-1.5 text-right tabular-nums">{d.views}</td>
                  <td className="px-5 py-1.5 text-right tabular-nums">{d.visitors}</td>
                  <td className="px-5 py-1.5 text-right tabular-nums">{newUsers.get(d.day) ?? 0}</td>
                  <td className="px-5 py-1.5 text-right tabular-nums">{logins.get(d.day) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
