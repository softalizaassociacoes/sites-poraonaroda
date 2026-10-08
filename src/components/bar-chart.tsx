"use client";

import { useState } from "react";
import { clsx } from "clsx";

export type BarDatum = { label: string; value: number; sub?: string };

/**
 * Gráfico de barras simples (uma série), com tooltip no hover e linhas de grade.
 * Marcas finas, cantos superiores arredondados, sem eixo duplo.
 */
export function BarChart({
  data,
  valueLabel,
  className,
  height = 180,
}: {
  data: BarDatum[];
  valueLabel: string;
  className?: string;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const ticks = [max, Math.round(max / 2), 0];
  const n = data.length;
  const labelEvery = n <= 10 ? 1 : n <= 31 ? 5 : n <= 92 ? 15 : 30;

  return (
    <div className={clsx("relative", className)}>
      <div className="flex gap-2">
        <div className="flex w-8 shrink-0 flex-col justify-between text-right text-[10px] text-ink-400" style={{ height }}>
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="relative flex-1" style={{ height }}>
          {/* linhas de grade */}
          {[0, 50, 100].map((p) => (
            <div key={p} className="absolute inset-x-0 border-t border-ink-100" style={{ top: `${p}%` }} aria-hidden />
          ))}
          <div className="absolute inset-0 flex items-end gap-px">
            {data.map((d, i) => {
              const h = (d.value / max) * 100;
              return (
                <div
                  key={d.label}
                  className="group relative flex h-full flex-1 items-end"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div
                    className={clsx(
                      "w-full rounded-t-[4px] transition-colors",
                      hover === i ? "bg-brand-700" : "bg-brand-500",
                      d.value === 0 && "bg-ink-100"
                    )}
                    style={{ height: `${Math.max(d.value === 0 ? 1 : 2, h)}%` }}
                  />
                  {hover === i && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs text-white shadow-lg">
                      <span className="font-semibold">{d.value}</span> {valueLabel}
                      <span className="block text-white/60">{d.sub ?? d.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ml-10 mt-1 flex text-[10px] text-ink-400">
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 truncate text-center">
            {i % labelEvery === 0 || i === n - 1 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
