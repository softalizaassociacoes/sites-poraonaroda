import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProgramView } from "../program-view";

export async function generateMetadata({ params }: PageProps<"/programacao/[year]">): Promise<Metadata> {
  const { year } = await params;
  return { title: /^\d{4}$/.test(year) ? `Programação ${year}` : "Programação" };
}

export default async function ProgramacaoYearPage({ params }: PageProps<"/programacao/[year]">) {
  const { year } = await params;
  if (!/^\d{4}$/.test(year)) {
    // Links antigos do WordPress: /programacao/<slug-da-aula> → sala
    const lecture = await db.lecture.findUnique({ where: { slug: year }, select: { slug: true } });
    if (lecture) redirect(`/sala/${lecture.slug}`);
    notFound();
  }
  const y = parseInt(year, 10);
  const edition = await db.edition.findFirst({ where: { year: y, active: true }, select: { id: true } });
  if (!edition) notFound();
  return <ProgramView year={y} />;
}
