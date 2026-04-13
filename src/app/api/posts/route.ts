import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Category, PostStatus } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Get or create the user record
  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
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
