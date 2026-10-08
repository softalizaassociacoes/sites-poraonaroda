import type { Metadata } from "next";
import { getCurrentEdition } from "@/lib/content";
import { ProgramView } from "./program-view";

export const metadata: Metadata = { title: "Programação" };

export default async function ProgramacaoPage() {
  const edition = await getCurrentEdition();
  return <ProgramView year={edition?.year ?? null} />;
}
