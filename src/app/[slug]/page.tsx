import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CategoryBadge from "@/components/CategoryBadge";
import ShareButtons from "@/components/ShareButtons";
import FaqSection from "@/components/FaqSection";
import { CATEGORIES } from "@/lib/categories";
import { Category } from "@prisma/client";
import { Clock, ArrowLeft, User, Tag, BookOpen } from "lucide-react";

const SITE_URL = "https://networth-status-blog.vercel.app";

interface Props {
  params: Promise<{ slug: string }>;
}

function getReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
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
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&category=${post.category}`;
  const imageUrl = post.coverImage ? `${SITE_URL}${post.coverImage}` : ogImageUrl;

  return {
    title,
    description,
    keywords: post.keywords ?? undefined,
    alternates: { canonical: `${SITE_URL}/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE_URL}/${slug}`,
      images: [
        { url: ogImageUrl, width: 1200, height: 630, alt: title },
        ...(post.coverImage ? [{ url: imageUrl, width: 1200, height: 630, alt: post.coverImageAlt ?? title }] : []),
      ],
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
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
  const readingTime = getReadingTime(post.content);
  const postUrl = `${SITE_URL}/${slug}`;

  // Parse FAQ
  let faqs: { question: string; answer: string }[] = [];
  if (post.faq) {
    try { faqs = JSON.parse(post.faq); } catch { faqs = []; }
  }

  // Extract person name from title for Person schema
  // Assumes title format like "Max Mustermann Nettovermögen" or "Wie reich ist Max Mustermann?"
  const personName = post.title
    .replace(/nettovermögen|vermögen|wie reich ist|was verdient|einkommen/gi, "")
    .replace(/[?!.,]/g, "")
    .trim();

  // JSON-LD: Article
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    image: post.coverImage ? `${SITE_URL}${post.coverImage}` : `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&category=${post.category}`,
    author: {
      "@type": "Person",
      name: post.author?.name ?? "Networth Status",
    },
    publisher: {
      "@type": "Organization",
      name: "Networth Status",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: postUrl,
    keywords: post.keywords ?? undefined,
    articleSection: cat.label,
    inLanguage: "de",
    timeRequired: `PT${readingTime}M`,
  };

  // JSON-LD: Person (the celebrity)
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: personName,
    description: post.excerpt ?? undefined,
    url: postUrl,
  };

  // JSON-LD: FAQ
  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  // JSON-LD: Breadcrumb
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: cat.label, item: `${SITE_URL}/?kategorie=${cat.slug}` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <div className="hero-bg min-h-screen">
        <Navbar />

        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/30 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Startseite</Link>
            <span>/</span>
            <Link href={`/?kategorie=${cat.slug}`} className="hover:text-white transition-colors">{cat.label}</Link>
            <span>/</span>
            <span className="text-white/60 truncate max-w-xs">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <CategoryBadge category={post.category as Category} />
              {post.publishedAt && (
                <span className="text-sm text-white/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(post.publishedAt).toLocaleDateString("de-DE", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              )}
              <span className="text-sm text-white/30 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {readingTime} Min. Lesezeit
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-white/50 leading-relaxed">{post.excerpt}</p>
            )}

            {/* Author */}
            {post.author && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  {post.author.image ? (
                    <Image src={post.author.image} alt={post.author.name ?? ""} width={36} height={36} className="rounded-full" />
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
                <ShareButtons url={postUrl} title={post.title} />
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
          <div className="prose-wealth" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* FAQ Section */}
          {faqs.length > 0 && <FaqSection faqs={faqs} />}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-white/30" />
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-400 border border-purple-500/20">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Share */}
          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
            <Link href="/" className="btn-ghost inline-flex">
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Übersicht
            </Link>
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </article>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-20">
            <h2 className="text-xl font-bold text-white mb-6">Weitere {cat.label}-Beiträge</h2>
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
                    <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors line-clamp-2">{rp.title}</h3>
                    {rp.publishedAt && (
                      <p className="text-xs text-white/30 mt-2">{new Date(rp.publishedAt).toLocaleDateString("de-DE")}</p>
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
