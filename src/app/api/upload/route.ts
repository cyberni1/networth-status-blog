import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// SEO-friendly filename from any string
function toSeoFilename(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 60);
}

// Build SEO-optimised alt text from title + category
function buildSeoAlt(title: string, category: string): string {
  const catMap: Record<string, string> = {
    KUENSTLER: "Künstler",
    SPORTLER: "Sportler",
    UNTERNEHMER: "Unternehmer",
    INFLUENCER: "Influencer",
  };
  const cat = catMap[category] ?? "";
  const year = new Date().getFullYear();
  // e.g. "Helene Fischer Nettovermögen 2026 – Künstlerin | PROMIVERMÖGEN"
  return `${title} Nettovermögen ${year}${cat ? ` – ${cat}` : ""} | PROMIVERMÖGEN`.substring(0, 120);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("adminToken")?.value;
  if (!adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || "image";
  const slug = (formData.get("slug") as string) || "";
  const category = (formData.get("category") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/heic"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Use slug if available (already SEO-perfect), otherwise derive from title
  const seoBase = slug ? slug.substring(0, 60) : toSeoFilename(title);
  const uniqueSuffix = Date.now().toString(36);
  const filename = `${seoBase}-${uniqueSuffix}.webp`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);

  // Convert to WebP, resize to max 1200px wide, optimize
  await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(filePath);

  const url = `/uploads/${filename}`;
  const alt = buildSeoAlt(title, category);

  return NextResponse.json({ url, alt });
}
