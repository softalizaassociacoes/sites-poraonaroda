import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { CadastroForm } from "./cadastro-form";

export const metadata: Metadata = { title: "Cadastro" };

export default async function CadastroPage() {
  const settings = await getSettings();
  return <CadastroForm autoApprove={settings.auto_approve === "1"} />;
}
