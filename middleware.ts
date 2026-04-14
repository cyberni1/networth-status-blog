import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Admin routes: allow NextAuth session OR admin token from cookie
  if (pathname.startsWith("/admin")) {
    const hasSession = !!req.auth;
    const adminToken = req.cookies.get("adminToken")?.value;

    // Allow if either authenticated or has valid token
    if (!hasSession && !adminToken) {
      // Redirect to 404 (don't reveal admin exists)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (assets)
     * - favicon.ico
     * - public files (uploads, images)
     * - auth routes
     * - api/auth routes
     * - sitemap, robots
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads/|auth/|api/auth/|sitemap|robots).*)",
  ],
};
