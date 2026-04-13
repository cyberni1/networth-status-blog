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
    take: 20,
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <style>{`
        .posts-grid { grid-template-columns: 1fr; }
        .hero-h1 { font-size: 52px; }
        .hero-desc br { display: none; }
        .stats-row { gap: 24px; }
        .cat-pills { -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .cat-pills::-webkit-scrollbar { display: none; }
        @media (min-width: 480px) { .posts-grid { grid-template-columns: repeat(2, 1fr); } .hero-h1 { font-size: 64px; } }
        @media (min-width: 860px) { .posts-grid { grid-template-columns: repeat(3, 1fr); } .hero-h1 { font-size: 88px; } .hero-desc br { display: inline; } .stats-row { gap: 48px; } }
      `}</style>

      <div style={{ background: "#080810", minHeight: "100vh" }}>
        <Navbar />

        {/* ── HERO ── */}
        <section style={{ padding: "clamp(40px,8vw,80px) 16px clamp(32px,6vw,60px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(168,85,247,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: "860px", margin: "0 auto" }}>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.25)", borderRadius: "100px", padding: "6px 16px", marginBottom: "20px", fontSize: "11px", fontWeight: 700, color: "#fde047", letterSpacing: "1.5px" }}>
              💰 VERMÖGEN DER REICHEN &amp; BERÜHMTEN
            </div>

            <h1 className="hero-h1" style={{ fontWeight: 900, lineHeight: 1.0, letterSpacing: "-2px", marginBottom: "20px" }}>
              <span style={{ background: "linear-gradient(135deg, #f5c842 0%, #c084fc 55%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>NETWORTH</span>
              <br />
              <span style={{ color: "#fff" }}>STATUS</span>
            </h1>

            <p className="hero-desc" style={{ fontSize: "clamp(14px,3.5vw,18px)", color: "rgba(255,255,255,0.5)", maxWidth: "520px", margin: "0 auto 32px", lineHeight: 1.6 }}>
              Entdecke das Nettovermögen von Künstlern, Sportlern,<br />
              Unternehmern und Influencern.
            </p>

            {/* Search bar in hero */}
            <Link href="/suche" style={{ display: "block", maxWidth: "460px", margin: "0 auto 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "50px", padding: "12px 20px", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>Name suchen, z.B. Cristiano Ronaldo...</span>
              </div>
            </Link>

            <div className="stats-row" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { label: "Artikel", value: posts.length.toString() },
                { label: "Kategorien", value: "4" },
                { label: "Täglich aktuell", value: "✓" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(22px,5vw,30px)", fontWeight: 800, color: "#fff" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORY FILTER ── */}
        <section style={{ padding: "0 16px 28px", maxWidth: "1200px", margin: "0 auto" }}>
          <div className="cat-pills" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            <Link href="/" style={{ padding: "8px 18px", borderRadius: "100px", fontSize: "13px", fontWeight: 600, textDecoration: "none", flexShrink: 0, background: !kategorie ? "linear-gradient(135deg,#a855f7,#3b82f6)" : "rgba(255,255,255,0.05)", color: !kategorie ? "#fff" : "rgba(255,255,255,0.5)", border: !kategorie ? "none" : "1px solid rgba(255,255,255,0.1)", boxShadow: !kategorie ? "0 4px 15px rgba(168,85,247,0.3)" : "none" }}>Alle</Link>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Link key={key} href={`/?kategorie=${cat.slug}`} style={{ padding: "8px 18px", borderRadius: "100px", fontSize: "13px", fontWeight: 600, textDecoration: "none", flexShrink: 0, background: kategorie === cat.slug ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)", color: kategorie === cat.slug ? "#fff" : "rgba(255,255,255,0.5)", border: `1px solid ${kategorie === cat.slug ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}` }}>{cat.label}</Link>
            ))}
          </div>
        </section>

        {/* ── POSTS GRID ── */}
        <section style={{ padding: "0 16px 60px", maxWidth: "1200px", margin: "0 auto" }}>
          {posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>📊</div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Noch keine Beiträge</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>Die ersten Artikel erscheinen hier sobald sie veröffentlicht werden.</p>
            </div>
          ) : (
            <div className="posts-grid" style={{ display: "grid", gap: "16px" }}>
              {posts.map((post) => {
                const cat = CATEGORIES[post.category as Category];
                return (
                  <Link key={post.id} href={`/${post.slug}`} style={{ textDecoration: "none" }}>
                    <article style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden", height: "100%" }}>
                      <div style={{ position: "relative", aspectRatio: "16/9", background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(245,200,66,0.1))", overflow: "hidden" }}>
                        {post.coverImage ? (
                          <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "40px" }}>💎</div>
                        )}
                        <div style={{ position: "absolute", bottom: "10px", left: "10px", padding: "3px 10px", borderRadius: "100px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", background: cat.badge.includes("kuenstler") ? "rgba(244,114,182,0.2)" : cat.badge.includes("sportler") ? "rgba(74,222,128,0.2)" : cat.badge.includes("unternehmer") ? "rgba(253,224,71,0.2)" : "rgba(165,180,252,0.2)", border: `1px solid ${cat.color}50`, color: cat.color }}>{cat.label}</div>
                      </div>
                      <div style={{ padding: "16px" }}>
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#f0f0ff", lineHeight: 1.4, marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.title}</h2>
                        {post.excerpt && (
                          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "12px" }}>{post.excerpt}</p>
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("de-DE") : ""}</span>
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

        {/* ── SEO TEXT SECTION ── */}
        <section style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "clamp(40px,6vw,64px) 16px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(20px,4vw,28px)", fontWeight: 800, color: "#fff", marginBottom: "16px", background: "linear-gradient(135deg,#f5c842,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Das Nettovermögen berühmter Persönlichkeiten — alles auf einem Blick
            </h2>
            <p style={{ fontSize: "clamp(14px,2.5vw,16px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: "20px" }}>
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>Networth Status</strong> ist die führende deutschsprachige Quelle für fundierte Vermögensschätzungen und Einkommensanalysen von Prominenten. Ob Musiker, Fußballstar, Tech-Unternehmer oder Social-Media-Influencer — wir recherchieren sorgfältig und stellen dir die aktuellsten Informationen zu den Vermögen der bekanntesten Persönlichkeiten zur Verfügung.
            </p>
            <p style={{ fontSize: "clamp(14px,2.5vw,16px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: "28px" }}>
              Wie reich ist <strong style={{ color: "rgba(255,255,255,0.8)" }}>Cristiano Ronaldo</strong>? Was verdient <strong style={{ color: "rgba(255,255,255,0.8)" }}>Elon Musk</strong> wirklich? Wie hoch ist das <strong style={{ color: "rgba(255,255,255,0.8)" }}>Nettovermögen von Taylor Swift</strong>? Diese und viele weitere Fragen beantworten wir mit detaillierten Hintergrundartikeln zu Karriere, Einkommensquellen und Vermögensschätzungen.
            </p>

            {/* Category boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <Link key={key} href={`/?kategorie=${cat.slug}`} style={{ textDecoration: "none", padding: "16px", background: "rgba(255,255,255,0.03)", border: `1px solid ${cat.color}30`, borderRadius: "12px", display: "block" }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>
                    {key === "KUENSTLER" ? "🎵" : key === "SPORTLER" ? "⚽" : key === "UNTERNEHMER" ? "💼" : "📱"}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: cat.color, marginBottom: "4px" }}>{cat.label}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    {key === "KUENSTLER" ? "Musiker, Schauspieler, Sänger" : key === "SPORTLER" ? "Fußball, Tennis, Formel 1" : key === "UNTERNEHMER" ? "Start-ups, Milliardäre" : "YouTube, Instagram, TikTok"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 16px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} Networth Status · Alle Angaben sind Schätzungen und dienen zu Informationszwecken.</p>
        </footer>
      </div>
    </>
  );
}
