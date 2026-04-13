"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { CATEGORIES } from "@/lib/categories";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(8,8,16,0.9)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #f5c842, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px",
          }}>📈</div>
          <span style={{
            fontWeight: 800, fontSize: "15px", letterSpacing: "1px",
            background: "linear-gradient(135deg, #f5c842, #c084fc)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>NETWORTH STATUS</span>
        </Link>

        {/* Categories – hidden on very small screens */}
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <Link key={key} href={`/?kategorie=${cat.slug}`} style={{
              padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
              color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "all 0.2s",
            }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "#fff"; (e.target as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.55)"; (e.target as HTMLElement).style.background = "transparent"; }}
            >{cat.label}</Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {session ? (
            <>
              <Link href="/admin" style={{
                padding: "7px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)",
                color: "#c084fc", textDecoration: "none",
              }}>Admin</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} style={{
                padding: "7px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", cursor: "pointer",
              }}>Abmelden</button>
            </>
          ) : (
            <Link href="/auth/signin" style={{
              padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              background: "linear-gradient(135deg, #a855f7, #3b82f6)",
              color: "#fff", textDecoration: "none",
              boxShadow: "0 4px 15px rgba(168,85,247,0.3)",
            }}>Anmelden</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
