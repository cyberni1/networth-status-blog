"use client";

import { useState } from "react";
import { Download, Loader2, Link as LinkIcon, AlertCircle } from "lucide-react";

type Format = {
  url: string;
  quality: string;
  container: string;
  hasAudio: boolean;
  hasVideo: boolean;
  filesizeMB?: number;
};

type VideoInfo = {
  platform: "youtube" | "tiktok" | "instagram";
  title: string;
  thumbnail: string;
  duration?: number;
  author?: string;
  formats: Format[];
};

function formatLabel(f: Format): string {
  const parts: string[] = [f.quality, f.container.toUpperCase()];
  if (f.filesizeMB) parts.push(`~${f.filesizeMB} MB`);
  return parts.join(" · ");
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "video";
}

export default function DownloaderPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<VideoInfo | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/downloader/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Analysieren");
      setInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  function buildDownloadHref(f: Format): string {
    const base = info ? slugify(info.title) : "video";
    const filename = `${base}-${f.quality}.${f.container}`;
    const params = new URLSearchParams({
      url: f.url,
      filename,
      platform: info?.platform || "",
    });
    return `/api/downloader/proxy?${params.toString()}`;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Video Downloader</h1>
        <p className="text-white/50 text-sm mt-1">
          YouTube · TikTok · Instagram
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="glass-card p-6 mb-6">
        <label className="block text-sm font-medium text-white/70 mb-2">Video-URL</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=… oder tiktok.com/… oder instagram.com/…"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url}
            className="px-5 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-yellow-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? "Analysiere…" : "Analysieren"}
          </button>
        </div>
      </form>

      {error && (
        <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-500/5 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-medium text-sm">Fehler</p>
            <p className="text-white/60 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {info && (
        <div className="glass-card p-6">
          <div className="flex gap-4 mb-6">
            {info.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={info.thumbnail}
                alt=""
                className="w-40 h-24 object-cover rounded-lg border border-white/10"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-purple-300 font-semibold">
                {info.platform}
              </p>
              <h2 className="text-lg font-semibold text-white line-clamp-2 mt-1">
                {info.title}
              </h2>
              {info.author && (
                <p className="text-sm text-white/50 mt-1">von {info.author}</p>
              )}
              {info.duration && (
                <p className="text-xs text-white/40 mt-1">
                  {Math.floor(info.duration / 60)}:
                  {String(Math.floor(info.duration % 60)).padStart(2, "0")} min
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-sm font-medium text-white/70 mb-3">
              Verfügbare Formate ({info.formats.length})
            </p>
            <div className="space-y-2">
              {info.formats.map((f, i) => (
                <a
                  key={i}
                  href={buildDownloadHref(f)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                >
                  <span className="text-sm text-white/80">{formatLabel(f)}</span>
                  <span className="text-purple-300 group-hover:text-purple-200 flex items-center gap-1 text-sm font-medium">
                    <Download className="w-4 h-4" /> Download
                  </span>
                </a>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/40 mt-6 leading-relaxed">
            Hinweis: Bei größeren Videos kann der Download bis zu 60 Sekunden brauchen
            (Vercel-Limit). YouTube blockiert manchmal Datacenter-IPs — falls ein Format
            fehlschlägt, versuche ein anderes oder eine kleinere Qualität.
          </p>
        </div>
      )}
    </div>
  );
}
