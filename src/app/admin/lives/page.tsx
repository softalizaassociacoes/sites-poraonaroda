import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { db } from "@/lib/db";
import { effectiveStatus } from "@/lib/content";
import { dateTimeBr } from "@/lib/format";
import { adminSetLectureStatus } from "../actions/content";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Lives / Salas | Admin" };

export default async function AdminLivesPage({ searchParams }: PageProps<"/admin/lives">) {
  const sp = await searchParams;
  const editions = await db.edition.findMany({ orderBy: { year: "desc" } });
  const yearParam = typeof sp.edicao === "string" ? parseInt(sp.edicao, 10) : NaN;
  const selected = editions.find((e) => e.year === yearParam) ?? editions.find((e) => e.current) ?? editions[0];
  const lectures = selected
    ? await db.lecture.findMany({
        where: { editionId: selected.id },
        orderBy: [{ date: "asc" }, { order: "asc" }],
        include: {
          speakers: { include: { speaker: true }, orderBy: { order: "asc" } },
          _count: { select: { questions: true, attempts: true } },
        },
      })
    : [];
  const now = new Date();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl text-ink-900">Lives / Salas</h1>
          <p className="mt-1 text-sm text-ink-600">
            Cada live é uma sala privada (/sala/…): link do Zoom para o dia, gravação depois, materiais e quiz.
          </p>
        </div>
        <Link
          href={`/admin/lives/nova${selected ? `?edicao=${selected.year}` : ""}`}
          className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:from-brand-600 hover:to-brand-700"
        >
          + Nova live
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {editions.map((e) => (
          <Link
            key={e.id}
            href={`/admin/lives?edicao=${e.year}`}
            className={clsx(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              selected?.id === e.id ? "bg-brand-600 text-white" : "border border-ink-200 bg-white text-ink-700 hover:border-brand-300"
            )}
          >
            {e.year}
            {e.current && " · atual"}
          </Link>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        {lectures.map((l) => {
          const st = effectiveStatus(l, now);
          return (
            <div key={l.id} className={clsx("flex flex-wrap items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-card", l.active ? "border-ink-100" : "border-red-200 opacity-70")}>
              <div className="w-14 shrink-0 text-center">
                <p className="text-lg font-bold leading-none text-brand-700">{l.dateLabel ?? "--"}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-400">{l.timeLabel ?? ""}</p>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/lives/${l.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                    {l.title}
                  </Link>
                  <StatusBadge status={st} />
                  {!l.active && <Badge color="red">Oculta</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-ink-500">
                  {l.speakers.map((s) => s.speaker.name).join(", ") || "Sem palestrante"} · /sala/{l.slug}
                  {l.startsAt ? ` · início ${dateTimeBr(l.startsAt)}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-ink-500">
                  <span className={l.liveUrl ? "text-brand-700" : ""}>
                    <Icon name="live" size={11} className="mr-0.5 inline" />
                    {l.liveUrl ? "Zoom ok" : "sem Zoom"}
                  </span>
                  <span className={l.recordingUrl ? "text-brand-700" : ""}>
                    <Icon name="play" size={11} className="mr-0.5 inline" />
                    {l.recordingUrl ? "gravação ok" : "sem gravação"}
                  </span>
                  <span>
                    <Icon name="quiz" size={11} className="mr-0.5 inline" />
                    {l._count.questions} questões · {l._count.attempts} respostas
                  </span>
                </div>
              </div>
              <form action={adminSetLectureStatus} className="flex items-center gap-1">
                <input type="hidden" name="id" value={l.id} />
                <select
                  name="status"
                  defaultValue={l.status}
                  className="rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs font-semibold text-ink-800"
                  aria-label="Status"
                >
                  <option value="SCHEDULED">Agendada</option>
                  <option value="LIVE">Ao vivo</option>
                  <option value="RECORDED">Gravação</option>
                </select>
                <button type="submit" className="rounded-lg bg-ink-100 px-2.5 py-1.5 text-xs font-semibold text-ink-800 hover:bg-ink-200">
                  ok
                </button>
              </form>
              <Link href={`/admin/lives/${l.id}`} className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-800 transition hover:bg-ink-100">
                Editar
              </Link>
              <Link href={`/sala/${l.slug}`} target="_blank" className="rounded-lg px-2 py-1.5 text-ink-400 hover:text-brand-700" title="Abrir sala">
                <Icon name="external" size={16} />
              </Link>
            </div>
          );
        })}
        {lectures.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-ink-500 shadow-card">Nenhuma live nesta edição.</p>}
      </div>
    </div>
  );
}
