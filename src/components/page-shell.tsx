import Link from "next/link";
import { clsx } from "clsx";
import { Icon } from "@/components/icons";

export function PageShell({
  title,
  eyebrow,
  subtitle,
  children,
  wide,
  backHref,
  backLabel = "Voltar",
  actions,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      <div className="relative overflow-hidden border-b border-ink-800 bg-ink-950 py-12 text-white md:py-16">
        <div
          className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-punk-blue/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-punk-orange/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 sm:px-6">
          <div className="max-w-3xl">
            {backHref && (
              <Link
                href={backHref}
                className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-ink-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-200 transition hover:border-brand-500 hover:text-brand-500"
              >
                <Icon name="back" size={14} />
                {backLabel}
              </Link>
            )}
            {eyebrow && (
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
                {eyebrow}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl">{title}</h1>
            {subtitle && <p className="mt-3 text-base text-ink-300 md:text-lg">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
      <div className={clsx("mx-auto px-4 py-10 sm:px-6 md:py-14", wide ? "max-w-7xl" : "max-w-5xl")}>
        {children}
      </div>
    </div>
  );
}
