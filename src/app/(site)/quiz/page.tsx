import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { shortDate } from "@/lib/format";
import { PageShell } from "@/components/page-shell";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizIndexPage() {
  const user = await requireUser();
  const lectures = await db.lecture.findMany({
    where: { active: true, questions: { some: {} } },
    orderBy: [{ edition: { year: "desc" } }, { date: "asc" }],
    include: {
      edition: true,
      _count: { select: { questions: true } },
      attempts: { where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  const years = [...new Set(lectures.map((l) => l.edition.year))];

  return (
    <PageShell
      eyebrow="Fixação do conteúdo"
      title="Quiz"
      subtitle="Questionários de cada aula. Responda quantas vezes quiser — as respostas ficam registradas na sua conta."
    >
      {lectures.length === 0 && (
        <p className="rounded-2xl bg-ink-900 p-8 text-center text-ink-400 shadow-card">Nenhum quiz disponível ainda.</p>
      )}
      <div className="space-y-10">
        {years.map((y) => (
          <section key={y}>
            <h2 className="mb-4 text-xl">Porão na Roda {y}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {lectures
                .filter((l) => l.edition.year === y)
                .map((l) => {
                  const a = l.attempts[0];
                  return (
                    <Link
                      key={l.id}
                      href={`/sala/${l.slug}#quiz`}
                      className="group flex items-start gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-5 shadow-card transition hover:border-brand-500"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-brand-500 group-hover:bg-brand-500 group-hover:text-black">
                        <Icon name="quiz" size={20} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-ink-500">{shortDate(l.date, l.dateLabel ?? "")}</span>
                        <span className="block font-semibold leading-snug text-ink-50 group-hover:text-brand-500">{l.title}</span>
                        <span className="mt-1 block text-xs text-ink-400">
                          {l._count.questions} questões
                          {a
                            ? a.score !== null
                              ? ` · último resultado: ${a.score}/${a.total}`
                              : " · respondido"
                            : " · ainda não respondido"}
                        </span>
                      </span>
                      <Icon name="arrow" size={16} className="mt-1 shrink-0 text-ink-300 group-hover:text-brand-500" />
                    </Link>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
