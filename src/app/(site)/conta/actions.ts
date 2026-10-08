"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, createSession } from "@/lib/auth";
import { verifyLegacyHash } from "@/lib/phpass";

export type ContaFormState = { error?: string; success?: string };

const profileSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo"),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().max(80).optional(),
  state: z.string().trim().max(2).optional(),
  profession: z.string().trim().max(80).optional(),
  institution: z.string().trim().max(120).optional(),
  cpf: z.string().trim().max(20).optional(),
});

export async function updateProfile(_prev: ContaFormState, formData: FormData): Promise<ContaFormState> {
  const user = await requireUser();
  const get = (k: string) => (formData.get(k) as string | null) || undefined;
  const parsed = profileSchema.safeParse({
    name: get("name"),
    phone: get("phone"),
    city: get("city"),
    state: get("state"),
    profession: get("profession"),
    institution: get("institution"),
    cpf: get("cpf"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      phone: d.phone ?? null,
      city: d.city ?? null,
      state: d.state ? d.state.toUpperCase() : null,
      profession: d.profession ?? null,
      institution: d.institution ?? null,
      cpf: d.cpf ?? null,
    },
  });
  await createSession(updated);
  revalidatePath("/conta");
  return { success: "Dados atualizados com sucesso." };
}

const passwordSchema = z.object({
  current: z.string().optional(),
  password: z.string().min(6, "A nova senha precisa de pelo menos 6 caracteres"),
  confirm: z.string(),
});

export async function updatePassword(_prev: ContaFormState, formData: FormData): Promise<ContaFormState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current") ?? undefined,
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { current, password, confirm } = parsed.data;
  if (password !== confirm) return { error: "As senhas não conferem." };

  const hasPassword = !!(user.passwordHash || user.legacyHash);
  if (hasPassword) {
    if (!current) return { error: "Informe a senha atual." };
    let ok = user.passwordHash ? await bcrypt.compare(current, user.passwordHash) : false;
    if (!ok && user.legacyHash) ok = await verifyLegacyHash(current, user.legacyHash);
    if (!ok) return { error: "Senha atual incorreta." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, 10), legacyHash: null },
  });
  return { success: "Senha alterada com sucesso." };
}
