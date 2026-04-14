import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashToken, extractTokenFromPath } from "@/lib/admin-auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

/**
 * GET /api/admin/token-login?token=<token>
 * or from calling middleware with path: /admin/secret-<token>
 *
 * FIX: Hashes the plaintext token from URL before DB lookup
 * because tokens are stored as SHA-256 hashes in the database
 */
export async function GET(req: NextRequest) {
  const plainToken = req.nextUrl.searchParams.get("token");

  if (!plainToken) {
    return NextResponse.json({ error: "Token erforderlich" }, { status: 400 });
  }

  // Hash the plaintext token before searching the database
  const hashedToken = hashToken(plainToken);

  const adminToken = await prisma.adminToken.findUnique({
    where: { token: hashedToken },
  });

  if (!adminToken || !adminToken.active) {
    return NextResponse.json({ error: "Token ungültig oder inaktiv" }, { status: 401 });
  }

  // Check if token has expired
  if (adminToken.expiresAt && adminToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token ist abgelaufen" }, { status: 401 });
  }

  // Token ist gültig — Cookie setzen (speichere den plaintext token im Cookie)
  const cookieStore = await cookies();
  cookieStore.set("adminToken", plainToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 Tage
    path: "/",
  });

  // Update lastUsedAt
  await prisma.adminToken.update({
    where: { token: hashedToken },
    data: { lastUsedAt: new Date() },
  });

  // Redirect zu Admin-Dashboard
  return NextResponse.redirect(new URL("/admin", req.url), { status: 302 });
}
