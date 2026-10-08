"use server";

import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAuthEvent, requireAdmin } from "@/lib/auth";
import { mapRows, parseCsv } from "@/lib/csv";
import { importUsers } from "@/lib/import-users";
import { mailConfigured, sendAccountApprovedEmail } from "@/lib/mail";

export type AdminFormState = { error?: string; success?: string };

const STATUSES = ["ACTIVE", "PENDING", "BLOCKED", "REJECTED"] as const;

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[randomInt(alphabet.length)];
  return `uc-${s}`;
}

function revalidateUsers() {
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/solicitacoes");
  revalidatePath("/admin");
}

/* ============================= CRIAR ============================= */

const createUserSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(6, "Senha com pelo menos 6 caracteres"),
  category: z.string().trim().min(1).default("Participante"),
  role: z.enum(["ADMIN", "PARTICIPANT"]).default("PARTICIPANT"),
  institution: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
});

export async function adminCreateUser(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    category: formData.get("category") || "Participante",
    role: formData.get("role") || "PARTICIPANT",
    institution: formData.get("institution") || undefined,
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password, institution, ...rest } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) return { error: "Já existe um usuário com este e-mail." };
  const user = await db.user.create({
    data: {
      ...rest,
      email,
      institution: institution ?? null,
      passwordHash: await bcrypt.hash(password, 10),
      status: "ACTIVE",
      source: "admin",
      approvedAt: new Date(),
    },
  });
  await logAuthEvent("ADMIN_CREATE", { userId: user.id, email });
  revalidateUsers();
  return { success: "Usuário criado." };
}

/* ============================= EDITAR ============================= */

export async function adminUpdateUser(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const name = str("name");
  const email = str("email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = str("role");
  const statusRaw = str("status");
  if (!id || name.length < 2) return;

  const newRole = id === admin.id ? "ADMIN" : role === "ADMIN" ? "ADMIN" : "PARTICIPANT";
  const status = (STATUSES as readonly string[]).includes(statusRaw) && id !== admin.id ? (statusRaw as (typeof STATUSES)[number]) : undefined;

  let emailChange = {};
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    const owner = await db.user.findUnique({ where: { email } });
    if (!owner || owner.id === id) emailChange = { email };
  }
  await db.user.update({
    where: { id },
    data: {
      name,
      ...emailChange,
      category: str("category") || "Participante",
      role: newRole,
      ...(status ? { status, ...(status === "ACTIVE" ? { approvedAt: new Date() } : {}) } : {}),
      institution: str("institution") || null,
      phone: str("phone") || null,
      profession: str("profession") || null,
      cpf: str("cpf") || null,
      city: str("city") || null,
      state: str("state").toUpperCase() || null,
      notes: str("notes") || null,
      ...(password.length >= 6 ? { passwordHash: await bcrypt.hash(password, 10), legacyHash: null } : {}),
    },
  });
  revalidateUsers();
}

/** Gera uma senha temporária, aplica no usuário e devolve para o admin repassar. */
export async function adminResetPassword(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return { error: "Usuário não encontrado." };
  const newPassword = generatePassword();
  await db.user.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10), legacyHash: null },
  });
  await logAuthEvent("ADMIN_RESET", { userId: user.id, email: user.email });
  return { success: newPassword };
}

export async function adminDeleteUser(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  if (!id || id === admin.id) return;
  await db.user.delete({ where: { id } }).catch(() => {});
  revalidateUsers();
}

/* ============================= SOLICITAÇÕES ============================= */

export async function adminApproveUser(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const generate = formData.get("generate") === "on";
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return { error: "Usuário não encontrado." };

  let password: string | undefined;
  if (generate || (!user.passwordHash && !user.legacyHash)) {
    password = generatePassword();
  }
  await db.user.update({
    where: { id },
    data: {
      status: "ACTIVE",
      approvedAt: new Date(),
      ...(password ? { passwordHash: await bcrypt.hash(password, 10), legacyHash: null } : {}),
    },
  });
  await logAuthEvent("APPROVE", { userId: user.id, email: user.email });
  const sent = await sendAccountApprovedEmail(user.email, user.name, { password });
  revalidateUsers();
  if (password) {
    return {
      success: sent
        ? `Aprovado. E-mail enviado com a senha ${password}.`
        : `Aprovado. Senha gerada: ${password} — ${mailConfigured() ? "falha no envio do e-mail, repasse manualmente." : "envie manualmente (e-mail automático não configurado)."}`,
    };
  }
  return {
    success: sent ? "Aprovado. O usuário foi avisado por e-mail." : "Aprovado. Avise o usuário (e-mail automático não configurado).",
  };
}

export async function adminRejectUser(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return;
  await db.user.update({ where: { id }, data: { status: "REJECTED" } });
  await logAuthEvent("REJECT", { userId: user.id, email: user.email });
  revalidateUsers();
}

export async function adminSetAutoApprove(formData: FormData) {
  await requireAdmin();
  const value = formData.get("auto_approve") === "on" ? "1" : "0";
  await db.setting.upsert({ where: { key: "auto_approve" }, update: { value }, create: { key: "auto_approve", value } });
  revalidatePath("/admin/solicitacoes");
  revalidatePath("/admin/conteudo");
}

/* ============================= IMPORTAÇÃO ============================= */

export async function adminImportUsers(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const file = formData.get("file");
  const defaultPassword = String(formData.get("defaultPassword") ?? "").trim();
  const defaultCategory = String(formData.get("defaultCategory") ?? "").trim() || "Participante";
  const defaultStatus = String(formData.get("defaultStatus") ?? "ACTIVE") === "PENDING" ? "PENDING" : "ACTIVE";
  const updateExisting = formData.get("updateExisting") === "on";

  if (!(file instanceof File) || file.size === 0) return { error: "Selecione um arquivo CSV." };
  if (defaultPassword && defaultPassword.length < 6) return { error: "A senha padrão precisa de pelo menos 6 caracteres." };

  const rows = parseCsv(await file.text());
  if (rows.length === 0) return { error: "Arquivo vazio." };
  const { format, users, invalid } = mapRows(rows, { defaultCategory, defaultStatus });
  if (users.length === 0) return { error: `Nenhum usuário válido encontrado (formato detectado: ${format}).` };

  const { created, updated, skipped } = await importUsers(db, users, {
    defaultPassword: defaultPassword || undefined,
    defaultCategory,
    defaultStatus,
    updateExisting,
  });
  await logAuthEvent("IMPORT", { email: `${created} criados` });
  revalidateUsers();
  return {
    success: `Importação (${format}) concluída: ${created} criado(s), ${updated} atualizado(s), ${skipped} já existiam, ${invalid} inválido(s).`,
  };
}
