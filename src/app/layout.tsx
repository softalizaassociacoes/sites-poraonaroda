import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Track } from "@/components/track";
import { siteUrl } from "@/lib/mail";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Porão na Roda",
    template: "%s | Porão na Roda",
  },
  description:
    "Porão na Roda: ciclo formativo gratuito do Festival Porão do Rock sobre carreira, mercado e produção musical, com aulas ao vivo e grandes nomes do setor.",
  metadataBase: new URL(siteUrl()),
  openGraph: {
    title: "Porão na Roda",
    description:
      "Ciclo formativo gratuito do Festival Porão do Rock. Aulas ao vivo sobre carreira, mercado e produção musical.",
    locale: "pt_BR",
    type: "website",
    images: ["/uploads/2022/02/e32qsmslxyo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ink-950 text-ink-50">
        {children}
        <Track />
      </body>
    </html>
  );
}
