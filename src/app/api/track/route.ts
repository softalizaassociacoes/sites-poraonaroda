import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { isBot, parseUserAgent } from "@/lib/analytics";

const COOKIE_NAME = "uc_session";
const VISITOR_COOKIE = "uc_vid";

export async function POST(req: NextRequest) {
  let body: { path?: string; referrer?: string | null } = {};
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "";
  if (!path.startsWith("/")) return new NextResponse(null, { status: 400 });

  const ua = req.headers.get("user-agent") ?? "";
  if (isBot(ua)) return new NextResponse(null, { status: 204 });

  let visitorId = req.cookies.get(VISITOR_COOKIE)?.value;
  const res = new NextResponse(null, { status: 204 });
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
  }

  let userId: string | null = null;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token && process.env.AUTH_SECRET) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      userId = (payload.sub as string) ?? null;
    } catch {
      userId = null;
    }
  }

  let referrer: string | null = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
  let referrerHost: string | null = null;
  if (referrer) {
    try {
      const u = new URL(referrer);
      referrerHost = u.hostname.replace(/^www\./, "");
      if (referrerHost === req.nextUrl.hostname.replace(/^www\./, "")) {
        referrer = null;
        referrerHost = null;
      }
    } catch {
      referrer = null;
    }
  }

  const geoCountry = req.headers.get("x-vercel-ip-country");
  const geoCity = req.headers.get("x-vercel-ip-city");
  const { device, browser, os } = parseUserAgent(ua);

  try {
    await db.pageView.create({
      data: {
        path,
        visitorId,
        userId,
        referrer,
        referrerHost,
        country: geoCountry || null,
        city: geoCity ? decodeURIComponent(geoCity) : null,
        device,
        browser,
        os,
      },
    });
  } catch (e) {
    console.error("track error", e);
  }
  return res;
}
