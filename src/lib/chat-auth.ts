import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/admin-auth";

// Returns true if the current request carries a valid, active admin session cookie.
// The admin (on Windows 11) gets device-routing + speaker-management powers.
export async function isAdminRequest(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const plain = cookieStore.get("adminToken")?.value;
    if (!plain) return false;

    const token = await prisma.adminToken.findUnique({ where: { token: hashToken(plain) } });
    if (!token || !token.active) return false;
    if (token.expiresAt && token.expiresAt < new Date()) return false;
    return true;
  } catch {
    return false;
  }
}
