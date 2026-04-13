"use client";

import { useState, useEffect, useRef } from "react";

interface Faq {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: Faq[];
}

export default function FaqSection({ faqs }: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(0);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!faqs.length) return null;

  return (
    <section aria-labelledby="faq-heading" style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <h2 id="faq-heading" style={{ fontSize: "clamp(18px,4vw,24px)", fontWeight: 700, color: "#fff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span aria-hidden="true" style={{ color: "#a855f7" }}>?</span>
        Häufig gestellte Fragen
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          const panelId = `faq-panel-${i}`;
          const btnId = `faq-btn-${i}`;
          return (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
              <h3 style={{ margin: 0 }}>
                <button
                  id={btnId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 18px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    gap: "12px",
                    minHeight: "56px",
                  }}
                >
                  <span style={{ fontSize: "clamp(14px,3vw,16px)", fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.4 }}>
                    {faq.question}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: "20px",
                      color: "#a855f7",
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                      display: "inline-block",
                    }}
                  >
                    ⌄
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                ref={(el) => { answerRefs.current[i] = el; }}
                hidden={!isOpen}
                style={isOpen ? {
                  padding: "0 18px 18px",
                  fontSize: "clamp(14px,2.8vw,16px)",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.7,
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  paddingTop: "14px",
                } : undefined}
              >
                {faq.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
