import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { adminDeleteEdition, adminSaveEdition } from "../actions/content";
import { Badge, Button, Checkbox, Input, Label } from "@/components/ui";

export const metadata: Metadata = { title: "Edições | Admin" };

export default async function AdminEdicoesPage() {
  const editions = await db.edition.findMany({
    orderBy: { year: "desc" },
    include: { _count: { select: { lectures: true } } },
  });
  const nextYear = (editions[0]?.year ?? new Date().getFullYear()) + 1;

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl text-ink-900">Edições</h1>
      <p className="mt-1 text-sm text-ink-600">
        Cada ano do Porão na Roda é uma edição. A edição marcada como <strong>atual</strong> aparece na home e em “Programação”; as demais ficam em “Edições anteriores”.
      </p>

      <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="mb-3 text-lg text-ink-900">Nova edição</h2>
        <form action={adminSaveEdition} className="grid gap-3 sm:grid-cols-[100px_1fr_auto]">
          <div>
            <Label htmlFor="ne-year">Ano</Label>
            <Input id="ne-year" name="year" type="number" required defaultValue={nextYear} />
          </div>
          <div>
            <Label htmlFor="ne-name">Nome</Label>
            <Input id="ne-name" name="name" placeholder={`Porão na Roda ${nextYear}`} />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 pb-2.5 text-sm text-ink-800">
              <Checkbox name="active" defaultChecked /> ativa
            </label>
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </section>

      <div className="mt-6 space-y-3">
        {editions.map((e) => (
          <div key={e.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <form action={adminSaveEdition} className="grid gap-3 sm:grid-cols-[90px_1fr_1fr_70px]">
              <input type="hidden" name="id" value={e.id} />
              <div>
                <Label>Ano</Label>
                <Input name="year" type="number" defaultValue={e.year} required />
              </div>
              <div>
                <Label>Nome</Label>
                <Input name="name" defaultValue={e.name} required />
              </div>
              <div>
                <Label>Descrição (subtítulo da programação)</Label>
                <Input name="description" defaultValue={e.description ?? ""} placeholder="Opcional" />
              </div>
              <div>
                <Label>Ordem</Label>
                <Input name="order" type="number" defaultValue={e.order} />
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:col-span-4">
                <label className="flex items-center gap-2 text-sm text-ink-800">
                  <Checkbox name="current" defaultChecked={e.current} /> edição atual
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-800">
                  <Checkbox name="active" defaultChecked={e.active} /> visível no site
                </label>
                <Badge color="ink">{e._count.lectures} aulas</Badge>
                <Link href={`/admin/lives?edicao=${e.year}`} className="text-sm font-semibold text-brand-700 hover:underline">
                  Ver lives →
                </Link>
                <div className="ml-auto flex items-center gap-3">
                  <Button type="submit" variant="secondary">
                    Salvar
                  </Button>
                </div>
              </div>
            </form>
            {e._count.lectures === 0 && (
              <form action={adminDeleteEdition} className="mt-2 text-right">
                <input type="hidden" name="id" value={e.id} />
                <button type="submit" className="text-xs font-medium text-red-500 hover:underline">
                  Excluir edição
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
