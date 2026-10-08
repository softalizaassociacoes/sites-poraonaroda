import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getEditionByYear, getEditions, getLecturesForEdition } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { EditionTabs } from "@/components/edition-tabs";
import { LectureCard } from "@/components/lecture-card";
import { Icon } from "@/components/icons";

export async function ProgramView({ year }: { year: number | null }) {
  const [user, editions, settings] = await Promise.all([getCurrentUser(), getEditions(), getSettings()]);
  const edition = year ? await getEditionByYear(year) : null;
  const lectures = edition ? await getLecturesForEdition(edition.id) : [];
  const loggedIn = !!user;

  return (
    <PageShell
      eyebrow={edition ? edition.name : "Programação"}
      title={edition ? `Programação ${edition.year}` : "Programação"}
      subtitle={
        edition?.description ??
        (edition?.current
          ? `Aulas ao vivo às terças-feiras, ${settings.live_time_default}. As gravações ficam disponíveis na plataforma.`
          : "Reveja as aulas desta edição. As gravações continuam disponíveis para cooperados cadastrados.")
      }
      wide
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <EditionTabs
          editions={editions.map((e) => ({ year: e.year, current: e.current }))}
          activeYear={edition?.year ?? 0}
          basePath="/programacao"
        />
        {!loggedIn && (
          <p className="flex items-center gap-2 text-sm text-ink-400">
            <Icon name="lock" size={14} />
            Para assistir,{" "}
            <Link href="/login" className="font-semibold text-brand-500 hover:underline">
              entre
            </Link>{" "}
            ou{" "}
            <Link href="/cadastro" className="font-semibold text-brand-500 hover:underline">
              cadastre-se
            </Link>
          </p>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {lectures.map((l) => (
          <LectureCard key={l.id} lecture={l} loggedIn={loggedIn} />
        ))}
        {lectures.length === 0 && (
          <p className="rounded-2xl bg-ink-900 p-8 text-center text-ink-400 shadow-card">
            A programação desta edição será divulgada em breve.
          </p>
        )}
      </div>
    </PageShell>
  );
}
