import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Proxy-Route: Lädt das Video serverseitig und streamt es zum Client.
// Nötig, weil TikTok/Instagram Direktlinks oft Referer-Header verlangen,
// und um saubere Dateinamen + Content-Disposition zu setzen.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  const filename = searchParams.get("filename") || "video.mp4";
  const platformHint = searchParams.get("platform") || "";

  if (!target) {
    return new Response("Parameter 'url' fehlt", { status: 400 });
  }

  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };
  // Plattformspezifischer Referer hilft bei TikTok/Instagram CDN
  if (platformHint === "tiktok" || /tiktokcdn/.test(target)) {
    headers["Referer"] = "https://www.tiktok.com/";
  } else if (platformHint === "instagram" || /cdninstagram|fbcdn/.test(target)) {
    headers["Referer"] = "https://www.instagram.com/";
  }
  // Range-Header durchreichen, damit der Browser scrubben/seeken kann
  const range = req.headers.get("range");
  if (range) headers["Range"] = range;

  const upstream = await fetch(target, { headers, redirect: "follow" });

  if (!upstream.ok && upstream.status !== 206) {
    return new Response(`Upstream Fehler: HTTP ${upstream.status}`, {
      status: upstream.status,
    });
  }

  const safeName = filename.replace(/[^\w.\- ]+/g, "_").slice(0, 120);
  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", upstream.headers.get("content-type") || "video/mp4");
  responseHeaders.set(
    "Content-Disposition",
    `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`
  );
  const len = upstream.headers.get("content-length");
  if (len) responseHeaders.set("Content-Length", len);
  const cr = upstream.headers.get("content-range");
  if (cr) responseHeaders.set("Content-Range", cr);
  const ar = upstream.headers.get("accept-ranges");
  if (ar) responseHeaders.set("Accept-Ranges", ar);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
