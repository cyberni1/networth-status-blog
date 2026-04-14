/**
 * Vercel Cron Job: Täglich 3 Artikel automatisch veröffentlichen
 * Läuft jeden Tag um 08:00 Uhr
 * Gesichert durch CRON_SECRET env var
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";

export const maxDuration = 300; // 5 Minuten Timeout (Vercel Pro)

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const today = () => new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Schritt 1: Claude wählt 3 Trending-Prominente ───────────────────────────
async function getTrendingCelebrities(existingSlugs: string[]): Promise<CelebrityTopic[]> {
  const existingNames = existingSlugs.map((s) => s.replace(/-vermoegen-\d{4}$/, "").replace(/-/g, " "));

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `Du bist ein SEO-Experte für ein deutsches Prominenten-Nettovermögen-Blog namens PROMIVERMÖGEN (promivermögen.com).
Deine Aufgabe: Wähle Prominente aus, die gerade in Deutschland stark gesucht werden.
Berücksichtige: aktuelle Sportereignisse, Musik-Releases, Unternehmens-News, Skandale, TV-Auftritte, Social-Media-Trends.
Heute ist der ${today()}.`,
    messages: [
      {
        role: "user",
        content: `Wähle genau 3 Prominente (deutsche oder international bekannte), über deren Vermögen deutsche Nutzer gerade stark googeln.

Bereits veröffentlichte Artikel (diese NICHT nochmal wählen):
${existingNames.join(", ") || "Keine"}

Antworte NUR mit einem JSON-Array, kein Markdown:
[
  {
    "name": "Vollständiger Name",
    "nameSlug": "vorname-nachname",
    "category": "KUENSTLER" oder "SPORTLER" oder "UNTERNEHMER" oder "INFLUENCER",
    "netWorthMio": Zahl (geschätztes Nettovermögen in Millionen Euro),
    "currency": "€" oder "$",
    "trendReason": "Warum gerade trending (1 Satz)",
    "keyFacts": ["Fakt 1", "Fakt 2", "Fakt 3"]
  }
]`,
      },
    ],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text : "[]";
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Kein JSON-Array in Claude-Antwort gefunden");
  return JSON.parse(match[0]) as CelebrityTopic[];
}

// ─── Schritt 2: Vollständigen Artikel generieren ──────────────────────────────
async function generateArticle(topic: CelebrityTopic): Promise<GeneratedArticle> {
  const catLabels: Record<string, string> = {
    KUENSTLER: "Künstler/in",
    SPORTLER: "Sportler/in",
    UNTERNEHMER: "Unternehmer/in",
    INFLUENCER: "Influencer/in",
  };
  const catLabel = catLabels[topic.category] ?? "Prominente/r";
  const year = new Date().getFullYear();
  const currency = topic.currency ?? "€";

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: `Du bist ein professioneller Journalist für PROMIVERMÖGEN, das führende deutsche Blog für Promi-Vermögen.
Schreibe hochwertige, SEO-optimierte Artikel auf Deutsch. Heute ist der ${today()}.
Nutze ausschließlich HTML-Tags (h2, h3, p, strong, ul, li). Keine Markdown-Syntax.
Stil: informativ, sachlich, aber lebendig. Zahlen konkret nennen.`,
    messages: [
      {
        role: "user",
        content: `Schreibe einen vollständigen Vermögens-Artikel über: ${topic.name} (${catLabel})

Bekannte Fakten:
- Geschätztes Nettovermögen: ${topic.netWorthMio} Mio. ${currency}
- Kategorie: ${catLabel}
- Trending weil: ${topic.trendReason}
- Schlüssel-Fakten: ${topic.keyFacts.join("; ")}

Artikel-Anforderungen:
1. ZUSAMMENFASSUNGS-BOX: HTML-div mit gelb-goldener Gestaltung (inline styles), zeigt 4–5 Bullet Points mit den wichtigsten Zahlen
2. H2: Wer ist [Name]? – Kurzportrait (2–3 Absätze)
3. H2: Einkommensquellen (3–4 H3-Unterabschnitte mit konkreten Zahlen)
4. H2: Vergleich mit ähnlichen Prominenten (als HTML-Tabelle mit inline styles, dunkel gestaltet)
5. H2: Lebensstil & Assets
6. H2: Quellen & Methodik

Nutze diese inline styles für die Zusammenfassungs-Box:
style="background:rgba(245,200,66,0.08);border:1px solid rgba(245,200,66,0.25);border-radius:14px;padding:20px 24px;margin-bottom:32px"

Antworte NUR mit einem JSON-Objekt:
{
  "title": "SEO-Titel mit Namen und Vermögen ${year}",
  "content": "Vollständiger HTML-Inhalt",
  "excerpt": "2-3 Sätze Zusammenfassung für SEO",
  "metaTitle": "Meta-Title max 60 Zeichen",
  "metaDescription": "Meta-Description 150-160 Zeichen",
  "keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
  "faq": [
    {"question": "Frage 1?", "answer": "Antwort 1"},
    {"question": "Frage 2?", "answer": "Antwort 2"},
    {"question": "Frage 3?", "answer": "Antwort 3"},
    {"question": "Frage 4?", "answer": "Antwort 4"},
    {"question": "Frage 5?", "answer": "Antwort 5"}
  ]
}`,
      },
    ],
  });

  const raw = msg.content[0].type === "text" ? msg.content[0].text : "{}";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Kein JSON für ${topic.name}`);

  const parsed = JSON.parse(match[0]);

  const wealthData = {
    netWorth: topic.netWorthMio,
    currency,
    trend: "up" as const,
    trendPercent: Math.floor(Math.random() * 8) + 2,
    yearChange: parseFloat((topic.netWorthMio * 0.03).toFixed(1)),
    mainSource: catLabel,
    sourceIcon: topic.category === "KUENSTLER" ? "🎵" : topic.category === "SPORTLER" ? "⚽" : topic.category === "INFLUENCER" ? "📱" : "💼",
    assets: [
      { label: "Haupteinnahme", percent: 45, color: "#a855f7" },
      { label: "Nebeneinnahmen", percent: 30, color: "#f5c842" },
      { label: "Investments", percent: 15, color: "#10b981" },
      { label: "Sonstiges", percent: 10, color: "#3b82f6" },
    ],
    incomeIcons: topic.keyFacts.slice(0, 3).map((f) => `✦ ${f.substring(0, 20)}`),
    annualIncome: parseFloat((topic.netWorthMio * 0.06).toFixed(1)),
    maxNetWorth: topic.netWorthMio * 5,
  };

  return {
    ...parsed,
    wealthData: JSON.stringify(wealthData),
    faq: JSON.stringify(parsed.faq ?? []),
    category: topic.category,
    slug: `${slugify(topic.nameSlug)}-vermoegen-${year}`,
  };
}

// ─── Schritt 3: In DB speichern ───────────────────────────────────────────────
async function saveArticle(article: GeneratedArticle, authorId: string): Promise<string> {
  const existing = await prisma.post.findUnique({ where: { slug: article.slug } });

  if (existing) {
    await prisma.post.update({
      where: { slug: article.slug },
      data: {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        keywords: article.keywords,
        faq: article.faq,
        wealthData: article.wealthData,
        updatedAt: new Date(),
      },
    });
    return `updated:${article.slug}`;
  }

  await prisma.post.create({
    data: {
      slug: article.slug,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      keywords: article.keywords,
      faq: article.faq,
      wealthData: article.wealthData,
      tags: [],
      status: "PUBLISHED",
      publishedAt: new Date(),
      category: article.category as "KUENSTLER" | "SPORTLER" | "UNTERNEHMER" | "INFLUENCER",
      authorId,
    },
  });
  return `created:${article.slug}`;
}

// ─── Haupt-Handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Autorisierung prüfen
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];
  const errors: string[] = [];

  try {
    // Admin-User holen oder anlegen
    let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      admin = await prisma.user.create({
        data: { email: "admin@promivermögen.com", name: "PROMIVERMÖGEN", role: "ADMIN" },
      });
    }

    // Bestehende Slugs laden (Duplikate vermeiden)
    const existingPosts = await prisma.post.findMany({ select: { slug: true } });
    const existingSlugs = existingPosts.map((p) => p.slug);

    // 3 Trending-Themen von Claude holen
    const topics = await getTrendingCelebrities(existingSlugs);

    // Artikel parallel generieren
    const articlePromises = topics.map((topic) =>
      generateArticle(topic).catch((err) => {
        errors.push(`${topic.name}: ${err.message}`);
        return null;
      })
    );
    const articles = await Promise.all(articlePromises);

    // Artikel in DB speichern
    for (const article of articles) {
      if (!article) continue;
      try {
        const result = await saveArticle(article, admin.id);
        results.push(result);
      } catch (err) {
        errors.push(`DB-Fehler ${article.slug}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      date: today(),
      published: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ─── Typen ────────────────────────────────────────────────────────────────────
interface CelebrityTopic {
  name: string;
  nameSlug: string;
  category: string;
  netWorthMio: number;
  currency: string;
  trendReason: string;
  keyFacts: string[];
}

interface GeneratedArticle {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  faq: string;
  wealthData: string;
  category: string;
}
