import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { adminDeleteSpeaker, adminSaveSpeaker } from "../../actions/content";
import { Avatar, Button, Checkbox, Input, Label, Textarea } from "@/components/ui";

export const metadata: Metadata = { title: "Palestrante | Admin" };

export default async function AdminSpeakerEditPage({ params }: PageProps<"/admin/palestrantes/[id]">) {
  const { id } = await params;
  const isNew = id === "novo";
  const speaker = isNew
    ? null
    : await db.speaker.findUnique({ where: { id }, include: { lectures: { include: { lecture: { include: { edition: true } } } } } });
  if (!isNew && !speaker) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/palestrantes" className="text-sm font-semibold text-ink-500 hover:text-brand-700">
        ← Palestrantes
      </Link>
      <h1 className="mt-2 text-3xl text-ink-900">{isNew ? "Novo palestrante" : speaker!.name}</h1>

      <form action={adminSaveSpeaker} className="mt-6 space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        {!isNew && <input type="hidden" name="id" value={speaker!.id} />}
        <div className="flex items-start gap-5">
          <Avatar name={speaker?.name ?? "?"} src={speaker?.photoUrl} size={96} className="ring-4 ring-brand-50" />
          <div className="flex-1 space-y-4">
            <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
              <div>
                <Label htmlFor="title">Tratamento</Label>
                <Input id="title" name="title" defaultValue={speaker?.title ?? ""} placeholder="Dr., Dra., Prof." />
              </div>
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required defaultValue={speaker?.name} />
              </div>
            </div>
            <div>
              <Label htmlFor="photoUrl">Foto (URL)</Label>
              <Input id="photoUrl" name="photoUrl" defaultValue={speaker?.photoUrl ?? ""} placeholder="/uploads/2026/04/nome.jpg ou https://…" />
              <p className="mt-1 text-xs text-ink-500">Fotos quadradas ficam melhores. Arquivos em public/uploads ou qualquer link público.</p>
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="bio">Minicurrículo</Label>
          <Textarea id="bio" name="bio" rows={6} defaultValue={speaker?.bio ?? ""} />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-28">
            <Label htmlFor="order">Ordem</Label>
            <Input id="order" name="order" type="number" defaultValue={speaker?.order ?? 0} />
          </div>
          <label className="flex items-center gap-2 pb-2.5 text-sm font-medium text-ink-800">
            <Checkbox name="active" defaultChecked={speaker?.active ?? true} /> Ativo
          </label>
          <div className="ml-auto">
            <Button type="submit">{isNew ? "Criar palestrante" : "Salvar"}</Button>
          </div>
        </div>
      </form>

      {!isNew && (
        <>
          <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <h2 className="text-lg text-ink-900">Aulas deste palestrante</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {speaker!.lectures.map((l) => (
                <li key={l.lectureId}>
                  <Link href={`/admin/lives/${l.lectureId}`} className="text-brand-700 hover:underline">
                    {l.lecture.edition.year} · {l.lecture.dateLabel} · {l.lecture.title}
                  </Link>
                </li>
              ))}
              {speaker!.lectures.length === 0 && <li className="text-ink-500">Nenhuma aula vinculada. Vincule na edição da live.</li>}
            </ul>
          </section>
          <form action={adminDeleteSpeaker} className="mt-4 text-right">
            <input type="hidden" name="id" value={speaker!.id} />
            <button type="submit" className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline">
              Excluir palestrante
            </button>
          </form>
        </>
      )}
    </div>
  );
}
