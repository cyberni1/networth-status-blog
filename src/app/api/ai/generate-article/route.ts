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

  const { prompt, category } = await req.json();
  if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

  const catLabel = CATEGORY_LABELS[category] ?? "Prominente";

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Du bist ein professioneller Journalist für ein deutsches Blog über Nettovermögen von Prominenten (Kategorie: ${catLabel}).

Schreibe einen vollständigen, SEO-optimierten Blog-Artikel auf Deutsch basierend auf diesem Thema/Prompt:
"${prompt}"

Anforderungen:
- Titel: Prägnant, SEO-optimiert, enthält den Namen und "Nettovermögen" oder "Vermögen"
- Länge: 600-900 Wörter
- Struktur: Einleitung → Karriere/Hintergrund → Einkommensquellen → Vermögensschätzung → Fazit
- Ton: Informativ, professionell, aber zugänglich
- Zahlen und Fakten einbauen (auch geschätzte/typische Werte für die Branche)
- HTML-Formatierung: Nutze <h2>, <h3>, <p>, <strong>, <ul>, <li>

Antworte NUR mit einem JSON-Objekt (kein Markdown drumherum):
{
  "title": "Titel des Artikels",
  "content": "Vollständiger HTML-Inhalt des Artikels"
}`,
      },
    ],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Parsing failed", raw: rawText }, { status: 500 });
  }
}
