"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, logAuthEvent } from "@/lib/auth";
import { verifyLegacyHash } from "@/lib/phpass";
import { getSettings } from "@/lib/settings";
import {
  mailConfigured,
  parseRecipients,
  sendAdminNewRegistrationEmail,
  sendPasswordResetEmail,
  sendRegistrationReceivedEmail,
  sendWelcomeEmail,
  siteUrl,
} from "@/lib/mail";

export type AuthFormState = { error?: string; success?: string };

const PENDING_MSG =
  "Seu cadastro ainda está em análise pela organização. Você receberá um e-mail assim que o acesso for aprovado.";

/* ============================= LOGIN ============================= */

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    await logAuthEvent("LOGIN_FAIL", { email });
    return { error: "E-mail ou senha incorretos." };
  }

  let ok = false;
  if (user.passwordHash) {
    ok = await bcrypt.compare(password, user.passwordHash);
  }
  if (!ok && user.legacyHash) {
    ok = await verifyLegacyHash(password, user.legacyHash);
    if (ok) {
      // migra a senha do WordPress para bcrypt
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(password, 10), legacyHash: null },
      });
    }
  }
  if (!ok) {
    await logAuthEvent("LOGIN_FAIL", { userId: user.id, email });
    if (!user.passwordHash && !user.legacyHash) {
      return {
        error:
          "Sua conta ainda não tem senha definida. Use “Esqueci minha senha” para criar uma.",
      };
    }
    return { error: "E-mail ou senha incorretos." };
  }

  if (user.status === "PENDING") return { error: PENDING_MSG };
  if (user.status === "REJECTED") {
    return { error: "Sua solicitação de cadastro não foi aprovada. Em caso de dúvida, fale com a organização." };
  }
  if (user.status === "BLOCKED") {
    return { error: "Este acesso está bloqueado. Entre em contato com a organização." };
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await logAuthEvent("LOGIN", { userId: user.id, email });
  await createSession(user);

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

/* ============================= CADASTRO ============================= */

const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Informe seu nome").max(60),
  lastName: z.string().trim().min(2, "Informe seu sobrenome").max(80),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  phone: z.string().trim().min(8, "Informe o telefone").max(30),
  // opcionais — ajudam na organização e no certificado
  city: z.string().trim().max(80).optional(),
  state: z.string().trim().max(2).optional(),
  profession: z.string().trim().max(80).optional(),
  institution: z.string().trim().max(120).optional(),
  password: z.string().min(6, "A senha precisa de pelo menos 6 caracteres"),
  confirm: z.string(),
  terms: z.literal("on", { message: "É preciso aceitar os Termos de Uso e a Política de Privacidade" }),
});

export async function register(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : undefined;
  };
  const parsed = registerSchema.safeParse({
    firstName: get("firstName"),
    lastName: get("lastName"),
    email: get("email"),
    phone: get("phone"),
    city: get("city") || undefined,
    state: get("state") || undefined,
    profession: get("profession") || undefined,
    institution: get("institution") || undefined,
    password: get("password"),
    confirm: get("confirm"),
    terms: get("terms"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.password !== d.confirm) return { error: "As senhas não conferem." };
  const name = `${d.firstName} ${d.lastName}`.replace(/\s+/g, " ").trim();

  const existing = await db.user.findUnique({ where: { email: d.email } });
  if (existing) {
    if (existing.status === "PENDING") {
      return { error: "Já existe uma solicitação de cadastro em análise para este e-mail." };
    }
    return { error: "Já existe uma conta com este e-mail. Faça login ou recupere a senha." };
  }

  const settings = await getSettings();
  const autoApprove = settings.auto_approve === "1";

  const user = await db.user.create({
    data: {
      name,
      email: d.email,
      passwordHash: await bcrypt.hash(d.password, 10),
      role: "PARTICIPANT",
      status: autoApprove ? "ACTIVE" : "PENDING",
      category: "Participante",
      phone: d.phone,
      city: d.city ?? null,
      state: d.state ? d.state.toUpperCase() : null,
      profession: d.profession ?? null,
      institution: d.institution ?? null,
      source: "site",
      approvedAt: autoApprove ? new Date() : null,
    },
  });
  await logAuthEvent("REGISTER", { userId: user.id, email: user.email });

  // notificações (não bloqueiam o fluxo)
  const notify = parseRecipients(settings.notify_email || settings.contact_email);
  await Promise.allSettled([
    autoApprove ? sendWelcomeEmail(user.email, user.name) : sendRegistrationReceivedEmail(user.email, user.name),
    notify.length ? sendAdminNewRegistrationEmail(notify, user, { autoApproved: autoApprove }) : Promise.resolve(false),
  ]);

  if (autoApprove) {
    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await logAuthEvent("LOGIN", { userId: user.id, email: user.email });
    await createSession(user);
    redirect("/");
  }
  redirect("/cadastro/enviado");
}

/* ============================= ESQUECI A SENHA ============================= */

export async function forgotPassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Informe um e-mail válido." };

  const settings = await getSettings();
  if (!mailConfigured()) {
    return {
      error: `O envio automático de e-mails ainda não está ativo. Escreva para ${settings.contact_email} para redefinir sua senha.`,
    };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (user && user.status !== "REJECTED" && user.status !== "BLOCKED") {
    const token = randomBytes(32).toString("hex");
    await db.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    await logAuthEvent("RESET_REQUEST", { userId: user.id, email });
    await sendPasswordResetEmail(user.email, user.name, `${siteUrl()}/redefinir-senha/${token}`);
  }
  return {
    success:
      "Se este e-mail estiver cadastrado, você receberá em instantes um link para criar uma nova senha. Verifique também a caixa de spam.",
  };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6, "A senha precisa de pelo menos 6 caracteres"),
  confirm: z.string(),
});

export async function resetPassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { token, password, confirm } = parsed.data;
  if (password !== confirm) return { error: "As senhas não conferem." };

  const row = await db.passwordResetToken.findUnique({ where: { token }, include: { user: true } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { error: "Este link expirou ou já foi utilizado. Solicite uma nova redefinição." };
  }
  await db.$transaction([
    db.user.update({
      where: { id: row.userId },
      data: { passwordHash: await bcrypt.hash(password, 10), legacyHash: null, lastLoginAt: new Date() },
    }),
    db.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
  await logAuthEvent("RESET_DONE", { userId: row.userId, email: row.user.email });
  if (row.user.status === "ACTIVE") {
    await createSession(row.user);
    redirect("/");
  }
  return { success: "Senha redefinida. Assim que seu cadastro for aprovado você poderá entrar." };
}
