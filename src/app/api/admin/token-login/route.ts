import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken, extractTokenFromPath } from "@/lib/admin-auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

/**
 * GET /api/admin/token-login?token=<token>
 * or from calling middleware with path: /admin/secret-<token>
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token erforderlich" }, { status: 400 });
  }

  const adminToken = await prisma.adminToken.findUnique({
    where: { token: token },
  });

  if (!adminToken || !adminToken.active) {
    return NextResponse.json({ error: "Token ungültig oder inaktiv" }, { status: 401 });
  }

  // Token ist gültig — Cookie setzen
  const cookieStore = await cookies();
  cookieStore.set("adminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 Tage
    path: "/",
  });

  // Update lastUsedAt
  await prisma.adminToken.update({
    where: { token },
    data: { lastUsedAt: new Date() },
  });

  // Redirect zu Admin-Dashboard
  return NextResponse.redirect(new URL("/admin", req.url), { status: 302 });
}
