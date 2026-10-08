"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Icon } from "@/components/icons";

export type HeaderUser = { name: string; isAdmin: boolean } | null;
export type HeaderEdition = { year: number; current: boolean };

const NAV = [
  { href: "/programacao", label: "Programação" },
  { href: "/palestrantes", label: "Palestrantes" },
  { href: "/passo-a-passo", label: "Passo a passo" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader({
  user,
  editions,
  logoutAction,
}: {
  user: HeaderUser;
  editions: HeaderEdition[];
  logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<"editions" | "user" | null>(null);
  const pathname = usePathname();
  const previous = editions.filter((e) => !e.current);
  const firstName = user?.name.split(" ")[0];

  // fecha menus ao navegar (ajuste de estado durante o render, sem efeito)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setMenu(null);
  }

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-menu]")) setMenu(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menu]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:h-[76px]">
        <Link href="/" className="shrink-0" aria-label="Porão na Roda — início">
          <Image src="/logo.png" alt="Porão na Roda" width={794} height={283} priority className="h-8 w-auto md:h-10" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-full px-3.5 py-2 text-sm font-bold uppercase tracking-wide transition",
                isActive(item.href)
                  ? "bg-brand-500 text-black"
                  : "text-ink-200 hover:bg-ink-800 hover:text-brand-500"
              )}
            >
              {item.label}
            </Link>
          ))}
          {previous.length > 0 && (
            <div className="relative" data-menu>
              <button
                type="button"
                onClick={() => setMenu(menu === "editions" ? null : "editions")}
                className={clsx(
                  "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-bold uppercase tracking-wide transition",
                  menu === "editions" ? "bg-ink-800 text-brand-500" : "text-ink-200 hover:bg-ink-800 hover:text-brand-500"
                )}
                aria-expanded={menu === "editions"}
              >
                Eventos anteriores
                <Icon name="chevron" size={14} className={clsx("transition", menu === "editions" && "rotate-180")} />
              </button>
              {menu === "editions" && (
                <div className="fade-in absolute left-0 top-full mt-2 w-60 rounded-2xl border border-ink-700 bg-ink-900 p-2 shadow-card">
                  {previous.map((e) => (
                    <div key={e.year} className="rounded-xl p-2">
                      <p className="px-1 text-xs font-bold uppercase tracking-wider text-ink-400">
                        Porão na Roda {e.year}
                      </p>
                      <div className="mt-1 flex flex-col">
                        <Link href={`/programacao/${e.year}`} className="rounded-lg px-2 py-1.5 text-sm font-medium text-ink-100 hover:bg-ink-800 hover:text-brand-500">
                          Programação {e.year}
                        </Link>
                        <Link href={`/palestrantes/${e.year}`} className="rounded-lg px-2 py-1.5 text-sm font-medium text-ink-100 hover:bg-ink-800 hover:text-brand-500">
                          Palestrantes {e.year}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <div className="relative" data-menu>
              <button
                type="button"
                onClick={() => setMenu(menu === "user" ? null : "user")}
                className="flex items-center gap-2 rounded-full border border-ink-600 py-1.5 pl-1.5 pr-3 text-sm font-bold text-ink-100 transition hover:border-brand-500 hover:text-brand-500"
                aria-expanded={menu === "user"}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-black">
                  {user.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0]?.toUpperCase())
                    .join("")}
                </span>
                Olá, {firstName}
                <Icon name="chevron" size={14} />
              </button>
              {menu === "user" && (
                <div className="fade-in absolute right-0 top-full mt-2 w-56 rounded-2xl border border-ink-700 bg-ink-900 p-2 shadow-card">
                  {[
                    { href: "/conta", label: "Minha conta", icon: "user" },
                    { href: "/credencial", label: "Minha credencial", icon: "badge" },
                  ].map((i) => (
                    <Link key={i.href} href={i.href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-100 hover:bg-ink-800 hover:text-brand-500">
                      <Icon name={i.icon} size={16} className="text-brand-500" />
                      {i.label}
                    </Link>
                  ))}
                  {user.isAdmin && (
                    <Link href="/admin" className="mt-1 flex items-center gap-2 rounded-xl bg-brand-500 px-3 py-2 text-sm font-bold text-black hover:bg-brand-400">
                      <Icon name="user-cog" size={16} />
                      Painel admin
                    </Link>
                  )}
                  <form action={logoutAction} className="mt-1 border-t border-ink-700 pt-1">
                    <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-300 hover:bg-ink-800">
                      <Icon name="logout" size={16} />
                      Sair
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink-100 transition hover:bg-ink-800">
                Entrar
              </Link>
              <Link href="/cadastro" className="rounded-full bg-brand-500 px-5 py-2 text-sm font-bold uppercase tracking-wide text-black shadow-soft transition hover:bg-brand-400">
                Inscreva-se
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-ink-600 p-2 text-ink-100 lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          <Icon name={open ? "x" : "menu"} size={20} strokeWidth={2} />
        </button>
      </div>

      {open && (
        <nav className="border-t border-ink-800 bg-ink-950 px-4 pb-5 pt-2 lg:hidden" aria-label="Menu">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "mt-1 block rounded-xl px-3 py-2.5 text-sm font-bold uppercase tracking-wide",
                isActive(item.href) ? "bg-brand-500 text-black" : "text-ink-100 hover:bg-ink-800"
              )}
            >
              {item.label}
            </Link>
          ))}
          {previous.length > 0 && (
            <div className="mt-3 rounded-xl bg-ink-900 p-3">
              <p className="px-1 text-xs font-bold uppercase tracking-wider text-ink-400">Eventos anteriores</p>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {previous.map((e) => (
                  <div key={e.year} className="contents">
                    <Link href={`/programacao/${e.year}`} className="rounded-lg px-2 py-1.5 text-sm font-medium text-ink-100 hover:bg-ink-800">
                      Programação {e.year}
                    </Link>
                    <Link href={`/palestrantes/${e.year}`} className="rounded-lg px-2 py-1.5 text-sm font-medium text-ink-100 hover:bg-ink-800">
                      Palestrantes {e.year}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-800 pt-3">
            {user ? (
              <>
                <Link href="/conta" className="rounded-full bg-ink-800 px-4 py-2 text-sm font-bold text-ink-100">Minha conta</Link>
                <Link href="/credencial" className="rounded-full bg-ink-800 px-4 py-2 text-sm font-bold text-ink-100">Credencial</Link>
                {user.isAdmin && (
                  <Link href="/admin" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-black">Admin</Link>
                )}
                <form action={logoutAction} className="ml-auto">
                  <button type="submit" className="rounded-full border border-ink-600 px-4 py-2 text-sm font-bold text-ink-200">Sair</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-full border border-ink-600 px-4 py-2 text-sm font-bold text-ink-100">Entrar</Link>
                <Link href="/cadastro" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-black">Inscreva-se</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
