import { Category } from "@prisma/client";

export const CATEGORIES: Record<Category, { label: string; slug: string; color: string; badge: string }> = {
  KUENSTLER: {
    label: "Künstler",
    slug: "kuenstler",
    color: "#f472b6",
    badge: "badge-kuenstler",
  },
  SPORTLER: {
    label: "Sportler",
    slug: "sportler",
    color: "#4ade80",
    badge: "badge-sportler",
  },
  UNTERNEHMER: {
    label: "Unternehmer",
    slug: "unternehmer",
    color: "#fde047",
    badge: "badge-unternehmer",
  },
  INFLUENCER: {
    label: "Influencer",
    slug: "influencer",
    color: "#a5b4fc",
    badge: "badge-influencer",
  },
};

export function getCategoryFromSlug(slug: string): Category | null {
  const entry = Object.entries(CATEGORIES).find(([, v]) => v.slug === slug);
  return entry ? (entry[0] as Category) : null;
}
