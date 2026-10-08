import type { Metadata } from "next";
import { db } from "@/lib/db";
import { adminDeleteFaq, adminSaveFaq } from "../actions/misc";
import { Button, Input, Label, Textarea } from "@/components/ui";

export const metadata: Metadata = { title: "FAQ | Admin" };

export default async function AdminFaqPage() {
  const items = await db.faqItem.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] });

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl text-ink-900">FAQ</h1>
      <p className="mt-1 text-sm text-ink-600">Perguntas frequentes exibidas em /faq, agrupadas (ex.: Congressistas, Palestrantes).</p>

      <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="mb-3 text-sm font-bold text-ink-900">+ Nova pergunta</h2>
        <form action={adminSaveFaq} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <div>
              <Label htmlFor="new-q">Pergunta</Label>
              <Input id="new-q" name="question" required />
            </div>
            <div>
              <Label htmlFor="new-g">Grupo</Label>
              <Input id="new-g" name="group" placeholder="Congressistas" list="faq-groups" />
            </div>
          </div>
          <div>
            <Label htmlFor="new-a">Resposta</Label>
            <Textarea id="new-a" name="answer" rows={3} required />
          </div>
          <div className="flex items-end gap-3">
            <div className="w-28">
              <Label htmlFor="new-o">Ordem</Label>
              <Input id="new-o" name="order" type="number" defaultValue={items.length} />
            </div>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
        <datalist id="faq-groups">
          {[...new Set(items.map((i) => i.group).filter(Boolean))].map((g) => (
            <option key={g!} value={g!} />
          ))}
        </datalist>
      </section>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <form action={adminSaveFaq} className="space-y-3">
              <input type="hidden" name="id" value={item.id} />
              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <Input name="question" defaultValue={item.question} required aria-label="Pergunta" />
                <Input name="group" defaultValue={item.group ?? ""} placeholder="Grupo" list="faq-groups" aria-label="Grupo" />
              </div>
              <Textarea name="answer" defaultValue={item.answer} rows={3} required aria-label="Resposta" />
              <div className="flex items-center gap-3">
                <Input name="order" type="number" defaultValue={item.order} className="w-24" aria-label="Ordem" />
                <Button type="submit" variant="secondary">
                  Salvar
                </Button>
              </div>
            </form>
            <form action={adminDeleteFaq} className="mt-2 text-right">
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline">
                Excluir
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
