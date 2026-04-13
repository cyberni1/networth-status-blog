"use client";

import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    { name: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, emoji: "💬", label: "Auf WhatsApp teilen" },
    { name: "X / Twitter", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, emoji: "𝕏", label: "Auf X (Twitter) teilen" },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, emoji: "f", label: "Auf Facebook teilen" },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }

  return (
    <div role="group" aria-label="Artikel teilen" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span aria-hidden="true" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginRight: "2px" }}>
        ↗ Teilen:
      </span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          style={{
            width: "36px", height: "36px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)", textDecoration: "none",
            fontSize: "13px", fontWeight: 700,
            minWidth: "44px", minHeight: "44px",
          }}
        >
          <span aria-hidden="true">{link.emoji}</span>
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label={copied ? "Link kopiert!" : "Link in Zwischenablage kopieren"}
        aria-live="polite"
        style={{
          width: "36px", height: "36px", borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
          color: copied ? "#4ade80" : "rgba(255,255,255,0.6)",
          cursor: "pointer", fontSize: "14px",
          minWidth: "44px", minHeight: "44px",
        }}
      >
        <span aria-hidden="true">{copied ? "✓" : "🔗"}</span>
      </button>
    </div>
  );
}
