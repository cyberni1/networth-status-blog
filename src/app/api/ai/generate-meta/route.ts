import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 80);
}

const CATEGORY_LABELS: Record<string, string> = {
  KUENSTLER: "Künstler",
  SPORTLER: "Sportler",
  UNTERNEHMER: "Unternehmer",
  INFLUENCER: "Influencer",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, category } = await req.json();

  // Strip HTML tags for text analysis
  const plainText = content
    ? content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 2000)
    : "";

  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Du bist ein deutschsprachiger SEO-Experte für ein Blog über Nettovermögen von Prominenten.

Analysiere diesen Blogartikel und generiere alle SEO-Metadaten auf Deutsch.

Titel: ${title}
Kategorie: ${categoryLabel}
Inhalt: ${plainText || "(noch leer)"}

Antworte NUR mit einem validen JSON-Objekt (kein Markdown, kein Text drumherum):
{
  "slug": "url-freundlicher-slug-max-80-zeichen",
  "excerpt": "Zusammenfassung in 1-2 Sätzen (max 200 Zeichen)",
  "metaTitle": "SEO-Titel mit Hauptkeyword (max 60 Zeichen)",
  "metaDescription": "Meta-Beschreibung für Google (max 160 Zeichen, enthält Call-to-Action)",
  "keywords": "hauptkeyword, keyword2, longtail keyword phrase, keyword4, keyword5, keyword6, keyword7, keyword8",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Für die keywords: Wähle die 8 besten Keywords für Google-Ranking — mix aus: Hauptkeyword (Personenname + Nettovermögen), Longtail-Keywords (z.B. "wie reich ist X"), verwandte Suchbegriffe, und kategoriesspezifische Keywords. Priorisiere Keywords mit hohem Suchvolumen in Deutschland.`,
      },
    ],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    // Extract JSON from the response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);

    // Ensure slug is URL-safe
    if (parsed.slug) {
      parsed.slug = toSlug(parsed.slug);
    } else if (title) {
      parsed.slug = toSlug(title);
    }

    return NextResponse.json(parsed);
  } catch {
    // Fallback: generate slug from title
    return NextResponse.json({
      slug: toSlug(title),
      excerpt: "",
      metaTitle: title.substring(0, 60),
      metaDescription: "",
      keywords: "",
      tags: [],
    });
  }
}
