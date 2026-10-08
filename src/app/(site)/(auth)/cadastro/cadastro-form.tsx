"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "../actions";
import { AuthCard } from "@/components/auth-card";
import { Button, Checkbox, FormError, Input, Label, Select } from "@/components/ui";

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

const ATUACOES = [
  "Artista / músico(a)",
  "Produtor(a) cultural",
  "Produtor(a) musical",
  "Gestor(a) de carreira / empresário(a)",
  "Técnico(a) / som e luz",
  "Comunicação e marketing",
  "Jornalista",
  "Estudante",
  "Outra",
];

export function CadastroForm({ autoApprove }: { autoApprove: boolean }) {
  const [state, action, pending] = useActionState(register, {});

  return (
    <AuthCard
      wide
      title="Não tenho login e quero me cadastrar"
      subtitle={
        autoApprove
          ? "A inscrição é gratuita. Preencha seus dados, crie sua senha e o acesso é liberado na hora."
          : "A inscrição é gratuita. Depois de enviar, você recebe a confirmação por e-mail assim que a organização aprovar."
      }
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-bold text-brand-500 hover:underline">
            Faça login
          </Link>
        </>
      }
    >
      <form action={action} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">Seus dados</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Nome *</Label>
              <Input id="firstName" name="firstName" required autoComplete="given-name" placeholder="Seu nome" />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome *</Label>
              <Input id="lastName" name="lastName" required autoComplete="family-name" placeholder="Seu sobrenome" />
            </div>
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" />
            </div>
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="(61) 99999-9999" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            Sobre você <span className="font-medium normal-case tracking-normal text-ink-500">(opcional)</span>
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" placeholder="Ex.: Brasília" autoComplete="address-level2" />
            </div>
            <div>
              <Label htmlFor="state">UF</Label>
              <Select id="state" name="state" defaultValue="">
                <option value="">—</option>
                {UFS.map((uf) => (
                  <option key={uf}>{uf}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="profession">Atuação no mercado</Label>
              <Select id="profession" name="profession" defaultValue="">
                <option value="">—</option>
                {ATUACOES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="institution">Banda, projeto ou empresa</Label>
              <Input id="institution" name="institution" placeholder="Ex.: sua banda ou coletivo" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">Senha de acesso</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="password">Senha *</Label>
              <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
            </div>
            <div>
              <Label htmlFor="confirm">Confirmar senha *</Label>
              <Input id="confirm" name="confirm" type="password" required minLength={6} autoComplete="new-password" />
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm text-ink-300">
            <Checkbox name="terms" required className="mt-0.5" />
            <span>
              Li e aceito os{" "}
              <Link href="/termos-de-uso" target="_blank" className="font-bold text-brand-500 hover:underline">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/politica-de-privacidade" target="_blank" className="font-bold text-brand-500 hover:underline">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
        </fieldset>

        <FormError message={state.error} />
        <Button type="submit" disabled={pending} className="w-full" size="lg">
          {pending
            ? autoApprove
              ? "Criando seu acesso…"
              : "Enviando…"
            : autoApprove
              ? "Cadastrar e assistir"
              : "Enviar inscrição"}
        </Button>
      </form>
    </AuthCard>
  );
}
