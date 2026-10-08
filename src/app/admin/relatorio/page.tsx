import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { clsx } from "clsx";
import { buildReport, lecturePresets, resolvePeriod } from "@/lib/report";
import type { CountRow } from "@/lib/analytics";
import { dateTimeBr } from "@/lib/format";
import { BarChart } from "@/components/bar-chart";
import { Badge, Button, Input } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Relatório de acessos | Admin" };

const COUNTRY: Record<string, string> = { BR: "Brasil", UY: "Uruguai", AR: "Argentina", PT: "Portugal", US: "Estados Unidos", PY: "Paraguai" };
const DEVICE: Record<string, string> = { desktop: "Computador", mobile: "Celular", tablet: "Tablet" };
const STATUS: Record<string, string> = { ACTIVE: "Ativo", PENDING: "Pendente", BLOCKED: "Bloqueado", REJECTED: "Recusado" };
const PAGE_NAME: Record<string, string> = {
  "/": "Home",
  "/login": "Login",
  "/cadastro": "Cadastro",
  "/programacao": "Programação",
  "/palestrantes": "Palestrantes",
  "/passo-a-passo": "Passo a passo",
  "/faq": "FAQ",
  "/quiz": "Quiz",
  "/credencial": "Credencial",
  "/conta": "Minha conta",
  "/esqueci-senha": "Esqueci minha senha",
};

function fmtDay(d: string) {
  return d.split("-").reverse().join("/");
}

function pageName(path: string) {
  if (PAGE_NAME[path]) return `${PAGE_NAME[path]} (${path})`;
  if (path.startsWith("/sala/")) return `Sala: ${path.slice(6)}`;
  return path;
}

function Table({ title, rows, total, labelMap }: { title: string; rows: CountRow[]; total: number; labelMap?: (l: string) => string }) {
  return (
    <div className="break-inside-avoid rounded-2xl border border-ink-100 bg-white p-5 shadow-card print:shadow-none">
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
                  <td className="w-20 py-1.5 print:hidden">
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

export default async function AdminRelatorioPage({ searchParams }: PageProps<"/admin/relatorio">) {
  const sp = await searchParams;
  const period = await resolvePeriod(typeof sp.de === "string" ? sp.de : undefined, typeof sp.ate === "string" ? sp.ate : undefined);
  const [presets, report] = await Promise.all([lecturePresets(), buildReport(period)]);
  const { kpis, daily, breakdowns, newUsers, totals } = report;
  const qs = `de=${period.de}&ate=${period.ate}`;
  const periodLabel = `${fmtDay(period.de)} a ${fmtDay(period.ate)}`;

  const kpiCards = [
    { label: "Visualizações de página", value: kpis.views },
    { label: "Visitantes únicos", value: kpis.visitors },
    { label: "Novos usuários", value: kpis.newUsers },
    { label: "Logins", value: kpis.logins },
    { label: "Usuários distintos que logaram", value: kpis.uniqueLoginUsers },
    { label: "Usuários logados navegando", value: kpis.loggedUsers },
    { label: "Quizzes respondidos", value: kpis.quizAttempts },
    { label: "Solicitações pendentes hoje", value: kpis.pendingCount },
  ];

  return (
    <div className="print:text-[13px]">
      {/* Cabeçalho (vira capa do PDF) */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="hidden print:block">
            <Image src="/logo-preto.png" alt="Porão na Roda" width={794} height={283} className="mb-3 h-10 w-auto" />
          </div>
          <h1 className="text-3xl text-ink-900 print:text-2xl">Relatório de acessos</h1>
          <p className="mt-1 text-sm text-ink-600">
            unimedclass · período de <strong>{periodLabel}</strong> · emitido em {dateTimeBr(new Date())} · páginas do admin não contam
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <a
            href={`/admin/relatorio/export?${qs}`}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 transition hover:border-brand-300"
          >
            <Icon name="download" size={16} /> Baixar CSV
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Seleção de período */}
      <div className="mt-5 rounded-2xl border border-ink-100 bg-white p-4 shadow-card print:hidden">
        <form className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="de" className="mb-1 block text-xs font-semibold text-ink-600">
              De
            </label>
            <Input id="de" type="date" name="de" defaultValue={period.de} className="w-44" />
          </div>
          <div>
            <label htmlFor="ate" className="mb-1 block text-xs font-semibold text-ink-600">
              Até
            </label>
            <Input id="ate" type="date" name="ate" defaultValue={period.ate} className="w-44" />
          </div>
          <Button type="submit" variant="secondary">
            Gerar relatório
          </Button>
        </form>
        {presets.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-50 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">Períodos entre palestras:</span>
            {presets.map((p) => (
              <Link
                key={p.label}
                href={`/admin/relatorio?de=${p.de}&ate=${p.ate}`}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  p.de === period.de && p.ate === period.ate
                    ? "bg-brand-600 text-white"
                    : "border border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700"
                )}
              >
                {p.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Resumo executivo */}
      <section className="mt-6">
        <h2 className="text-lg font-bold text-ink-900">Resumo do período</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpiCards.map((k) => (
            <div key={k.label} className="break-inside-avoid rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-card print:shadow-none">
              <p className="text-2xl font-bold tabular-nums text-brand-700">{k.value}</p>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-500">{k.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gráficos */}
      <section className="mt-6 grid gap-5 lg:grid-cols-2 print:hidden">
        {[
          { title: "Visualizações por dia", data: daily.map((d) => ({ label: fmtDay(d.day).slice(0, 5), value: d.views, sub: fmtDay(d.day) })), unit: "visualizações" },
          { title: "Novos usuários por dia", data: daily.map((d) => ({ label: fmtDay(d.day).slice(0, 5), value: d.newUsers, sub: fmtDay(d.day) })), unit: "cadastros" },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-500">{c.title}</h3>
            <BarChart data={c.data} valueLabel={c.unit} height={140} />
          </div>
        ))}
      </section>

      {/* Detalhamento diário */}
      <section className="mt-6 break-inside-avoid">
        <h2 className="text-lg font-bold text-ink-900">Detalhamento diário</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card print:shadow-none">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-2.5">Dia</th>
                <th className="px-4 py-2.5 text-right">Visualizações</th>
                <th className="px-4 py-2.5 text-right">Visitantes</th>
                <th className="px-4 py-2.5 text-right">Novos usuários</th>
                <th className="px-4 py-2.5 text-right">Logins</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.day} className="border-t border-ink-50">
                  <td className="px-4 py-1.5">{fmtDay(d.day)}</td>
                  <td className="px-4 py-1.5 text-right tabular-nums">{d.views}</td>
                  <td className="px-4 py-1.5 text-right tabular-nums">{d.visitors}</td>
                  <td className="px-4 py-1.5 text-right tabular-nums">{d.newUsers}</td>
                  <td className="px-4 py-1.5 text-right tabular-nums">{d.logins}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-ink-200 bg-sand-50 font-bold">
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-right tabular-nums">{kpis.views}</td>
                <td className="px-4 py-2 text-right tabular-nums">{kpis.visitors}</td>
                <td className="px-4 py-2 text-right tabular-nums">{kpis.newUsers}</td>
                <td className="px-4 py-2 text-right tabular-nums">{kpis.logins}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Quebras */}
      <section className="mt-6 grid gap-5 md:grid-cols-2">
        <Table title="Acessos por página" rows={breakdowns.pages} total={totals.views} labelMap={pageName} />
        <div className="space-y-5">
          <Table title="Origens do tráfego" rows={breakdowns.referrers} total={totals.views} />
          <Table title="Países" rows={breakdowns.countries} total={totals.views} labelMap={(l) => COUNTRY[l] ?? l} />
        </div>
        <Table title="Dispositivos" rows={breakdowns.devices} total={totals.views} labelMap={(l) => DEVICE[l] ?? l} />
        <Table title="Navegadores" rows={breakdowns.browsers} total={totals.views} />
      </section>

      {/* Novos usuários */}
      <section className="mt-6">
        <h2 className="text-lg font-bold text-ink-900">
          Quem se cadastrou no período <span className="text-sm font-normal text-ink-500">({newUsers.length})</span>
        </h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card print:shadow-none">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-2.5">Nome</th>
                <th className="px-4 py-2.5">E-mail</th>
                <th className="px-4 py-2.5">Cidade</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {newUsers.map((u) => (
                <tr key={u.email} className="border-t border-ink-50">
                  <td className="px-4 py-1.5 font-medium text-ink-900">{u.name}</td>
                  <td className="px-4 py-1.5 text-ink-600">{u.email}</td>
                  <td className="px-4 py-1.5 text-ink-600">{[u.city, u.state].filter(Boolean).join("/") || "—"}</td>
                  <td className="px-4 py-1.5">
                    <Badge color={u.status === "ACTIVE" ? "green" : u.status === "PENDING" ? "gold" : "red"}>{STATUS[u.status] ?? u.status}</Badge>
                  </td>
                  <td className="px-4 py-1.5 text-right text-xs text-ink-500">{dateTimeBr(u.createdAt)}</td>
                </tr>
              ))}
              {newUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-5 text-center text-ink-500">
                    Nenhum cadastro no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs text-ink-400 print:mt-10">
        Relatório gerado pela plataforma Porão na Roda · visitantes contados por identificador anônimo de navegador · bots e páginas do admin excluídos.
      </p>
    </div>
  );
}
