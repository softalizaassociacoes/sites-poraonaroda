"use client";

import { useActionState } from "react";
import { adminResetPassword } from "../actions/users";

export function ResetPasswordButton({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(adminResetPassword, {});

  return (
    <div className="flex flex-wrap items-center gap-2">
      {state.success && (
        <span className="flex items-center gap-2">
          <code className="select-all rounded-lg bg-lime-300/60 px-3 py-1.5 font-mono text-sm font-bold text-ink-900 ring-1 ring-lime-500">{state.success}</code>
          <span className="select-none text-xs text-ink-500">copie e envie agora — não será exibida de novo</span>
        </span>
      )}
      {state.error && <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700">{state.error}</span>}
      <form action={action}>
        <input type="hidden" name="id" value={userId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-lime-500 hover:bg-lime-300/40 disabled:opacity-50"
        >
          {pending ? "Gerando…" : "🔑 Gerar nova senha"}
        </button>
      </form>
    </div>
  );
}
