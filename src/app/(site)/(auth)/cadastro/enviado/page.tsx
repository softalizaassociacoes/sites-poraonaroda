import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { AuthCard } from "@/components/auth-card";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Solicitação enviada" };

export default async function CadastroEnviadoPage() {
  const settings = await getSettings();
  return (
    <AuthCard title="Solicitação enviada!" subtitle="Recebemos seus dados. Agora é só aguardar a análise da organização.">
      <div className="space-y-4 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-800 text-brand-500">
          <Icon name="check" size={32} strokeWidth={2.2} />
        </span>
        <p className="text-sm text-ink-200">
          Se aprovado o cadastro, você receberá a confirmação de acesso no e-mail informado em até{" "}
          <strong>10 dias úteis</strong>. Enquanto isso, a programação e os palestrantes já podem ser consultados.
        </p>
        <p className="text-xs text-ink-400">
          Dúvidas? Escreva para{" "}
          <a href={`mailto:${settings.contact_email}`} className="font-semibold text-brand-500 hover:underline">
            {settings.contact_email}
          </a>
        </p>
        <Link href="/programacao" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-400">
          Ver programação <Icon name="arrow" size={14} />
        </Link>
      </div>
    </AuthCard>
  );
}
