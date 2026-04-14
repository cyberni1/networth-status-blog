import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// SEO-friendly filename from title
function toSeoFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 60);
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
  const seoName = toSeoFilename(title);
  const uniqueSuffix = Date.now().toString(36);
  const filename = `${seoName}-${uniqueSuffix}.webp`;

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
  const alt = title || seoName.replace(/-/g, " ");

  return NextResponse.json({ url, alt });
}
