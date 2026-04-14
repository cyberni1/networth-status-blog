import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: "Falsches Passwort" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("adminToken", "pw-auth", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
    path: "/",
  });

  return NextResponse.json({ success: true });
}
