"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const errors: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign-in link is no longer valid.",
  Default: "An error occurred during sign in.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";
  const message = errors[error] ?? errors.Default;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-nav p-8 rounded-2xl text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Authentication Error</h1>
        <p className="text-white/70 mb-6">{message}</p>
        <Link href="/auth/signin" className="luxury-btn inline-block py-2 px-6">
          Try Again
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
