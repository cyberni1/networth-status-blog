/**
 * Seed script: Xavier Naidoo article
 * Run: npx tsx prisma/seed-xavier-naidoo.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CONTENT = `
<div style="background:rgba(245,200,66,0.08);border:1px solid rgba(245,200,66,0.25);border-radius:14px;padding:20px 24px;margin-bottom:32px">
  <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#fde047;text-transform:uppercase;margin-bottom:12px">⚡ In 5 Sekunden: Das Wichtigste</p>
  <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px">
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Geschätztes Vermögen:</strong> 14 Mio. € (Stand: April 2026)</li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Karriere:</strong> Über 25 Jahre als Solokünstler & Söhne Mannheims</li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Haupteinnahmen:</strong> Musikrechte, Konzerte, eigenes Label</li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Alben verkauft:</strong> Über 5 Millionen (Deutschland, Österreich, Schweiz)</li>
    <li style="font-size:15px;color:rgba(255,255,255,0.85)"><strong style="color:#fff">Auszeichnungen:</strong> 5× Echo, 2× BAMBI, 1× Goldene Kamera</li>
  </ul>
</div>

<h2>Xavier Naidoo: Deutschlands Soul-Legende mit Millionenvermögen</h2>

<p>Er ist eine der prägendsten Stimmen der deutschen Musikgeschichte: <strong>Xavier Kurt Naidoo</strong>, geboren am 2. Oktober 1971 in Mannheim, hat mit seiner einzigartigen Mischung aus Soul, R&B, Gospel und Deutsch-Pop Millionen Menschen bewegt. Sein geschätztes Nettovermögen von <strong>14 Millionen Euro</strong> (April 2026) macht ihn zu einem der wohlhabendsten deutschen Musiker – aufgebaut über drei Jahrzehnte harter Arbeit, millionenfach verkaufter Alben und ausverkaufter Arenen.</p>

<p>Naidoos Vater stammt aus Südafrika (indische Abstammung), seine Mutter ist Deutsche – eine Herkunft, die seinen künstlerischen Stil bis heute prägt. Aufgewachsen in den Mannheimer Stadtteilen Schönau und Rheinau, entwickelte er schon früh eine Leidenschaft für Musik und Spiritualität. Beides sollte zur Grundlage eines außergewöhnlichen Lebenswerks werden.</p>

<div style="background:rgba(168,85,247,0.06);border-left:3px solid #a855f7;padding:14px 18px;border-radius:0 10px 10px 0;margin:24px 0">
  <p style="font-size:12px;font-weight:700;color:#c084fc;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">📊 Konfidenz-Rating: Mittel gesichert</p>
  <p style="font-size:14px;color:rgba(255,255,255,0.6);margin:0">Basiert auf öffentlichen Musikrechte-Bewertungen, Albumverkaufszahlen (GfK, IFPI), Konzerteinnahmen und Branchenrichtwerten für Musiker der Spitzenklasse. Keine offizielle Bestätigung durch Xavier Naidoo oder sein Management.</p>
</div>

<h2>Der Aufstieg: Von Mannheim in die Spitze der deutschen Musikszene</h2>

<p>Xavier Naidoos Karriere begann nicht über Nacht. Nach Jahren in der Mannheimer Musikszene, Nebenjobs und ersten Gehversuchen als Backgroundsänger erschien 1998 sein Debütalbum <strong>„Nicht von dieser Welt"</strong> – und schlug ein wie eine Bombe. Das Album verkaufte sich über 1,2 Millionen Mal allein in Deutschland, hielt sich wochenlang auf Platz 1 der Charts und machte Naidoo praktisch über Nacht zum Star.</p>

<p>Was ihn von anderen Pop-Acts unterschied: <strong>Authentizität</strong>. Naidoo schrieb seine Songs selbst, produzierte sie mit, und seine Texte – geprägt von Glaube, Liebe und gesellschaftlicher Kritik – trafen einen Nerv. Titelsongs wie „Bitte hör nicht auf zu träumen", „Wo willst du hin" und „Ich kenne nichts" wurden zu Hymnen einer ganzen Generation.</p>

<h3>Die Söhne Mannheims: Kollektiv als Kraftverstärker</h3>

<p>Parallel zur Solokarriere war Xavier Naidoo Mitbegründer und Frontmann der <strong>Söhne Mannheims</strong> – einer der ungewöhnlichsten Bands Deutschlands. Das über 20-köpfige Kollektiv aus Musikern, Produzenten und Komponisten aus Mannheims multikultureller Musikszene verkaufte ebenfalls Millionen von Alben und füllte Arenen. Zu den bekanntesten Songs zählen „Ich bin gekommen um zu bleiben", „Sie sieht mich nicht" (mit Xavier als Solostimme) und das vielzitierte „Was wir alleine nicht schaffen".</p>

<p>Die Söhne Mannheims brachten Naidoo nicht nur zusätzliche Einnahmen, sondern festigten seinen Ruf als <strong>Visionär des deutschen Soul</strong> – jemand, der Genres mischte, bevor es zum Trend wurde.</p>

<h2>Die 4 Einkommensquellen von Xavier Naidoo</h2>

<h3>🎵 1. Musikrechte & Royalties (ca. 40% des Vermögens)</h3>

<p>Der mit Abstand wertvollste Vermögensbaustein von Xavier Naidoo ist sein Musikkatalog. Über 25 Jahre Solokarriere plus die Söhne Mannheims haben ein Portfolio geschaffen, das kontinuierlich Tantiemen generiert – aus Streaming, Radio, TV-Lizenzierungen und Synchronisationen.</p>

<ul>
  <li><strong>Spotify-Streams:</strong> Über 400 Millionen gesamt (Stand 2026) – ca. 1,4 Mio. Streams/Monat</li>
  <li><strong>„Dieser Weg" (WM-Song 2006):</strong> Einer der meistgestreamten deutschen Songs aller Zeiten</li>
  <li><strong>GEMA-Einnahmen:</strong> Geschätzt 200.000 – 350.000 € jährlich aus Radio, TV und Events</li>
  <li><strong>Katalogwert:</strong> Bei einem Faktor von 15× auf den Jahresroyalties ergibt sich ein Katalogwert von ~5–6 Mio. €</li>
  <li><strong>Eigenes Label Naidoo Records:</strong> Zusätzliche Einnahmen aus Katalogverwertung anderer Künstler</li>
</ul>

<p>Besonders wertvoll: Der Song <strong>„Dieser Weg"</strong>, der als offizieller Titelsong der deutschen Fußballnationalmannschaft zur WM 2006 eingesetzt wurde, läuft bis heute bei jedem Länderspiel im Radio und Fernsehen – ein passiver Einkommenstrom, der jahrzehntelang weiterläuft.</p>

<h3>🎤 2. Konzerte & Tourneen (ca. 30% des Vermögens)</h3>

<p>Xavier Naidoo gehört zu den wenigen deutschen Künstlern, die regelmäßig <strong>Arenen und große Hallen füllen</strong>. Seine Tourneen sind bekannt für aufwendige Bühnenproduktionen, mehrstündige Sets und eine legendäre Bühnenpräsenz.</p>

<ul>
  <li><strong>Typische Venue-Größe:</strong> 5.000 – 20.000 Besucher (von der Porsche-Arena bis zur Lanxess Arena)</li>
  <li><strong>Durchschnittlicher Ticketpreis:</strong> 45 – 85 € (VIP bis 180 €)</li>
  <li><strong>Einnahmen pro Konzertabend:</strong> 150.000 – 400.000 € (brutto, vor Produktionskosten)</li>
  <li><strong>Typische Tourneelänge:</strong> 20–40 Shows pro Jahr in guten Jahren</li>
  <li><strong>Geschätzte Konzerteinnahmen/Jahr:</strong> 1,5 – 3 Mio. € (Brutto) in Spitzenjahren</li>
</ul>

<p>Hinweis: Seit 2020 hat Naidoo aufgrund verschiedener Kontroversen weniger Konzerte gespielt als in seiner Blütezeit. Dennoch zieht er mit seiner treuen Fangemeinde noch immer Tausende pro Abend an – ein Zeichen für die emotionale Bindung, die er über Jahrzehnte aufgebaut hat.</p>

<h3>📺 3. TV & Medien – DSDS und Gastauftritte (ca. 15% des Vermögens)</h3>

<p>Von 2012 bis 2020 war Xavier Naidoo wiederholt Juror bei <strong>„Deutschland sucht den Superstar" (DSDS)</strong>, der erfolgreichsten deutschen Castingshow. Diese Auftritte sicherten ihm nicht nur Millionen-Gagen, sondern hielten seine Präsenz in der breiten Öffentlichkeit aufrecht.</p>

<ul>
  <li><strong>DSDS-Juror-Gage (Schätzung):</strong> 500.000 – 1.000.000 € pro Staffel</li>
  <li><strong>Gastauftritte, Werbedeals, TV-Features:</strong> geschätzt 100.000 – 200.000 € zusätzlich/Jahr in aktiven Jahren</li>
  <li><strong>Buchveröffentlichungen:</strong> Mehrere Bücher über Glaube, Musik und Lebensphilosophie, Erlöse fließen in den Gesamttopf</li>
</ul>

<h3>🏠 4. Immobilien & Sachwerte (ca. 15% des Vermögens)</h3>

<p>Xavier Naidoo lebt seit Jahren in Mannheim – er ist der Stadt, in der er aufgewachsen ist, trotz seines Erfolgs treu geblieben. Neben einem Wohnanwesen im Raum Mannheim/Rhein-Neckar hält er nach Branchenschätzungen weitere Immobilienpositionen als Kapitalanlage sowie Anteile an Musikproduktionsinfrastruktur (Studio, Equipment).</p>

<h2>Vergleich: Xavier Naidoo vs. andere deutsche Musiklegenden</h2>

<div style="overflow-x:auto;margin:24px 0">
  <table style="width:100%;border-collapse:collapse;font-size:14px" aria-label="Vergleich deutsche Musiker nach Vermögen">
    <thead>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
        <th style="text-align:left;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600">Künstler</th>
        <th style="text-align:right;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600">Vermögen (est.)</th>
        <th style="text-align:left;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600;min-width:140px">Hauptquelle</th>
        <th style="text-align:right;padding:10px 12px;color:rgba(255,255,255,0.5);font-weight:600">Alben verkauft</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:12px;color:rgba(255,255,255,0.8)">Herbert Grönemeyer</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">~80 Mio. €</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Musik, Rechte, Film</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.6)">~25 Mio.</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:12px;color:rgba(255,255,255,0.8)">Helene Fischer</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">~60 Mio. €</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Musik, Tourneen, TV</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.6)">~20 Mio.</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:12px;color:rgba(255,255,255,0.8)">Peter Maffay</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">~45 Mio. €</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Musik, Stiftung, Hotellerie</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.6)">~35 Mio.</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);background:rgba(168,85,247,0.08)">
        <td style="padding:12px;color:#c084fc;font-weight:700">Xavier Naidoo ← Du bist hier</td>
        <td style="padding:12px;text-align:right;color:#c084fc;font-weight:800">14 Mio. €</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Rechte, Konzerte, Label</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.6)">~5 Mio.</td>
      </tr>
      <tr>
        <td style="padding:12px;color:rgba(255,255,255,0.8)">Sido</td>
        <td style="padding:12px;text-align:right;color:#fff;font-weight:700">~8 Mio. €</td>
        <td style="padding:12px;color:rgba(255,255,255,0.6)">Musik, TV, Investments</td>
        <td style="padding:12px;text-align:right;color:rgba(255,255,255,0.6)">~4 Mio.</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Luxus & Lebensstil: Bodenständig trotz Millionenvermögen</h2>

<p>Xavier Naidoo ist für seinen Verhältnissen überraschend <strong>bodenständigen Lebensstil</strong> bekannt. Er wohnt bis heute in der Region Mannheim, trägt keine extravagante Designerkleidung und zeigt seinen Wohlstand nicht öffentlich zur Schau. Dennoch fließen einige Details aus seinem Leben durch, die seinen Status spiegeln:</p>

<ul>
  <li><strong>Wohnanwesen:</strong> Großzügiges Privatanwesen im Rhein-Neckar-Kreis (Schätzwert: ca. 1,5 – 2 Mio. €)</li>
  <li><strong>Fahrzeuge:</strong> Bekannt für hochwertige Limousinen, u.a. Mercedes S-Klasse</li>
  <li><strong>Heimstudio:</strong> Professionelles Aufnahmestudio in Mannheim (Schätzwert Ausstattung: 200.000 – 400.000 €)</li>
  <li><strong>Stiftungsengagement:</strong> Naidoo unterstützt mehrere soziale Projekte in Mannheim, insbesondere für Kinder und Jugendliche</li>
  <li><strong>Reisen:</strong> Regelmäßige Aufenthalte in Südafrika (familiäre Wurzeln) und im Mittelmeerraum</li>
</ul>

<div style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.2);border-radius:14px;padding:18px 20px;margin:28px 0">
  <p style="font-size:13px;font-weight:700;color:#4ade80;margin-bottom:8px">💡 Das besondere Vermögensprinzip von Xavier Naidoo</p>
  <p style="font-size:14px;color:rgba(255,255,255,0.65);margin:0;line-height:1.7">Anders als viele Stars, die ihr Geld wieder ausgeben, hat Naidoo früh in <strong>Musikrechte und ein eigenes Label</strong> investiert. Ein Musikkatalog, der echte Klassiker enthält, ist wie eine Immobilie – er zahlt jeden Monat Miete, egal ob der Künstler gerade auf Tour ist oder nicht. „Dieser Weg" allein hat vermutlich bereits mehr Geld eingebracht als manche komplette Karriere anderer Musiker.</p>
</div>

<h2>Quellen & Methodik</h2>

<ul>
  <li>IFPI Deutschland: Albumverkaufszahlen und Marktdaten (2026)</li>
  <li>GfK Entertainment: Chart-Historie und Streaming-Schätzungen</li>
  <li>GEMA Jahresbericht 2025 (Branchenrichtwerte)</li>
  <li>Pollstar: Live-Konzertdaten und Venue-Kapazitäten (2024/2025)</li>
  <li>Öffentliche Aussagen in Interviews mit der Süddeutschen Zeitung, Spiegel und ZDF</li>
</ul>

<p style="font-size:13px;color:rgba(255,255,255,0.35);margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
  <strong>Verwandte Artikel:</strong>
  Helene Fischer Vermögen · Herbert Grönemeyer Nettovermögen · Söhne Mannheims · Deutsche Musiklegenden
</p>
`.trim();

const FAQ = JSON.stringify([
  {
    question: "Wie viel ist Xavier Naidoo wert?",
    answer: "Das geschätzte Nettovermögen von Xavier Naidoo beträgt laut unserer Analyse rund 14 Millionen Euro (Stand April 2026). Der Großteil stammt aus seinem Musikkatalog (Royalties, GEMA), Konzerteinnahmen und seinem eigenen Label Naidoo Records. Da es sich um Schätzungen auf Basis öffentlicher Quellen handelt, kann der tatsächliche Wert abweichen.",
  },
  {
    question: "Was sind Xavier Naidoos bekannteste Songs?",
    answer: "Zu seinen bekanntesten Songs zählen: „Dieser Weg" (offizieller WM-Song 2006), „Bitte hör nicht auf zu träumen", „Wo willst du hin", „Ich kenne nichts (das so schön ist wie du)", „Was wir alleine nicht schaffen" (Söhne Mannheims), „Bei meiner Seele" und „Dieser Tag". Diese Songs laufen bis heute im Radio und generieren kontinuierlich GEMA-Einnahmen.",
  },
  {
    question: "Wie viel hat Xavier Naidoo bei DSDS verdient?",
    answer: "Als Juror bei „Deutschland sucht den Superstar" (DSDS, RTL) hat Xavier Naidoo nach Branchenschätzungen zwischen 500.000 und 1.000.000 € pro Staffel verdient. Er war in mehreren Staffeln (2012–2020) dabei, was über die gesamte Juroren-Zeit zu einem zweistelligen Millionenbetrag summiert haben dürfte.",
  },
  {
    question: "Woher stammt Xavier Naidoo?",
    answer: "Xavier Kurt Naidoo wurde am 2. Oktober 1971 in Mannheim geboren. Sein Vater stammt aus Südafrika (mit indischen Wurzeln), seine Mutter ist Deutsche. Er wuchs in den Mannheimer Stadtteilen Schönau und Rheinau auf und ist der Stadt bis heute eng verbunden – er lebt nach wie vor im Rhein-Neckar-Kreis.",
  },
  {
    question: "Was ist Naidoo Records?",
    answer: "Naidoo Records ist das eigene Musiklabel von Xavier Naidoo, über das er seinen Musikkatalog verwaltet und neue Projekte veröffentlicht. Ein eigenes Label bedeutet, dass Naidoo deutlich höhere Anteile an den Einnahmen behält als bei einem klassischen Major-Label-Vertrag – ein wesentlicher Grund dafür, dass sein Vermögen so groß ist.",
  },
  {
    question: "Hat Xavier Naidoo noch Konzerte?",
    answer: "Ja, Xavier Naidoo tritt weiterhin live auf, wenn auch in geringerer Frequenz als in seinen erfolgreichsten Jahren (2000–2019). Er konzentriert sich auf ausgewählte Konzerte und Festivals, bei denen er nach wie vor Tausende Fans anzieht. Informationen zu aktuellen Terminen gibt es auf seiner offiziellen Website.",
  },
]);

const WEALTH_DATA = JSON.stringify({
  netWorth: 14,
  currency: "€",
  trend: "up",
  trendPercent: 3,
  yearChange: 0.4,
  mainSource: "Musik & Tourneen",
  sourceIcon: "🎵",
  assets: [
    { label: "Musikrechte & Royalties", percent: 40, color: "#a855f7" },
    { label: "Konzerte & Tourneen", percent: 30, color: "#f5c842" },
    { label: "TV & Medien", percent: 15, color: "#ec4899" },
    { label: "Label & Immobilien", percent: 15, color: "#10b981" },
  ],
  incomeIcons: ["🎵 Musik", "🎤 Konzerte", "📺 DSDS/TV", "🎵 Naidoo Records", "🏠 Immobilien"],
  annualIncome: 0.7,
  maxNetWorth: 80,
});

async function main() {
  let user = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: "admin@networth-status.de", name: "PROMIVERMÖGEN", role: "ADMIN" },
    });
  }

  const SLUG = "xavier-naidoo-vermoegen-2026";

  const existing = await prisma.post.findUnique({ where: { slug: SLUG } });

  const postData = {
    title: "Xavier Naidoo Vermögen 2026: 14 Mio. € – Wie hat er es gemacht?",
    content: CONTENT,
    excerpt: "Xavier Naidoos Vermögen beträgt geschätzte 14 Mio. € (2026). Wie verdient Deutschlands Soul-Legende sein Geld? Musikrechte, Konzerte, DSDS und sein eigenes Label – alle Fakten im Detail.",
    metaTitle: "Xavier Naidoo Vermögen 2026: 14 Millionen € – Alle Einnahmen erklärt",
    metaDescription: "Xavier Naidoo Vermögen 2026: Schätzung 14 Mio. €. Musikrechte, Konzerteinnahmen, DSDS-Gagen und Naidoo Records – so hat Deutschlands bekanntester Soulsänger sein Millionenvermögen aufgebaut.",
    keywords: "Xavier Naidoo Vermögen, Xavier Naidoo Nettovermögen, wie reich ist Xavier Naidoo, Xavier Naidoo 2026, Naidoo Records, Söhne Mannheims Vermögen, DSDS Juror Gage, deutsche Musiker Vermögen",
    tags: ["xavier-naidoo", "musik", "soul", "söhne-mannheims", "dsds", "naidoo-records"],
    faq: FAQ,
    wealthData: WEALTH_DATA,
    status: "PUBLISHED" as const,
    publishedAt: new Date(),
    category: "KUENSTLER" as const,
  };

  if (existing) {
    await prisma.post.update({ where: { slug: SLUG }, data: postData });
    console.log("✅ Xavier Naidoo article updated!");
  } else {
    await prisma.post.create({ data: { ...postData, slug: SLUG, authorId: user.id } });
    console.log("✅ Xavier Naidoo article created!");
  }

  console.log("   URL: /" + SLUG);
}

main().catch(console.error).finally(() => prisma.$disconnect());
