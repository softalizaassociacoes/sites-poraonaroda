"use client";

import { useActionState } from "react";
import { resetPassword } from "../../actions";
import { Button, FormError, FormSuccess, Input, Label } from "@/components/ui";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">Nova senha</Label>
        <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
      </div>
      <div>
        <Label htmlFor="confirm">Confirmar nova senha</Label>
        <Input id="confirm" name="confirm" type="password" required minLength={6} autoComplete="new-password" />
      </div>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />
      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? "Salvando…" : "Salvar nova senha e entrar"}
      </Button>
    </form>
  );
}
