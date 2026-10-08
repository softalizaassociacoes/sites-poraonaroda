"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Icon } from "@/components/icons";

const ITEMS = [
  { href: "/admin", label: "Visão geral", icon: "grid" },
  { href: "/admin/metricas", label: "Métricas", icon: "chart" },
  { href: "/admin/relatorio", label: "Relatório de acessos", icon: "doc" },
  { href: "/admin/usuarios", label: "Usuários", icon: "users" },
  { href: "/admin/solicitacoes", label: "Solicitações", icon: "inbox", badge: true },
  { href: "/admin/categorias", label: "Categorias", icon: "tag" },
  { href: "/admin/edicoes", label: "Edições", icon: "layers" },
  { href: "/admin/lives", label: "Lives / Salas", icon: "video" },
  { href: "/admin/palestrantes", label: "Palestrantes", icon: "user" },
  { href: "/admin/faq", label: "FAQ", icon: "help" },
  { href: "/admin/patrocinadores", label: "Parceiros / Logos", icon: "handshake" },
  { href: "/admin/conteudo", label: "Conteúdo e config.", icon: "settings" },
];

export function AdminNav({ mobile, pending = 0 }: { mobile?: boolean; pending?: number }) {
  const pathname = usePathname();

  return (
    <nav className={clsx(!mobile && "flex-1 space-y-0.5 overflow-y-auto p-4")}>
      {ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
              mobile
                ? active
                  ? "bg-brand-100 text-brand-800"
                  : "text-ink-800 hover:bg-ink-100"
                : active
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-900/30"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
            )}
          >
            <span
              className={clsx(
                "flex h-8 w-8 items-center justify-center rounded-lg transition",
                mobile
                  ? active
                    ? "bg-brand-200 text-brand-800"
                    : "bg-ink-100 text-ink-600"
                  : active
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-brand-300 ring-1 ring-white/10"
              )}
            >
              <Icon name={item.icon} size={16} />
            </span>
            {item.label}
            {item.badge && pending > 0 && (
              <span className="ml-auto rounded-full bg-lime-400 px-2 py-0.5 text-[11px] font-bold text-ink-900">{pending}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
