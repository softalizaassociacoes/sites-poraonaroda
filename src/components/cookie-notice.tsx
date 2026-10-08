"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const KEY = "uc_cookie_ok";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(KEY) === null;
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

/** Aviso de cookies (LGPD). O site só usa cookies funcionais: sessão de login e identificador anônimo das métricas. */
export function CookieNotice() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      // armazenamento indisponível
    }
    listeners.forEach((l) => l());
  };

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fade-in fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-2xl border border-ink-700 bg-ink-900 p-4 shadow-2xl shadow-ink-900/15 sm:flex sm:items-center sm:gap-4 sm:p-5"
    >
      <p className="text-sm text-ink-200">
        Usamos apenas cookies funcionais: para manter você conectado e para contar acessos de forma anônima. Saiba mais na{" "}
        <Link href="/politica-de-cookies" className="font-semibold text-brand-500 hover:underline">
          Política de Cookies
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={accept}
        className="mt-3 w-full shrink-0 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-400 sm:mt-0 sm:w-auto"
      >
        Entendi
      </button>
    </div>
  );
}
