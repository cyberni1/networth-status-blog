import { auth } from "@/auth";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim();

  if (!name) {
    return NextResponse.json({ error: "name parameter required" }, { status: 400 });
  }

  // 1. Query Wikipedia REST API for page summary (includes main image)
  const wikiTitle = encodeURIComponent(name.replace(/ /g, "_"));
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`;

  let imageUrl: string | undefined;
  let altText = name;

  try {
    const summaryRes = await fetch(summaryUrl, {
      headers: { "User-Agent": "NetworthStatus/1.0 (https://networth-status-blog.vercel.app)" },
    });

    if (!summaryRes.ok) {
      // Try German Wikipedia as fallback
      const deRes = await fetch(
        `https://de.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`,
        { headers: { "User-Agent": "NetworthStatus/1.0" } }
      );
      if (deRes.ok) {
        const deData = await deRes.json();
        imageUrl = deData.originalimage?.source ?? deData.thumbnail?.source;
        altText = deData.title ?? name;
      }
    } else {
      const data = await summaryRes.json();
      // Prefer original full-resolution image, fallback to thumbnail
      imageUrl = data.originalimage?.source ?? data.thumbnail?.source;
      altText = data.title ?? name;
    }
  } catch {
    return NextResponse.json({ error: "Wikipedia API not reachable" }, { status: 502 });
  }

  if (!imageUrl) {
    return NextResponse.json(
      { error: `Kein Bild auf Wikipedia gefunden für: "${name}"` },
      { status: 404 }
    );
  }

  // 2. Download the image
  let imgBuffer: Buffer;
  try {
    const imgRes = await fetch(imageUrl, {
      headers: { "User-Agent": "NetworthStatus/1.0" },
    });
    if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);
    imgBuffer = Buffer.from(await imgRes.arrayBuffer());
  } catch (e) {
    return NextResponse.json({ error: "Bild konnte nicht heruntergeladen werden" }, { status: 502 });
  }

  // 3. Process with Sharp: resize to 1200px wide, convert to WebP
  const slug = name
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 50);

  const filename = `wiki-${slug}-${Date.now().toString(36)}.webp`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);

  try {
    await sharp(imgBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(filePath);
  } catch {
    return NextResponse.json({ error: "Bildverarbeitung fehlgeschlagen" }, { status: 500 });
  }

  return NextResponse.json({
    url: `/uploads/${filename}`,
    alt: altText,
    source: "Wikipedia (CC-lizenziert)",
    originalUrl: imageUrl,
  });
}
