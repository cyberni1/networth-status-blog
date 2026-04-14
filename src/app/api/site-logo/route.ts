import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();

// GET: Logo als Bild ausliefern
export async function GET() {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "logo" } });

  if (!setting) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = Buffer.from(setting.value, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}

// POST: Logo hochladen (nur Admin)
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("adminToken")?.value;
  if (!adminToken) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 5 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Zu WebP konvertieren, max 400px breit (Navbar-optimiert)
  const optimized = await sharp(buffer)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer();

  const base64 = optimized.toString("base64");

  await prisma.siteSetting.upsert({
    where: { key: "logo" },
    update: { value: base64 },
    create: { key: "logo", value: base64 },
  });

  return NextResponse.json({ success: true, size: optimized.length });
}
