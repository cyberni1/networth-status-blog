import { prisma } from "@/lib/prisma";
import PostEditor from "@/components/PostEditor";
import { notFound } from "next/navigation";
import { Category, PostStatus } from "@prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <PostEditor
      initialData={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt ?? "",
        metaTitle: post.metaTitle ?? "",
        metaDescription: post.metaDescription ?? "",
        keywords: post.keywords ?? "",
        tags: post.tags,
        category: post.category as Category,
        coverImage: post.coverImage ?? "",
        coverImageAlt: post.coverImageAlt ?? "",
        status: post.status as PostStatus,
      }}
    />
  );
}
