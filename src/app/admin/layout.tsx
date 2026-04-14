import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, PlusCircle, TrendingUp, LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Note: Admin access now supports both NextAuth session AND token-based auth
  // Middleware handles token validation, so no redirect needed here

  const navItems = [
    { href: "/admin", icon: "📊", label: "Dashboard" },
    { href: "/admin/posts", icon: "📝", label: "Alle Beiträge" },
    { href: "/admin/posts/new", icon: "➕", label: "Neuer Beitrag" },
  ];

  return (
    <>
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", flexDirection: "column" }}>
        {/* Top bar (mobile + desktop) */}
        <header style={{
          background: "rgba(8,8,16,0.95)", borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: "8px", height: "52px", overflowX: "auto" }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", marginRight: "16px", flexShrink: 0 }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#f5c842,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>📈</div>
              <span style={{ fontWeight: 800, fontSize: "13px", background: "linear-gradient(135deg,#f5c842,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", whiteSpace: "nowrap" }}>Admin</span>
            </Link>

            {/* Nav items */}
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 14px", borderRadius: "8px", whiteSpace: "nowrap",
                fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.65)",
                textDecoration: "none", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)", flexShrink: 0,
              }}>
                <span>{item.icon}</span> {item.label}
              </Link>
            ))}

            <div style={{ flex: 1 }} />

            {/* User */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              {session?.user?.image && (
                <img src={session.user.image} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%" }} />
              )}
              <form action="/api/admin/logout" method="POST" style={{ margin: 0 }}>
                <button type="submit" style={{
                  padding: "6px 12px", borderRadius: "8px", fontSize: "12px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)", cursor: "pointer", whiteSpace: "nowrap",
                }}>Abmelden</button>
              </form>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </>
  );
}
