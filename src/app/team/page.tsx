import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Über uns – Das Team hinter PROMIVERMÖGEN",
  description: "Lerne das Team hinter PROMIVERMÖGEN kennen. Gründer, Redakteure und Analysten, die täglich die Vermögen der globalen Elite recherchieren und aufbereiten.",
};

const team = [
  {
    name: "Julian von Thalberg",
    initials: "JT",
    role: "Founder & CEO",
    emoji: "🎯",
    bio: "Als Visionär an der Schnittstelle von Wirtschaft und Entertainment hat Julian von Thalberg PROMIVERMÖGEN ins Leben gerufen. Mit seinem Hintergrund in der strategischen Unternehmensentwicklung versteht er es, den Wert einer Marke – egal ob Firma oder Person – präzise einzuschätzen. Unter seiner Leitung hat sich das Portal zur ersten Adresse für exklusive Insights in die Welt des Erfolgs entwickelt.",
    gradient: "linear-gradient(135deg, #f5c842, #a855f7)",
    accent: "#f5c842",
  },
  {
    name: 'Elena "Leni" Novak',
    initials: "LN",
    role: "Chefredakteurin",
    emoji: "✍️",
    bio: 'Leni ist die operative Schaltzentrale unserer Redaktion. Mit ihrem unvergleichlichen Gespür für gesellschaftliche Strömungen und einem Netzwerk, das keine Grenzen kennt, kuratiert sie die Inhalte, die unsere Leser bewegen. Sie trennt die Spreu vom Weizen und sorgt dafür, dass PROMIVERMÖGEN immer am Puls der Zeit bleibt.',
    gradient: "linear-gradient(135deg, #ec4899, #a855f7)",
    accent: "#ec4899",
  },
  {
    name: "Marc Brandstetter",
    initials: "MB",
    role: "Chief Investigative Officer",
    emoji: "🔍",
    bio: "Hinter jedem Vermögen und jedem Status steckt eine Geschichte. Marc Brandstetter ist unser Mann für die Fakten. Mit seiner jahrelangen Erfahrung im investigativen Journalismus beleuchtet er die Hintergründe von Deals, Verträgen und dem Aufstieg der Stars. Er steht für die Verlässlichkeit und Tiefe, die unsere Leser von uns erwarten.",
    gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    accent: "#3b82f6",
  },
  {
    name: 'Tatjana "Tati" Müller',
    initials: "TM",
    role: "Head of Digital Trends",
    emoji: "📱",
    bio: 'Tati ist unsere Expertin für die digitale Währung der Moderne: Aufmerksamkeit. Sie analysiert den "Social Status" und versteht wie keine andere, wie Reichweite heute in echten Wert verwandelt wird. Sie verbindet unsere Plattform mit den globalen Communities und macht den Erfolg der Stars in Echtzeit erlebbar.',
    gradient: "linear-gradient(135deg, #f97316, #f59e0b)",
    accent: "#f97316",
  },
  {
    name: "Simon Wu",
    initials: "SW",
    role: "Director of Analytics & Tech",
    emoji: "📊",
    bio: "Daten lügen nicht. Simon Wu ist der Architekt hinter unseren Analyse-Tools. Er wertet komplexe Datenströme aus, um die Entwicklung von Marktwerten und Trends vorherzusagen. Dank seiner technischen Expertise bietet PROMIVERMÖGEN mehr als nur News – wir bieten datengestützte Orientierung in einer glitzernden Welt.",
    gradient: "linear-gradient(135deg, #10b981, #3b82f6)",
    accent: "#10b981",
  },
];

export default function TeamPage() {
  return (
    <>
      <style>{`
        .team-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        .values-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 640px) {
          .team-grid { grid-template-columns: repeat(2, 1fr); }
          .values-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .team-grid { grid-template-columns: repeat(3, 1fr); }
          .values-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div style={{ background: "#080810", minHeight: "100vh" }}>
        <Navbar />

        <main id="main-content" tabIndex={-1}>

          {/* ── HERO ── */}
          <section aria-labelledby="team-hero-heading" style={{ position: "relative", overflow: "hidden", padding: "clamp(48px,8vw,96px) 16px clamp(32px,6vw,64px)", textAlign: "center" }}>
            {/* Glow */}
            <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "700px", height: "350px", background: "radial-gradient(ellipse, rgba(168,85,247,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />

            <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245,200,66,0.1)", border: "1px solid rgba(245,200,66,0.25)", borderRadius: "100px", padding: "6px 18px", marginBottom: "20px", fontSize: "11px", fontWeight: 700, color: "#fde047", letterSpacing: "1.5px" }}>
                👥 DAS TEAM HINTER DEM KOMPASS
              </div>

              <h1 id="team-hero-heading" style={{ fontSize: "clamp(32px,7vw,64px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: "20px" }}>
                <span style={{ background: "linear-gradient(135deg, #f5c842, #c084fc, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Über PROMIVERMÖGEN</span>
              </h1>

              <p style={{ fontSize: "clamp(15px,3vw,18px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: "600px", margin: "0 auto" }}>
                Wer hat den Erfolg gepachtet? Wer bestimmt die Trends von morgen? PROMIVERMÖGEN ist die führende digitale Instanz für die Analyse von Ruhm, Reichtum und dem Lifestyle der globalen Elite. Wir blicken über den roten Teppich hinaus – und liefern fundierte Einblicke in die Welt derer, die es geschafft haben.
              </p>
            </div>
          </section>

          {/* ── MISSION STATEMENT ── */}
          <section style={{ padding: "0 16px 64px", maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "20px", padding: "clamp(24px,5vw,48px)", textAlign: "center" }}>
              <div aria-hidden="true" style={{ fontSize: "40px", marginBottom: "16px" }}>📈</div>
              <blockquote style={{ fontSize: "clamp(16px,3.5vw,22px)", fontWeight: 700, color: "#fff", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                „Bei uns geht es nicht nur um Schlagzeilen – es geht um den <span style={{ background: "linear-gradient(135deg,#f5c842,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>messbaren Status</span>."
              </blockquote>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)", marginTop: "12px" }}>— Julian von Thalberg, Gründer</p>
            </div>
          </section>

          {/* ── TEAM GRID ── */}
          <section aria-labelledby="team-section-heading" style={{ padding: "0 16px 80px", maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 id="team-section-heading" style={{ fontSize: "clamp(24px,5vw,36px)", fontWeight: 800, color: "#fff", marginBottom: "10px" }}>
                Die Köpfe hinter PROMIVERMÖGEN
              </h2>
              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)" }}>
                Fünf Experten. Eine Mission. Die Welt des Erfolgs entschlüsseln.
              </p>
            </div>

            <div className="team-grid">
              {team.map((member) => (
                <article key={member.name} aria-label={`${member.name}, ${member.role}`} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${member.accent}25`, borderRadius: "20px", overflow: "hidden", transition: "border-color 0.3s, box-shadow 0.3s" }}>
                  {/* Avatar area */}
                  <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
                    {/* Gradient background */}
                    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: member.gradient, opacity: 0.12 }} />
                    {/* Radial glow */}
                    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center, ${member.accent}30 0%, transparent 70%)` }} />
                    {/* Initials circle */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                      <div style={{
                        width: "80px", height: "80px", borderRadius: "50%",
                        background: member.gradient,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "28px", fontWeight: 900, color: "#fff",
                        boxShadow: `0 0 30px ${member.accent}50`,
                        letterSpacing: "-1px",
                      }} aria-hidden="true">
                        {member.initials}
                      </div>
                      <span aria-hidden="true" style={{ fontSize: "28px" }}>{member.emoji}</span>
                    </div>
                    {/* Bottom fade */}
                    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,0.95) 0%, transparent 55%)" }} />
                    {/* Role badge */}
                    <div style={{ position: "absolute", bottom: "14px", left: "14px", right: "14px" }}>
                      <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", background: `${member.accent}20`, border: `1px solid ${member.accent}50`, color: member.accent }}>
                        {member.role}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "clamp(16px,3vw,18px)", fontWeight: 800, color: "#fff", marginBottom: "10px" }}>
                      {member.name}
                    </h3>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>
                      {member.bio}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ── PHILOSOPHY ── */}
          <section aria-labelledby="philosophy-heading" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "clamp(48px,7vw,80px) 16px" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h2 id="philosophy-heading" style={{ fontSize: "clamp(24px,5vw,36px)", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>
                  Unsere Philosophie
                </h2>
                <p style={{ fontSize: "clamp(15px,3vw,18px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: "650px", margin: "0 auto" }}>
                  PROMIVERMÖGEN ist mehr als ein Magazin. Wir sind der <strong style={{ color: "rgba(255,255,255,0.8)" }}>Kompass in einer Welt des Überflusses</strong>. Unser Ziel ist es, Erfolg greifbar zu machen und unseren Lesern eine fundierte Perspektive auf die einflussreichsten Persönlichkeiten unserer Zeit zu bieten – objektiv, exklusiv und immer einen Schritt voraus.
                </p>
              </div>

              {/* Values */}
              <div className="values-grid">
                {[
                  { icon: "🔬", label: "Faktenbasiert", desc: "Jede Zahl basiert auf verifizierten Quellen wie Forbes, Bloomberg und SEC-Filings." },
                  { icon: "⚡", label: "Immer aktuell", desc: "Tägliche Updates zu Vermögensentwicklungen, Deals und Marktveränderungen." },
                  { icon: "📱", label: "Mobile First", desc: "Perfekt lesbar auf jedem Gerät – designed für unterwegs." },
                  { icon: "🎯", label: "Unabhängig", desc: "Keine PR-Aufträge, keine bezahlten Inhalte. Nur echte Analyse." },
                ].map((v) => (
                  <div key={v.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px" }}>
                    <div aria-hidden="true" style={{ fontSize: "28px", marginBottom: "10px" }}>{v.icon}</div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>{v.label}</h3>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section style={{ padding: "clamp(48px,7vw,80px) 16px", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>
              PROMIVERMÖGEN – <span style={{ background: "linear-gradient(135deg,#f5c842,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Wissen, was Erfolg wert ist.</span>
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)", marginBottom: "28px" }}>
              Entdecke die aktuellsten Vermögensanalysen.
            </p>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 32px", borderRadius: "12px", fontSize: "15px", fontWeight: 700, background: "linear-gradient(135deg,#a855f7,#3b82f6)", color: "#fff", textDecoration: "none", boxShadow: "0 4px 20px rgba(168,85,247,0.4)" }}>
              📊 Zu den Beiträgen
            </Link>
          </section>

        </main>

        <footer role="contentinfo" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 16px", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", maxWidth: "700px", margin: "0 auto", lineHeight: 1.6 }}>
            © {new Date().getFullYear()} PROMIVERMÖGEN &nbsp;·&nbsp;
            <strong style={{ color: "rgba(255,255,255,0.4)" }}>Alle Vermögensangaben sind Schätzungen</strong> basierend auf öffentlichen Quellen (Forbes, Bloomberg). Keine Anlageberatung.
          </p>
        </footer>
      </div>
    </>
  );
}
