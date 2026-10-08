"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "../actions";
import { AuthCard } from "@/components/auth-card";
import { Button, FormError, Input, Label } from "@/components/ui";

function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const reset = params.get("reset");

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {reset && (
        <p className="rounded-xl bg-ink-800 px-3.5 py-2.5 text-sm text-brand-400">Senha redefinida com sucesso. Entre com a nova senha.</p>
      )}
      {next && !state.error && (
        <p className="rounded-xl bg-ink-900 px-3.5 py-2.5 text-sm text-ink-200">
          Faça login para acessar esta área. O acesso às salas é exclusivo para cooperados cadastrados.
        </p>
      )}
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link href="/esqueci-senha" className="mb-1 text-xs font-semibold text-brand-500 hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </div>
      <FormError message={state.error} />
      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-center text-sm text-ink-300">
        Não tem login?{" "}
        <Link href="/cadastro" className="font-semibold text-brand-500 hover:underline">
          Quero me cadastrar
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Acesse a plataforma"
      subtitle="Entre com o e-mail e a senha cadastrados para assistir às lives e gravações."
      footer={
        <>
          Dúvidas sobre o acesso? Veja o{" "}
          <Link href="/passo-a-passo" className="font-semibold text-brand-500 hover:underline">
            passo a passo
          </Link>
          .
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
