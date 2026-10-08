import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "uc_session";
const VISITOR_COOKIE = "uc_vid";

// Áreas que exigem login (o restante do site é público)
const PROTECTED = ["/sala", "/quiz", "/credencial", "/conta", "/admin"];
// Páginas só para visitantes (usuário logado é mandado para a home)
const GUEST_ONLY = ["/login", "/cadastro"];

function startsWithAny(pathname: string, list: string[]) {
  return list.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let authenticated = false;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated && startsWithAny(pathname, PROTECTED)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (authenticated && startsWithAny(pathname, GUEST_ONLY)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Caminho atual para os server components (redirect de volta após login)
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-uc-path", pathname + req.nextUrl.search);
  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // Identificador anônimo do visitante (métricas de acesso)
  if (!req.cookies.get(VISITOR_COOKIE)) {
    res.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
  }
  return res;
}

export const config = {
  // Tudo, exceto assets estáticos e internals do Next
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|uploads/|api/track|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|mp4|webm|pdf|txt|xml)$).*)",
  ],
};
