import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Avatar, Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Palestrantes | Admin" };

export default async function AdminPalestrantesPage({ searchParams }: PageProps<"/admin/palestrantes">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const speakers = await db.speaker.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
    include: { lectures: { include: { lecture: { include: { edition: true } } } } },
  });

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-ink-900">
          Palestrantes <span className="text-lg text-ink-400">({speakers.length})</span>
        </h1>
        <div className="flex items-center gap-2">
          <form>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar…"
              className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </form>
          <Link href="/admin/palestrantes/novo" className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft">
            + Novo palestrante
          </Link>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {speakers.map((s) => (
          <Link key={s.id} href={`/admin/palestrantes/${s.id}`} className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition hover:border-brand-300">
            <Avatar name={s.name} src={s.photoUrl} size={56} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink-900">
                {s.title ? `${s.title} ` : ""}
                {s.name}
              </p>
              <p className="truncate text-xs text-ink-500">
                {s.lectures.length === 0
                  ? "Sem aulas vinculadas"
                  : s.lectures.map((l) => `${l.lecture.edition.year}: ${l.lecture.title}`).join(" · ")}
              </p>
            </div>
            {!s.active && <Badge color="red">Inativo</Badge>}
            {!s.photoUrl && <Badge color="sand">sem foto</Badge>}
          </Link>
        ))}
        {speakers.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-ink-500 shadow-card sm:col-span-2">Nenhum palestrante.</p>}
      </div>
    </div>
  );
}
