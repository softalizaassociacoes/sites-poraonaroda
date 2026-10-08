import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { toEmbedUrl, embedProvider } from "@/lib/embed";
import { effectiveStatus, getLectureBySlug, materialsOf } from "@/lib/content";
import { longDate } from "@/lib/format";
import { Avatar, Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { StatusBadge } from "@/components/status-badge";
import { RoomCountdown } from "@/components/room-countdown";
import { QuizForm } from "@/app/(site)/quiz/quiz-form";

/** Início futuro (mais de 15 min à frente) → mostra o cronômetro. */
function futureStart(startsAt: Date | null) {
  if (!startsAt) return null;
  return startsAt.getTime() > Date.now() + 15 * 60 * 1000 ? startsAt : null;
}

export async function generateMetadata({ params }: PageProps<"/sala/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lecture = await db.lecture.findUnique({ where: { slug }, select: { title: true } });
  return { title: lecture?.title ?? "Sala" };
}

export default async function SalaPage({ params }: PageProps<"/sala/[slug]">) {
  const { slug } = await params;
  const user = await requireUser();
  const lecture = await getLectureBySlug(slug);
  if (!lecture || !lecture.active) notFound();

  const status = effectiveStatus(lecture);
  const materials = materialsOf(lecture);
  const speakers = lecture.speakers.map((s) => s.speaker);
  const opensAt = futureStart(lecture.startsAt);

  const lastAttempt = lecture.questions.length
    ? await db.quizAttempt.findFirst({
        where: { lectureId: lecture.id, userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    : null;

  let embed: { url: string; provider: ReturnType<typeof embedProvider> } | null = null;
  if (status === "LIVE" && lecture.liveUrl) {
    embed = { url: toEmbedUrl(lecture.liveUrl, { displayName: user.name }), provider: embedProvider(lecture.liveUrl) };
  } else if (status === "RECORDED" && lecture.recordingUrl) {
    embed = { url: toEmbedUrl(lecture.recordingUrl), provider: embedProvider(lecture.recordingUrl) };
  }

  const sameEdition = await db.lecture.findMany({
    where: { editionId: lecture.editionId, active: true, NOT: { id: lecture.id } },
    orderBy: [{ date: "asc" }, { order: "asc" }],
    select: { id: true, slug: true, title: true, date: true, dateLabel: true, status: true, liveUrl: true, recordingUrl: true, startsAt: true },
  });

  return (
    <div className="flex-1 bg-ink-950">
      {/* Cabeçalho da sala */}
      <div className="border-b border-ink-800 bg-ink-950 pb-24 pt-10 text-white md:pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link
            href={lecture.edition.current ? "/programacao" : `/programacao/${lecture.edition.year}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-200 transition hover:border-brand-500 hover:text-brand-500"
          >
            <Icon name="back" size={14} />
            Programação {lecture.edition.year}
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StatusBadge status={status} size="md" />
            <span className="text-sm text-ink-300">
              {longDate(lecture.date) || lecture.dateLabel}
              {lecture.timeLabel ? ` · ${lecture.timeLabel}` : ""}
            </span>
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl md:text-4xl lg:text-[2.75rem]">{lecture.title}</h1>
          {lecture.subtitle && <p className="mt-2 max-w-3xl text-lg text-ink-300">{lecture.subtitle}</p>}
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* ===== Coluna principal ===== */}
          <div className="min-w-0 space-y-8">
            <Card className="overflow-hidden p-2 md:p-3">
              {opensAt && status !== "LIVE" && status !== "RECORDED" ? (
                <RoomCountdown targetIso={opensAt.toISOString()} />
              ) : embed ? (
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                  <iframe
                    src={embed.url}
                    className="h-full w-full"
                    allow="camera; microphone; fullscreen; display-capture; autoplay; picture-in-picture; clipboard-write"
                    allowFullScreen
                    title={lecture.title}
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl bg-black text-center text-white">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-black">
                    <Icon name={status === "SOON" ? "play" : "clock"} size={30} />
                  </span>
                  <p className="text-lg font-bold">
                    {status === "SOON" ? "Gravação em breve" : "A transmissão ainda não começou"}
                  </p>
                  <p className="max-w-md px-6 text-sm text-ink-300">
                    {status === "SOON"
                      ? "A gravação desta aula será disponibilizada aqui em breve."
                      : "Esta sala será ativada no horário da live. Volte em breve!"}
                  </p>
                </div>
              )}
              {status === "LIVE" && lecture.liveUrl && embed?.provider === "zoom" && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-sm text-ink-300">
                  <span className="flex items-center gap-2">
                    <span className="live-dot h-2 w-2 rounded-full bg-punk-orange" />
                    Transmissão ao vivo pelo Zoom. Você pode participar direto aqui no navegador.
                  </span>
                  <a
                    href={lecture.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink-600 px-3.5 py-1.5 text-xs font-semibold text-ink-200 hover:border-brand-500 hover:text-brand-500"
                  >
                    Abrir no aplicativo do Zoom <Icon name="external" size={12} />
                  </a>
                </div>
              )}
            </Card>

            {lecture.description && (
              <Card className="p-6 md:p-8">
                <h2 className="text-xl">Sobre a aula</h2>
                <div className="prose-uc mt-3 text-base leading-relaxed text-ink-200">
                  {lecture.description.split(/\n+/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Card>
            )}

            {materials.length > 0 && (
              <Card className="p-6 md:p-8">
                <h2 className="flex items-center gap-2 text-xl">
                  <Icon name="doc" size={20} className="text-brand-500" />
                  Materiais da aula
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {materials.map((m, i) => (
                    <li key={i}>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 transition hover:border-brand-500 hover:bg-ink-800"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-brand-500 shadow-sm">
                          <Icon name="download" size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink-50 group-hover:text-brand-500">
                            {m.title || "Baixar conteúdo da palestra"}
                          </span>
                          <span className="block text-xs text-ink-400">{m.url?.split(".").pop()?.toUpperCase()}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {lecture.questions.length > 0 && (
              <Card className="p-6 md:p-8" as="section">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-xl">
                    <Icon name="quiz" size={20} className="text-brand-500" />
                    Quiz da aula
                  </h2>
                  <span className="text-xs text-ink-400">
                    {lecture.questions.length} {lecture.questions.length === 1 ? "questão" : "questões"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-300">Teste o que você aprendeu. Você pode refazer o questionário quantas vezes quiser.</p>
                <div className="mt-6">
                  <QuizForm
                    lectureId={lecture.id}
                    questions={lecture.questions.map((q) => ({
                      id: q.id,
                      text: q.text,
                      description: q.description,
                      options: q.options.map((o) => ({ id: o.id, text: o.text })),
                    }))}
                    hasKey={lecture.questions.some((q) => q.options.some((o) => o.correct))}
                    lastAttempt={
                      lastAttempt
                        ? { score: lastAttempt.score, total: lastAttempt.total, createdAt: lastAttempt.createdAt.toISOString() }
                        : null
                    }
                  />
                </div>
              </Card>
            )}
          </div>

          {/* ===== Lateral ===== */}
          <aside className="space-y-6">
            <Card className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
                {speakers.length === 1 ? "Palestrante" : "Palestrantes"}
              </p>
              <div className="mt-4 space-y-6">
                {speakers.map((s) => (
                  <div key={s.id}>
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} src={s.photoUrl} size={64} className="ring-4 ring-ink-700" />
                      <div>
                        <p className="font-bold text-ink-50">
                          {s.title ? `${s.title} ` : ""}
                          {s.name}
                        </p>
                      </div>
                    </div>
                    {s.bio && <p className="mt-3 text-sm leading-relaxed text-ink-300">{s.bio}</p>}
                  </div>
                ))}
                {speakers.length === 0 && <p className="text-sm text-ink-400">Palestrante a confirmar.</p>}
              </div>
            </Card>

            {sameEdition.length > 0 && (
              <Card className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Outras aulas de {lecture.edition.year}</p>
                <ul className="mt-3 divide-y divide-ink-800">
                  {sameEdition.map((l) => {
                    const st = effectiveStatus(l);
                    return (
                      <li key={l.id}>
                        <Link href={`/sala/${l.slug}`} className="group flex items-center gap-3 py-2.5">
                          <span className="w-12 shrink-0 text-xs font-bold text-brand-500">
                            {l.date ? `${String(l.date.getUTCDate()).padStart(2, "0")}/${String(l.date.getUTCMonth() + 1).padStart(2, "0")}` : l.dateLabel}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm text-ink-100 group-hover:text-brand-500">{l.title}</span>
                          {st === "RECORDED" && <Icon name="play" size={14} className="shrink-0 text-brand-500" />}
                          {st === "LIVE" && <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-punk-orange" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
