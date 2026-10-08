"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string, d = 0) => parseInt(str(fd, k), 10) || d;

function revalidateAll() {
  revalidatePath("/", "layout");
}

/* ============================= CATEGORIAS ============================= */

export async function adminSaveCategory(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const order = int(formData, "order");
  if (name.length < 2) return;
  if (id) {
    const current = await db.category.findUnique({ where: { id } });
    if (!current) return;
    await db.category.update({ where: { id }, data: { name, order } });
    if (current.name !== name) {
      await db.user.updateMany({ where: { category: current.name }, data: { category: name } });
    }
  } else if (!(await db.category.findUnique({ where: { name } }))) {
    await db.category.create({ data: { name, order } });
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/usuarios");
}

export async function adminDeleteCategory(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await db.category.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/usuarios");
}

/* ============================= FAQ ============================= */

export async function adminSaveFaq(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const question = str(formData, "question");
  const answer = str(formData, "answer");
  const group = str(formData, "group") || null;
  const order = int(formData, "order");
  if (!question || !answer) return;
  if (id) {
    await db.faqItem.update({ where: { id }, data: { question, answer, group, order } });
  } else {
    await db.faqItem.create({ data: { question, answer, group, order } });
  }
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}

export async function adminDeleteFaq(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await db.faqItem.delete({ where: { id } }).catch(() => {});
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}

/* ============================= PARCEIROS / LOGOS ============================= */

export async function adminSaveSponsor(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const logoUrl = str(formData, "logoUrl");
  if (name.length < 2 || !logoUrl) return;
  const data = {
    name,
    group: str(formData, "group") || "apoio",
    logoUrl,
    url: str(formData, "url") || null,
    order: int(formData, "order"),
    active: formData.get("active") === "on",
  };
  if (id) await db.sponsor.update({ where: { id }, data });
  else await db.sponsor.create({ data });
  revalidateAll();
}

export async function adminDeleteSponsor(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  await db.sponsor.delete({ where: { id } }).catch(() => {});
  revalidateAll();
}

/* ============================= CONTEÚDO / CONFIGURAÇÕES ============================= */

const SETTING_KEYS = [
  "site_name",
  "home_headline",
  "home_about",
  "passo_a_passo",
  "contact_email",
  "notify_email",
  "live_time_default",
  "footer_note",
  "legal_privacy",
  "legal_terms",
  "legal_cookies",
];

export async function adminSaveSettings(formData: FormData) {
  await requireAdmin();
  for (const key of SETTING_KEYS) {
    if (!formData.has(key)) continue;
    const value = String(formData.get(key) ?? "").trim();
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  const auto = formData.get("auto_approve") === "on" ? "1" : "0";
  await db.setting.upsert({ where: { key: "auto_approve" }, update: { value: auto }, create: { key: "auto_approve", value: auto } });
  revalidateAll();
}
