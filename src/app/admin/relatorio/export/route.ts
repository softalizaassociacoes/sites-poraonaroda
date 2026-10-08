import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildReport, resolvePeriod } from "@/lib/report";
import { toCsv } from "@/lib/csv";
import { dateTimeBr } from "@/lib/format";

const fmtDay = (d: string) => d.split("-").reverse().join("/");

/** Exporta o relatório de acessos do período em CSV (somente admin). */
export async function GET(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return new NextResponse("Não autorizado", { status: 403 });

  const sp = req.nextUrl.searchParams;
  const period = await resolvePeriod(sp.get("de") ?? undefined, sp.get("ate") ?? undefined);
  const { kpis, daily, breakdowns, newUsers, totals } = await buildReport(period);

  const rows: (string | number | null | undefined)[][] = [
    ["Relatório de acessos — Porão na Roda"],
    [`Período: ${fmtDay(period.de)} a ${fmtDay(period.ate)}`],
    [`Emitido em: ${dateTimeBr(new Date())} (páginas do admin e bots excluídos)`],
    [],
    ["RESUMO DO PERÍODO"],
    ["Indicador", "Valor"],
    ["Visualizações de página", kpis.views],
    ["Visitantes únicos", kpis.visitors],
    ["Novos usuários", kpis.newUsers],
    ["Logins", kpis.logins],
    ["Usuários distintos que logaram", kpis.uniqueLoginUsers],
    ["Usuários logados navegando", kpis.loggedUsers],
    ["Quizzes respondidos", kpis.quizAttempts],
    ["Solicitações pendentes hoje", kpis.pendingCount],
    [],
    ["DETALHAMENTO DIÁRIO"],
    ["Dia", "Visualizações", "Visitantes", "Novos usuários", "Logins"],
    ...daily.map((d) => [fmtDay(d.day), d.views, d.visitors, d.newUsers, d.logins]),
    ["Total", kpis.views, kpis.visitors, kpis.newUsers, kpis.logins],
    [],
    ["ACESSOS POR PÁGINA"],
    ["Página", "Visualizações", "% do total"],
    ...breakdowns.pages.map((p) => [p.label, p.count, totals.views ? `${Math.round((p.count / totals.views) * 100)}%` : ""]),
    [],
    ["ORIGENS DO TRÁFEGO"],
    ["Origem", "Visualizações"],
    ...breakdowns.referrers.map((p) => [p.label, p.count]),
    [],
    ["PAÍSES"],
    ["País", "Visualizações"],
    ...breakdowns.countries.map((p) => [p.label, p.count]),
    [],
    ["DISPOSITIVOS"],
    ["Dispositivo", "Visualizações"],
    ...breakdowns.devices.map((p) => [p.label, p.count]),
    [],
    ["NAVEGADORES"],
    ["Navegador", "Visualizações"],
    ...breakdowns.browsers.map((p) => [p.label, p.count]),
    [],
    [`NOVOS USUÁRIOS NO PERÍODO (${newUsers.length})`],
    ["Nome", "E-mail", "Telefone", "Cidade", "UF", "Atuação", "Status", "Origem", "Cadastro"],
    ...newUsers.map((u) => [u.name, u.email, u.phone, u.city, u.state, u.profession, u.status, u.source, dateTimeBr(u.createdAt)]),
  ];

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-acessos-poraonaroda-${period.de}-a-${period.ate}.csv"`,
    },
  });
}
