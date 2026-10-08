import { getEditionByYear, getEditions, getSpeakersForEdition } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { EditionTabs } from "@/components/edition-tabs";
import { SpeakerCard } from "@/components/speaker-card";

export async function SpeakersView({ year }: { year: number | null }) {
  const editions = await getEditions();
  const edition = year ? await getEditionByYear(year) : null;
  const speakers = edition ? await getSpeakersForEdition(edition.id) : [];

  return (
    <PageShell
      eyebrow={edition ? edition.name : "Palestrantes"}
      title={edition ? `Palestrantes ${edition.year}` : "Palestrantes"}
      subtitle="Um line up de grandes nomes do mercado da música e da produção cultural."
      wide
    >
      <EditionTabs
        editions={editions.map((e) => ({ year: e.year, current: e.current }))}
        activeYear={edition?.year ?? 0}
        basePath="/palestrantes"
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {speakers.map(({ speaker, lecture }) => (
          <SpeakerCard key={speaker.id} speaker={speaker} lecture={lecture} />
        ))}
      </div>
      {speakers.length === 0 && (
        <p className="rounded-2xl bg-ink-900 p-8 text-center text-ink-400 shadow-card">
          Os palestrantes desta edição serão divulgados em breve.
        </p>
      )}
    </PageShell>
  );
}
