import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CategoryBadge from "@/components/CategoryBadge";
import { CATEGORIES } from "@/lib/categories";
import { Category } from "@prisma/client";
import { Clock, ArrowLeft, User, Tag } from "lucide-react";

const SITE_URL = "https://networth-status-blog.vercel.app";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { name: true } } },
  });

  if (!post) return { title: "Nicht gefunden" };

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || "";
  const imageUrl = post.coverImage
    ? `${SITE_URL}${post.coverImage}`
    : `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    keywords: post.keywords ?? undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}/${slug}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.coverImageAlt ?? title }],
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { name: true, image: true } } },
  });

  if (!post) notFound();

  const cat = CATEGORIES[post.category as Category];

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    image: post.coverImage ? `${SITE_URL}${post.coverImage}` : undefined,
    author: {
      "@type": "Person",
      name: post.author?.name ?? "Networth Status",
    },
    publisher: {
      "@type": "Organization",
      name: "Networth Status",
      url: SITE_URL,
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: `${SITE_URL}/${slug}`,
    keywords: post.keywords ?? undefined,
    articleSection: cat.label,
    inLanguage: "de",
  };

  // Related posts
  const related = await prisma.post.findMany({
    where: { status: "PUBLISHED", category: post.category, NOT: { id: post.id } },
    take: 3,
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, slug: true, coverImage: true, excerpt: true, publishedAt: true, category: true },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="hero-bg min-h-screen">
        <Navbar />

        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/30 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Startseite</Link>
            <span>/</span>
            <Link href={`/?kategorie=${cat.slug}`} className="hover:text-white transition-colors">
              {cat.label}
            </Link>
            <span>/</span>
            <span className="text-white/60 truncate max-w-xs">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <CategoryBadge category={post.category as Category} />
              {post.publishedAt && (
                <span className="text-sm text-white/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(post.publishedAt).toLocaleDateString("de-DE", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-white/50 leading-relaxed">{post.excerpt}</p>
            )}

            {/* Author */}
            {post.author && (
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name ?? ""}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-purple-500/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white/80">{post.author.name}</p>
                  <p className="text-xs text-white/30">Autor</p>
                </div>
              </div>
            )}
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 glass">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt ?? post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose-wealth"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-white/30" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-400 border border-purple-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-12">
            <Link href="/" className="btn-ghost inline-flex">
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Übersicht
            </Link>
          </div>
        </article>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-20">
            <h2 className="text-xl font-bold text-white mb-6">
              Weitere {cat.label}-Beiträge
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map((rp) => (
                <Link key={rp.id} href={`/${rp.slug}`} className="glass-card overflow-hidden group block">
                  <div className="relative aspect-video bg-black overflow-hidden">
                    {rp.coverImage ? (
                      <Image src={rp.coverImage} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 wealth-gradient-bg" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors line-clamp-2">
                      {rp.title}
                    </h3>
                    {rp.publishedAt && (
                      <p className="text-xs text-white/30 mt-2">
                        {new Date(rp.publishedAt).toLocaleDateString("de-DE")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
