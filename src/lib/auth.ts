import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";
import { db } from "@/lib/db";

export const COOKIE_NAME = "uc_session";
export const VISITOR_COOKIE = "uc_vid";
const SESSION_DAYS = 30;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurado");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string; // user id
  name: string;
  role: "ADMIN" | "PARTICIPANT";
};

export async function createSession(user: {
  id: string;
  name: string;
  role: "ADMIN" | "PARTICIPANT";
}) {
  const token = await new SignJWT({ name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: payload.sub as string,
      name: payload.name as string,
      role: payload.role as SessionPayload["role"],
    };
  } catch {
    return null;
  }
});

/** Usuário logado (do banco) ou null — para páginas públicas. */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.sub } });
  if (!user || user.status !== "ACTIVE") return null;
  return user;
});

/** Usuário completo (do banco). Redireciona para /login se não autenticado. */
export const requireUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    const h = await headers();
    const next = h.get("x-uc-path");
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
});

/** Exige papel ADMIN (verificado no banco, não só no token). */
export const requireAdmin = cache(async () => {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
});

export async function getClientIp() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    null
  );
}

export async function logAuthEvent(
  type: string,
  data: { userId?: string | null; email?: string | null }
) {
  try {
    await db.authEvent.create({
      data: {
        type,
        userId: data.userId ?? null,
        email: data.email ?? null,
        ip: await getClientIp(),
      },
    });
  } catch {
    // métricas nunca devem quebrar o fluxo principal
  }
}
