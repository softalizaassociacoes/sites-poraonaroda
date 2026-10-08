import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Icon } from "@/components/icons";

const GROUPS: { key: string; label: string }[] = [
  { key: "realizacao", label: "Realização" },
  { key: "apoio", label: "Apoio" },
  { key: "patrocinio", label: "Patrocínio" },
  { key: "gerenciamento", label: "Plataforma" },
];

const SOCIAL: { key: string; icon: string; label: string }[] = [
  { key: "social_facebook", icon: "facebook", label: "Facebook" },
  { key: "social_instagram", icon: "instagram", label: "Instagram" },
  { key: "social_x", icon: "twitter-x", label: "X" },
  { key: "social_youtube", icon: "youtube", label: "YouTube" },
  { key: "social_spotify", icon: "spotify", label: "Spotify" },
  { key: "social_tiktok", icon: "tiktok", label: "TikTok" },
];

export async function SiteFooter() {
  const [sponsors, settings] = await Promise.all([
    db.sponsor.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    getSettings(),
  ]);
  const year = new Date().getFullYear();
  // a "régua" é a faixa única de patrocinadores vinda da arte oficial do festival
  const regua = sponsors.filter((s) => s.group === "regua");
  const social = SOCIAL.filter((s) => settings[s.key]);

  return (
    <footer className="mt-auto border-t border-ink-800 bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <Image src="/logo.png" alt="Porão na Roda" width={794} height={283} className="h-14 w-auto" />
          {social.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {social.map((s) => (
                <a
                  key={s.key}
                  href={settings[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 text-ink-200 transition hover:border-brand-500 hover:bg-brand-500 hover:text-black"
                >
                  <Icon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        {regua.length > 0 && (
          <div className="mt-12 border-t border-ink-800 pt-10">
            {regua.map((s) => (
              // a faixa é preta sobre fundo claro na arte original — invertida aqui
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.id}
                src={s.logoUrl}
                alt={s.name}
                className="mx-auto w-full max-w-5xl object-contain invert"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {sponsors.some((s) => s.group !== "regua") && (
          <div className="mt-10 grid gap-10 border-t border-ink-800 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {GROUPS.map((g) => {
              const items = sponsors.filter((s) => s.group === g.key);
              if (items.length === 0) return null;
              return (
                <div key={g.key}>
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ink-400">{g.label}</p>
                  <div className="flex flex-wrap items-center gap-6">
                    {items.map((s) => {
                      const img = (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.logoUrl}
                          alt={s.name}
                          className="h-12 w-auto max-w-[200px] object-contain invert"
                          loading="lazy"
                        />
                      );
                      return s.url ? (
                        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" title={s.name}>
                          {img}
                        </a>
                      ) : (
                        <span key={s.id}>{img}</span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-ink-800 bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-center text-xs text-ink-400 sm:px-6 md:flex-row md:text-left">
          <div>
            <p className="font-bold uppercase tracking-wide text-ink-200">
              {settings.site_name} © {year} · Todos os direitos reservados
            </p>
            <p className="mt-1 flex flex-wrap justify-center gap-x-2 md:justify-start">
              <Link href="/politica-de-privacidade" className="hover:text-brand-500 hover:underline">
                Política de Privacidade
              </Link>
              <span aria-hidden>·</span>
              <Link href="/politica-de-cookies" className="hover:text-brand-500 hover:underline">
                Política de cookies
              </Link>
              <span aria-hidden>·</span>
              <Link href="/termos-de-uso" className="hover:text-brand-500 hover:underline">
                Termos de Uso
              </Link>
              <span aria-hidden>·</span>
              <a href={`mailto:${settings.contact_email}`} className="hover:text-brand-500 hover:underline">
                {settings.contact_email}
              </a>
            </p>
          </div>
          <a
            href="https://softaliza.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ink-500 transition hover:text-ink-200"
          >
            <span>Plataforma</span>
            <Image src="/softaliza.png" alt="Softaliza" width={278} height={50} className="h-5 w-auto invert" />
          </a>
        </div>
      </div>
    </footer>
  );
}
