"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPassword } from "../actions";
import { AuthCard } from "@/components/auth-card";
import { Button, FormError, FormSuccess, Input, Label } from "@/components/ui";

export default function EsqueciSenhaPage() {
  const [state, action, pending] = useActionState(forgotPassword, {});

  return (
    <AuthCard
      title="Redefinir senha"
      subtitle="Digite o e-mail cadastrado. Enviaremos um link para você criar uma nova senha."
      footer={
        <Link href="/login" className="font-semibold text-brand-500 hover:underline">
          ← Voltar para o login
        </Link>
      }
    >
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@exemplo.com" />
        </div>
        <FormError message={state.error} />
        <FormSuccess message={state.success} />
        <Button type="submit" disabled={pending || !!state.success} className="w-full" size="lg">
          {pending ? "Enviando…" : "Enviar link de redefinição"}
        </Button>
      </form>
    </AuthCard>
  );
}
