import { clsx } from "clsx";
import type { EffectiveStatus } from "@/lib/content";

export function StatusBadge({
  status,
  className,
  size = "sm",
}: {
  status: EffectiveStatus;
  className?: string;
  size?: "sm" | "md";
}) {
  const base = clsx(
    "inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wide",
    size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
    className
  );
  if (status === "LIVE") {
    return (
      <span className={clsx(base, "bg-punk-orange text-black")}>
        <span className="live-dot h-2 w-2 rounded-full bg-black" />
        Ao vivo
      </span>
    );
  }
  if (status === "RECORDED") {
    return (
      <span className={clsx(base, "bg-punk-green/20 text-punk-green ring-1 ring-punk-green/40")}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
        Gravação disponível
      </span>
    );
  }
  if (status === "SOON") {
    return <span className={clsx(base, "bg-ink-800 text-ink-300")}>Gravação em breve</span>;
  }
  return <span className={clsx(base, "bg-brand-500 text-black")}>Agendada</span>;
}
