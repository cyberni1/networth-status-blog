import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signOut } from "@/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("adminToken");

  // Auch NextAuth-Session clearen
  await signOut({ redirectTo: "/" });

  return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "https://promivermögen.com"), { status: 302 });
}
