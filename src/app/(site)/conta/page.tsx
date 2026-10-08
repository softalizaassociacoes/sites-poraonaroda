import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { dateBr } from "@/lib/format";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PasswordForm, ProfileForm } from "./conta-forms";

export const metadata: Metadata = { title: "Minha conta" };

export default async function ContaPage() {
  const user = await requireUser();
  const attempts = await db.quizAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { lecture: { select: { title: true, slug: true } } },
  });

  return (
    <PageShell eyebrow="Área do participante" title="Minha conta" subtitle={`Cadastro desde ${dateBr(user.createdAt)}.`} wide>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-6 md:p-8">
          <h2 className="mb-5 text-xl">Meus dados</h2>
          <ProfileForm user={user} />
        </Card>
        <div className="space-y-6">
          <Card className="p-6 md:p-8">
            <h2 className="mb-5 text-xl">Alterar senha</h2>
            <PasswordForm hasPassword={!!(user.passwordHash || user.legacyHash)} />
          </Card>
          <Card className="p-6 md:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl">
              <Icon name="quiz" size={20} className="text-brand-500" /> Meus quizzes
            </h2>
            {attempts.length === 0 ? (
              <p className="text-sm text-ink-400">
                Você ainda não respondeu nenhum quiz.{" "}
                <Link href="/quiz" className="font-semibold text-brand-500 hover:underline">
                  Ver quizzes
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-ink-800 text-sm">
                {attempts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link href={`/sala/${a.lecture.slug}`} className="min-w-0 truncate font-medium text-ink-100 hover:text-brand-500">
                      {a.lecture.title}
                    </Link>
                    <span className="shrink-0 text-xs text-ink-400">
                      {a.score !== null ? `${a.score}/${a.total}` : "respondido"} · {dateBr(a.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
