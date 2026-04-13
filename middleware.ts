import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Admin routes require authentication
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(signInUrl);
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
