/**
 * Seed script: Niknando article
 * Run: npx tsx prisma/seed-niknando.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CONTENT = `
<div style="background:rgba(245,200,66,0.08);border:1px solid rgba(245,200,66,0.25);border-radius:14px;padding:20px 24px;margin-bottom:32px">
  <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#fde047;text-transform:uppercase;margin-bottom:12px">⚡ In 5 Sekunden: Das Wichtigste</p>
  <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px">
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Geschätztes Vermögen:</strong> 3,3 Mio. € (Stand: April 2026)</li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">TikTok-Follower:</strong> 2,1 Millionen (Deutschland-weit Top 30)</li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Haupteinnahmen:</strong> Brand Deals, Online-Kurse, Merchandise & Immobilien</li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Vermögenswachstum 2025–2026:</strong> <span style="color:#4ade80">▲ +€500k (+18%)</span></li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Verdienst pro Sponsored Post:</strong> ca. 8.000 – 25.000 €</li>
  </ul>
</div>

<h2>Wer ist Niknando – und wie wurde er so reich?</h2>

<p>Nico „Nando" Schreiber, bekannt als <strong>Niknando</strong>, ist einer der erfolgreichsten deutschen TikTok-Creator im Bereich Lifestyle, Motivation und Business-Content. Mit über <strong>2,1 Millionen Followern auf TikTok</strong> und 480.000 Abonnenten auf Instagram hat sich der Stuttgarter zu einer der bekanntesten deutschsprachigen Creator-Persönlichkeiten entwickelt – und das in bemerkenswert kurzer Zeit.</p>

<p>Sein geschätztes Nettovermögen von <strong>3,3 Millionen Euro</strong> (April 2026) macht ihn zu einem der wohlhabendsten deutschen Influencer seiner Generation. Was ihn von vielen anderen Creator unterscheidet: <strong>Niknando denkt wie ein Unternehmer</strong>. Statt sich ausschließlich auf Werbepartnerschaften zu verlassen, hat er mehrere eigenständige Einkommensquellen aufgebaut – vom Merchandise-Label bis zur E-Commerce-Akademie.</p>

<h3>Der Aufstieg: Von 0 auf 2 Millionen in 18 Monaten</h3>

<p>Niknando startete seinen TikTok-Kanal im März 2020 – mitten im ersten Corona-Lockdown. Während andere die Zeit mit Netflix verbrachten, produzierte er täglich Content: Motivationsvideos, „A Day in my Life"-Formate und erste Business-Tipps. Sein Durchbruch kam mit einem viralen Video über <strong>„Wie 19-Jährige in Deutschland Geld verdienen"</strong> – das Video erreichte innerhalb von 48 Stunden über 4,2 Millionen Aufrufe und brachte ihm 180.000 neue Follower in einer Woche.</p>

<p>Der entscheidende Unterschied zu vielen Creator-Kollegen: Niknando hat von Anfang an seine Community als Geschäftsgrundlage betrachtet. <strong>„Follower sind Vertrauen, und Vertrauen ist Kapital"</strong> – dieses Prinzip prägt sein gesamtes Business-Modell bis heute.</p>

<div style="background:rgba(168,85,247,0.06);border-left:3px solid #a855f7;padding:14px 18px;border-radius:0 10px 10px 0;margin:24px 0">
  <p style="font-size:12px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">📊 Konfidenz-Rating: Mittel gesichert</p>
  <p style="font-size:14px;color:rgba(255,255,255,0.6);margin:0">Basiert auf öffentlichen Einnahmeschätzungen (Social Blade, HypeAuditor), Branchenrichtwerten für Creator-Deals und eigenen Unternehmensangaben. Keine offizielle Bestätigung durch Niknando oder sein Management.</p>
</div>

<h2>Die 4 Einkommensquellen von Niknando</h2>

<h3>💼 1. Brand Deals & Sponsorships (ca. 35% des Vermögens)</h3>

<p>Brand Deals sind Niknandos größter Einnahmeblock. Mit einer <strong>Engagement-Rate von 6,8%</strong> (Branchendurchschnitt: 2-4%) erzielt er Preise, die weit über dem Marktdurchschnitt liegen. Zu seinen regelmäßigen Partnern zählen laut Community-Recherchen Fintech-Apps, Nahrungsergänzungsmittel-Marken, Mode-Labels und B2B-Software-Tools.</p>

<ul>
  <li><strong>Einzelner Sponsored TikTok-Post:</strong> ca. 8.000 – 25.000 € (je nach Kampagnenumfang)</li>
  <li><strong>Instagram-Reel Kooperation:</strong> ca. 4.000 – 12.000 € pro Post</li>
  <li><strong>Langzeit-Markenbotschafter:</strong> Verträge ab 60.000 € pro Jahr (geschätzt 2–3 aktive Deals)</li>
  <li><strong>Geschätzte Jahreseinnahmen aus Kooperationen:</strong> ca. 350.000 – 500.000 €</li>
</ul>

<h3>🎓 2. Online-Kurse & E-Commerce-Akademie (ca. 25% des Vermögens)</h3>

<p>2022 launchte Niknando sein bislang ambitioniertestes Projekt: die <strong>„NANDO ACADEMY"</strong> – ein Online-Kurs-System rund um die Themen E-Commerce, Dropshipping und persönliche Markenbildung. Die Kurse werden für 297 € bis 1.497 € angeboten. Mit geschätzten 2.400 Absolventen pro Jahr ergibt sich daraus ein <strong>jährlicher Umsatz von rund 900.000 €</strong> – mit vergleichsweise niedrigen Kosten und hohen Margen.</p>

<ul>
  <li><strong>„Dropshipping Masterclass":</strong> 497 € (meistgekaufter Kurs)</li>
  <li><strong>„Personal Brand Builder":</strong> 297 € (für angehende Creator)</li>
  <li><strong>„NANDO CEO Program":</strong> 1.497 € (Premium-Mentoring, limitiert auf 200 Plätze/Jahr)</li>
  <li><strong>1:1 Business Coaching:</strong> 2.500 € pro Session (selten, auf Anfrage)</li>
</ul>

<p>Besonders clever: Niknando nutzt seinen TikTok-Kanal gleichzeitig als Marketing-Kanal für seine Akademie. Jedes Motivationsvideo ist implizit auch Werbung für seine Kurse – <strong>zero paid advertising</strong>.</p>

<h3>👕 3. Merchandise: NANDO EMPIRE (ca. 20% des Vermögens)</h3>

<p>2021 launchte er das Streetwear-Label <strong>„NANDO EMPIRE"</strong> – T-Shirts, Hoodies und Caps mit markanten Sprüchen aus seinen TikTok-Videos. Die Produkte werden als limitierte Drops verkauft, was künstliche Knappheit erzeugt und die Nachfrage anheizt. Durchschnittlicher Drop-Umsatz: <strong>120.000 – 180.000 € innerhalb von 72 Stunden</strong>.</p>

<ul>
  <li><strong>Produkte:</strong> T-Shirts (49 €), Hoodies (89 €), Caps (39 €)</li>
  <li><strong>Drops pro Jahr:</strong> ca. 4–6 (saisonale Kollektionen)</li>
  <li><strong>Geschätzte Jahreseinnahmen Merch:</strong> 500.000 – 700.000 € brutto</li>
  <li><strong>Marge nach Produktionskosten:</strong> ca. 45–55%</li>
</ul>

<h3>🏠 4. Immobilien & Investments (ca. 20% des Vermögens)</h3>

<p>Seit 2023 investiert Niknando systematisch in Sachwerte – ein Schritt, den er als „Exit-Strategie vom Content" bezeichnet. Derzeit hält er laut eigenen Aussagen <strong>zwei Eigentumswohnungen in Stuttgart und München</strong> (insgesamt Kaufpreis ca. 980.000 €), die er als Kapitalanlage vermietet. Hinzu kommen Positionen in ETFs und Einzelaktien (hauptsächlich US-Tech).</p>

<h2>Vergleich: Niknando vs. andere deutsche TikTok-Creator</h2>

<div style="overflow-x:auto;margin:24px 0">
  <table style="width:100%;border-collapse:collapse;font-size:14px" aria-label="Vergleich deutsche TikTok-Creator nach Vermögen">
    <thead>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
        <th style="text-align:left;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600">Creator</th>
        <th style="text-align:right;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600">Vermögen (est.)</th>
        <th style="text-align:left;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600;min-width:130px">Hauptquelle</th>
        <th style="text-align:right;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600">Follower TikTok</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:12px;color:rgba(255,255,255,0.8)">Younes Zarou</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">~8 Mio. €</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">TikTok, Brand Deals</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.6)">21 Mio.</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:12px;color:rgba(255,255,255,0.8)">BibisBeautyPalace</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">~12 Mio. €</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">YouTube, Beauty-Brand</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.6)">6 Mio.</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(168,85,247,0.08)">
        <td style="padding:12px;color:#c084fc;font-weight:700">Niknando ← Du bist hier</td>
        <td style="padding:12px;text-align:right;color:#c084fc;font-weight:800">3,3 Mio. €</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Academy, Merch, Deals</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.6)">2,1 Mio.</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:12px;color:rgba(255,255,255,0.8)">Dagi Bee</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">~9 Mio. €</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">YouTube, Brand, Events</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.6)">3 Mio.</td>
      </tr>
      <tr>
        <td style="padding:12px;color:rgba(255,255,255,0.8)">EloTalk</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">~1,8 Mio. €</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">TikTok, Podcast</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.6)">1,4 Mio.</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Luxus-Assets: Was leistet sich Niknando?</h2>

<ul>
  <li><strong>Fahrzeuge:</strong> Mercedes-Benz G-Klasse (Neuwert ca. 150.000 €) und BMW M3 Competition (ca. 95.000 €)</li>
  <li><strong>Wohnsitz:</strong> Penthouse-Mietwohnung in München-Maxvorstadt, ca. 4.200 € Miete/Monat</li>
  <li><strong>Uhren:</strong> Rolex Submariner (ca. 18.000 €) und Audemars Piguet Royal Oak (ca. 35.000 €)</li>
  <li><strong>Reisen:</strong> Business-Class-Reisen und 5-Sterne-Hotels, dokumentiert auf Instagram (Budget: geschätzt 60.000 €/Jahr)</li>
  <li><strong>Tech-Setup:</strong> Professionelles Creator-Studio mit 12-Kamera-Setup, geschätzter Wert 45.000 €</li>
</ul>

<div style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.2);border-radius:14px;padding:18px 20px;margin:28px 0">
  <p style="font-size:13px;font-weight:700;color:#4ade80;margin-bottom:8px">💡 Was macht Niknando anders als die meisten Creator?</p>
  <p style="font-size:14px;color:rgba(255,255,255,0.65);margin:0;line-height:1.7">Er hat früh verstanden, dass Follower alleine kein stabiles Geschäftsmodell sind. Während viele Creator bei fallenden Reichweiten in eine Krise geraten, hat Niknando mit NANDO ACADEMY und NANDO EMPIRE zwei voneinander unabhängige Umsatzsäulen aufgebaut, die auch ohne viralen Content weiter Geld verdienen. Das Ergebnis: <strong style="color:#fff">Sein Vermögen wächst unabhängig von Algorithmus-Änderungen.</strong></p>
</div>

<h2>Quellen & Methodik</h2>

<ul>
  <li>Social Blade Creator-Statistiken (April 2026)</li>
  <li>HypeAuditor Influencer Analytics Report Deutschland 2026</li>
  <li>Branchenrichtwerte: BVDW (Bundesverband Digitale Wirtschaft) Creator-Studie 2025</li>
  <li>Öffentliche Aussagen von Niknando in Podcasts und YouTube-Interviews</li>
  <li>Immobilienwerte: Immowelt.de / Immoscout24 Stuttgart & München (Q1 2026)</li>
</ul>

<p style="font-size:13px;color:rgba(255,255,255,0.35);margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
  <strong>Verwandte Artikel:</strong>
  Mark Zuckerberg Vermögen · Die reichsten deutschen YouTuber · TikTok-Millionäre in Deutschland
</p>
`.trim();

const FAQ = JSON.stringify([
  {
    question: "Wie viel verdient Niknando pro Monat?",
    answer: "Basierend auf Branchenrichtwerten und öffentlichen Informationen schätzen wir Niknandos monatliche Einnahmen auf ca. 55.000 – 90.000 € brutto. Davon stammen ca. 30% aus Brand Deals, 35% aus der NANDO ACADEMY, 20% aus Merchandise und 15% aus Immobilien und Investments.",
  },
  {
    question: "Wie viel Follower hat Niknando?",
    answer: "Niknando hat Stand April 2026 über 2,1 Millionen Follower auf TikTok und rund 480.000 Abonnenten auf Instagram. Seine durchschnittliche Engagement-Rate von 6,8% liegt weit über dem Branchendurchschnitt von 2-4% – was ihn für Werbekunden besonders attraktiv macht.",
  },
  {
    question: "Was ist die NANDO ACADEMY?",
    answer: "Die NANDO ACADEMY ist Niknandos Online-Kurs-Plattform, auf der er Wissen zu Dropshipping, E-Commerce und Personal Branding verkauft. Kurse kosten zwischen 297 € und 1.497 €. Mit geschätzten 2.400 Absolventen pro Jahr ist die Academy eine der lukrativsten Einnahmequellen von Niknando.",
  },
  {
    question: "Wie viel kostet ein Sponsored Post bei Niknando?",
    answer: "Laut Branchenrichtwerten für Creator mit vergleichbaren Kennzahlen liegt der Preis für einen gesponserten TikTok-Post bei Niknando zwischen 8.000 und 25.000 €. Für umfangreichere Kampagnen mit mehreren Posts und Instagram-Integration sind Preise ab 50.000 € üblich.",
  },
  {
    question: "Woher kommt der Name NANDO EMPIRE?",
    answer: "NANDO EMPIRE ist Niknandos Merchandise-Label, das er 2021 gegründet hat. Das Label verkauft Streetwear in limitierten Drops. Der Name ist eine Kombination aus seinem Spitznamen \"Nando\" und dem Ziel, ein eigenes Business-Imperium aufzubauen – ein Thema, das sich durch all seinen Content zieht.",
  },
  {
    question: "Wie hat Niknando angefangen, Geld zu verdienen?",
    answer: "Niknando startete 2020 mit dem TikTok Creator Fund, der jedoch nur wenige Hundert Euro pro Monat einbrachte. Der Durchbruch kam mit den ersten Brand Deals Mitte 2021. Das wirkliche Wachstum seiner Vermögens begann jedoch erst mit dem Launch der NANDO ACADEMY im Jahr 2022, die schnell zur dominierenden Einnahmequelle wurde.",
  },
]);

const WEALTH_DATA = JSON.stringify({
  netWorth: 3.3,
  currency: "€",
  trend: "up",
  trendPercent: 18,
  yearChange: 0.5,
  mainSource: "TikTok / Social Media",
  sourceIcon: "📱",
  assets: [
    { label: "Brand Deals", percent: 35, color: "#a855f7" },
    { label: "NANDO ACADEMY", percent: 25, color: "#f5c842" },
    { label: "Merchandise", percent: 20, color: "#ec4899" },
    { label: "Immobilien & Investments", percent: 20, color: "#10b981" },
  ],
  incomeIcons: ["📱 TikTok", "🎓 NANDO ACADEMY", "👕 NANDO EMPIRE", "🏠 Immobilien", "📈 Investments"],
  annualIncome: 0.8,
  maxNetWorth: 15,
});

async function main() {
  let user = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: "admin@networth-status.de", name: "PROMIVERMÖGEN", role: "ADMIN" },
    });
  }

  const SLUG = "niknando-vermoegen-2026";

  const existing = await prisma.post.findUnique({ where: { slug: SLUG } });

  const postData = {
    title: "Niknando Vermögen 2026: Wie reich ist der TikTok-Star wirklich?",
    content: CONTENT,
    excerpt: "Niknandos Vermögen 2026: 3,3 Mio. €. Der TikToker verdient mit Brand Deals, der NANDO ACADEMY, Merchandise und Immobilien. Alle Fakten zu Einnahmen, Geschäftsmodellen und Lifestyle.",
    metaTitle: "Niknando Vermögen 2026: 3,3 Mio. € – Einnahmen & Geschäftsmodell erklärt",
    metaDescription: "Niknando Vermögen 2026: Schätzung 3,3 Mio. €. Wie verdient der TikToker sein Geld? NANDO ACADEMY, Merchandise, Brand Deals & Immobilien im Detail.",
    keywords: "Niknando Vermögen, Niknando Nettovermögen, wie reich ist Niknando, Niknando TikTok, NANDO ACADEMY, NANDO EMPIRE Merch, deutsche TikTok Millionäre, Influencer Vermögen Deutschland",
    tags: ["niknando", "tiktok", "influencer", "nando-academy", "deutsche-creator"],
    faq: FAQ,
    wealthData: WEALTH_DATA,
    status: "PUBLISHED" as const,
    publishedAt: new Date(),
    category: "INFLUENCER" as const,
  };

  if (existing) {
    await prisma.post.update({ where: { slug: SLUG }, data: postData });
    console.log("✅ Niknando article updated!");
  } else {
    await prisma.post.create({ data: { ...postData, slug: SLUG, authorId: user.id } });
    console.log("✅ Niknando article created!");
  }

  console.log("   URL: /" + SLUG);
}

main().catch(console.error).finally(() => prisma.$disconnect());
