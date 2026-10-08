import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { dateTimeBr } from "@/lib/format";

/** Exporta todos os usuários em CSV (somente admin). */
export async function GET() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") return new NextResponse("Não autorizado", { status: 403 });

  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  const rows: (string | null | undefined)[][] = [
    ["nome", "email", "status", "papel", "categoria", "telefone", "cidade", "uf", "atuacao", "banda_projeto", "cpf", "origem", "cadastro", "ultimo_acesso", "aprovado_em"],
    ...users.map((u) => [
      u.name,
      u.email,
      u.status,
      u.role,
      u.category,
      u.phone,
      u.city,
      u.state,
      u.profession,
      u.institution,
      u.cpf,
      u.source,
      dateTimeBr(u.createdAt),
      dateTimeBr(u.lastLoginAt),
      dateTimeBr(u.approvedAt),
    ]),
  ];
  const csv = toCsv(rows);
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="usuarios-poraonaroda-${date}.csv"`,
    },
  });
}
