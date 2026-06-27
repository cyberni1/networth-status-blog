import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateSecureToken, hashToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// One-click admin setup. Open once in your browser:
//   /api/admin/bootstrap?secret=<CRON_SECRET>
// It creates a fresh admin token, logs THIS browser in (cookie) and sends you
// to /chat as admin. Gated by CRON_SECRET so only the site owner can use it.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET ist nicht gesetzt." }, { status: 500 });
  }
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: "Falsches oder fehlendes secret." }, { status: 403 });
  }

  const plainToken = generateSecureToken();
  await prisma.adminToken.create({ data: { token: hashToken(plainToken), active: true } });

  const cookieStore = await cookies();
  cookieStore.set("adminToken", plainToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  // Land directly in the chat as admin.
  return NextResponse.redirect(new URL("/chat", req.url), { status: 302 });
}
