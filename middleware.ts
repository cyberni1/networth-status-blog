import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes: require authentication (skip login page itself)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = req.cookies.get("adminToken")?.value;

    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/|auth/|api/auth/|sitemap|robots).*)",
  ],
};
