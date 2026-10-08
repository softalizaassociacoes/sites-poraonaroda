import type { Metadata } from "next";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { getCurrentEdition } from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Minha credencial" };

export default async function CredencialPage() {
  const [user, edition] = await Promise.all([requireUser(), getCurrentEdition()]);
  const since = user.createdAt.getFullYear();

  return (
    <PageShell eyebrow="Área do participante" title="Minha credencial" subtitle="Sua identificação como participante do Porão na Roda.">
      <div className="flex justify-center">
        <div className="w-full max-w-sm overflow-hidden rounded-[28px] bg-ink-900 shadow-2xl ring-1 ring-ink-700">
          <div className="flex justify-center bg-ink-900 py-3">
            <div className="h-2.5 w-28 rounded-full bg-brand-500" />
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500 px-8 pb-8 pt-8 text-center">
            <div className="bg-grid absolute inset-0 opacity-30" aria-hidden />
            <div className="relative mx-auto w-fit rounded-2xl bg-ink-900 p-4 shadow-lg">
              <Image src="/logo.png" alt="Porão na Roda" width={794} height={283} className="h-10 w-auto" />
            </div>
            <p className="relative mt-4 text-xs font-bold uppercase tracking-[0.25em] text-lime-300">
              {edition?.name ?? "Porão na Roda"}
            </p>
          </div>
          <div className="px-8 py-8 text-center">
            <p className="text-2xl font-bold uppercase leading-tight text-ink-50">{user.name}</p>
            {user.institution && (
              <p className="mt-1 text-sm text-ink-300">{user.institution}</p>
            )}
            {user.profession && <p className="text-xs text-ink-400">{user.profession}</p>}
            <div className="mt-4 flex justify-center gap-2">
              <Badge color={user.role === "ADMIN" ? "gold" : "green"}>{user.role === "ADMIN" ? "Organização" : user.category}</Badge>
              <Badge color="sand">desde {since}</Badge>
            </div>
          </div>
          <div className="bg-brand-500 py-3 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-black">
            Festival Porão do Rock
          </div>
        </div>
      </div>
    </PageShell>
  );
}
