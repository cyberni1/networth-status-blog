"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";
import { CATEGORIES } from "@/lib/categories";
import { Category } from "@prisma/client";
import {
  Save, Send, Sparkles, Upload, X, Image as ImageIcon,
  RefreshCw, Tag, FileText, Search, Globe, HelpCircle, ChevronDown, Plus, Trash2
} from "lucide-react";

interface FaqItem { question: string; answer: string; }

interface WealthAsset { label: string; percent: number; color: string; }

interface WealthFormData {
  netWorth: string;        // string input e.g. "131"
  currency: string;
  trend: "up" | "down" | "flat";
  trendPercent: string;
  yearChange: string;
  mainSource: string;
  sourceIcon: string;
  assets: WealthAsset[];
  incomeIcons: string;     // comma-separated
  annualIncome: string;
}

interface PostData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  tags: string[];
  category: Category;
  coverImage: string;
  coverImageAlt: string;
  faq: FaqItem[];
  wealthForm: WealthFormData;
  status: "DRAFT" | "PUBLISHED";
}

const DEFAULT_WEALTH: WealthFormData = {
  netWorth: "", currency: "$", trend: "flat", trendPercent: "0",
  yearChange: "0", mainSource: "", sourceIcon: "💼",
  assets: [
    { label: "Firmenanteile", percent: 70, color: "#F5B041" },
    { label: "Immobilien", percent: 20, color: "#a855f7" },
    { label: "Liquide Mittel", percent: 10, color: "#60a5fa" },
  ],
  incomeIcons: "💼 Gründer, 📈 Aktien",
  annualIncome: "",
};

interface PostEditorProps {
  initialData?: Partial<PostData>;
}

export default function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingFaq, setGeneratingFaq] = useState(false);
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [articlePrompt, setArticlePrompt] = useState("");
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [wikiSearch, setWikiSearch] = useState("");
  const [wikiFetching, setWikiFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "faq" | "wealth" | "settings">("content");
  const [tagInput, setTagInput] = useState("");

  const [data, setData] = useState<PostData>({
    id: initialData?.id,
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    content: initialData?.content ?? "",
    excerpt: initialData?.excerpt ?? "",
    metaTitle: initialData?.metaTitle ?? "",
    metaDescription: initialData?.metaDescription ?? "",
    keywords: initialData?.keywords ?? "",
    tags: initialData?.tags ?? [],
    category: initialData?.category ?? "KUENSTLER",
    coverImage: initialData?.coverImage ?? "",
    coverImageAlt: initialData?.coverImageAlt ?? "",
    faq: initialData?.faq ?? [],
    wealthForm: (() => {
      try {
        const wd = (initialData as any)?.wealthData;
        if (!wd) return DEFAULT_WEALTH;
        const parsed = typeof wd === "string" ? JSON.parse(wd) : wd;
        return {
          netWorth: String(parsed.netWorth ?? ""),
          currency: parsed.currency ?? "$",
          trend: parsed.trend ?? "flat",
          trendPercent: String(parsed.trendPercent ?? "0"),
          yearChange: String(parsed.yearChange ?? "0"),
          mainSource: parsed.mainSource ?? "",
          sourceIcon: parsed.sourceIcon ?? "💼",
          assets: parsed.assets ?? DEFAULT_WEALTH.assets,
          incomeIcons: (parsed.incomeIcons ?? []).join(", "),
          annualIncome: String(parsed.annualIncome ?? ""),
        } as WealthFormData;
      } catch { return DEFAULT_WEALTH; }
    })(),
    status: initialData?.status ?? "DRAFT",
  });

  function update<K extends keyof PostData>(key: K, value: PostData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerateArticle() {
    if (!articlePrompt.trim()) return;
    setGeneratingArticle(true);
    try {
      const res = await fetch("/api/ai/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: articlePrompt, category: data.category }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      if (result.title) update("title", result.title);
      if (result.content) update("content", result.content);
      setShowArticleModal(false);
      setArticlePrompt("");
      // Auto-generate meta after article
      setTimeout(() => handleGenerateAI(), 500);
    } catch (err) {
      alert("Fehler: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGeneratingArticle(false);
    }
  }

  async function handleGenerateFaq() {
    if (!data.title && !data.content) {
      alert("Bitte füge zuerst einen Titel oder Inhalt hinzu.");
      return;
    }
    setGeneratingFaq(true);
    try {
      const res = await fetch("/api/ai/generate-faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title, content: data.content, category: data.category }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { faqs } = await res.json();
      if (faqs?.length) update("faq", faqs);
    } catch (err) {
      alert("FAQ-Fehler: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGeneratingFaq(false);
    }
  }

  function buildWealthData() {
    const f = data.wealthForm;
    if (!f.netWorth) return null;
    return {
      netWorth: parseFloat(f.netWorth) || 0,
      currency: f.currency,
      trend: f.trend,
      trendPercent: parseFloat(f.trendPercent) || 0,
      yearChange: parseFloat(f.yearChange) || 0,
      mainSource: f.mainSource,
      sourceIcon: f.sourceIcon,
      assets: f.assets.filter((a) => a.label),
      incomeIcons: f.incomeIcons.split(",").map((s) => s.trim()).filter(Boolean),
      annualIncome: parseFloat(f.annualIncome) || undefined,
    };
  }

  async function handleSave(status?: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    try {
      const wealthJson = buildWealthData();
      const payload = {
        ...data,
        faq: JSON.stringify(data.faq),
        wealthData: wealthJson ? JSON.stringify(wealthJson) : null,
        status: status ?? data.status,
      };
      const res = await fetch(data.id ? `/api/posts/${data.id}` : "/api/posts", {
        method: data.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      if (!data.id) router.push(`/admin/posts/${saved.id}`);
      else update("status", saved.status);
    } catch (err) {
      alert("Fehler beim Speichern: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateAI() {
    if (!data.title && !data.content) {
      alert("Bitte füge zuerst einen Titel oder Inhalt hinzu.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title, content: data.content, category: data.category }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      setData((prev) => ({
        ...prev,
        slug: result.slug || prev.slug,
        excerpt: result.excerpt || prev.excerpt,
        metaTitle: result.metaTitle || prev.metaTitle,
        metaDescription: result.metaDescription || prev.metaDescription,
        keywords: result.keywords || prev.keywords,
        tags: result.tags?.length ? result.tags : prev.tags,
      }));
    } catch (err) {
      alert("KI-Fehler: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGenerating(false);
    }
  }

  // Extrahiert den Personen-Namen aus Slug oder Titel
  // z.B. "elon-musk-vermoegen-2026" → "Elon Musk"
  function extractPersonName(): string {
    if (wikiSearch.trim()) return wikiSearch.trim();
    // Aus Slug: alles vor "-vermoegen-" nehmen
    if (data.slug) {
      const slugName = data.slug.replace(/-vermoegen-\d{4}.*$/, "").replace(/-/g, " ");
      if (slugName) return slugName.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    // Fallback: erste 2 Wörter des Titels
    return data.title.split(" ").slice(0, 2).join(" ");
  }

  async function fetchWikiImage() {
    const name = extractPersonName();
    if (!name) return alert("Bitte einen Namen eingeben.");
    setWikiFetching(true);
    try {
      const res = await fetch(`/api/fetch-wiki-image?name=${encodeURIComponent(name)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unbekannter Fehler");
      update("coverImage", json.url);
      // Auto SEO alt-text
      const year = new Date().getFullYear();
      const catMap: Record<string, string> = { KUENSTLER: "Künstler", SPORTLER: "Sportler", UNTERNEHMER: "Unternehmer", INFLUENCER: "Influencer" };
      const seoAlt = `${data.title} Nettovermögen ${year}${catMap[data.category] ? ` – ${catMap[data.category]}` : ""} | PROMIVERMÖGEN`;
      update("coverImageAlt", seoAlt.substring(0, 120));
    } catch (err) {
      alert("Wikipedia-Fehler: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setWikiFetching(false);
    }
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", data.title);
      formData.append("slug", data.slug);
      formData.append("category", data.category);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      const { url, alt } = await res.json();
      update("coverImage", url);
      update("coverImageAlt", alt);
    } catch (err) {
      alert("Upload-Fehler: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploading(false);
    }
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !data.tags.includes(tag)) {
      update("tags", [...data.tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    update("tags", data.tags.filter((t) => t !== tag));
  }

  const tabs = [
    { id: "content" as const, label: "Inhalt", icon: FileText },
    { id: "seo" as const, label: "SEO", icon: Search },
    { id: "faq" as const, label: `FAQ ${data.faq.length > 0 ? `(${data.faq.length})` : ""}`, icon: HelpCircle },
    { id: "wealth" as const, label: "💰 Daten", icon: null },
    { id: "settings" as const, label: "Einstellungen", icon: Globe },
  ];

  return (
    <div style={{ padding: "16px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
          {data.id ? "Beitrag bearbeiten" : "Neuer Beitrag"}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setShowArticleModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, background: "linear-gradient(135deg,#a855f7,#3b82f6)", color: "#fff", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <Sparkles className="w-4 h-4" />
            KI-Artikel
          </button>
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={generating}
            className="btn-ghost text-sm"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            KI-Metadaten
          </button>
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="btn-ghost text-sm"
          >
            <Save className="w-4 h-4" />
            Entwurf
          </button>
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
            className="btn-gold text-sm"
          >
            <Send className="w-4 h-4" />
            Veröffentlichen
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        value={data.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Beitragstitel..."
        style={{ width: "100%", background: "transparent", border: "none", fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800, color: "#fff", outline: "none", marginBottom: "20px", fontFamily: "inherit" }}
      />

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "text-purple-400 border-purple-400"
                : "text-white/50 border-transparent hover:text-white"
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "20px" }} className="content-grid">
          <div><style>{`.content-grid { grid-template-columns: minmax(0,1fr) !important; } @media (min-width: 900px) { .content-grid { grid-template-columns: minmax(0,2fr) minmax(280px,1fr) !important; } }`}</style>
            <RichTextEditor
              content={data.content}
              onChange={(html) => update("content", html)}
            />
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Cover image */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Titelbild
              </h3>
              {data.coverImage ? (
                <div className="relative">
                  <img
                    src={data.coverImage}
                    alt={data.coverImageAlt}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => { update("coverImage", ""); update("coverImageAlt", ""); }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {/* SEO Dateiname */}
                  <p className="mt-2 text-xs text-white/30 font-mono truncate" title={data.coverImage}>
                    📄 {data.coverImage.split("/").pop()}
                  </p>
                  <input
                    type="text"
                    value={data.coverImageAlt}
                    onChange={(e) => update("coverImageAlt", e.target.value)}
                    placeholder="Alt-Text (SEO)..."
                    className="input-glass mt-1 text-sm"
                  />
                  <p className="mt-1 text-xs text-white/25">Alt-Text wird in Google Bildersuche indexiert</p>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  {/* Wikipedia auto-fetch */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={wikiSearch}
                      onChange={(e) => setWikiSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchWikiImage()}
                      placeholder={data.slug ? data.slug.replace(/-vermoegen-\d{4}.*$/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Name leer lassen = auto"}
                      className="input-glass text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={fetchWikiImage}
                      disabled={wikiFetching}
                      title="Bild automatisch von Wikipedia holen"
                      className="px-3 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25 transition-all text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                    >
                      {wikiFetching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>🌐</span>}
                      {wikiFetching ? "Lädt..." : "Wikipedia"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-6 border-2 border-dashed border-white/10 rounded-xl hover:border-purple-500/40 transition-all text-white/30 hover:text-white/60 flex flex-col items-center gap-2"
                  >
                    {uploading ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                    <span className="text-xs">{uploading ? "Lädt hoch..." : "Eigenes Bild hochladen"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Kategorie</h3>
              <select
                value={data.category}
                onChange={(e) => update("category", e.target.value as Category)}
                className="select-glass"
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {data.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Tag hinzufügen..."
                  className="input-glass flex-1 text-sm"
                />
                <button type="button" onClick={addTag} className="btn-ghost text-xs px-3">+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === "seo" && (
        <div className="max-w-2xl space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">URL-Slug</label>
            <input
              type="text"
              value={data.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="url-freundlicher-slug"
              className="input-glass font-mono text-sm"
            />
            <p className="text-xs text-white/30 mt-1">promivermögen.com/{data.slug || "slug"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Excerpt (Zusammenfassung)</label>
            <textarea
              value={data.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="Kurze Zusammenfassung des Beitrags..."
              rows={3}
              className="textarea-glass"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Meta-Titel</label>
            <input
              type="text"
              value={data.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              placeholder="SEO-Titel (max. 60 Zeichen)"
              className="input-glass"
            />
            <p className="text-xs text-white/30 mt-1">{data.metaTitle.length}/60 Zeichen</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Meta-Beschreibung</label>
            <textarea
              value={data.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              placeholder="Beschreibung für Suchmaschinen (max. 160 Zeichen)"
              rows={3}
              className="textarea-glass"
            />
            <p className="text-xs text-white/30 mt-1">{data.metaDescription.length}/160 Zeichen</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Keywords</label>
            <input
              type="text"
              value={data.keywords}
              onChange={(e) => update("keywords", e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              className="input-glass"
            />
          </div>

          {/* SERP Preview */}
          {(data.metaTitle || data.title) && (
            <div className="glass-card p-4 mt-4">
              <p className="text-xs text-white/40 mb-3 font-medium uppercase tracking-wider">Google-Vorschau</p>
              <div className="space-y-1">
                <p className="text-[#8ab4f8] text-base">
                  {data.metaTitle || data.title}
                </p>
                <p className="text-[#bdc1c6] text-xs">
                  promivermögen.com › {data.slug || "beitrag"}
                </p>
                <p className="text-[#bdc1c6] text-sm">
                  {data.metaDescription || data.excerpt || "Keine Beschreibung vorhanden."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">FAQ-Sektion</h2>
              <p className="text-sm text-white/40 mt-1">Erscheint auf Google als "People also ask" — massiv mehr Klicks</p>
            </div>
            <button
              type="button"
              onClick={handleGenerateFaq}
              disabled={generatingFaq}
              className="btn-primary text-sm"
            >
              {generatingFaq ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              KI generieren
            </button>
          </div>

          <div className="space-y-4">
            {data.faq.map((item, i) => (
              <div key={i} className="glass-card p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-purple-400 mt-3 w-5 flex-shrink-0">F{i + 1}</span>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => {
                      const updated = [...data.faq];
                      updated[i] = { ...updated[i], question: e.target.value };
                      update("faq", updated);
                    }}
                    placeholder="Frage..."
                    className="input-glass flex-1 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => update("faq", data.faq.filter((_, idx) => idx !== i))}
                    className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-start gap-2 pl-7">
                  <textarea
                    value={item.answer}
                    onChange={(e) => {
                      const updated = [...data.faq];
                      updated[i] = { ...updated[i], answer: e.target.value };
                      update("faq", updated);
                    }}
                    placeholder="Antwort..."
                    rows={3}
                    className="textarea-glass flex-1 text-sm"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => update("faq", [...data.faq, { question: "", answer: "" }])}
              className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl hover:border-purple-500/40 transition-all text-white/30 hover:text-white/60 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Frage manuell hinzufügen
            </button>
          </div>
        </div>
      )}

      {/* Wealth Data Tab */}
      {activeTab === "wealth" && (
        <div style={{ maxWidth: "600px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>💰 Vermögens-Dashboard</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Wird direkt unter dem Artikel-Header angezeigt. Alle Felder optional.</p>
          </div>

          {/* Row: Net Worth + Currency */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Nettovermögen (in Mrd.)</label>
              <input type="number" value={data.wealthForm.netWorth} onChange={(e) => update("wealthForm", { ...data.wealthForm, netWorth: e.target.value })} placeholder="z.B. 131" className="input-glass" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Währung</label>
              <select value={data.wealthForm.currency} onChange={(e) => update("wealthForm", { ...data.wealthForm, currency: e.target.value })} className="select-glass">
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
              </select>
            </div>
          </div>

          {/* Row: Trend + Percent + Year Change */}
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Trend</label>
              <select value={data.wealthForm.trend} onChange={(e) => update("wealthForm", { ...data.wealthForm, trend: e.target.value as any })} className="select-glass">
                <option value="up">▲ Gestiegen</option>
                <option value="down">▼ Gesunken</option>
                <option value="flat">= Gleich</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Trend % (z.B. 12.3)</label>
              <input type="number" value={data.wealthForm.trendPercent} onChange={(e) => update("wealthForm", { ...data.wealthForm, trendPercent: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Veränd. ggü. Vorjahr (Mrd.)</label>
              <input type="number" value={data.wealthForm.yearChange} onChange={(e) => update("wealthForm", { ...data.wealthForm, yearChange: e.target.value })} placeholder="z.B. 14 oder -5" className="input-glass" />
            </div>
          </div>

          {/* Main source */}
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Icon</label>
              <input type="text" value={data.wealthForm.sourceIcon} onChange={(e) => update("wealthForm", { ...data.wealthForm, sourceIcon: e.target.value })} className="input-glass" style={{ textAlign: "center", fontSize: "20px" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Haupteinnahmequelle</label>
              <input type="text" value={data.wealthForm.mainSource} onChange={(e) => update("wealthForm", { ...data.wealthForm, mainSource: e.target.value })} placeholder="z.B. Tech / Software" className="input-glass" />
            </div>
          </div>

          {/* Asset mix */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>Vermögensmix (Prozente müssen ~100 ergeben)</label>
            {data.wealthForm.assets.map((asset, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 40px 36px", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
                <input type="text" value={asset.label} onChange={(e) => { const a = [...data.wealthForm.assets]; a[i] = { ...a[i], label: e.target.value }; update("wealthForm", { ...data.wealthForm, assets: a }); }} placeholder="z.B. Aktien" className="input-glass" style={{ padding: "8px 10px", fontSize: "12px" }} />
                <input type="number" value={asset.percent} onChange={(e) => { const a = [...data.wealthForm.assets]; a[i] = { ...a[i], percent: parseInt(e.target.value) || 0 }; update("wealthForm", { ...data.wealthForm, assets: a }); }} placeholder="%" className="input-glass" style={{ padding: "8px 10px", fontSize: "12px" }} />
                <input type="color" value={asset.color} onChange={(e) => { const a = [...data.wealthForm.assets]; a[i] = { ...a[i], color: e.target.value }; update("wealthForm", { ...data.wealthForm, assets: a }); }} style={{ width: "36px", height: "36px", border: "none", borderRadius: "6px", background: "transparent", cursor: "pointer" }} />
                <button type="button" onClick={() => { const a = data.wealthForm.assets.filter((_, idx) => idx !== i); update("wealthForm", { ...data.wealthForm, assets: a }); }} style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "14px" }}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => update("wealthForm", { ...data.wealthForm, assets: [...data.wealthForm.assets, { label: "", percent: 0, color: "#6b7280" }] })} style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", background: "none", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "8px", padding: "6px 14px", cursor: "pointer" }}>+ Asset hinzufügen</button>
          </div>

          {/* Income icons */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Vermögensquellen (kommagetrennt)</label>
            <input type="text" value={data.wealthForm.incomeIcons} onChange={(e) => update("wealthForm", { ...data.wealthForm, incomeIcons: e.target.value })} placeholder="💼 Gründer, 📈 Aktien, 🏠 Immobilien" className="input-glass" />
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>Tipps: 🎤 Musik, ⚽ Sport, 💻 Tech, 🎬 Film, 💎 Luxus-Assets, 🏠 Immobilien</p>
          </div>

          {/* Annual income for clock */}
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Jahreseinkommen (Mrd.) — für Vermögensuhr</label>
            <input type="number" value={data.wealthForm.annualIncome} onChange={(e) => update("wealthForm", { ...data.wealthForm, annualIncome: e.target.value })} placeholder="z.B. 14.5 (optional)" className="input-glass" />
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>Zeigt an: „Während du liest, verdient er/sie ca. X" — leer lassen zum deaktivieren.</p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="max-w-md space-y-5">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-4">Veröffentlichungsstatus</h3>
            <div className="space-y-3">
              {(["DRAFT", "PUBLISHED"] as const).map((s) => (
                <label key={s} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  data.status === s ? "bg-purple-500/20 border border-purple-500/30" : "hover:bg-white/5"
                }`}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={data.status === s}
                    onChange={() => update("status", s)}
                    className="accent-purple-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {s === "DRAFT" ? "Entwurf" : "Veröffentlicht"}
                    </p>
                    <p className="text-xs text-white/40">
                      {s === "DRAFT" ? "Nicht öffentlich sichtbar" : "Öffentlich für alle sichtbar"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── KI-ARTIKEL MODAL ── */}
      {showArticleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "520px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
              🤖 KI-Artikel generieren
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", marginBottom: "20px", lineHeight: 1.5 }}>
              Beschreibe kurz worum es geht — z.B. <em>"Cristiano Ronaldo Nettovermögen"</em> oder <em>"Wie reich ist Taylor Swift?"</em>
            </p>
            <textarea
              value={articlePrompt}
              onChange={(e) => setArticlePrompt(e.target.value)}
              placeholder="Thema eingeben, z.B. Elon Musk Nettovermögen 2024..."
              rows={4}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "12px", color: "#fff", fontSize: "15px", outline: "none", resize: "none", fontFamily: "inherit", marginBottom: "16px" }}
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleGenerateArticle(); }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowArticleModal(false)}
                style={{ padding: "10px 18px", borderRadius: "8px", fontSize: "14px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
              >Abbrechen</button>
              <button
                type="button"
                onClick={handleGenerateArticle}
                disabled={generatingArticle || !articlePrompt.trim()}
                style={{ padding: "10px 22px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, background: "linear-gradient(135deg,#a855f7,#3b82f6)", color: "#fff", border: "none", cursor: generatingArticle ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "8px", opacity: !articlePrompt.trim() ? 0.5 : 1 }}
              >
                {generatingArticle ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Schreibe Artikel...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Artikel generieren</>
                )}
              </button>
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", marginTop: "12px" }}>
              Inklusive automatischer Metadaten, Keywords &amp; SEO-Optimierung
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
