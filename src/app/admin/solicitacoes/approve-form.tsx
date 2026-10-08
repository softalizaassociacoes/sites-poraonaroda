"use client";

import { useActionState } from "react";
import { adminApproveUser } from "../actions/users";
import { Checkbox } from "@/components/ui";

export function ApproveForm({ userId, hasPassword }: { userId: string; hasPassword: boolean }) {
  const [state, action, pending] = useActionState(adminApproveUser, {});
  if (state.success) {
    return <p className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-medium text-brand-900">{state.success}</p>;
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="id" value={userId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:from-brand-600 hover:to-brand-700 disabled:opacity-60"
      >
        {pending ? "Aprovando…" : "Aprovar acesso"}
      </button>
      {hasPassword && (
        <label className="flex items-center gap-2 text-xs text-ink-600">
          <Checkbox name="generate" />
          gerar nova senha e enviar por e-mail
        </label>
      )}
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
