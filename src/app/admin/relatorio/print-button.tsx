"use client";

import { Icon } from "@/components/icons";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:from-brand-600 hover:to-brand-700"
    >
      <Icon name="doc" size={16} /> Imprimir / salvar PDF
    </button>
  );
}
