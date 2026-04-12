export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - auth routes (sign-in, error pages)
     * - api/auth (NextAuth endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/|api/auth/).*)",
  ],
};
