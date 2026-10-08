import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PageShell } from "@/components/page-shell";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "FAQ" };

function withLinks(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-500 hover:underline">
        {p.replace(/^https?:\/\//, "").split("/")[0]}
        <Icon name="external" size={12} className="ml-0.5 inline" />
      </a>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export default async function FaqPage() {
  const items = await db.faqItem.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] });
  const groups = [...new Set(items.map((i) => i.group ?? "Perguntas frequentes"))];

  return (
    <PageShell eyebrow="Ajuda" title="Perguntas frequentes" subtitle="Tire suas dúvidas sobre a plataforma, as lives e os certificados.">
      {items.length === 0 && (
        <p className="rounded-2xl bg-ink-900 p-8 text-center text-ink-400 shadow-card">Nenhuma pergunta cadastrada ainda.</p>
      )}
      <div className="space-y-10">
        {groups.map((g) => (
          <section key={g}>
            <h2 className="mb-4 text-xl text-ink-50">{g}</h2>
            <div className="space-y-3">
              {items
                .filter((i) => (i.group ?? "Perguntas frequentes") === g)
                .map((item) => (
                  <details key={item.id} className="group rounded-2xl border border-ink-700 bg-ink-900 shadow-card open:border-brand-500">
                    <summary className="flex cursor-pointer items-center justify-between gap-3 px-6 py-4 text-sm font-semibold text-ink-50 [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <Icon name="chevron" size={18} className="shrink-0 text-brand-500 transition group-open:rotate-180" />
                    </summary>
                    <div className="space-y-2 border-t border-ink-700 px-6 py-4 text-sm leading-relaxed text-ink-200">
                      {item.answer.split("\n").map((p, i) => (
                        <p key={i}>{withLinks(p)}</p>
                      ))}
                    </div>
                  </details>
                ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
