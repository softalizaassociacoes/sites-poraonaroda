import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";

export function AuthCard({
  title,
  subtitle,
  children,
  wide,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-ink-950 px-4 py-12">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-punk-blue/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-punk-orange/20 blur-3xl" aria-hidden />
      <div className={clsx("fade-in relative w-full", wide ? "max-w-3xl" : "max-w-md")}>
        <div className="rounded-3xl border border-ink-700 bg-ink-900 p-7 shadow-2xl shadow-black/60 md:p-9">
          <div className="mb-6 flex justify-center">
            <Link href="/" aria-label="Porão na Roda — início">
              <Image src="/logo.png" alt="Porão na Roda" width={794} height={283} priority className="h-14 w-auto" />
            </Link>
          </div>
          <h1 className="text-center text-2xl text-ink-50">{title}</h1>
          {subtitle && <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink-300">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-5 text-center text-sm text-ink-300">{footer}</div>}
      </div>
    </div>
  );
}
