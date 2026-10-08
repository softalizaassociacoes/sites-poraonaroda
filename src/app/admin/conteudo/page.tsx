import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { mailConfigured } from "@/lib/mail";
import { COOKIES, PRIVACY, TERMS } from "@/content/legal";
import { adminSaveSettings } from "../actions/misc";
import { Button, Checkbox, Input, Label, Textarea } from "@/components/ui";

export const metadata: Metadata = { title: "Conteúdo e configurações | Admin" };

export default async function AdminConteudoPage() {
  const s = await getSettings();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl text-ink-900">Conteúdo e configurações</h1>
      <p className="mt-1 text-sm text-ink-600">Textos das páginas públicas e regras de cadastro. Tudo entra no ar imediatamente ao salvar.</p>

      <form action={adminSaveSettings} className="mt-6 space-y-8">
        <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h2 className="text-lg text-ink-900">Cadastro e contato</h2>
          <label className="flex items-start gap-3 rounded-xl bg-sand-50 p-4 text-sm text-ink-800">
            <Checkbox name="auto_approve" defaultChecked={s.auto_approve === "1"} className="mt-0.5" />
            <span>
              <strong>Aprovar cadastros automaticamente.</strong> Desligado, cada solicitação fica pendente até um admin aprovar (fluxo atual, com validação do
              participante).
            </span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contact_email">E-mail de contato (exibido no site)</Label>
              <Input id="contact_email" name="contact_email" type="email" defaultValue={s.contact_email} />
            </div>
            <div>
              <Label htmlFor="notify_email">E-mails que recebem aviso de novo cadastro</Label>
              <Input
                id="notify_email"
                name="notify_email"
                defaultValue={s.notify_email}
                placeholder="um ou mais, separados por vírgula — vazio = usa o e-mail de contato"
              />
            </div>
          </div>
          <p className="text-xs text-ink-500">
            Envio de e-mails: <strong>{mailConfigured() ? "configurado (SendGrid)" : "não configurado"}</strong>. Para ativar, defina SENDGRID_API_KEY e MAIL_FROM
            nas variáveis de ambiente do projeto na Vercel.
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h2 className="text-lg text-ink-900">Home</h2>
          <div>
            <Label htmlFor="site_name">Nome do site</Label>
            <Input id="site_name" name="site_name" defaultValue={s.site_name} />
          </div>
          <div>
            <Label htmlFor="home_headline">Chamada principal (hero)</Label>
            <Input id="home_headline" name="home_headline" defaultValue={s.home_headline} />
          </div>
          <div>
            <Label htmlFor="home_about">Texto “Sobre o projeto”</Label>
            <Textarea id="home_about" name="home_about" rows={7} defaultValue={s.home_about} />
          </div>
          <div>
            <Label htmlFor="live_time_default">Horário padrão das lives (texto)</Label>
            <Input id="live_time_default" name="live_time_default" defaultValue={s.live_time_default} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h2 className="text-lg text-ink-900">Passo a passo</h2>
          <div>
            <Label htmlFor="passo_a_passo">Texto (um parágrafo por linha)</Label>
            <Textarea id="passo_a_passo" name="passo_a_passo" rows={8} defaultValue={s.passo_a_passo} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <h2 className="text-lg text-ink-900">Textos legais</h2>
          <p className="text-xs text-ink-500">Linhas começando com “1. ”, “2. ”… viram subtítulos. Deixe em branco para usar o texto padrão migrado do site anterior.</p>
          <div>
            <Label htmlFor="legal_privacy">Política de Privacidade</Label>
            <Textarea id="legal_privacy" name="legal_privacy" rows={10} defaultValue={s.legal_privacy ?? ""} placeholder={PRIVACY.slice(0, 200) + "…"} />
          </div>
          <div>
            <Label htmlFor="legal_terms">Termos de Uso</Label>
            <Textarea id="legal_terms" name="legal_terms" rows={8} defaultValue={s.legal_terms ?? ""} placeholder={TERMS.slice(0, 200) + "…"} />
          </div>
          <div>
            <Label htmlFor="legal_cookies">Política de Cookies</Label>
            <Textarea id="legal_cookies" name="legal_cookies" rows={6} defaultValue={s.legal_cookies ?? ""} placeholder={COOKIES.slice(0, 200) + "…"} />
          </div>
        </section>

        <div className="sticky bottom-4">
          <Button type="submit" size="lg" className="shadow-xl">
            Salvar tudo
          </Button>
        </div>
      </form>
    </div>
  );
}
