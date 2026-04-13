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
    { name: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, emoji: "💬", hoverColor: "#22c55e" },
    { name: "X / Twitter", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, emoji: "𝕏", hoverColor: "#38bdf8" },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, emoji: "f", hoverColor: "#60a5fa" },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginRight: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
        ↗ Teilen:
      </span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}
        >
          {link.emoji}
        </a>
      ))}
      <button
        onClick={copyLink}
        title="Link kopieren"
        style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`, color: copied ? "#4ade80" : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "13px" }}
      >
        {copied ? "✓" : "🔗"}
      </button>
    </div>
  );
}
