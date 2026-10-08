import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { COOKIES } from "@/content/legal";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Política de Cookies" };

export default async function Page() {
  const s = await getSettings();
  return <LegalPage title="Política de Cookies" text={s.legal_cookies || COOKIES} />;
}
