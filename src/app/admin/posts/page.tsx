export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Edit, Eye, FileText } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { Category } from "@prisma/client";
import DeletePostButton from "./DeletePostButton";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Alle Beitr\u00e4ge</h1>
          <p className="text-white/50 text-sm mt-1">{posts.length} Beitrag{posts.length !== 1 ? "e" : ""} insgesamt</p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Neuer Beitrag
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg mb-6">Noch keine Beitr\u00e4ge vorhanden</p>
          <Link href="/admin/posts/new" className="btn-primary">
            <PlusCircle className="w-4 h-4" />
            Ersten Beitrag erstellen
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Titel</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Kategorie</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Datum</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map((post) => {
                const cat = CATEGORIES[post.category as Category];
                return (
                  <tr key={post.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">/{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cat.badge}`}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        post.status === "PUBLISHED" ? "text-green-400" : "text-yellow-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          post.status === "PUBLISHED" ? "bg-green-400" : "bg-yellow-400"
                        }`} />
                        {post.status === "PUBLISHED" ? "Ver\u00f6ffentlicht" : "Entwurf"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/40">
                      {new Date(post.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === "PUBLISHED" && (
                          <Link href={`/${post.slug}`} target="_blank" className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all" title="Anzeigen">
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        <Link href={`/admin/posts/${post.id}`} className="p-1.5 rounded-lg text-white/40 hover:text-purple-400 hover:bg-purple-500/10 transition-all" title="Bearbeiten">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeletePostButton postId={post.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
