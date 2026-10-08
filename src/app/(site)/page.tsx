import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import {
  effectiveStatus,
  getCurrentEdition,
  getEditions,
  getLecturesForEdition,
} from "@/lib/content";
import { longDate, shortDate } from "@/lib/format";
import { Avatar, Paragraphs, SectionTitle } from "@/components/ui";
import { Icon } from "@/components/icons";
import { LectureCard, DateBlock } from "@/components/lecture-card";
import { StatusBadge } from "@/components/status-badge";

export default async function HomePage() {
  const [user, settings, edition, editions] = await Promise.all([
    getCurrentUser(),
    getSettings(),
    getCurrentEdition(),
    getEditions(),
  ]);
  const lectures = edition ? await getLecturesForEdition(edition.id) : [];
  const now = new Date();
  const withStatus = lectures.map((l) => ({ l, status: effectiveStatus(l, now) }));
  const live = withStatus.find((x) => x.status === "LIVE");
  const next =
    live ??
    withStatus.find((x) => x.status === "SCHEDULED") ??
    [...withStatus].reverse().find((x) => x.status === "RECORDED") ??
    null;
  const recordedCount = withStatus.filter((x) => x.status === "RECORDED").length;
  const [totalLectures, totalSpeakers] = await Promise.all([
    db.lecture.count({ where: { active: true } }),
    db.speaker.count({ where: { active: true } }),
  ]);
  const previous = editions.filter((e) => !e.current);
  const loggedIn = !!user;

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div className="bg-grid absolute inset-0 opacity-70" aria-hidden />
        <div className="float-slow pointer-events-none absolute -right-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-punk-blue/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-punk-orange/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="fade-in">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-black">
              <Icon name="live" size={14} />
              Festival Porão do Rock · {edition?.name ?? "Porão na Roda"}
            </p>
            <h1 className="mt-6 text-5xl leading-[1.02] md:text-6xl lg:text-7xl">
              {settings.home_headline}
            </h1>
            <p className="mt-6 max-w-xl text-base text-ink-200 md:text-lg">
              Um ciclo formativo online e gratuito sobre carreira, mercado e produção musical, com
              quem faz a indústria acontecer. Aulas ao vivo, do seu jeito, de onde você estiver.
            </p>
            <p className="mt-4 inline-block bg-punk-orange px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-black">
              {settings.free_note}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/programacao"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-bold uppercase tracking-wide text-black shadow-lg transition hover:bg-brand-400"
              >
                <Icon name="calendar" size={16} />
                Ver programação
              </Link>
              {loggedIn ? (
                <Link
                  href="/credencial"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:border-brand-500 hover:text-brand-500"
                >
                  <Icon name="badge" size={16} />
                  Minha credencial
                </Link>
              ) : (
                <>
                  <Link
                    href="/cadastro"
                    className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:border-brand-500 hover:text-brand-500"
                  >
                    Inscreva-se
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink-300 underline-offset-4 transition hover:text-brand-500 hover:underline"
                  >
                    <Icon name="lock" size={14} />
                    Já tenho login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Próxima aula / ao vivo / última gravação */}
          {next && (
            <div className="fade-in relative">
              <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-brand-500/40 to-transparent blur-lg" aria-hidden />
              <Link
                href={`/sala/${next.l.slug}`}
                className="relative block rounded-3xl border border-ink-700 bg-ink-900 p-6 text-ink-50 shadow-2xl transition hover:-translate-y-0.5 hover:border-brand-500 md:p-7"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-400">
                    {next.status === "LIVE"
                      ? "Acontecendo agora"
                      : next.status === "SCHEDULED"
                        ? "Próxima aula"
                        : "Última gravação"}
                  </p>
                  <StatusBadge status={next.status} />
                </div>
                <div className="mt-5 flex items-start gap-4">
                  <DateBlock date={next.l.date} label={next.l.dateLabel} size="lg" />
                  <div className="min-w-0">
                    <h2 className="text-xl leading-snug md:text-2xl">{next.l.title}</h2>
                    <p className="mt-1 text-sm text-ink-400">
                      {longDate(next.l.date)}
                      {next.l.timeLabel ? ` · ${next.l.timeLabel}` : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {next.l.speakers.map(({ speaker }) => (
                    <div key={speaker.id} className="flex items-center gap-2.5">
                      <Avatar name={speaker.name} src={speaker.photoUrl} size={40} />
                      <div>
                        <p className="text-sm font-semibold">{speaker.name}</p>
                        <p className="text-xs text-ink-400">Palestrante</p>
                      </div>
                    </div>
                  ))}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-black">
                  {!loggedIn && <Icon name="lock" size={14} />}
                  {next.status === "LIVE" ? "Entrar na sala" : next.status === "RECORDED" ? "Assistir gravação" : "Assistir palestra"}
                  <Icon name="arrow" size={14} />
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ================= NÚMEROS ================= */}
      <section className="border-y border-ink-800 bg-ink-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-ink-800 px-4 py-8 sm:px-6 md:grid-cols-4 md:divide-x">
          {[
            { value: "100%", label: "gratuito, do início ao fim" },
            { value: String(editions.length), label: "edições do Porão na Roda" },
            { value: String(totalLectures), label: "aulas com o mercado" },
            { value: String(totalSpeakers), label: "nomes no line up" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 text-center">
              <p className="font-display text-3xl font-bold text-brand-500 md:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SOBRE ================= */}
      <section id="sobre" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <SectionTitle eyebrow="Sobre o ciclo" title="O que é o Porão na Roda" />
            <Paragraphs text={settings.home_about} className="mt-6 text-base leading-relaxed text-ink-200 md:text-lg" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              {
                icon: "live",
                title: "Aulas ao vivo",
                text: "Transmissões pelo Zoom, com espaço para perguntar direto a quem faz o mercado.",
              },
              {
                icon: "play",
                title: "Gravações",
                text: "Perdeu a aula ao vivo? Algumas ficam disponíveis para rever na plataforma.",
              },
              {
                icon: "badge",
                title: "Certificado",
                text: "Quem acompanha as aulas e cumpre a presença mínima recebe certificado digital.",
              },
              {
                icon: "users",
                title: "Line up de peso",
                text: "Profissionais atuantes em gravadoras, festivais, streaming, sync e direito autoral.",
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-5 shadow-card">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-black">
                  <Icon name={f.icon} size={20} />
                </span>
                <div>
                  <p className="font-bold text-ink-50">{f.title}</p>
                  <p className="mt-1 text-sm text-ink-300">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PROGRAMAÇÃO ================= */}
      {edition && lectures.length > 0 && (
        <section className="border-y border-ink-800 bg-ink-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle
                eyebrow={`Programação ${edition.year}`}
                title={settings.home_kicker || "Nossos convidados"}
                description={`${lectures.length} aulas. ${recordedCount > 0 ? `${recordedCount} já disponíveis para assistir.` : "Todas ao vivo, pelo Zoom."}`}
              />
              <Link
                href="/programacao"
                className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-brand-500 hover:underline"
              >
                Programação completa <Icon name="arrow" size={14} />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lectures.map((l) => (
                <LectureCard key={l.id} lecture={l} loggedIn={loggedIn} variant="card" />
              ))}
            </div>
            {!loggedIn && (
              <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink-400">
                <Icon name="lock" size={14} />
                O acesso às salas (ao vivo e gravações) é só para quem está inscrito.{" "}
                <Link href="/cadastro" className="font-bold text-brand-500 hover:underline">
                  Faça sua inscrição gratuita
                </Link>
              </p>
            )}
          </div>
        </section>
      )}

      {/* ================= COMO PARTICIPAR ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <SectionTitle eyebrow="Passo a passo" title="Como participar" align="center" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "Faça sua inscrição",
              text: "É gratuita. Preencha nome, telefone e e-mail e crie sua senha.",
              href: "/cadastro",
              cta: "Quero me inscrever",
            },
            settings.auto_approve === "1"
              ? {
                  n: "2",
                  title: "Acesso na hora",
                  text: "No próprio formulário você define sua senha e já entra na plataforma, sem espera.",
                  href: "/passo-a-passo",
                  cta: "Ver passo a passo",
                }
              : {
                  n: "2",
                  title: "Aguarde a liberação",
                  text: "A organização confere os dados e envia a confirmação de acesso por e-mail.",
                  href: "/passo-a-passo",
                  cta: "Ver passo a passo",
                },
            {
              n: "3",
              title: "Entre na sala",
              text: "No horário da aula, acesse a sala pela programação — a transmissão abre na própria página.",
              href: "/login",
              cta: "Fazer login",
            },
          ].map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-card">
              <span className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-display text-sm font-bold text-black shadow-soft">
                {s.n}
              </span>
              <h3 className="mt-3 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{s.text}</p>
              <Link href={s.href} className="mt-4 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wide text-brand-500 hover:underline">
                {s.cta} <Icon name="arrow" size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= EDIÇÕES ANTERIORES ================= */}
      {previous.length > 0 && (
        <section className="border-t border-ink-800 bg-ink-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionTitle
              eyebrow="Acervo"
              title="Eventos anteriores"
              description="As edições passadas do Porão na Roda continuam aqui, com toda a programação e o line up."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {await Promise.all(
                previous.map(async (e) => {
                  const ls = await getLecturesForEdition(e.id);
                  return (
                    <div key={e.id} className="rounded-2xl border border-ink-700 bg-ink-950 p-6 shadow-card">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl">{e.name}</h3>
                        <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-black">
                          {ls.length} aulas
                        </span>
                      </div>
                      <ul className="mt-4 space-y-1.5 text-sm text-ink-300">
                        {ls.slice(0, 5).map((l) => (
                          <li key={l.id} className="flex items-center gap-2">
                            <span className="w-12 shrink-0 font-bold text-brand-500">{shortDate(l.date, l.dateLabel ?? "")}</span>
                            <span className="truncate">{l.title}</span>
                          </li>
                        ))}
                        {ls.length > 5 && <li className="text-ink-500">e mais {ls.length - 5} aulas…</li>}
                      </ul>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link href={`/programacao/${e.year}`} className="rounded-full bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-black hover:bg-brand-400">
                          Programação {e.year}
                        </Link>
                        <Link href={`/palestrantes/${e.year}`} className="rounded-full border border-ink-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink-200 hover:border-brand-500 hover:text-brand-500">
                          Palestrantes {e.year}
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
