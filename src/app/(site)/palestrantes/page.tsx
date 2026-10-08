import type { Metadata } from "next";
import { getCurrentEdition } from "@/lib/content";
import { SpeakersView } from "./speakers-view";

export const metadata: Metadata = { title: "Palestrantes" };

export default async function PalestrantesPage() {
  const edition = await getCurrentEdition();
  return <SpeakersView year={edition?.year ?? null} />;
}
