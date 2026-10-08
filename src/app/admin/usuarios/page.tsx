import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { clsx } from "clsx";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { dateBr, dateTimeBr, initials } from "@/lib/format";
import { adminDeleteUser, adminUpdateUser } from "../actions/users";
import { Badge, Button, Input, Select, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";
import { CreateUserForm, ImportUsersForm } from "./user-forms";
import { ResetPasswordButton } from "./reset-password";

export const metadata: Metadata = { title: "Usuários | Admin" };

const PAGE_SIZE = 50;
const STATUS_LABEL: Record<string, string> = { ACTIVE: "Ativo", PENDING: "Pendente", BLOCKED: "Bloqueado", REJECTED: "Recusado" };

export default async function AdminUsuariosPage({ searchParams }: PageProps<"/admin/usuarios">) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" && sp.status in STATUS_LABEL ? sp.status : "";
  const role = sp.role === "ADMIN" ? "ADMIN" : "";
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);

  const where: Prisma.UserWhereInput = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { institution: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { cpf: { contains: query.replace(/\D/g, "") || query } },
          ],
        }
      : {}),
    ...(status ? { status: status as Prisma.UserWhereInput["status"] } : {}),
    ...(role ? { role: "ADMIN" } : {}),
  };

  const [users, total, filtered, categoryRows, counts] = await Promise.all([
    db.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.user.count(),
    db.user.count({ where }),
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.user.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const categories = categoryRows.map((c) => c.name);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const pages = Math.max(1, Math.ceil(filtered / PAGE_SIZE));
  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (status) p.set("status", status);
    if (role) p.set("role", role);
    for (const [k, v] of Object.entries(extra)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const s = p.toString();
    return `/admin/usuarios${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl text-ink-900">
            Usuários <span className="text-lg text-ink-400">({total})</span>
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            {countOf("ACTIVE")} ativos · {countOf("PENDING")} pendentes · {countOf("BLOCKED")} bloqueados · {countOf("REJECTED")} recusados
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/admin/usuarios/export"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 transition hover:border-brand-300"
          >
            <Icon name="download" size={16} />
            Exportar CSV
          </a>
        </div>
      </div>

      <form className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-ink-100 bg-white p-3 shadow-card">
        <div className="min-w-56 flex-1">
          <Input type="search" name="q" defaultValue={query} placeholder="Buscar nome, e-mail, cidade, telefone…" />
        </div>
        <Select name="status" defaultValue={status} className="w-40">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Select name="role" defaultValue={role} className="w-40">
          <option value="">Todos os papéis</option>
          <option value="ADMIN">Somente admins</option>
        </Select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        {(query || status || role) && (
          <Link href="/admin/usuarios" className="text-sm font-semibold text-ink-500 hover:text-ink-900">
            Limpar
          </Link>
        )}
      </form>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <details className="rounded-2xl border border-ink-100 bg-white shadow-card">
          <summary className="flex cursor-pointer items-center gap-2 px-6 py-4 text-sm font-bold text-ink-900 transition hover:text-brand-700">
            <Icon name="user-plus" size={16} className="text-brand-600" /> Adicionar usuário
          </summary>
          <div className="border-t border-ink-100 px-6 py-4">
            <CreateUserForm categories={categories} />
          </div>
        </details>
        <details className="rounded-2xl border border-ink-100 bg-white shadow-card">
          <summary className="flex cursor-pointer items-center gap-2 px-6 py-4 text-sm font-bold text-ink-900 transition hover:text-brand-700">
            <Icon name="upload" size={16} className="text-brand-600" /> Importar usuários (CSV / exportação do WordPress)
          </summary>
          <div className="border-t border-ink-100 px-6 py-4">
            <ImportUsersForm categories={categories} />
          </div>
        </details>
      </div>

      <p className="mt-6 text-sm text-ink-500">
        {filtered} resultado(s){pages > 1 ? ` · página ${page} de ${pages}` : ""}
      </p>

      <div className="mt-2 space-y-3">
        {users.map((u) => {
          const hasPassword = !!(u.passwordHash || u.legacyHash);
          return (
            <div key={u.id} className={clsx("rounded-2xl border bg-white p-4 shadow-card transition hover:border-ink-200", u.status === "PENDING" ? "border-lime-300" : "border-ink-100")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white">
                  {initials(u.name)}
                </span>
                <p className="font-semibold text-ink-900">{u.name}</p>
                <Badge color={u.role === "ADMIN" ? "gold" : "green"}>{u.role === "ADMIN" ? "Admin" : u.category}</Badge>
                <Badge color={u.status === "ACTIVE" ? "green" : u.status === "PENDING" ? "gold" : "red"}>{STATUS_LABEL[u.status]}</Badge>
                {u.legacyHash && !u.passwordHash && <Badge color="sand">senha do WordPress</Badge>}
                {!hasPassword && <Badge color="red">sem senha</Badge>}
                <span className="text-sm text-ink-500">{u.email}</span>
                {u.institution && <span className="text-xs text-ink-400">· {u.institution}</span>}
                <span className="ml-auto text-xs text-ink-400">
                  cadastro {dateBr(u.createdAt)}
                  {u.lastLoginAt && ` · último acesso ${dateTimeBr(u.lastLoginAt)}`}
                  {u.source && ` · ${u.source}`}
                </span>
              </div>

              <details className="mt-3 border-t border-ink-50 pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-brand-700 hover:underline">Editar dados / ficha completa</summary>
                <form action={adminUpdateUser} className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-6">
                  <input type="hidden" name="id" value={u.id} />
                  <Input name="name" defaultValue={u.name} aria-label="Nome" className="col-span-2" />
                  <Input name="email" type="email" defaultValue={u.email} aria-label="E-mail" className="col-span-2" />
                  <Input name="institution" defaultValue={u.institution ?? ""} placeholder="Banda / projeto" aria-label="Banda, projeto ou empresa" className="col-span-2" />
                  <Select name="category" defaultValue={u.category} aria-label="Categoria">
                    {!categories.includes(u.category) && <option value={u.category}>{u.category}</option>}
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                  <Select name="role" defaultValue={u.role} aria-label="Papel" disabled={u.id === me.id}>
                    <option value="PARTICIPANT">Participante</option>
                    <option value="ADMIN">Admin</option>
                  </Select>
                  <Select name="status" defaultValue={u.status} aria-label="Status" disabled={u.id === me.id}>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                  <Input name="phone" defaultValue={u.phone ?? ""} placeholder="Telefone" aria-label="Telefone" />
                  <Input name="profession" defaultValue={u.profession ?? ""} placeholder="Atuação no mercado" aria-label="Atuação" className="col-span-2" />
                  <Input name="city" defaultValue={u.city ?? ""} placeholder="Cidade" aria-label="Cidade" />
                  <Input name="state" defaultValue={u.state ?? ""} placeholder="UF" aria-label="UF" maxLength={2} />
                  <Input name="cpf" defaultValue={u.cpf ?? ""} placeholder="CPF" aria-label="CPF" className="col-span-2" />
                  <Input name="password" type="password" placeholder="Nova senha (opcional)" aria-label="Nova senha" autoComplete="new-password" className="col-span-2" />
                  <Textarea name="notes" defaultValue={u.notes ?? ""} placeholder="Observações internas" rows={1} aria-label="Observações" className="col-span-2 md:col-span-4" />
                  <div className="col-span-2 flex gap-2">
                    <Button type="submit" className="flex-1">
                      Salvar
                    </Button>
                  </div>
                </form>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <ResetPasswordButton userId={u.id} />
                  {u.id !== me.id && (
                    <form action={adminDeleteUser}>
                      <input type="hidden" name="id" value={u.id} />
                      <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline">
                        Excluir usuário
                      </button>
                    </form>
                  )}
                </div>
              </details>
            </div>
          );
        })}
        {users.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-ink-500 shadow-card">Nenhum usuário encontrado.</p>}
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={qs({ page: String(page - 1) })} className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold">
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-ink-500">
            {page} / {pages}
          </span>
          {page < pages && (
            <Link href={qs({ page: String(page + 1) })} className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold">
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
