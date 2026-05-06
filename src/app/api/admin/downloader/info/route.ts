import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Innertube, UniversalCache } from "youtubei.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

function detectPlatform(url: string): VideoInfo["platform"] | null {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/instagram\.com/i.test(url)) return "instagram";
  return null;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:v=|youtu\.be\/|\/embed\/|\/shorts\/|\/v\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

async function fetchYouTube(url: string): Promise<VideoInfo> {
  const videoId = extractYouTubeId(url);
  if (!videoId) throw new Error("YouTube: Video-ID konnte nicht extrahiert werden");

  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });

  // IOS Client umgeht YouTubes Bot-Schutz oft besser als WEB; URLs sind
  // dort außerdem direkt nutzbar (kein Cipher-Decoding nötig).
  // biome-ignore lint/suspicious/noExplicitAny: youtubei.js client option types are too restrictive
  const info = await yt.getBasicInfo(videoId, { client: "IOS" } as any);

  const combined = info.streaming_data?.formats || [];

  const formats: Format[] = combined
    .filter((f) => f.has_audio && f.has_video && f.url)
    .map((f) => ({
      url: f.url as string,
      quality: f.quality_label || "unbekannt",
      container: f.mime_type?.split("/")[1]?.split(";")[0] || "mp4",
      hasAudio: true,
      hasVideo: true,
      filesizeMB: f.content_length
        ? Math.round(Number(f.content_length) / 1024 / 1024)
        : undefined,
    }))
    .sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0));

  if (formats.length === 0) {
    throw new Error(
      "YouTube: Keine kombinierten Video+Audio-Formate verfügbar. " +
        "Ein VPS mit yt-dlp wäre für dieses Video nötig."
    );
  }

  const thumbs = info.basic_info.thumbnail || [];
  return {
    platform: "youtube",
    title: info.basic_info.title || "YouTube Video",
    thumbnail: thumbs[thumbs.length - 1]?.url || "",
    duration: info.basic_info.duration,
    author: info.basic_info.author,
    formats,
  };
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} beim Abruf von ${url}`);
  return res.text();
}

async function fetchTikTok(url: string): Promise<VideoInfo> {
  const html = await fetchHtml(url);
  const match = html.match(
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) throw new Error("TikTok: Datenblock nicht gefunden");

  const data = JSON.parse(match[1]);
  const itemStruct =
    data?.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct;
  if (!itemStruct) throw new Error("TikTok: Video-Daten nicht gefunden");

  const video = itemStruct.video || {};
  const playUrl: string = video.playAddr || video.downloadAddr || "";
  if (!playUrl) throw new Error("TikTok: Keine Video-URL gefunden");

  return {
    platform: "tiktok",
    title: itemStruct.desc || `TikTok von ${itemStruct.author?.uniqueId || "Unbekannt"}`,
    thumbnail: video.cover || video.dynamicCover || "",
    duration: video.duration,
    author: itemStruct.author?.nickname || itemStruct.author?.uniqueId,
    formats: [
      {
        url: playUrl,
        quality: `${video.height || ""}p`,
        container: "mp4",
        hasAudio: true,
        hasVideo: true,
      },
    ],
  };
}

async function fetchInstagram(url: string): Promise<VideoInfo> {
  // Erzwinge ?__a=1&__d=dis nicht — funktioniert nicht ohne Login.
  // Stattdessen: og:video Meta-Tag aus der HTML-Seite extrahieren.
  const html = await fetchHtml(url);

  const videoUrlMatch =
    html.match(/<meta property="og:video" content="([^"]+)"/) ||
    html.match(/"video_url":"([^"]+)"/) ||
    html.match(/"playback_url":"([^"]+)"/);
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/);

  if (!videoUrlMatch) {
    throw new Error(
      "Instagram: Video-URL konnte nicht extrahiert werden. Prüfe, ob der Post öffentlich ist."
    );
  }

  const videoUrl = videoUrlMatch[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");

  return {
    platform: "instagram",
    title: titleMatch?.[1] || "Instagram Video",
    thumbnail: imgMatch?.[1] || "",
    formats: [
      {
        url: videoUrl,
        quality: "Original",
        container: "mp4",
        hasAudio: true,
        hasVideo: true,
      },
    ],
  };
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (!cookieStore.get("adminToken")?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL fehlt" }, { status: 400 });
    }

    const platform = detectPlatform(url);
    if (!platform) {
      return NextResponse.json(
        { error: "Plattform nicht unterstützt. YouTube, TikTok und Instagram werden unterstützt." },
        { status: 400 }
      );
    }

    let info: VideoInfo;
    if (platform === "youtube") info = await fetchYouTube(url);
    else if (platform === "tiktok") info = await fetchTikTok(url);
    else info = await fetchInstagram(url);

    return NextResponse.json(info);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
