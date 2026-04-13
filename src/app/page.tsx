import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { CATEGORIES } from "@/lib/categories";
import { Category } from "@prisma/client";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ kategorie?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { kategorie } = await searchParams;

  const categoryFilter = kategorie
    ? (Object.entries(CATEGORIES).find(([, v]) => v.slug === kategorie)?.[0] as Category | undefined)
    : undefined;

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      ...(categoryFilter ? { category: categoryFilter } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 10,
    include: { author: { select: { name: true } } },
  });

  return (
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        padding: "80px 20px 60px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow orbs */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "600px", height: "300px",
          background: "radial-gradient(ellipse, rgba(168,85,247,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.25)",
            borderRadius: "100px", padding: "6px 16px", marginBottom: "24px",
            fontSize: "12px", fontWeight: 600, color: "#fde047", letterSpacing: "1px",
          }}>
            💰 DAS VERMÖGEN DER REICHEN &amp; BERÜHMTEN
          </div>

          <h1 style={{ fontSize: "clamp(48px, 10vw, 96px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: "24px" }}>
            <span style={{
              background: "linear-gradient(135deg, #f5c842 0%, #c084fc 55%, #60a5fa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>NETWORTH</span>
            <br />
            <span style={{ color: "#fff" }}>STATUS</span>
          </h1>

          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)", maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.6 }}>
            Entdecke das Nettovermögen von Künstlern, Sportlern,<br />
            Unternehmern und Influencern.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
            {[
              { label: "Artikel", value: posts.length.toString() },
              { label: "Kategorien", value: "4" },
              { label: "Täglich aktuell", value: "✓" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER ── */}
      <section style={{ padding: "0 20px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/" style={{
            padding: "8px 20px", borderRadius: "100px", fontSize: "14px", fontWeight: 600,
            textDecoration: "none", transition: "all 0.2s",
            background: !kategorie ? "linear-gradient(135deg,#a855f7,#3b82f6)" : "rgba(255,255,255,0.05)",
            color: !kategorie ? "#fff" : "rgba(255,255,255,0.5)",
            border: !kategorie ? "none" : "1px solid rgba(255,255,255,0.1)",
            boxShadow: !kategorie ? "0 4px 15px rgba(168,85,247,0.3)" : "none",
          }}>Alle</Link>

          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <Link key={key} href={`/?kategorie=${cat.slug}`} style={{
              padding: "8px 20px", borderRadius: "100px", fontSize: "14px", fontWeight: 600,
              textDecoration: "none", transition: "all 0.2s",
              background: kategorie === cat.slug ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
              color: kategorie === cat.slug ? "#fff" : "rgba(255,255,255,0.5)",
              border: `1px solid ${kategorie === cat.slug ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}`,
            }}>{cat.label}</Link>
          ))}
        </div>
      </section>

      {/* ── POSTS ── */}
      <section style={{ padding: "0 20px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        {posts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
          }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📊</div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
              Noch keine Beiträge
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "32px" }}>
              Die ersten Artikel erscheinen hier sobald sie veröffentlicht werden.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
            {posts.map((post) => {
              const cat = CATEGORIES[post.category as Category];
              return (
                <Link key={post.id} href={`/${post.slug}`} style={{ textDecoration: "none" }}>
                  <article style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px", overflow: "hidden", transition: "all 0.3s", cursor: "pointer",
                    height: "100%",
                  }}>
                    {/* Image */}
                    <div style={{ position: "relative", aspectRatio: "16/9", background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(245,200,66,0.1))", overflow: "hidden" }}>
                      {post.coverImage ? (
                        <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: "cover" }} />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "48px" }}>💎</div>
                      )}
                      {/* Category badge */}
                      <div style={{
                        position: "absolute", bottom: "12px", left: "12px",
                        padding: "4px 12px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
                        letterSpacing: "0.5px",
                        background: cat.badge.includes("kuenstler") ? "rgba(244,114,182,0.2)" :
                          cat.badge.includes("sportler") ? "rgba(74,222,128,0.2)" :
                          cat.badge.includes("unternehmer") ? "rgba(253,224,71,0.2)" :
                          "rgba(165,180,252,0.2)",
                        border: `1px solid ${cat.color}50`,
                        color: cat.color,
                      }}>{cat.label}</div>
                    </div>
                    {/* Content */}
                    <div style={{ padding: "20px" }}>
                      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f0f0ff", lineHeight: 1.4, marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "16px" }}>
                          {post.excerpt}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("de-DE") : ""}
                        </span>
                        <span style={{ fontSize: "12px", color: "#a855f7", fontWeight: 600 }}>Lesen →</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
