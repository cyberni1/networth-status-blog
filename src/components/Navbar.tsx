"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(8,8,16,0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px",
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "8px",
              background: "linear-gradient(135deg, #f5c842, #a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px",
            }}>📈</div>
            <span style={{
              fontWeight: 800, fontSize: "14px", letterSpacing: "0.5px",
              background: "linear-gradient(135deg, #f5c842, #c084fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>NETWORTH STATUS</span>
          </Link>

          {/* Desktop: Category links */}
          <div style={{ display: "flex", gap: "2px", alignItems: "center" }} className="desktop-nav">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Link key={key} href={`/?kategorie=${cat.slug}`} style={{
                padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
                color: "rgba(255,255,255,0.55)", textDecoration: "none",
              }}>{cat.label}</Link>
            ))}
          </div>

          {/* Right side: Search + Anmelden + Hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <Link href="/suche" style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", textDecoration: "none", flexShrink: 0 }} aria-label="Suche">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </Link>
            {session ? (
              <>
                <Link href="/admin" style={{
                  padding: "7px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                  background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)",
                  color: "#c084fc", textDecoration: "none", whiteSpace: "nowrap",
                }}>Admin</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} style={{
                  padding: "7px 12px", borderRadius: "8px", fontSize: "13px",
                  background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)", cursor: "pointer", whiteSpace: "nowrap",
                }}>Abmelden</button>
              </>
            ) : (
              <Link href="/auth/signin" style={{
                padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                background: "linear-gradient(135deg, #a855f7, #3b82f6)",
                color: "#fff", textDecoration: "none",
                boxShadow: "0 4px 15px rgba(168,85,247,0.3)", whiteSpace: "nowrap",
              }}>Anmelden</Link>
            )}

            {/* Hamburger for mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: "none", flexDirection: "column", gap: "5px",
                background: "transparent", border: "none", cursor: "pointer", padding: "4px",
              }}
              className="hamburger"
              aria-label="Menü"
            >
              <span style={{ display: "block", width: "22px", height: "2px", background: menuOpen ? "#a855f7" : "rgba(255,255,255,0.6)", borderRadius: "2px", transition: "all 0.2s" }} />
              <span style={{ display: "block", width: "22px", height: "2px", background: menuOpen ? "#a855f7" : "rgba(255,255,255,0.6)", borderRadius: "2px", transition: "all 0.2s" }} />
              <span style={{ display: "block", width: "22px", height: "2px", background: menuOpen ? "#a855f7" : "rgba(255,255,255,0.6)", borderRadius: "2px", transition: "all 0.2s" }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{
            background: "rgba(8,8,16,0.98)", borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "12px 16px 16px",
          }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Link key={key} href={`/?kategorie=${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block", padding: "12px 16px", borderRadius: "10px",
                  fontSize: "15px", fontWeight: 500, color: "rgba(255,255,255,0.7)",
                  textDecoration: "none", marginBottom: "4px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                }}>{cat.label}</Link>
            ))}
          </div>
        )}
      </nav>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
