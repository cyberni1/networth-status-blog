/**
 * Seed script: Mark Zuckerberg article
 * Run: npx ts-node --project tsconfig.json -e "require('./prisma/seed-zuckerberg.ts')"
 * OR via: npx tsx prisma/seed-zuckerberg.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CONTENT = `
<div style="background:rgba(245,200,66,0.08);border:1px solid rgba(245,200,66,0.25);border-radius:14px;padding:20px 24px;margin-bottom:32px">
  <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#fde047;text-transform:uppercase;margin-bottom:12px">⚡ In 5 Sekunden: Das Wichtigste</p>
  <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px">
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Gesamtvermögen:</strong> $221 Mrd. (Stand: April 2026)</li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Rang weltweit:</strong> #3 (hinter Bernard Arnault &amp; Jeff Bezos)</li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Hauptquelle:</strong> 85% Meta-Aktien (ca. 13% des Unternehmens)</li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Veränderung 2025–2026:</strong> <span style="color:#4ade80">▲ +$23,7 Mrd. (+12%)</span></li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Täglicher Verdienst (geschätzt):</strong> ca. $65 Mio.</li>
  </ul>
</div>

<h2>Wie ist Mark Zuckerberg so reich geworden?</h2>

<p>Mark Zuckerberg, der Gründer und CEO von Meta (ehemals Facebook), gehört seit über einem Jahrzehnt zu den reichsten Menschen der Welt. Mit einem geschätzten Vermögen von <strong>$221 Mrd.</strong> (April 2026) belegt er laut Forbes den dritten Platz – hinter Bernard Arnault (LVMH) und Jeff Bezos. Im Vergleich zum Vorjahr konnte Zuckerberg sein Net Worth um über <strong style="color:#4ade80">$23 Mrd.</strong> steigern, getrieben durch die starke Erholung der Meta-Aktie und milliardenschwere KI-Investitionen.</p>

<p>Anders als viele andere Tech-Milliardäre ist sein Vermögen extrem konzentriert: Rund <strong>85% stecken in Meta-Aktien</strong>. Dieser Artikel analysiert seine Einnahmequellen, größten Assets, Kontroversen und warum er „nur" 1% seines Vermögens spendet – anders als Gates oder Buffett.</p>

<h3>Die Facebook-Gründung (2004)</h3>

<p>Zuckerberg gründete Facebook im Alter von 19 Jahren in seinem Harvard-Wohnheim. Die entscheidende Wende: <strong>2012 ging Facebook mit einer Bewertung von $104 Mrd. an die Börse</strong> – Zuckerberg behielt 28% der Anteile. Heute hält er nach Aktienverkäufen (hauptsächlich für wohltätige Zwecke) noch ca. <strong>13% an Meta</strong> – und genau dieser Anteil macht den Großteil seines Vermögens aus.</p>

<h3>Die Meta-Transformation (2021–heute)</h3>

<p>Die Umbenennung in Meta und der Fokus auf das Metaverse ließen das Vermögen 2022 kurzzeitig auf unter $40 Mrd. abstürzen – ein Verlust von über 70% in weniger als 12 Monaten. Doch seit 2023 hat sich der Wert durch <strong>KI-Erfolge, das Llama-Modell und massive Kostensenkungen</strong> (das „Year of Efficiency") mehr als verfünffacht. Die Meta-Aktie stieg von ~$90 (2022) auf über $650 (2025).</p>

<div style="background:rgba(168,85,247,0.06);border-left:3px solid #a855f7;padding:14px 18px;border-radius:0 10px 10px 0;margin:24px 0">
  <p style="font-size:12px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">📊 Konfidenz-Rating: Hoch gesichert</p>
  <p style="font-size:14px;color:rgba(255,255,255,0.6);margin:0">Basiert auf SEC-Filings, Forbes Real-Time Billionaires Index und Bloomberg Billionaires Index (April 2026).</p>
</div>

<h2>Die größten Assets von Mark Zuckerberg</h2>

<h3>🏠 Immobilien (geschätzt $350 Mio.)</h3>

<ul>
  <li><strong>Hawaii (Kauai):</strong> 5,6 km² Grundstück – Kaufpreis ca. $170 Mio. (umstritten wegen einheimischer Landrechte)</li>
  <li><strong>Lake Tahoe:</strong> Zwei Anwesen für $59 Mio. (2021–2022)</li>
  <li><strong>San Francisco:</strong> Townhouse für $31 Mio. (2022)</li>
  <li><strong>Palo Alto:</strong> 5.000 m² Hauptwohnsitz (Wert ca. $40 Mio.)</li>
</ul>

<h3>✈️ Weitere Luxus-Assets</h3>

<ul>
  <li><strong>Privatjet:</strong> Gulfstream G650ER (Wert ca. $70 Mio.)</li>
  <li><strong>Yacht „Launchpad":</strong> Superyacht, ca. 118 m lang, Schätzwert $300 Mio.</li>
  <li><strong>Kunstsammlung:</strong> Schätzungen um $100 Mio. (u.a. Werke von Kerry James Marshall)</li>
</ul>

<p><strong>Kuriosum:</strong> Zuckerberg fährt trotz allem einen VW Golf ($25.000) – eines der auffälligsten Beispiele für bodenständiges Auftreten unter Milliardären.</p>

<h2>Wie hoch ist sein Jahreseinkommen?</h2>

<p>Zuckerberg zahlt sich offiziell <strong>$1 Gehalt pro Jahr</strong> – ein klassischer Gründer-Move. Sein echtes Einkommen kommt aus:</p>

<ul>
  <li><strong>Aktienoptionen:</strong> In guten Jahren mehrere Milliarden Dollar</li>
  <li><strong>Dividenden:</strong> Meta zahlt keine Dividende – daher kein passives Einkommen</li>
  <li><strong>Kapitalgewinne:</strong> Regelmäßige Aktienverkäufe (zuletzt 2024: $200 Mio. für KI-Forschung)</li>
</ul>

<p>Fazit: Sein Vermögen wächst fast ausschließlich über den Aktienkurs von Meta – nicht über Gehalt oder Dividenden. Das macht es gleichzeitig volatil: Ein 10%-Einbruch der Meta-Aktie kostet ihn über $20 Mrd. in einem einzigen Tag.</p>

<h2>Vergleich mit anderen Tech-Milliardären</h2>

<div style="overflow-x:auto;margin:24px 0">
  <table style="width:100%;border-collapse:collapse;font-size:14px" aria-label="Vergleich der reichsten Tech-Milliardäre">
    <thead>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
        <th style="text-align:left;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600">Name</th>
        <th style="text-align:right;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600">Vermögen</th>
        <th style="text-align:left;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600;min-width:140px">Hauptquelle</th>
        <th style="text-align:right;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600">Unterschied</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:12px;color:rgba(255,255,255,0.8)">Bernard Arnault</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">$233 Mrd.</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Luxusgüter (LVMH)</td>
        <td style="padding:12px;text-align:right;color:#4ade80;font-weight:600">+$12 Mrd.</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:12px;color:rgba(255,255,255,0.8)">Jeff Bezos</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">$228 Mrd.</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Amazon</td>
        <td style="padding:12px;text-align:right;color:#4ade80;font-weight:600">+$7 Mrd.</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(168,85,247,0.08)">
        <td style="padding:12px;color:#c084fc;font-weight:700">Mark Zuckerberg ← Du bist hier</td>
        <td style="padding:12px;text-align:right;color:#c084fc;font-weight:800">$221 Mrd.</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Meta Platforms</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.4)">—</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:12px;color:rgba(255,255,255,0.8)">Elon Musk</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">$195 Mrd.</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Tesla, SpaceX, X</td>
        <td style="padding:12px;text-align:right;color:#f87171;font-weight:600">-$26 Mrd.</td>
      </tr>
      <tr>
        <td style="padding:12px;color:rgba(255,255,255,0.8)">Larry Ellison</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">$160 Mrd.</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Oracle</td>
        <td style="padding:12px;text-align:right;color:#f87171;font-weight:600">-$61 Mrd.</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Kritik &amp; Kontroversen um sein Vermögen</h2>

<ul>
  <li><strong>„1%-Spender":</strong> Hat versprochen, 99% seines Vermögens zu spenden – bisher sind laut Forbes weniger als 1% geflossen. Die Chan Zuckerberg Initiative ist als LLC strukturiert, nicht als klassische Stiftung.</li>
  <li><strong>Landkonflikte Hawaii:</strong> Der Kauf von 5,6 km² auf Kauai wurde von Einheimischen als „neokolonial" kritisiert. Zuckerberg nutzte jahrhundertealte Rechtsstrukturen, um Landbesitzer zu enteignen.</li>
  <li><strong>Steueroptimierung:</strong> Wie die meisten Milliardäre nutzt er Stiftungen und Darlehen gegen Aktien, um Kapitalertragssteuer zu minimieren.</li>
</ul>

<h2>Quellen &amp; Verweise</h2>

<ul>
  <li>Forbes Real-Time Billionaires Index (April 2026)</li>
  <li>Bloomberg Billionaires Index (April 2026)</li>
  <li>SEC-Filings, Meta Platforms Inc. (2025–2026)</li>
  <li>The Land Report – Immobilienkäufe Zuckerberg</li>
</ul>

<p style="font-size:13px;color:rgba(255,255,255,0.35);margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
  <strong>Verwandte Artikel:</strong>
  Elon Musk Vermögen · Jeff Bezos Nettovermögen · Die reichsten Tech-Gründer der Welt
</p>
`.trim();

const FAQ = JSON.stringify([
  {
    question: "Wie reich ist Mark Zuckerberg genau?",
    answer: "$221 Mrd. (April 2026) – die exakte Zahl schwankt täglich mit dem Meta-Aktienkurs. Bei einem 10%-Einbruch verliert er auf dem Papier über $20 Mrd. innerhalb eines Tages.",
  },
  {
    question: "Besitzt Mark Zuckerberg mehr als Elon Musk?",
    answer: "Ja, aktuell ca. $26 Mrd. mehr. Zuckerberg hält Platz 3 der Forbes-Liste, während Musk – trotz Tesla und SpaceX – durch sein Twitter/X-Investment Vermögen verloren hat.",
  },
  {
    question: "Wie viel Geld hat Mark Zuckerberg gespendet?",
    answer: "Laut Forbes unter $1 Mrd. – weit entfernt von seinem 99%-Versprechen. Die Chan Zuckerberg Initiative ist als LLC strukturiert, was steuerliche Vorteile bietet, aber weniger Transparenz als eine klassische Stiftung.",
  },
  {
    question: "Warum fährt Zuckerberg einen VW Golf?",
    answer: "Er gilt bewusst als bodenständig. Sein luxuriösestes Asset ist dagegen das Hawaii-Anwesen (ca. $170 Mio.) sowie seine Superyacht 'Launchpad' (geschätzt $300 Mio.).",
  },
  {
    question: "Wie viel verdient Mark Zuckerberg pro Sekunde?",
    answer: "Ca. $750 pro Sekunde – basierend auf dem Vermögenswachstum von +$23,7 Mrd. in 2024. Das entspricht etwa $65 Mio. pro Tag oder $2,7 Mio. pro Stunde.",
  },
  {
    question: "Wie viel Prozent von Meta gehören Mark Zuckerberg?",
    answer: "Ca. 13% der Meta-Aktien (2025). Er hält damit trotz Jahrzehnten von Aktienverkäufen immer noch die Kontrolle über das Unternehmen durch spezielle Stimmrechtsaktien (Klasse B).",
  },
]);

const WEALTH_DATA = JSON.stringify({
  netWorth: 221,
  currency: "$",
  trend: "up",
  trendPercent: 12,
  yearChange: 23.7,
  mainSource: "Tech / Social Media",
  sourceIcon: "💻",
  assets: [
    { label: "Meta-Aktien", percent: 85, color: "#a855f7" },
    { label: "Immobilien", percent: 8, color: "#F5B041" },
    { label: "Liquide Mittel", percent: 5, color: "#60a5fa" },
    { label: "Weitere Investments", percent: 2, color: "#4ade80" },
  ],
  incomeIcons: ["💼 Gründer", "💻 Tech", "🏠 Immobilien", "📈 Meta-Aktien"],
  annualIncome: 23.7,
  maxNetWorth: 400,
});

async function main() {
  // Get or create admin user
  let user = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "admin@networth-status.de",
        name: "PROMIVERMÖGEN",
        role: "ADMIN",
      },
    });
    console.log("Created admin user");
  }

  // Check if article already exists
  const existing = await prisma.post.findUnique({ where: { slug: "mark-zuckerberg-vermoegen-2025" } });
  if (existing) {
    console.log("Article already exists, updating...");
    await prisma.post.update({
      where: { slug: "mark-zuckerberg-vermoegen-2025" },
      data: {
        title: "Das Vermögen von Mark Zuckerberg 2026: Aktuelle Schätzung, Quelle, Entwicklung",
        content: CONTENT,
        excerpt: "Mark Zuckerbergs Vermögen 2026: $221 Mrd. Wie reich ist der Meta-Gründer wirklich? Alle Fakten zu Einkommensquellen, Assets, Kontroversen und dem Vergleich mit Musk & Bezos.",
        metaTitle: "Mark Zuckerberg Vermögen 2026: $221 Mrd. – Aktuelle Schätzung",
        metaDescription: "Mark Zuckerbergs Vermögen 2026: Aktuelle Schätzung $221 Mrd. Wie reich ist der Meta-Gründer wirklich? Quelle, Entwicklung, Vergleich zu Musk & Bezos.",
        keywords: "Mark Zuckerberg Vermögen, Mark Zuckerberg Nettovermögen, wie reich ist Zuckerberg, Zuckerberg 2026, Meta Gründer Vermögen, Zuckerberg Aktien, Zuckerberg Immobilien, reichste Tech-Milliardäre",
        tags: ["mark-zuckerberg", "meta", "tech-milliardaere", "facebook", "nettovermögen"],
        faq: FAQ,
        wealthData: WEALTH_DATA,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  } else {
    await prisma.post.create({
      data: {
        title: "Das Vermögen von Mark Zuckerberg 2026: Aktuelle Schätzung, Quelle, Entwicklung",
        slug: "mark-zuckerberg-vermoegen-2025",
        content: CONTENT,
        excerpt: "Mark Zuckerbergs Vermögen 2026: $221 Mrd. Wie reich ist der Meta-Gründer wirklich? Alle Fakten zu Einkommensquellen, Assets, Kontroversen und dem Vergleich mit Musk & Bezos.",
        metaTitle: "Mark Zuckerberg Vermögen 2026: $221 Mrd. – Aktuelle Schätzung",
        metaDescription: "Mark Zuckerbergs Vermögen 2026: Aktuelle Schätzung $221 Mrd. Wie reich ist der Meta-Gründer wirklich? Quelle, Entwicklung, Vergleich zu Musk & Bezos.",
        keywords: "Mark Zuckerberg Vermögen, Mark Zuckerberg Nettovermögen, wie reich ist Zuckerberg, Zuckerberg 2026, Meta Gründer Vermögen, Zuckerberg Aktien, Zuckerberg Immobilien, reichste Tech-Milliardäre",
        tags: ["mark-zuckerberg", "meta", "tech-milliardaere", "facebook", "nettovermögen"],
        category: "UNTERNEHMER",
        faq: FAQ,
        wealthData: WEALTH_DATA,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: user.id,
      },
    });
  }

  console.log("✅ Mark Zuckerberg article created/updated!");
  console.log("   URL: /mark-zuckerberg-vermoegen-2025");
  console.log("");
  console.log("   Next: Upload the 3 images via Admin panel:");
  console.log("   1. Portrait (Julian image 1) → set as Cover Image");
  console.log("   2. Selfie with wife + Porsches → add to Luxus-Assets section");
  console.log("   3. Yacht photo → add to Luxus-Assets section");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
