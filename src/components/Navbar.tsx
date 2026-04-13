"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { TrendingUp, LayoutDashboard, LogOut, User } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f5c842, #a855f7)" }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg wealth-gradient">NETWORTH STATUS</span>
          </Link>

          {/* Categories */}
          <div className="hidden md:flex items-center gap-1">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Link
                key={key}
                href={`/kategorie/${cat.slug}`}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link href="/admin" className="btn-ghost text-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-ghost text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Abmelden</span>
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className="btn-primary text-sm">
                <User className="w-4 h-4" />
                Anmelden
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
