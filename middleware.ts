import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes: require token-based authentication
  if (pathname.startsWith("/admin")) {
    const adminToken = req.cookies.get("adminToken")?.value;

    if (!adminToken) {
      // Return 404 (don't reveal admin exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/|auth/|api/auth/|sitemap|robots).*)",
  ],
};
