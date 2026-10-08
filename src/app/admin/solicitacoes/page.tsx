import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { mailConfigured } from "@/lib/mail";
import { dateTimeBr, initials } from "@/lib/format";
import { adminDeleteUser, adminRejectUser, adminSetAutoApprove } from "../actions/users";
import { Badge, Checkbox } from "@/components/ui";
import { Icon } from "@/components/icons";
import { ApproveForm } from "./approve-form";

export const metadata: Metadata = { title: "Solicitações de cadastro | Admin" };

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</dt>
      <dd className="text-sm text-ink-800">{value}</dd>
    </div>
  );
}

export default async function AdminSolicitacoesPage() {
  const [pending, recent, settings] = await Promise.all([
    db.user.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
    db.user.findMany({
      where: { status: { in: ["ACTIVE", "REJECTED"] }, source: { in: ["site", "forminator"] } },
      orderBy: { updatedAt: "desc" },
      take: 15,
      select: { id: true, name: true, email: true, status: true, approvedAt: true, updatedAt: true },
    }),
    getSettings(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl text-ink-900">
            Solicitações de cadastro <span className="text-lg text-ink-400">({pending.length})</span>
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Quem preencheu “Não tenho login e quero me cadastrar”. Aprove para liberar o acesso às salas.
          </p>
        </div>
        <form action={adminSetAutoApprove} className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-card">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-800">
            <Checkbox name="auto_approve" defaultChecked={settings.auto_approve === "1"} />
            Aprovar cadastros automaticamente
          </label>
          <button type="submit" className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white">
            Salvar
          </button>
        </form>
      </div>

      {!mailConfigured() && (
        <p className="mt-4 rounded-xl border border-lime-400 bg-lime-300/30 px-4 py-3 text-sm text-ink-800">
          <strong>E-mail automático não configurado.</strong> Ao aprovar, avise a pessoa manualmente (a senha gerada aparece na tela). Para ativar o envio,
          defina SENDGRID_API_KEY e MAIL_FROM nas variáveis de ambiente.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {pending.map((u) => (
          <article key={u.id} className="rounded-2xl border border-lime-300 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                {initials(u.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink-900">{u.name}</p>
                <p className="text-sm text-ink-600">
                  {u.email}
                  {u.phone ? ` · ${u.phone}` : ""}
                </p>
              </div>
              <Badge color="gold">Pendente</Badge>
              <span className="text-xs text-ink-400">
                solicitado em {dateTimeBr(u.createdAt)}
                {u.source ? ` · ${u.source}` : ""}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
              <Field label="Telefone" value={u.phone} />
              <Field label="Cidade" value={[u.city, u.state].filter(Boolean).join("/")} />
              <Field label="Atuação" value={u.profession} />
              <Field label="Banda / projeto" value={u.institution} />
              <Field label="Senha definida" value={u.passwordHash || u.legacyHash ? "sim (escolhida no cadastro)" : "não — será gerada"} />
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-4">
              <ApproveForm userId={u.id} hasPassword={!!(u.passwordHash || u.legacyHash)} />
              <form action={adminRejectUser}>
                <input type="hidden" name="id" value={u.id} />
                <button type="submit" className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:border-red-300 hover:text-red-700">
                  Recusar
                </button>
              </form>
              <form action={adminDeleteUser} className="ml-auto">
                <input type="hidden" name="id" value={u.id} />
                <button type="submit" className="text-xs font-medium text-red-500 hover:underline">
                  Excluir solicitação
                </button>
              </form>
            </div>
          </article>
        ))}
        {pending.length === 0 && (
          <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center shadow-card">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Icon name="check" size={26} strokeWidth={2.2} />
            </span>
            <p className="mt-3 font-semibold text-ink-900">Nenhuma solicitação pendente</p>
            <p className="text-sm text-ink-500">Novos pedidos de cadastro aparecerão aqui.</p>
          </div>
        )}
      </div>

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl text-ink-900">Últimas decisões</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <tbody>
                {recent.map((u) => (
                  <tr key={u.id} className="border-b border-ink-50 last:border-0">
                    <td className="px-5 py-2.5">
                      <p className="font-medium text-ink-900">{u.name}</p>
                      <p className="text-xs text-ink-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-2.5">
                      <Badge color={u.status === "ACTIVE" ? "green" : "red"}>{u.status === "ACTIVE" ? "Aprovado" : "Recusado"}</Badge>
                    </td>
                    <td className="px-5 py-2.5 text-right text-xs text-ink-500">{dateTimeBr(u.approvedAt ?? u.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
