"use client";

import { useEffect, useState } from "react";

function remaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff / 3600000) % 24),
    min: Math.floor((diff / 60000) % 60),
    seg: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

/** Cronômetro regressivo até o início da live; ao zerar, recarrega a página. */
export function RoomCountdown({ targetIso, label }: { targetIso: string; label?: string }) {
  const target = new Date(targetIso).getTime();
  const [t, setT] = useState(() => remaining(target));

  useEffect(() => {
    const id = setInterval(() => {
      const next = remaining(target);
      setT(next);
      if (next.done) {
        clearInterval(id);
        setTimeout(() => window.location.reload(), 1200);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const formatted = new Date(targetIso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const blocks = [
    { label: "dias", value: t.dias },
    { label: "horas", value: t.horas },
    { label: "min", value: t.min },
    { label: "seg", value: t.seg },
  ];

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-6 rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-center text-white">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-300">
        {label ?? "A live começa em"}
      </p>
      <div className="flex items-center gap-3 md:gap-4">
        {blocks.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1.5">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-900/10 text-3xl font-bold tabular-nums ring-1 ring-white/15 backdrop-blur md:h-20 md:w-20 md:text-4xl">
              {String(b.value).padStart(2, "0")}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
              {b.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm text-white/80">
        {formatted} <span className="text-white/50">· horário de Brasília</span>
      </p>
    </div>
  );
}
