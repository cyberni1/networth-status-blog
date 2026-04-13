"use client";

import { useEffect, useState } from "react";

export interface WealthData {
  netWorth: number;           // in billions (e.g. 131 for $131B)
  currency: string;           // "€" | "$" | "£"
  trend: "up" | "down" | "flat";
  trendPercent: number;       // e.g. 12.3
  yearChange: number;         // in billions, e.g. 14
  mainSource: string;         // e.g. "Tech / Software"
  sourceIcon: string;         // emoji e.g. "💻"
  assets: { label: string; percent: number; color: string }[];
  incomeIcons: string[];      // e.g. ["💼 Gründer", "📈 Aktien", "🏠 Immobilien"]
  annualIncome?: number;      // in billions per year, for wealth clock
  maxNetWorth?: number;       // richest person on site (for gauge scale)
}

// Format billion values
function fmt(val: number, currency: string) {
  if (val >= 1000) return `${currency}${(val / 1000).toFixed(1)} Bio.`;
  if (val >= 1) return `${currency}${val.toFixed(1)} Mrd.`;
  return `${currency}${(val * 1000).toFixed(0)} Mio.`;
}

// Gauge SVG (half-circle)
function GaugeSVG({ value, max, currency }: { value: number; max: number; currency: string }) {
  const pct = Math.min(value / max, 1);
  const r = 70;
  const cx = 90;
  const cy = 90;
  // Arc path: half circle = 180 degrees
  const startAngle = 180; // leftmost
  const endAngle = 0;     // rightmost
  const fillAngle = 180 - pct * 180;

  function polar(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  }

  const trackStart = polar(cx, cy, r, 180);
  const trackEnd = polar(cx, cy, r, 0);
  const fillEnd = polar(cx, cy, r, fillAngle);
  const fillLargeArc = pct > 0.5 ? 1 : 0;
  const trackArc = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 0 1 ${trackEnd.x} ${trackEnd.y}`;
  const fillArc = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${fillLargeArc} 1 ${fillEnd.x} ${fillEnd.y}`;

  return (
    <svg viewBox="0 0 180 100" aria-hidden="true" style={{ width: "100%", maxWidth: "180px" }}>
      {/* Background track */}
      <path d={trackArc} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
      {/* Fill */}
      <path d={fillArc} fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" />
      {/* Gradient def */}
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5B041" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
      {/* Value text */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800" fontFamily="inherit">
        {fmt(value, currency)}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="inherit">
        Nettovermögen
      </text>
    </svg>
  );
}

// Stacked horizontal bar for asset mix
function AssetBar({ assets }: { assets: WealthData["assets"] }) {
  return (
    <div>
      {/* Bar */}
      <div style={{ display: "flex", borderRadius: "6px", overflow: "hidden", height: "10px", marginBottom: "10px" }} role="img" aria-label="Vermögensmix">
        {assets.map((a, i) => (
          <div key={i} style={{ width: `${a.percent}%`, background: a.color, height: "100%" }} title={`${a.label}: ${a.percent}%`} />
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {assets.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: a.color, flexShrink: 0 }} aria-hidden="true" />
            {a.label} <span style={{ color: "rgba(255,255,255,0.4)" }}>{a.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Wealth clock: earns X per second
function WealthClock({ annualIncome }: { annualIncome: number }) {
  const [elapsed, setElapsed] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const perSecond = (annualIncome * 1_000_000_000) / (365 * 24 * 3600);
  const earned = perSecond * elapsed;
  const formatted = earned >= 1_000_000
    ? `${(earned / 1_000_000).toFixed(1)} Mio.`
    : earned >= 1_000
    ? `${(earned / 1_000).toFixed(0)} Tsd.`
    : `${earned.toFixed(0)}`;

  if (reduced) return null;

  return (
    <div style={{ marginTop: "8px", padding: "10px 14px", background: "rgba(245,176,65,0.08)", border: "1px solid rgba(245,176,65,0.2)", borderRadius: "10px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
      <span aria-live="off" aria-atomic="true">
        ⏱ Während du liest, verdient er/sie ca.{" "}
        <strong style={{ color: "#F5B041" }}>
          €{formatted}
        </strong>
      </span>
    </div>
  );
}

export default function WealthDashboard({ data }: { data: WealthData }) {
  const max = data.maxNetWorth ?? 400; // default max = 400 Mrd.
  const trendUp = data.trend === "up";
  const trendDown = data.trend === "down";

  return (
    <>
      <style>{`
        .wd-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 600px) { .wd-grid { grid-template-columns: 160px 1fr 1fr; gap: 16px; } }
      `}</style>

      <section
        aria-label="Vermögens-Dashboard"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(245,176,65,0.2)",
          borderRadius: "16px",
          padding: "20px",
          margin: "24px 0",
        }}
      >
        <h2 style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px" }}>
          Vermögens-Überblick
        </h2>

        <div className="wd-grid">
          {/* ── COLUMN 1: Gauge ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <GaugeSVG value={data.netWorth} max={max} currency={data.currency} />
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
              Schätzung laut Forbes / Bloomberg
            </p>
          </div>

          {/* ── COLUMN 2: Key tiles ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Tile: Net Worth */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "12px 14px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Gesamtvermögen</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 800, color: "#fff" }}>
                  {fmt(data.netWorth, data.currency)}
                </span>
                {!trendUp && !trendDown ? null : (
                  <span
                    aria-label={trendUp ? `Trend: gestiegen um ${data.trendPercent}%` : `Trend: gesunken um ${data.trendPercent}%`}
                    style={{ fontSize: "13px", fontWeight: 700, color: trendUp ? "#4ade80" : "#f87171", display: "flex", alignItems: "center", gap: "2px" }}
                  >
                    <span aria-hidden="true">{trendUp ? "▲" : "▼"}</span>
                    {data.trendPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Tile: Year change */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "12px 14px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Veränderung ggü. Vorjahr</p>
              <span
                aria-label={`${data.yearChange >= 0 ? "Gestiegen" : "Gesunken"} um ${Math.abs(data.yearChange)} Milliarden`}
                style={{ fontSize: "18px", fontWeight: 700, color: data.yearChange >= 0 ? "#4ade80" : "#f87171" }}
              >
                <span aria-hidden="true">{data.yearChange >= 0 ? "+" : ""}</span>
                {fmt(Math.abs(data.yearChange), data.currency)}{" "}
                <span aria-hidden="true">({data.yearChange >= 0 ? "▲" : "▼"} {data.trendPercent}%)</span>
              </span>
            </div>

            {/* Tile: Main source */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "12px 14px" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Haupteinnahmequelle</p>
              <span style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                <span aria-hidden="true">{data.sourceIcon} </span>
                {data.mainSource}
              </span>
            </div>
          </div>

          {/* ── COLUMN 3: Asset mix + Income icons ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.assets.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>Vermögensmix</p>
                <AssetBar assets={data.assets} />
              </div>
            )}
            {data.incomeIcons.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>Vermögensquellen</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {data.incomeIcons.map((icon, i) => (
                    <span key={i} style={{ padding: "4px 10px", borderRadius: "100px", fontSize: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                      {icon}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wealth Clock – only shown if annualIncome provided */}
        {data.annualIncome && data.annualIncome > 0 && (
          <WealthClock annualIncome={data.annualIncome} />
        )}

        {/* Disclaimer */}
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "14px" }}>
          * Alle Angaben sind Schätzungen basierend auf öffentlichen Quellen (Forbes, Bloomberg). Keine Anlageberatung.
        </p>
      </section>
    </>
  );
}
