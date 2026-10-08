import type { Metadata } from "next";
import { db } from "@/lib/db";
import { adminDeleteSponsor, adminSaveSponsor } from "../actions/misc";
import { Button, Checkbox, Input, Label, Select } from "@/components/ui";

export const metadata: Metadata = { title: "Parceiros | Admin" };

const GROUPS = [
  { key: "realizacao", label: "Realização" },
  { key: "apoio", label: "Apoio" },
  { key: "gerenciamento", label: "Gerenciamento" },
  { key: "patrocinio", label: "Patrocínio" },
];

type SponsorRow = { name: string; group: string; logoUrl: string; url: string | null; order: number };

function Fields({ s }: { s?: SponsorRow }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_150px_1fr_1fr_70px]">
      <div>
        <Label>Nome</Label>
        <Input name="name" required defaultValue={s?.name} placeholder="Ex.: Festival Porão do Rock" />
      </div>
      <div>
        <Label>Grupo</Label>
        <Select name="group" defaultValue={s?.group ?? "apoio"}>
          {GROUPS.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Logo (URL)</Label>
        <Input name="logoUrl" required defaultValue={s?.logoUrl} placeholder="/uploads/… ou https://…" />
      </div>
      <div>
        <Label>Site (opcional)</Label>
        <Input name="url" defaultValue={s?.url ?? ""} placeholder="https://…" />
      </div>
      <div>
        <Label>Ordem</Label>
        <Input name="order" type="number" defaultValue={s?.order ?? 0} />
      </div>
    </div>
  );
}

export default async function AdminPatrocinadoresPage() {
  const sponsors = await db.sponsor.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] });

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl text-ink-900">Parceiros / Logos</h1>
      <p className="mt-1 text-sm text-ink-600">Logos de realização, apoio e gerenciamento exibidos no rodapé e na home.</p>

      <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="mb-3 text-sm font-bold text-ink-900">+ Novo parceiro</h2>
        <form action={adminSaveSponsor} className="space-y-3">
          <Fields />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-800">
              <Checkbox name="active" defaultChecked /> visível
            </label>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </section>

      <div className="mt-6 space-y-3">
        {sponsors.map((s) => (
          <div key={s.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.logoUrl} alt={s.name} className="h-14 w-32 shrink-0 rounded-lg border border-ink-100 bg-white object-contain p-1" />
              <form action={adminSaveSponsor} className="flex-1 space-y-3">
                <input type="hidden" name="id" value={s.id} />
                <Fields s={s} />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-ink-800">
                    <Checkbox name="active" defaultChecked={s.active} /> visível
                  </label>
                  <Button type="submit" variant="secondary">
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
            <form action={adminDeleteSponsor} className="mt-2 text-right">
              <input type="hidden" name="id" value={s.id} />
              <button type="submit" className="text-xs font-medium text-red-500 hover:underline">
                Excluir
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
