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

        <main id="main-content" tabIndex={-1}>

        {/* ── HERO ── */}
        <section aria-labelledby="hero-heading" style={{ padding: "clamp(40px,8vw,80px) 16px clamp(32px,6vw,60px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(168,85,247,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: "860px", margin: "0 auto" }}>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.25)", borderRadius: "100px", padding: "6px 16px", marginBottom: "20px", fontSize: "11px", fontWeight: 700, color: "#fde047", letterSpacing: "1.5px" }}>
              💰 VERMÖGEN DER REICHEN &amp; BERÜHMTEN
            </div>

            <h1 id="hero-heading" className="hero-h1" style={{ fontWeight: 900, lineHeight: 1.0, letterSpacing: "-2px", marginBottom: "20px" }}>
              <span style={{ background: "linear-gradient(135deg, #f5c842 0%, #c084fc 55%, #60a5fa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>NETWORTH</span>
              <br />
              <span style={{ color: "#fff" }}>STATUS</span>
            </h1>

            <p className="hero-desc" style={{ fontSize: "clamp(14px,3.5vw,18px)", color: "rgba(255,255,255,0.5)", maxWidth: "520px", margin: "0 auto 32px", lineHeight: 1.6 }}>
              Entdecke das Nettovermögen von Künstlern, Sportlern,<br />
              Unternehmern und Influencern.
            </p>

            {/* Search bar in hero */}
            <Link
              href="/suche"
              aria-label="Zur Suchseite – Promi-Vermögen suchen"
              style={{ display: "block", maxWidth: "460px", margin: "0 auto 32px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "50px", padding: "12px 20px", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)" }}>Name suchen, z.B. Cristiano Ronaldo...</span>
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
        <nav aria-label="Nach Kategorie filtern" style={{ padding: "0 16px 28px", maxWidth: "1200px", margin: "0 auto" }}>
          <div className="cat-pills" role="group" aria-label="Kategorie-Filter" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            <Link href="/" style={{ padding: "8px 18px", borderRadius: "100px", fontSize: "13px", fontWeight: 600, textDecoration: "none", flexShrink: 0, background: !kategorie ? "linear-gradient(135deg,#a855f7,#3b82f6)" : "rgba(255,255,255,0.05)", color: !kategorie ? "#fff" : "rgba(255,255,255,0.5)", border: !kategorie ? "none" : "1px solid rgba(255,255,255,0.1)", boxShadow: !kategorie ? "0 4px 15px rgba(168,85,247,0.3)" : "none" }}>Alle</Link>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Link key={key} href={`/?kategorie=${cat.slug}`} style={{ padding: "8px 18px", borderRadius: "100px", fontSize: "13px", fontWeight: 600, textDecoration: "none", flexShrink: 0, background: kategorie === cat.slug ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)", color: kategorie === cat.slug ? "#fff" : "rgba(255,255,255,0.5)", border: `1px solid ${kategorie === cat.slug ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}` }}>{cat.label}</Link>
            ))}
          </div>
        </nav>

        {/* ── POSTS GRID ── */}
        <section aria-labelledby="posts-heading" style={{ padding: "0 16px 60px", maxWidth: "1200px", margin: "0 auto" }}>
          <h2 id="posts-heading" className="sr-only">Aktuelle Beiträge</h2>
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
                  <Link key={post.id} href={`/${post.slug}`} aria-label={`${post.title} – Artikel lesen`} style={{ textDecoration: "none" }}>
                    <article aria-label={post.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden", height: "100%" }}>
                      <div style={{ position: "relative", aspectRatio: "16/9", background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(245,200,66,0.1))", overflow: "hidden" }}>
                        {post.coverImage ? (
                          <Image src={post.coverImage} alt={`Titelbild: ${post.title}`} fill style={{ objectFit: "cover" }} />
                        ) : (
                          <div aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "40px" }}>💎</div>
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

        </main>

        {/* ── SEO TEXT SECTION ── */}
        <section aria-labelledby="seo-section-heading" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "clamp(48px,7vw,80px) 16px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>

            {/* Main heading */}
            <h2 id="seo-section-heading" style={{ fontSize: "clamp(22px,4.5vw,32px)", fontWeight: 800, marginBottom: "20px", background: "linear-gradient(135deg,#f5c842,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Nettovermögen & Gehalt von Prominenten – Deutschlands führende Analyse-Plattform
            </h2>

            <p style={{ fontSize: "clamp(14px,2.5vw,16px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.9, marginBottom: "18px" }}>
              <strong style={{ color: "rgba(255,255,255,0.85)" }}>Networth Status</strong> ist die führende deutschsprachige Quelle für fundierte Vermögensschätzungen, Einkommensanalysen und Karriere-Hintergründe der bekanntesten Persönlichkeiten der Welt. Unsere Redaktion recherchiert täglich auf Basis öffentlicher Quellen wie <strong style={{ color: "rgba(255,255,255,0.85)" }}>Forbes, Bloomberg, SEC-Filings und Unternehmensberichten</strong> – und liefert dir aktuelle, transparente Einblicke, wie reich Stars, Sportler, Unternehmer und Influencer wirklich sind.
            </p>

            <p style={{ fontSize: "clamp(14px,2.5vw,16px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.9, marginBottom: "18px" }}>
              Wie hoch ist das <strong style={{ color: "rgba(255,255,255,0.85)" }}>Nettovermögen von Mark Zuckerberg</strong>? Was verdient <strong style={{ color: "rgba(255,255,255,0.85)" }}>Cristiano Ronaldo</strong> pro Jahr? Wie reich ist <strong style={{ color: "rgba(255,255,255,0.85)" }}>Taylor Swift</strong> nach ihrer Eras Tour? Welches Vermögen hat <strong style={{ color: "rgba(255,255,255,0.85)" }}>Elon Musk</strong> trotz Twitter-Übernahme aufgebaut? Diese und Hunderte weitere Fragen beantworten wir mit detaillierten Artikeln, die Karriere, Einkommensquellen, Luxus-Assets und Vermögensentwicklung beleuchten.
            </p>

            <p style={{ fontSize: "clamp(14px,2.5vw,16px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.9, marginBottom: "32px" }}>
              Unser einzigartiges <strong style={{ color: "rgba(255,255,255,0.85)" }}>Vermögens-Dashboard</strong> visualisiert Nettovermögen in Echtzeit – inklusive Live-Ticker, Vermögensmix-Analyse und Jahreswachstum. So macht Networth Status aus abstrakten Milliardenzahlen erlebbare, vergleichbare Daten.
            </p>

            {/* Category boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "48px" }}>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <Link key={key} href={`/?kategorie=${cat.slug}`} style={{ textDecoration: "none", padding: "18px", background: "rgba(255,255,255,0.03)", border: `1px solid ${cat.color}30`, borderRadius: "14px", display: "block" }}>
                  <div style={{ fontSize: "22px", marginBottom: "8px" }}>
                    {key === "KUENSTLER" ? "🎵" : key === "SPORTLER" ? "⚽" : key === "UNTERNEHMER" ? "💼" : "📱"}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: cat.color, marginBottom: "4px" }}>{cat.label}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                    {key === "KUENSTLER" ? "Musiker, Schauspieler, Sänger & mehr" : key === "SPORTLER" ? "Fußball, Tennis, Formel 1 & Co." : key === "UNTERNEHMER" ? "Tech-Milliardäre & Start-up-Gründer" : "YouTube, Instagram, TikTok-Stars"}
                  </div>
                </Link>
              ))}
            </div>

            {/* FAQ SEO block */}
            <h2 style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 800, color: "#fff", marginBottom: "20px" }}>
              Häufige Fragen zum Nettovermögen von Stars
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "40px" }}>
              {[
                {
                  q: "Was ist das Nettovermögen (Net Worth)?",
                  a: "Das Nettovermögen (englisch: Net Worth) ist der Gesamtwert aller Vermögenswerte einer Person – also Immobilien, Aktien, Bargeld und andere Assets – abzüglich aller Verbindlichkeiten wie Schulden und Kredite. Es zeigt, wie viel jemand wert wäre, wenn alle Besitztümer zu aktuellen Marktwerten verkauft und alle Schulden beglichen würden."
                },
                {
                  q: "Wie werden die Vermögenswerte auf Networth Status ermittelt?",
                  a: "Unsere Redaktion wertet öffentlich zugängliche Quellen aus: Forbes Real-Time Billionaires, Bloomberg Billionaires Index, SEC-Filings (für börsennotierte Beteiligungen), Immobilienregister, Unternehmensberichte und seriöse Wirtschaftsmedien. Alle Angaben sind Schätzungen und können von den tatsächlichen Werten abweichen."
                },
                {
                  q: "Warum schwanken die Vermögensangaben so stark?",
                  a: "Das Vermögen von Milliardären und Stars ist stark an volatile Vermögenswerte geknüpft: Aktienkurse, Immobilienmärkte oder Kryptowährungen können täglich um Milliarden schwanken. Ein 10%-Rückgang der Meta-Aktie bedeutet für Mark Zuckerberg z.B. einen Vermögensverlust von über 20 Milliarden Dollar – auf dem Papier, über Nacht."
                },
                {
                  q: "Welche Stars haben das größte Nettovermögen in Deutschland?",
                  a: "Zu den vermögendsten deutschen Prominenten zählen u.a. Dieter Schwarz (Lidl, über 40 Mrd. €), Klaus-Michael Kühne (Logistik), Dietmar Hopp (SAP-Mitgründer) sowie im Entertainment-Bereich Herbert Grönemeyer und Til Schweiger. International führen Tech-Milliardäre wie Elon Musk, Jeff Bezos und Mark Zuckerberg die Listen an."
                },
              ].map((item, i) => (
                <details key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px 18px" }}>
                  <summary style={{ fontSize: "15px", fontWeight: 700, color: "#fff", cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    {item.q}
                    <span aria-hidden="true" style={{ color: "#a855f7", flexShrink: 0, fontSize: "18px" }}>+</span>
                  </summary>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginTop: "12px" }}>{item.a}</p>
                </details>
              ))}
            </div>

            {/* Trust signals */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {[
                { icon: "🔬", title: "Faktenbasiert", text: "Verifizierte Quellen: Forbes, Bloomberg, SEC-Filings" },
                { icon: "🔄", title: "Täglich aktualisiert", text: "Vermögensangaben immer auf dem neuesten Stand" },
                { icon: "🎯", title: "Unabhängig", text: "Keine PR-Aufträge, keine gesponserten Inhalte" },
                { icon: "🇩🇪", title: "Auf Deutsch", text: "Die führende deutschsprachige Net-Worth-Plattform" },
              ].map((item) => (
                <div key={item.title} style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: "12px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#c084fc", marginBottom: "3px" }}>{item.title}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer role="contentinfo" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 16px" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <nav aria-label="Footer-Navigation" style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap", marginBottom: "14px" }}>
              {[
                { href: "/", label: "Startseite" },
                { href: "/suche", label: "Suche" },
                { href: "/team", label: "Über uns" },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
              © {new Date().getFullYear()} Networth Status &nbsp;·&nbsp;
              <strong style={{ color: "rgba(255,255,255,0.35)" }}>Alle Vermögensangaben sind Schätzungen</strong> basierend auf öffentlichen Quellen. Keine Anlageberatung.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
