import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { AuthCard } from "@/components/auth-card";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Nova senha" };

export default async function RedefinirSenhaPage({ params }: PageProps<"/redefinir-senha/[token]">) {
  const { token } = await params;
  const row = await db.passwordResetToken.findUnique({ where: { token }, include: { user: { select: { name: true, email: true } } } });
  const valid = !!row && !row.usedAt && row.expiresAt > new Date();

  return (
    <AuthCard
      title="Criar nova senha"
      subtitle={valid ? `Olá, ${row!.user.name.split(" ")[0]}. Escolha a nova senha da conta ${row!.user.email}.` : undefined}
      footer={
        <Link href="/login" className="font-semibold text-brand-500 hover:underline">
          ← Voltar para o login
        </Link>
      }
    >
      {valid ? (
        <ResetForm token={token} />
      ) : (
        <div className="space-y-4 text-center">
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Este link expirou ou já foi utilizado.</p>
          <Link href="/esqueci-senha" className="inline-flex rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-400">
            Solicitar novo link
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
