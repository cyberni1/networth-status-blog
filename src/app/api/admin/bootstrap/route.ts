import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateSecureToken, hashToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// One-click admin setup.
//   First time (no admin exists yet): just open /api/admin/bootstrap — no secret needed.
//   After an admin exists: requires /api/admin/bootstrap?secret=<CRON_SECRET>.
// Either way it creates an admin token, logs THIS browser in (cookie) and
// redirects to /chat as admin.
export async function GET(req: NextRequest) {
  const activeAdmins = await prisma.adminToken.count({ where: { active: true } });
  const firstRun = activeAdmins === 0;

  if (!firstRun) {
    const secret = req.nextUrl.searchParams.get("secret");
    const expected = process.env.CRON_SECRET;
    if (!expected || !secret || secret !== expected) {
      return NextResponse.json(
        { error: "Es existiert bereits ein Admin. Aufruf nur mit ?secret=<CRON_SECRET>." },
        { status: 403 },
      );
    }
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

  return NextResponse.redirect(new URL("/chat", req.url), { status: 302 });
}
