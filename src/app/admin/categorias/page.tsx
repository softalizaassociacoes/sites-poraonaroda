import type { Metadata } from "next";
import { db } from "@/lib/db";
import { adminDeleteCategory, adminSaveCategory } from "../actions/misc";
import { Button, Input, Label } from "@/components/ui";

export const metadata: Metadata = { title: "Categorias | Admin" };

export default async function AdminCategoriasPage() {
  const categories = await db.category.findMany({ orderBy: { order: "asc" } });
  const counts = await db.user.groupBy({ by: ["category"], _count: { _all: true } });
  const countByName = new Map(counts.map((c) => [c.category, c._count._all]));

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl text-ink-900">Categorias</h1>
      <p className="mt-1 text-sm text-ink-600">
        Classificam os usuários (aparecem na credencial e nos filtros). Todo cadastro novo entra como &quot;Participante&quot;.
      </p>

      <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="mb-3 text-lg text-ink-900">Nova categoria</h2>
        <form action={adminSaveCategory} className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="new-name">Nome</Label>
            <Input id="new-name" name="name" required placeholder="Ex.: Palestrante" />
          </div>
          <div className="w-24">
            <Label htmlFor="new-order">Ordem</Label>
            <Input id="new-order" name="order" type="number" defaultValue={categories.length} />
          </div>
          <Button type="submit">Criar</Button>
        </form>
      </section>

      <div className="mt-6 space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-card">
            <form action={adminSaveCategory} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={c.id} />
              <Input name="name" defaultValue={c.name} required className="max-w-56" aria-label="Nome da categoria" />
              <Input name="order" type="number" defaultValue={c.order} className="w-20" aria-label="Ordem" />
              <span className="text-xs text-ink-500">{countByName.get(c.name) ?? 0} usuário(s)</span>
              <div className="ml-auto flex items-center gap-3">
                <Button type="submit" variant="secondary">
                  Salvar
                </Button>
              </div>
            </form>
            <form action={adminDeleteCategory} className="mt-1 text-right">
              <input type="hidden" name="id" value={c.id} />
              <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline">
                Excluir categoria
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
