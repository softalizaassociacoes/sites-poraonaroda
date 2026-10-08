import Link from "next/link";
import { clsx } from "clsx";

export function EditionTabs({
  editions,
  activeYear,
  basePath,
}: {
  editions: { year: number; current: boolean }[];
  activeYear: number;
  basePath: string;
}) {
  if (editions.length <= 1) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {editions.map((e) => (
        <Link
          key={e.year}
          href={e.current ? basePath : `${basePath}/${e.year}`}
          className={clsx(
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            e.year === activeYear
              ? "bg-brand-500 text-black shadow-soft"
              : "border border-ink-600 bg-ink-900 text-ink-200 hover:border-brand-500 hover:text-brand-500"
          )}
        >
          {e.year}
          {e.current && <span className="ml-1.5 text-xs font-normal opacity-80">atual</span>}
        </Link>
      ))}
    </div>
  );
}
