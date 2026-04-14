"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { CATEGORIES } from "@/lib/categories";
import { Category } from "@prisma/client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: Category;
  publishedAt: string | null;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (initialQ) doSearch(initialQ);
  }, []);

  function doSearch(q: string) {
    setErrorMsg("");
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    if (q.trim().length < 2) {
      setErrorMsg("Bitte mindestens 2 Zeichen eingeben.");
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(false);
    fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.posts ?? []);
        setSearched(true);
        router.replace(`/suche?q=${encodeURIComponent(q.trim())}`, { scroll: false });
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setErrorMsg("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(query);
  }

  const statusText = loading
    ? "Suche läuft..."
    : searched
    ? results.length === 0
      ? `Keine Ergebnisse für „${query}"`
      : `${results.length} Ergebnis${results.length !== 1 ? "se" : ""} für „${query}"`
    : "";

  return (
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <Navbar />

      <main id="main-content" tabIndex={-1} style={{ maxWidth: "760px", margin: "0 auto", padding: "clamp(24px,5vw,48px) 16px 64px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <Link href="/" aria-label="Zurück zur Startseite" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", marginBottom: "16px" }}>
            ← Startseite
          </Link>
          <h1 style={{ fontSize: "clamp(22px,5vw,32px)", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>Promi-Vermögen suchen</h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
            Finde Artikel über das Nettovermögen deiner Lieblingsprominenten
          </p>
        </div>

        {/* Search form — accessible */}
        <form onSubmit={handleSubmit} role="search" aria-label="Promi-Vermögen suchen" style={{ marginBottom: "32px" }}>
          <label
            htmlFor="search-input"
            style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}
          >
            Promi-Name oder Thema eingeben
          </label>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              ref={inputRef}
              id="search-input"
              type="search"
              value={query}
              onChange={handleInput}
              placeholder="z.B. Cristiano Ronaldo, Elon Musk, Taylor Swift..."
              aria-label="Promi-Name eingeben"
              aria-describedby={errorMsg ? "search-error" : "search-hint"}
              aria-invalid={!!errorMsg}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${errorMsg ? "#f87171" : "rgba(255,255,255,0.15)"}`,
                borderRadius: "14px",
                padding: "16px 52px 16px 48px",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
                fontFamily: "inherit",
                WebkitAppearance: "none",
              }}
            />
            {loading && (
              <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: "14px" }} aria-hidden="true">
                ⏳
              </div>
            )}
          </div>

          {/* Error message */}
          {errorMsg && (
            <p id="search-error" role="alert" style={{ marginTop: "8px", fontSize: "14px", color: "#f87171", display: "flex", alignItems: "center", gap: "6px" }}>
              <span aria-hidden="true">⚠</span> {errorMsg}
            </p>
          )}

          {/* Hint */}
          {!errorMsg && (
            <p id="search-hint" style={{ marginTop: "8px", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              Suche nach Name, Kategorie oder Thema. Mindestens 2 Zeichen.
            </p>
          )}
        </form>

        {/* Live region for screen readers */}
        <div
          ref={liveRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {statusText}
        </div>

        {/* Results */}
        {searched && !loading && (
          <section aria-labelledby="results-heading">
            {results.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div aria-hidden="true" style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
                <h2 id="results-heading" style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Keine Ergebnisse</h2>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)" }}>
                  Für <strong style={{ color: "rgba(255,255,255,0.7)" }}>„{query}"</strong> wurden keine Artikel gefunden.
                </p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", marginTop: "8px" }}>Versuch einen anderen Namen oder Begriff.</p>
              </div>
            ) : (
              <div>
                <h2 id="results-heading" style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
                  {results.length} Ergebnis{results.length !== 1 ? "se" : ""} für <span style={{ color: "rgba(255,255,255,0.7)" }}>„{query}"</span>
                </h2>
                <ul style={{ display: "flex", flexDirection: "column", gap: "10px", listStyle: "none", padding: 0, margin: 0 }}>
                  {results.map((post) => {
                    const cat = CATEGORIES[post.category];
                    return (
                      <li key={post.id}>
                        <Link href={`/${post.slug}`} aria-label={`${post.title} – Artikel lesen`} style={{ textDecoration: "none" }}>
                          <article style={{ display: "flex", gap: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden" }}>
                            {/* Thumbnail */}
                            <div style={{ position: "relative", width: "100px", minWidth: "100px", background: "linear-gradient(135deg,rgba(168,85,247,0.2),rgba(245,200,66,0.1))", flexShrink: 0 }}>
                              {post.coverImage ? (
                                <Image src={post.coverImage} alt={`Titelbild: ${post.title}`} fill style={{ objectFit: "cover" }} />
                              ) : (
                                <div aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "28px" }}>💎</div>
                              )}
                            </div>
                            {/* Info */}
                            <div style={{ padding: "14px 14px 14px 0", flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                                <span style={{ padding: "2px 8px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, color: cat.color, background: `${cat.color}20`, border: `1px solid ${cat.color}30` }}>{cat.label}</span>
                                {post.publishedAt && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}><time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString("de-DE")}</time></span>}
                              </div>
                              <h3 style={{ fontSize: "clamp(13px,3vw,15px)", fontWeight: 700, color: "#f0f0ff", lineHeight: 1.3, marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{post.title}</h3>
                              {post.excerpt && (
                                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{post.excerpt}</p>
                              )}
                            </div>
                          </article>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Suggestions when no search yet */}
        {!searched && !loading && (
          <section aria-labelledby="suggestions-heading">
            <h2 id="suggestions-heading" style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", marginBottom: "14px" }}>
              Beliebte Kategorien
            </h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }} role="group" aria-label="Kategorie-Vorschläge">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => { setQuery(cat.label); doSearch(cat.label); }}
                  aria-label={`Kategorie ${cat.label} durchsuchen`}
                  style={{ padding: "10px 18px", borderRadius: "100px", fontSize: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer", minHeight: "44px" }}
                >
                  {key === "KUENSTLER" ? "🎵" : key === "SPORTLER" ? "⚽" : key === "UNTERNEHMER" ? "💼" : "📱"} {cat.label}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer role="contentinfo" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 16px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", maxWidth: "700px", margin: "0 auto", lineHeight: 1.6 }}>
          © {new Date().getFullYear()} PROMIVERMÖGEN &nbsp;·&nbsp;
          <strong style={{ color: "rgba(255,255,255,0.4)" }}>Alle Vermögensangaben sind Schätzungen</strong> basierend auf öffentlichen Quellen. Keine Anlageberatung.
        </p>
      </footer>
    </div>
  );
}

export default function SuchePage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#080810", minHeight: "100vh" }}>
        <Navbar />
        <main id="main-content" style={{ padding: "48px 16px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>Suche wird geladen...</p>
        </main>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
