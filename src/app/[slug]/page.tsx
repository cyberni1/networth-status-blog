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

  let faqs: { question: string; answer: string }[] = [];
  if (post.faq) {
    try { faqs = JSON.parse(post.faq); } catch { faqs = []; }
  }

  const personName = post.title
    .replace(/nettovermögen|vermögen|wie reich ist|was verdient|einkommen/gi, "")
    .replace(/[?!.,]/g, "")
    .trim();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    image: post.coverImage ? `${SITE_URL}${post.coverImage}` : `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&category=${post.category}`,
    author: { "@type": "Person", name: post.author?.name ?? "Networth Status" },
    publisher: { "@type": "Organization", name: "Networth Status", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: postUrl,
    keywords: post.keywords ?? undefined,
    articleSection: cat.label,
    inLanguage: "de",
    timeRequired: `PT${readingTime}M`,
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: personName,
    description: post.excerpt ?? undefined,
    url: postUrl,
  };

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: cat.label, item: `${SITE_URL}/?kategorie=${cat.slug}` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  const related = await prisma.post.findMany({
    where: { status: "PUBLISHED", category: post.category, NOT: { id: post.id } },
    take: 3,
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, slug: true, coverImage: true, excerpt: true, publishedAt: true, category: true },
  });

  return (
    <>
      <style>{`
        .related-grid { grid-template-columns: 1fr; }
        @media (min-width: 640px) { .related-grid { grid-template-columns: repeat(3, 1fr); } }
        .post-article { padding: 24px 16px 48px; }
        @media (min-width: 640px) { .post-article { padding: 40px 24px 64px; } }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <div style={{ background: "#080810", minHeight: "100vh" }}>
        <Navbar />

        <main id="main-content" tabIndex={-1}>
        <article className="post-article" style={{ maxWidth: "800px", margin: "0 auto" }}>

          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "24px", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Startseite</Link>
            <span>/</span>
            <Link href={`/?kategorie=${cat.slug}`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{cat.label}</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{post.title}</span>
          </nav>

          {/* Header */}
          <header style={{ marginBottom: "28px" }}>
            {/* Meta row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <CategoryBadge category={post.category as Category} />
              {post.publishedAt && (
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: "4px" }}>
                  📅 {new Date(post.publishedAt).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: "4px" }}>
                📖 {readingTime} Min. Lesezeit
              </span>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: "clamp(26px, 6vw, 44px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: "16px", letterSpacing: "-0.5px" }}>
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p style={{ fontSize: "clamp(15px, 3vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                {post.excerpt}
              </p>
            )}

            {/* Author + Share */}
            {post.author && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {post.author.image ? (
                    <Image src={post.author.image} alt={post.author.name ?? ""} width={32} height={32} style={{ borderRadius: "50%" }} />
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>👤</div>
                  )}
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{post.author.name}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Autor</p>
                  </div>
                </div>
                <ShareButtons url={postUrl} title={post.title} />
              </div>
            )}
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <figure style={{ margin: "0 0 32px" }}>
              <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: "16px", overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
                <Image
                  src={post.coverImage}
                  alt={post.coverImageAlt ?? `Titelbild: ${post.title}`}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
              {post.coverImageAlt && (
                <figcaption style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "8px" }}>
                  {post.coverImageAlt}
                </figcaption>
              )}
            </figure>
          )}

          {/* Content */}
          <div className="prose-wealth" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* FAQ */}
          {faqs.length > 0 && <FaqSection faqs={faqs} />}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>🏷</span>
                {post.tags.map((tag) => (
                  <span key={tag} style={{ padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 500, background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.25)" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom nav */}
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
              ← Zurück zur Übersicht
            </Link>
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </article>

        </main>

        {/* Related Posts */}
        {related.length > 0 && (
          <section style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px 60px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
              Weitere {cat.label}-Beiträge
            </h2>
            <div className="related-grid" style={{ display: "grid", gap: "12px" }}>
              {related.map((rp) => {
                const rCat = CATEGORIES[rp.category as Category];
                return (
                  <Link key={rp.id} href={`/${rp.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
                      <div style={{ position: "relative", aspectRatio: "16/9", background: "linear-gradient(135deg,rgba(168,85,247,0.15),rgba(245,200,66,0.08))" }}>
                        {rp.coverImage ? (
                          <Image src={rp.coverImage} alt={rp.title} fill style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "32px" }}>💎</div>
                        )}
                      </div>
                      <div style={{ padding: "12px" }}>
                        <h3 style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{rp.title}</h3>
                        {rp.publishedAt && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>{new Date(rp.publishedAt).toLocaleDateString("de-DE")}</p>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer role="contentinfo" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 16px", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", maxWidth: "700px", margin: "0 auto", lineHeight: 1.6 }}>
            © {new Date().getFullYear()} Networth Status &nbsp;·&nbsp;
            <strong style={{ color: "rgba(255,255,255,0.4)" }}>Alle Vermögensangaben sind Schätzungen</strong> basierend auf öffentlichen Quellen (Forbes, Bloomberg, Unternehmensberichte). Keine Anlageberatung.
          </p>
        </footer>
      </div>
    </>
  );
}
