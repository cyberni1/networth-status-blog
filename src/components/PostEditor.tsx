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
  status: "DRAFT" | "PUBLISHED";
}

interface PostEditorProps {
  initialData?: Partial<PostData>;
}

export default function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingFaq, setGeneratingFaq] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "faq" | "settings">("content");
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
    status: initialData?.status ?? "DRAFT",
  });

  function update<K extends keyof PostData>(key: K, value: PostData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
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

  async function handleSave(status?: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    try {
      const payload = { ...data, faq: JSON.stringify(data.faq), status: status ?? data.status };
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

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", data.title);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      const { url, alt } = await res.json();
      update("coverImage", url);
      if (!data.coverImageAlt) update("coverImageAlt", alt);
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
    { id: "settings" as const, label: "Einstellungen", icon: Globe },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">
          {data.id ? "Beitrag bearbeiten" : "Neuer Beitrag"}
        </h1>
        <div className="flex items-center gap-3">
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
        className="w-full bg-transparent border-none text-3xl font-bold text-white placeholder-white/20 focus:outline-none mb-6"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10">
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
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
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
                  <input
                    type="text"
                    value={data.coverImageAlt}
                    onChange={(e) => update("coverImageAlt", e.target.value)}
                    placeholder="Alt-Text..."
                    className="input-glass mt-2 text-sm"
                  />
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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-8 border-2 border-dashed border-white/10 rounded-xl hover:border-purple-500/40 transition-all text-white/30 hover:text-white/60 flex flex-col items-center gap-2"
                  >
                    {uploading ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                    <span className="text-xs">{uploading ? "Lädt hoch..." : "Bild hochladen"}</span>
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
            <p className="text-xs text-white/30 mt-1">networth-status-blog.vercel.app/{data.slug || "slug"}</p>
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
                  networth-status-blog.vercel.app › {data.slug || "beitrag"}
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
    </div>
  );
}
