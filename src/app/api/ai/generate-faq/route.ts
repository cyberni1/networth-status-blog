import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  const plainText = content
    ? content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 3000)
    : "";

  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Du bist SEO-Experte für ein deutsches Blog über Nettovermögen von Prominenten.

Generiere 6 häufig gestellte Fragen (FAQ) für diesen Artikel. Die FAQs erscheinen in Google als "People also ask" Boxen und sollen Nutzer ansprechen die nach dem Vermögen dieser Person suchen.

Titel: ${title}
Kategorie: ${categoryLabel}
Inhalt: ${plainText || "(noch leer)"}

Regeln:
- Fragen auf Deutsch, direkt und klar formuliert
- Antworten 2-4 Sätze, informativ und präzise
- Mix aus: Vermögensfragen, Karrierefragen, Einkommensfragen, Vergleichsfragen
- Antworten sollen auch ohne den Artikel verständlich sein

Antworte NUR mit einem validen JSON-Array (kein Markdown):
[
  {"question": "Frage 1?", "answer": "Antwort 1."},
  {"question": "Frage 2?", "answer": "Antwort 2."}
]`,
      },
    ],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "[]";

  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found");
    const faqs = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ faqs });
  } catch {
    return NextResponse.json({ faqs: [] });
  }
}
