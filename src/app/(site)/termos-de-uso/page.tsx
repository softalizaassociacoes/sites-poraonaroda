import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { TERMS } from "@/content/legal";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Termos de Uso" };

export default async function Page() {
  const s = await getSettings();
  return <LegalPage title="Termos de Uso" text={s.legal_terms || TERMS} />;
}
