import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashToken } from "@/lib/admin-auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const plainToken = req.nextUrl.searchParams.get("token");

  if (!plainToken) {
    return NextResponse.json({ error: "Token erforderlich" }, { status: 400 });
  }

  const hashedToken = hashToken(plainToken);

  const adminToken = await prisma.adminToken.findUnique({
    where: { token: hashedToken },
  });

  if (!adminToken || !adminToken.active) {
    return NextResponse.json({ error: "Token ung\u00fcltig oder inaktiv" }, { status: 401 });
  }

  if (adminToken.expiresAt && adminToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token ist abgelaufen" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("adminToken", plainToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  await prisma.adminToken.update({
    where: { token: hashedToken },
    data: { lastUsedAt: new Date() },
  });

  return NextResponse.redirect(new URL("/admin", req.url), { status: 302 });
}
