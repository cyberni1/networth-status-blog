export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, Eye, PlusCircle, TrendingUp, Users } from "lucide-react";

export default async function AdminDashboard() {

  const [totalPosts, publishedPosts, draftPosts, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, category: true, createdAt: true },
    }),
  ]);

  const stats = [
    { label: "Gesamt Beiträge", value: totalPosts, icon: FileText, color: "text-purple-400" },
    { label: "Veröffentlicht", value: publishedPosts, icon: Eye, color: "text-green-400" },
    { label: "Entwürfe", value: draftPosts, icon: FileText, color: "text-yellow-400" },
  ];

  const categoryLabels: Record<string, string> = {
    KUENSTLER: "Künstler",
    SPORTLER: "Sportler",
    UNTERNEHMER: "Unternehmer",
    INFLUENCER: "Influencer",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">Willkommen zurück</p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Neuer Beitrag
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/50">{stat.label}</p>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Letzte Beiträge</h2>
          <Link href="/admin/posts" className="text-sm text-purple-400 hover:text-purple-300">
            Alle anzeigen →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Noch keine Beiträge. Erstelle deinen ersten!</p>
            <Link href="/admin/posts/new" className="btn-primary mt-4 inline-flex">
              <PlusCircle className="w-4 h-4" />
              Ersten Beitrag erstellen
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${post.status === "PUBLISHED" ? "bg-green-400" : "bg-yellow-400"}`} />
                  <div>
                    <p className="text-sm font-medium text-white/90">{post.title}</p>
                    <p className="text-xs text-white/40">
                      {categoryLabels[post.category]} · {new Date(post.createdAt).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="text-xs text-purple-400 hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-all"
                >
                  Bearbeiten →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
