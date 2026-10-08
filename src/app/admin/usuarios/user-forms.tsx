"use client";

import { useActionState } from "react";
import { adminCreateUser, adminImportUsers } from "../actions/users";
import { Button, Checkbox, FormError, FormSuccess, Input, Label, Select } from "@/components/ui";

export function CreateUserForm({ categories }: { categories: string[] }) {
  const [state, action, pending] = useActionState(adminCreateUser, {});

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <Label htmlFor="cu-name">Nome</Label>
        <Input id="cu-name" name="name" required />
      </div>
      <div>
        <Label htmlFor="cu-email">E-mail</Label>
        <Input id="cu-email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="cu-password">Senha</Label>
        <Input id="cu-password" name="password" required minLength={6} />
      </div>
      <div>
        <Label htmlFor="cu-institution">Banda, projeto ou empresa (opcional)</Label>
        <Input id="cu-institution" name="institution" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="cu-category">Categoria</Label>
          <Select id="cu-category" name="category" defaultValue="Participante">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="cu-role">Papel</Label>
          <Select id="cu-role" name="role" defaultValue="PARTICIPANT">
            <option value="PARTICIPANT">Participante</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="cu-phone">Telefone (opcional)</Label>
        <Input id="cu-phone" name="phone" />
      </div>
      <div className="sm:col-span-2">
        <FormError message={state.error} />
        <FormSuccess message={state.success} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Criando…" : "Criar usuário"}
        </Button>
      </div>
    </form>
  );
}

export function ImportUsersForm({ categories }: { categories: string[] }) {
  const [state, action, pending] = useActionState(adminImportUsers, {});

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1 text-sm text-ink-600">
        <p>Formatos aceitos (detectados automaticamente pelo cabeçalho):</p>
        <ul className="list-disc space-y-0.5 pl-5 text-xs">
          <li>
            <strong>Simples:</strong> <code className="rounded bg-ink-800 px-1">nome; email; senha; categoria; banda; telefone; cidade; uf</code> (tudo além de nome e e-mail é opcional)
          </li>
          <li>
            <strong>Exportação do WordPress</strong> (plugin Import/Export Users): mantém a senha original de cada usuário (
            <code className="rounded bg-ink-100 px-1">user_pass</code>), papel e data de cadastro.
          </li>
          <li>
            <strong>Formulário “Não tenho login e quero me cadastrar”</strong> (exportação do Forminator): entra como solicitação pendente com a ficha completa.
          </li>
        </ul>
      </div>
      <div>
        <Label htmlFor="iu-file">Arquivo CSV</Label>
        <input
          id="iu-file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="iu-pass">Senha padrão (opcional)</Label>
          <Input id="iu-pass" name="defaultPassword" minLength={6} placeholder="para quem não tiver senha" />
        </div>
        <div>
          <Label htmlFor="iu-cat">Categoria padrão</Label>
          <Select id="iu-cat" name="defaultCategory" defaultValue="Participante">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="iu-status">Status padrão</Label>
          <Select id="iu-status" name="defaultStatus" defaultValue="ACTIVE">
            <option value="ACTIVE">Ativo (pode entrar)</option>
            <option value="PENDING">Pendente (aguarda aprovação)</option>
          </Select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-700">
        <Checkbox name="updateExisting" />
        Atualizar dados de usuários que já existem (em vez de pular)
      </label>
      <p className="text-xs text-ink-500">
        Quem for importado sem senha pode usar “Esqueci minha senha” (se o e-mail estiver configurado) ou receber uma senha gerada pelo admin.
      </p>
      <FormError message={state.error} />
      <FormSuccess message={state.success} />
      <Button type="submit" disabled={pending}>
        {pending ? "Importando…" : "Importar usuários"}
      </Button>
    </form>
  );
}
