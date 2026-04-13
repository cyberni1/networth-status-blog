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
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (initialQ) {
      doSearch(initialQ);
    }
  }, []);

  function doSearch(q: string) {
    if (q.trim().length < 2) {
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(query);
  }

  return (
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "clamp(24px,5vw,48px) 16px 64px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.35)", textDecoration: "none", marginBottom: "16px" }}>
            ← Startseite
          </Link>
          <h1 style={{ fontSize: "clamp(22px,5vw,32px)", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>Suche</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Finde Artikel über deine Lieblingsprominenten</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "32px" }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={handleInput}
              placeholder="Name oder Thema suchen, z.B. Ronaldo..."
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", padding: "14px 50px 14px 46px", color: "#fff", fontSize: "clamp(15px,3.5vw,17px)", outline: "none", fontFamily: "inherit", WebkitAppearance: "none" }}
              autoComplete="off"
            />
            {loading && (
              <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                ⏳
              </div>
            )}
          </div>
        </form>

        {/* Results */}
        {searched && !loading && (
          <div>
            {results.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Keine Ergebnisse</h2>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
                  Für <strong style={{ color: "rgba(255,255,255,0.7)" }}>"{query}"</strong> wurden keine Artikel gefunden.
                </p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "8px" }}>Versuch einen anderen Suchbegriff.</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>
                  {results.length} Ergebnis{results.length !== 1 ? "se" : ""} für <strong style={{ color: "rgba(255,255,255,0.6)" }}>"{query}"</strong>
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {results.map((post) => {
                    const cat = CATEGORIES[post.category];
                    return (
                      <Link key={post.id} href={`/${post.slug}`} style={{ textDecoration: "none" }}>
                        <div style={{ display: "flex", gap: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", overflow: "hidden", padding: "0" }}>
                          {/* Thumbnail */}
                          <div style={{ position: "relative", width: "100px", minWidth: "100px", background: "linear-gradient(135deg,rgba(168,85,247,0.2),rgba(245,200,66,0.1))", flexShrink: 0 }}>
                            {post.coverImage ? (
                              <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: "cover" }} />
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "28px" }}>💎</div>
                            )}
                          </div>
                          {/* Info */}
                          <div style={{ padding: "14px 14px 14px 0", flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                              <span style={{ padding: "2px 8px", borderRadius: "100px", fontSize: "10px", fontWeight: 700, color: cat.color, background: `${cat.color}20`, border: `1px solid ${cat.color}30` }}>{cat.label}</span>
                              {post.publishedAt && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{new Date(post.publishedAt).toLocaleDateString("de-DE")}</span>}
                            </div>
                            <h3 style={{ fontSize: "clamp(13px,3vw,15px)", fontWeight: 700, color: "#f0f0ff", lineHeight: 1.3, marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{post.title}</h3>
                            {post.excerpt && (
                              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{post.excerpt}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Suggestions when empty */}
        {!searched && !loading && (
          <div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "16px" }}>Beliebte Kategorien</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { label: "🎵 Künstler", q: "nettovermögen" },
                { label: "⚽ Sportler", q: "sportler" },
                { label: "💼 Unternehmer", q: "unternehmer" },
                { label: "📱 Influencer", q: "influencer" },
              ].map((s) => (
                <button key={s.label} onClick={() => { setQuery(s.label.split(" ")[1]); doSearch(s.label.split(" ")[1]); }} style={{ padding: "8px 16px", borderRadius: "100px", fontSize: "13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuchePage() {
  return (
    <Suspense fallback={<div style={{ background: "#080810", minHeight: "100vh" }}><Navbar /></div>}>
      <SearchContent />
    </Suspense>
  );
}
