import { PageShell } from "@/components/page-shell";

/** Renderiza os textos legais: linhas "N. Título" viram subtítulos; o resto, parágrafos. */
export function LegalPage({ title, text, updated }: { title: string; text: string; updated?: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <PageShell eyebrow="Documentos" title={title} subtitle={updated ? `Última atualização: ${updated}` : undefined}>
      <article className="rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-card md:p-10">
        <div className="space-y-3 text-[15px] leading-relaxed text-ink-200">
          {lines.map((l, i) => {
            if (/^\d+\.\s/.test(l)) {
              return (
                <h2 key={i} className="pt-4 text-lg text-ink-50 first:pt-0">
                  {l}
                </h2>
              );
            }
            if (/^(Princípio d[aeo] [^:]+:)/.test(l)) {
              return (
                <p key={i} className="font-semibold text-ink-50">
                  {l}
                </p>
              );
            }
            const parts = l.split(/(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g);
            return (
              <p key={i}>
                {parts.map((p, j) =>
                  /^https?:\/\//.test(p) ? (
                    <a key={j} href={p} className="font-semibold text-brand-500 hover:underline" target="_blank" rel="noopener noreferrer">
                      {p}
                    </a>
                  ) : /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(p) ? (
                    <a key={j} href={`mailto:${p}`} className="font-semibold text-brand-500 hover:underline">
                      {p}
                    </a>
                  ) : (
                    <span key={j}>{p}</span>
                  )
                )}
              </p>
            );
          })}
        </div>
      </article>
    </PageShell>
  );
}
