import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { PageShell } from "@/components/page-shell";
import { Paragraphs } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Passo a passo" };

export default async function PassoAPassoPage() {
  const settings = await getSettings();

  const steps = [
    {
      icon: "user-plus",
      title: "Já tem login?",
      text: "Basta inserir o e-mail cadastrado e a senha na área de login.",
      href: "/login",
      cta: "Ir para o login",
    },
    {
      icon: "lock",
      title: "Esqueceu a senha?",
      text: "Clique em “Esqueci minha senha” na área de login para redefinir através do e-mail cadastrado.",
      href: "/esqueci-senha",
      cta: "Redefinir senha",
    },
    {
      icon: "badge",
      title: "Ainda não tem cadastro?",
      text: "A inscrição é gratuita: preencha nome, telefone e e-mail, crie sua senha e o acesso é liberado na hora.",
      href: "/cadastro",
      cta: "Fazer inscrição",
    },
  ];

  return (
    <PageShell
      eyebrow="Ajuda"
      title="Passo a passo"
      subtitle="Como acessar as aulas do Porão na Roda."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.title} className="flex flex-col rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-brand-500">
              <Icon name={s.icon} size={20} />
            </span>
            <h2 className="mt-4 text-lg">{s.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-300">{s.text}</p>
            <Link href={s.href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-500 hover:underline">
              {s.cta} <Icon name="arrow" size={14} />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-card md:p-8">
        <Paragraphs text={settings.passo_a_passo} className="text-base leading-relaxed text-ink-200" />
        <p className="mt-6 flex flex-wrap items-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm text-ink-200">
          <Icon name="mail" size={16} className="text-brand-500" />
          Dúvidas sobre o seu login? Escreva para{" "}
          <a href={`mailto:${settings.contact_email}`} className="font-semibold text-brand-500 hover:underline">
            {settings.contact_email}
          </a>
        </p>
      </div>
    </PageShell>
  );
}
