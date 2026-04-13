"use client";

import { useState } from "react";

interface Faq {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: Faq[];
}

export default function FaqSection({ faqs }: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(0);

  if (!faqs.length) return null;

  return (
    <section style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <h2 style={{ fontSize: "clamp(18px,4vw,24px)", fontWeight: 700, color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: "#a855f7" }}>?</span>
        Häufig gestellte Fragen
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", textAlign: "left", background: "none", border: "none", cursor: "pointer", gap: "12px" }}
            >
              <span style={{ fontSize: "clamp(13px,3vw,15px)", fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.4 }}>{faq.question}</span>
              <span style={{ fontSize: "18px", color: "#a855f7", flexShrink: 0, transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>⌄</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 18px 16px", fontSize: "clamp(13px,2.8vw,15px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px", marginTop: "0" }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
