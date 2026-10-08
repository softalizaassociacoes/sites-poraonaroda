import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import type { ImportedUser } from "@/lib/csv";

export type ImportSummary = { created: number; updated: number; skipped: number };

/**
 * Grava usuários mapeados de um CSV. Compartilhado entre o painel admin e o
 * script de linha de comando (scripts/import-wp-users.ts).
 */
export async function importUsers(
  db: PrismaClient,
  users: ImportedUser[],
  opts: { defaultPassword?: string; defaultCategory: string; defaultStatus: "ACTIVE" | "PENDING"; updateExisting: boolean }
): Promise<ImportSummary> {
  let created = 0,
    updated = 0,
    skipped = 0;

  for (const u of users) {
    const exists = await db.user.findUnique({ where: { email: u.email } });
    const profile = {
      institution: u.institution ?? undefined,
      phone: u.phone,
      cpf: u.cpf,
      city: u.city,
      state: u.state,
      profession: u.profession,
    };
    if (exists) {
      if (!opts.updateExisting) {
        skipped++;
        continue;
      }
      await db.user.update({
        where: { id: exists.id },
        data: {
          name: u.name || exists.name,
          ...Object.fromEntries(Object.entries(profile).filter(([, v]) => v !== undefined)),
          ...(u.legacyHash && !exists.passwordHash ? { legacyHash: u.legacyHash } : {}),
          ...(u.wpId ? { wpId: u.wpId } : {}),
        },
      });
      updated++;
      continue;
    }
    const status = u.status ?? opts.defaultStatus;
    const password = u.password ?? (opts.defaultPassword || null);
    await db.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash: password ? await bcrypt.hash(password, 10) : null,
        legacyHash: u.legacyHash ?? null,
        role: u.role ?? "PARTICIPANT",
        status,
        category: u.category ?? opts.defaultCategory,
        ...profile,
        wpId: u.wpId ?? null,
        source: u.source,
        createdAt: u.createdAt ?? undefined,
        approvedAt: status === "ACTIVE" ? (u.createdAt ?? new Date()) : null,
      },
    });
    created++;
  }
  return { created, updated, skipped };
}
