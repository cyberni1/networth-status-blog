import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Category, PostStatus } from "@prisma/client";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("adminToken")?.value;
  if (!adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Get or create the user record
  const email = "admin@promivermögen.com";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Admin",
        image: null,
        role: "ADMIN",
      },
    });
  }

  const slug = body.slug || generateSlug(body.title);

  const post = await prisma.post.create({
    data: {
      title: body.title,
      slug,
      content: body.content ?? "",
      excerpt: body.excerpt ?? null,
      metaTitle: body.metaTitle ?? null,
      metaDescription: body.metaDescription ?? null,
      keywords: body.keywords ?? null,
      tags: body.tags ?? [],
      category: (body.category as Category) ?? "KUENSTLER",
      coverImage: body.coverImage ?? null,
      coverImageAlt: body.coverImageAlt ?? null,
      faq: body.faq ?? null,
      wealthData: body.wealthData ?? null,
      status: (body.status as PostStatus) ?? "DRAFT",
      publishedAt: body.status === "PUBLISHED" ? new Date() : null,
      authorId: user.id,
    },
  });

  return NextResponse.json(post, { status: 201 });
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    + "-" + Date.now().toString(36);
}
