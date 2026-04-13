import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

const SITE_URL = "https://networth-status-blog.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...Object.values(CATEGORIES).map((cat) => ({
      url: `${SITE_URL}/?kategorie=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...postPages];
}
