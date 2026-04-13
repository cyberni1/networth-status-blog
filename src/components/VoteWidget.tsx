"use client";

import { useState, useEffect } from "react";

interface VoteWidgetProps {
  postId: string;
  personName: string;
  netWorth?: string; // e.g. "$221 Mrd."
}

const STAR_LABELS = [
  "1 Stern – sehr unrealistisch",
  "2 Sterne – eher unrealistisch",
  "3 Sterne – teils/teils",
  "4 Sterne – eher realistisch",
  "5 Sterne – sehr realistisch",
];

export default function VoteWidget({ postId, personName, netWorth }: VoteWidgetProps) {
  const [hovered, setHovered] = useState(0);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    fetch(`/api/vote?postId=${postId}`)
      .then((r) => r.json())
      .then((d) => {
        setCount(d.count ?? 0);
        setAvg(d.avg ?? 0);
        setMyVote(d.myVote ?? null);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleVote(stars: number) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, stars }),
      });
      if (res.ok) {
        const isNew = myVote === null;
        setMyVote(stars);
        setThanks(true);
        // optimistic update
        const newCount = isNew ? count + 1 : count;
        const newAvg = isNew
          ? (avg * count + stars) / newCount
          : (avg * count - (myVote ?? 0) + stars) / count;
        setCount(newCount);
        setAvg(Math.round(newAvg * 10) / 10);
        setTimeout(() => setThanks(false), 3000);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const display = hovered || myVote || 0;

  return (
    <section
      aria-labelledby="vote-heading"
      style={{
        marginTop: "40px",
        padding: "24px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(168,85,247,0.2)",
        borderRadius: "16px",
      }}
    >
      <h2 id="vote-heading" style={{ fontSize: "clamp(16px,3.5vw,20px)", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
        🗳 Community-Bewertung
      </h2>
      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
        Wie realistisch ist unsere Schätzung{netWorth ? ` von ${netWorth}` : ""}?
      </p>

      {/* Stars */}
      <div
        role="group"
        aria-label={`Schätzung für ${personName} bewerten`}
        style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            aria-label={STAR_LABELS[star - 1]}
            aria-pressed={myVote === star}
            disabled={submitting}
            onClick={() => handleVote(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              fontSize: "clamp(22px,5vw,32px)",
              background: "none",
              border: "none",
              cursor: submitting ? "wait" : "pointer",
              padding: "4px 6px",
              transform: display >= star ? "scale(1.15)" : "scale(1)",
              transition: "transform 0.15s",
              filter: display >= star ? "none" : "grayscale(1) opacity(0.4)",
              minWidth: "44px",
              minHeight: "44px",
            }}
          >
            ⭐
          </button>
        ))}
      </div>

      {/* Current selected label */}
      {display > 0 && (
        <p style={{ fontSize: "13px", color: "#c084fc", marginBottom: "14px", fontStyle: "italic" }}>
          {STAR_LABELS[display - 1]}
        </p>
      )}

      {/* Stats */}
      {!loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#fde047" }}>{avg > 0 ? avg.toFixed(1) : "–"}</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>/ 5</span>
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            {count > 0 ? `Durchschnitt aus ${count} Stimme${count !== 1 ? "n" : ""}` : "Noch keine Stimmen – sei der Erste!"}
          </div>
        </div>
      )}

      {thanks && myVote && (
        <p role="status" style={{ marginTop: "10px", fontSize: "13px", color: "#4ade80", fontWeight: 600 }}>
          ✓ Danke für deine Bewertung! ({myVote} {myVote === 1 ? "Stern" : "Sterne"})
        </p>
      )}

      {myVote && !thanks && (
        <p style={{ marginTop: "10px", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
          Du hast {myVote} {myVote === 1 ? "Stern" : "Sterne"} abgegeben. Klicke erneut, um zu ändern.
        </p>
      )}
    </section>
  );
}
