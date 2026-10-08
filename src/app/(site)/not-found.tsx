import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="max-w-md text-center">
        <p className="text-7xl font-bold text-brand-200">404</p>
        <h1 className="mt-4 text-2xl text-ink-50">Página não encontrada</h1>
        <p className="mt-2 text-ink-300">
          O endereço pode ter mudado com a nova plataforma. Confira a programação ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-400">
            <Icon name="home" size={16} /> Início
          </Link>
          <Link href="/programacao" className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-5 py-2.5 text-sm font-semibold text-ink-200 hover:border-brand-500">
            <Icon name="calendar" size={16} /> Programação
          </Link>
        </div>
      </div>
    </div>
  );
}
