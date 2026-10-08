import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { PRIVACY } from "@/content/legal";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default async function Page() {
  const s = await getSettings();
  return <LegalPage title="Política de Privacidade" text={s.legal_privacy || PRIVACY} />;
}
