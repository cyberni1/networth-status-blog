import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, PlusCircle, TrendingUp, Settings } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="min-h-screen flex hero-bg">
      {/* Sidebar */}
      <aside className="w-64 glass-nav border-r border-white/5 flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f5c842, #a855f7)" }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold wealth-gradient">Admin</span>
          </Link>

          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/admin/posts" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
              <FileText className="w-4 h-4" />
              Alle Beiträge
            </Link>
            <Link href="/admin/posts/new" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
              <PlusCircle className="w-4 h-4" />
              Neuer Beitrag
            </Link>
          </nav>
        </div>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            {session.user?.image ? (
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center">
                <Settings className="w-4 h-4 text-purple-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80 truncate">{session.user?.name}</p>
              <p className="text-xs text-white/40 truncate">{session.user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
