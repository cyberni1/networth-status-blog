import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Category, PostStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const post = await prisma.post.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      content: body.content ?? "",
      excerpt: body.excerpt ?? null,
      metaTitle: body.metaTitle ?? null,
      metaDescription: body.metaDescription ?? null,
      keywords: body.keywords ?? null,
      tags: body.tags ?? [],
      category: body.category as Category,
      coverImage: body.coverImage ?? null,
      coverImageAlt: body.coverImageAlt ?? null,
      status: body.status as PostStatus,
      publishedAt:
        body.status === "PUBLISHED"
          ? body.publishedAt ?? new Date()
          : null,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
