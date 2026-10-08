"use client";

import { useActionState } from "react";
import { updatePassword, updateProfile } from "./actions";
import { Button, FormError, FormSuccess, Input, Label } from "@/components/ui";

export function ProfileForm({
  user,
}: {
  user: {
    name: string;
    email: string;
    institution: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    profession: string | null;
    cpf: string | null;
  };
}) {
  const [state, action, pending] = useActionState(updateProfile, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" name="name" defaultValue={user.name} required />
      </div>
      <div>
        <Label>E-mail (login)</Label>
        <Input value={user.email} disabled />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="institution">Banda, projeto ou empresa</Label>
          <Input id="institution" name="institution" defaultValue={user.institution ?? ""} />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" defaultValue={user.city ?? ""} />
        </div>
        <div>
          <Label htmlFor="state">UF</Label>
          <Input id="state" name="state" maxLength={2} defaultValue={user.state ?? ""} />
        </div>
        <div>
          <Label htmlFor="profession">Atuação no mercado</Label>
          <Input id="profession" name="profession" defaultValue={user.profession ?? ""} />
        </div>
        <div>
          <Label htmlFor="cpf">CPF (para o certificado)</Label>
          <Input id="cpf" name="cpf" inputMode="numeric" defaultValue={user.cpf ?? ""} />
        </div>
      </div>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Salvar dados"}
      </Button>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState(updatePassword, {});
  return (
    <form action={action} className="space-y-4">
      {hasPassword ? (
        <div>
          <Label htmlFor="current">Senha atual</Label>
          <Input id="current" name="current" type="password" required autoComplete="current-password" />
        </div>
      ) : (
        <p className="rounded-xl bg-ink-900 px-3.5 py-2.5 text-sm text-ink-200">Sua conta ainda não tem senha definida. Crie uma abaixo.</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="password">Nova senha</Label>
          <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirmar</Label>
          <Input id="confirm" name="confirm" type="password" required minLength={6} autoComplete="new-password" />
        </div>
      </div>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />
      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Alterando…" : "Alterar senha"}
      </Button>
    </form>
  );
}
