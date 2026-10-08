import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

/** Compatibilidade com o link /logout do site antigo. */
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
