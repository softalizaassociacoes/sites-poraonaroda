import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/mail";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const editions = await db.edition.findMany({ where: { active: true } });
  const fixed = ["", "/programacao", "/palestrantes", "/passo-a-passo", "/faq", "/cadastro", "/login", "/politica-de-privacidade", "/politica-de-cookies", "/termos-de-uso"];
  return [
    ...fixed.map((p) => ({ url: `${base}${p}`, lastModified: new Date() })),
    ...editions.flatMap((e) => [
      { url: `${base}/programacao/${e.year}`, lastModified: new Date() },
      { url: `${base}/palestrantes/${e.year}`, lastModified: new Date() },
    ]),
  ];
}
