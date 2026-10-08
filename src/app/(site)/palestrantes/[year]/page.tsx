import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SpeakersView } from "../speakers-view";

export async function generateMetadata({ params }: PageProps<"/palestrantes/[year]">): Promise<Metadata> {
  const { year } = await params;
  return { title: `Palestrantes ${year}` };
}

export default async function PalestrantesYearPage({ params }: PageProps<"/palestrantes/[year]">) {
  const { year } = await params;
  if (!/^\d{4}$/.test(year)) notFound();
  const y = parseInt(year, 10);
  const edition = await db.edition.findFirst({ where: { year: y, active: true }, select: { id: true } });
  if (!edition) notFound();
  return <SpeakersView year={y} />;
}
