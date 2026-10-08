import { getCurrentUser } from "@/lib/auth";
import { getEditions } from "@/lib/content";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieNotice } from "@/components/cookie-notice";
import { logout } from "./(auth)/actions";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, editions] = await Promise.all([getCurrentUser(), getEditions()]);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <SiteHeader
        user={user ? { name: user.name, isAdmin: user.role === "ADMIN" } : null}
        editions={editions.map((e) => ({ year: e.year, current: e.current }))}
        logoutAction={logout}
      />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
      <CookieNotice />
    </div>
  );
}
