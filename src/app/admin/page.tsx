import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getTotals } from "@/lib/analytics";
import { dateBr, dateTimeBr } from "@/lib/format";
import { effectiveStatus } from "@/lib/content";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboard() {
  const now = new Date();
  const from7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const [users, pending, admins, lectures, speakers, lastUsers, totals7, logins7, nextLectures, quizAttempts] = await Promise.all([
    db.user.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { status: "PENDING" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.lecture.count({ where: { active: true } }),
    db.speaker.count({ where: { active: true } }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, category: true, status: true, city: true, state: true, createdAt: true },
    }),
    getTotals(from7, now, true),
    db.authEvent.count({ where: { type: "LOGIN", createdAt: { gte: from7 } } }),
    db.lecture.findMany({
      where: { active: true, edition: { current: true } },
      orderBy: [{ date: "asc" }],
      include: { speakers: { include: { speaker: true } } },
    }),
    db.quizAttempt.count({ where: { createdAt: { gte: from7 } } }),
  ]);
  const upcoming = nextLectures.filter((l) => ["SCHEDULED", "LIVE"].includes(effectiveStatus(l, now))).slice(0, 4);

  const cards = [
    { label: "Usuários ativos", value: users, href: "/admin/usuarios", icon: "users" },
    { label: "Solicitações pendentes", value: pending, href: "/admin/solicitacoes", icon: "inbox", highlight: pending > 0 },
    { label: "Admins", value: admins, href: "/admin/usuarios?role=ADMIN", icon: "user-cog" },
    { label: "Lives cadastradas", value: lectures, href: "/admin/lives", icon: "video" },
    { label: "Palestrantes", value: speakers, href: "/admin/palestrantes", icon: "user" },
  ];
  const week = [
    { label: "Visualizações (7 dias)", value: totals7.views },
    { label: "Visitantes (7 dias)", value: totals7.visitors },
    { label: "Logins (7 dias)", value: logins7 },
    { label: "Quizzes respondidos (7 dias)", value: quizAttempts },
  ];

  return (
    <div>
      <h1 className="text-3xl text-ink-900">Visão geral</h1>
      <p className="mt-1 text-sm text-ink-600">Acompanhe o Porão na Roda em um só lugar.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-300 ${
              c.highlight ? "border-lime-400" : "border-ink-100"
            }`}
          >
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 to-lime-400 opacity-0 transition group-hover:opacity-100" />
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
              <Icon name={c.icon} size={19} />
            </span>
            <p className="mt-3 text-3xl font-bold text-ink-900">{c.value}</p>
            <p className="mt-0.5 text-sm text-ink-600">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {week.map((w) => (
          <div key={w.label} className="rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-card">
            <p className="text-2xl font-bold text-brand-700">{w.value}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{w.label}</p>
          </div>
        ))}
        <Link href="/admin/metricas" className="col-span-full text-sm font-semibold text-brand-700 hover:underline">
          Ver métricas completas →
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl text-ink-900">Últimos cadastros</h2>
            <Link href="/admin/usuarios" className="text-sm font-semibold text-brand-700 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-sand-50 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3">Nome</th>
                  <th className="px-5 py-3">Singular</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {lastUsers.map((u) => (
                  <tr key={u.id} className="border-b border-ink-50 last:border-0 hover:bg-brand-50/40">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-900">{u.name}</p>
                      <p className="text-xs text-ink-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-600">{[u.city, u.state].filter(Boolean).join("/") || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge color={u.status === "ACTIVE" ? "green" : u.status === "PENDING" ? "gold" : "red"}>
                        {u.status === "ACTIVE" ? "Ativo" : u.status === "PENDING" ? "Pendente" : u.status === "BLOCKED" ? "Bloqueado" : "Recusado"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-500">{dateBr(u.createdAt)}</td>
                  </tr>
                ))}
                {lastUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-ink-500">
                      Nenhum usuário ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl text-ink-900">Próximas lives</h2>
            <Link href="/admin/lives" className="text-sm font-semibold text-brand-700 hover:underline">
              Gerenciar →
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {upcoming.map((l) => (
              <Link key={l.id} href={`/admin/lives/${l.id}`} className="block rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition hover:border-brand-300">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-brand-700">
                    {l.dateLabel} {l.timeLabel ? `· ${l.timeLabel}` : ""}
                  </span>
                  <StatusBadge status={effectiveStatus(l, now)} />
                </div>
                <p className="mt-1 font-semibold text-ink-900">{l.title}</p>
                <p className="text-xs text-ink-500">
                  {l.speakers.map((s) => s.speaker.name).join(", ") || "Sem palestrante"} ·{" "}
                  {l.liveUrl ? "link do Zoom ok" : "sem link do Zoom"}
                  {l.startsAt ? ` · início ${dateTimeBr(l.startsAt)}` : ""}
                </p>
              </Link>
            ))}
            {upcoming.length === 0 && <p className="rounded-2xl bg-white p-5 text-sm text-ink-500 shadow-card">Nenhuma live agendada na edição atual.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
