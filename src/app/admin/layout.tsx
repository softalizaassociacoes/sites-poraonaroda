import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { initials } from "@/lib/format";
import { AdminNav } from "./admin-nav";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const pending = await db.user.count({ where: { status: "PENDING" } });

  return (
    <div className="flex min-h-screen flex-1 bg-sand-50 text-ink-900">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-ink-800 via-ink-900 to-ink-950 md:flex print:hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-brand-400 to-lime-400" />
        <div className="flex items-center gap-3 px-5 pb-4 pt-5">
          <div className="rounded-xl bg-white px-2.5 py-1.5 shadow-lg">
            <Image src="/logo-preto.png" alt="Porão na Roda" width={794} height={283} className="h-6 w-auto" />
          </div>
          <span className="rounded-full bg-lime-400 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-900">Admin</span>
        </div>

        <AdminNav pending={pending} />

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white">
              {initials(admin.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{admin.name}</p>
              <p className="truncate text-xs text-white/50">{admin.email}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <Icon name="door" size={15} />
            Voltar ao site
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="border-b border-ink-100 bg-white px-4 py-3 md:hidden print:hidden">
          <details>
            <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-ink-900">
              <span className="flex items-center gap-2">
                <Image src="/logo-preto.png" alt="Porão na Roda" width={794} height={283} className="h-6 w-auto" />
                Admin
              </span>
              <Icon name="menu" size={18} />
            </summary>
            <div className="mt-2 space-y-1">
              <AdminNav mobile pending={pending} />
              <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink-800">
                <Icon name="door" size={15} />
                Voltar ao site
              </Link>
            </div>
          </details>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
