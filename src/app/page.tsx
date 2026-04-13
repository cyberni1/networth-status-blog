import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import CategoryBadge from "@/components/CategoryBadge";
import { CATEGORIES } from "@/lib/categories";
import { Category } from "@prisma/client";
import { TrendingUp, ArrowRight, Clock, Eye } from "lucide-react";

interface HomePageProps {
  searchParams: Promise<{ kategorie?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { kategorie } = await searchParams;

  // Map slug to enum
  const categoryFilter = kategorie
    ? Object.entries(CATEGORIES).find(([, v]) => v.slug === kategorie)?.[0] as Category | undefined
    : undefined;

  const [featuredPost, posts] = await Promise.all([
    // Featured: most recent published post
    prisma.post.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { author: { select: { name: true } } },
    }),
    // Latest 10 (or filtered)
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        ...(categoryFilter ? { category: categoryFilter } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 10,
      include: { author: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="hero-bg min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: "radial-gradient(circle, #f5c842, transparent)" }} />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-semibold text-yellow-400 mb-6 border border-yellow-400/20">
            <TrendingUp className="w-3.5 h-3.5" />
            Das Vermögen der Reichen & Berühmten
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="wealth-gradient">NETWORTH</span>
            <br />
            <span className="text-white">STATUS</span>
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Entdecke das Nettovermögen von Künstlern, Sportlern, Unternehmern und Influencern.
            Aktuelle Zahlen, Hintergründe und Analysen.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !kategorie
                  ? "bg-purple-500/30 text-purple-300 border border-purple-500/30"
                  : "glass text-white/50 hover:text-white"
              }`}
            >
              Alle
            </Link>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Link
                key={key}
                href={`/?kategorie=${cat.slug}`}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  kategorie === cat.slug
                    ? `${cat.badge} border`
                    : "glass text-white/50 hover:text-white"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {!categoryFilter && featuredPost && (
        <section className="px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <Link href={`/${featuredPost.slug}`} className="block group">
              <div className="glass-card overflow-hidden hover:border-purple-500/30">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="relative aspect-video md:aspect-auto bg-gradient-to-br from-purple-900/40 to-yellow-900/20">
                    {featuredPost.coverImage ? (
                      <Image
                        src={featuredPost.coverImage}
                        alt={featuredPost.coverImageAlt ?? featuredPost.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TrendingUp className="w-20 h-20 text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
                  </div>

                  {/* Content */}
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <CategoryBadge category={featuredPost.category as Category} />
                      <span className="text-xs text-white/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {featuredPost.publishedAt
                          ? new Date(featuredPost.publishedAt).toLocaleDateString("de-DE", {
                              day: "numeric", month: "long", year: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:wealth-gradient transition-all line-clamp-3">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.excerpt && (
                      <p className="text-white/50 mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm group-hover:gap-3 transition-all">
                      Vollständigen Artikel lesen
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {categoryFilter && (
            <h2 className="text-2xl font-bold text-white mb-8">
              {CATEGORIES[categoryFilter].label}
            </h2>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 text-lg">
                Noch keine Beiträge in dieser Kategorie.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  return (
    <Link href={`/${post.slug}`} className="block group">
      <article className="glass-card overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-video bg-gradient-to-br from-purple-900/30 to-black overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt ?? post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center wealth-gradient-bg">
              <TrendingUp className="w-12 h-12 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <CategoryBadge category={post.category as Category} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h2 className="text-base font-bold text-white/90 group-hover:text-white mb-2 line-clamp-2 transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm text-white/40 line-clamp-2 flex-1 mb-4">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
            <span className="text-xs text-white/30 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("de-DE")
                : ""}
            </span>
            <span className="text-xs text-purple-400 group-hover:text-purple-300 flex items-center gap-1 transition-colors">
              Lesen <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
