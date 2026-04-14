"use client";

import { useEffect, useState } from "react";

export interface WealthData {
  netWorth: number;           // in billions (e.g. 221 for $221B)
  currency: string;           // "€" | "$" | "£"
  trend: "up" | "down" | "flat";
  trendPercent: number;       // e.g. 12
  yearChange: number;         // in billions, e.g. 23.7
  mainSource: string;         // e.g. "Tech / Social Media"
  sourceIcon: string;         // emoji e.g. "💻"
  assets: { label: string; percent: number; color: string }[];
  incomeIcons: string[];      // e.g. ["💼 Gründer", "📈 Aktien"]
  annualIncome?: number;      // in billions per year, for wealth clock
  maxNetWorth?: number;       // for gauge scale (default 400)
}

function fmt(val: number, currency: string) {
  if (val >= 1000) return `${currency}${(val / 1000).toFixed(1)} Bio.`;
  if (val >= 1) return `${currency}${val.toFixed(1)} Mrd.`;
  return `${currency}${(val * 1000).toFixed(0)} Mio.`;
}

// Animated count-up
function CountUp({ target, currency }: { target: number; currency: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { setCurrent(target); return; }
    const duration = 1400;
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <>{fmt(current, currency)}</>;
}

// Half-circle SVG gauge
function GaugeSVG({ value, max }: { value: number; max: number }) {
  const pct = Math.min(value / max, 1);
  const r = 80; const cx = 100; const cy = 95;

  function polar(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  }

  const start = polar(cx, cy, r, 180);
  const end = polar(cx, cy, r, 0);
  const fillEnd = polar(cx, cy, r, 180 - pct * 180);
  const largeArc = pct > 0.5 ? 1 : 0;
  const track = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  const fill = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`;

  return (
    <svg viewBox="0 0 200 105" aria-hidden="true" style={{ width: "100%", maxWidth: "240px", display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f5c842" />
          <stop offset="60%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <path d={track} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="13" strokeLinecap="round" />
      {/* Glow */}
      <path d={fill} fill="none" stroke="url(#gaugeGrad)" strokeWidth="13" strokeLinecap="round" filter="url(#gaugeGlow)" opacity="0.5" />
      {/* Fill */}
      <path d={fill} fill="none" stroke="url(#gaugeGrad)" strokeWidth="13" strokeLinecap="round" />
      {/* Dot at fill end */}
      {pct > 0.01 && (
        <circle cx={fillEnd.x} cy={fillEnd.y} r="7" fill="#f5c842" filter="url(#gaugeGlow)" />
      )}
    </svg>
  );
}

// Stacked asset bar
function AssetBar({ assets }: { assets: WealthData["assets"] }) {
  return (
    <div>
      <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", height: "14px", marginBottom: "14px" }}>
        {assets.map((a, i) => (
          <div key={i} style={{ width: `${a.percent}%`, background: a.color }} title={`${a.label}: ${a.percent}%`} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {assets.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: a.color, flexShrink: 0 }} aria-hidden="true" />
            {a.label} <span style={{ color: a.color, fontWeight: 700 }}>{a.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Live wealth ticker
function WealthClock({ annualIncome, currency }: { annualIncome: number; currency: string }) {
  const [elapsed, setElapsed] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;
    const start = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - start) / 1000), 100);
    return () => clearInterval(id);
  }, []);

  const perSec = (annualIncome * 1_000_000_000) / (365 * 24 * 3600);
  const earned = perSec * elapsed;
  const display = earned >= 1_000_000
    ? `${(earned / 1_000_000).toFixed(2)} Mio.`
    : earned >= 1_000
    ? `${(earned / 1_000).toFixed(1)} Tsd.`
    : earned.toFixed(0);

  if (reduced) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "14px",
      padding: "16px 20px",
      background: "linear-gradient(135deg, rgba(245,200,66,0.1), rgba(168,85,247,0.08))",
      border: "1px solid rgba(245,200,66,0.3)",
      borderRadius: "14px",
      marginTop: "16px",
    }}>
      <div style={{ fontSize: "28px", flexShrink: 0 }} aria-hidden="true">⏱</div>
      <div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>
          Seit du liest, verdiente er ca.
        </p>
        <p aria-live="off" style={{ fontSize: "clamp(22px,5vw,30px)", fontWeight: 900, color: "#f5c842", letterSpacing: "-0.5px", lineHeight: 1 }}>
          {currency}{display}
        </p>
      </div>
    </div>
  );
}

export default function WealthDashboard({ data }: { data: WealthData }) {
  const max = data.maxNetWorth ?? 400;
  const trendUp = data.trend === "up";
  const trendDown = data.trend === "down";

  return (
    <>
      <style>{`
        .wd-wrap {
          position: relative;
          background: linear-gradient(145deg, rgba(245,200,66,0.07) 0%, rgba(8,8,16,0) 40%, rgba(168,85,247,0.07) 100%);
          border: 1px solid rgba(245,200,66,0.35);
          border-radius: 22px;
          padding: clamp(18px,4vw,32px);
          margin: 28px 0;
          box-shadow: 0 0 60px rgba(245,200,66,0.07), 0 0 0 1px rgba(255,255,255,0.03) inset;
          overflow: hidden;
        }
        .wd-wrap::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .wd-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 24px;
          gap: 4px;
        }
        .wd-big-number {
          font-size: clamp(44px,11vw,72px);
          font-weight: 900;
          letter-spacing: -2px;
          line-height: 1;
          background: linear-gradient(135deg, #f5c842 0%, #ffd966 50%, #f5c842 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(245,200,66,0.3));
        }
        .wd-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        @media (min-width: 480px) {
          .wd-stats { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <section aria-label="Vermögens-Dashboard" className="wd-wrap">
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f5c842", boxShadow: "0 0 6px #f5c842" }} aria-hidden="true" />
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#f5c842", textTransform: "uppercase" }}>
              Live Vermögens-Dashboard
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "3px 10px" }}>
            Forbes / Bloomberg
          </span>
        </div>

        {/* Hero: Gauge + Big Number */}
        <div className="wd-hero">
          <GaugeSVG value={data.netWorth} max={max} />
          <div className="wd-big-number">
            <CountUp target={data.netWorth} currency={data.currency} />
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
            Geschätztes Nettovermögen
          </div>
          {(trendUp || trendDown) && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              marginTop: "8px", padding: "5px 14px", borderRadius: "100px",
              background: trendUp ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
              border: `1px solid ${trendUp ? "rgba(74,222,128,0.35)" : "rgba(248,113,113,0.35)"}`,
              fontSize: "13px", fontWeight: 700,
              color: trendUp ? "#4ade80" : "#f87171",
            }}>
              <span aria-hidden="true">{trendUp ? "▲" : "▼"}</span>
              {trendUp ? "+" : "-"}{data.trendPercent}% gegenüber Vorjahr
            </div>
          )}
        </div>

        {/* 3 Stat tiles */}
        <div className="wd-stats">
          <div style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.18)", borderRadius: "14px", padding: "14px 16px" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>
              Jahresveränderung
            </p>
            <p style={{ fontSize: "clamp(17px,3.5vw,22px)", fontWeight: 800, color: data.yearChange >= 0 ? "#4ade80" : "#f87171" }}>
              {data.yearChange >= 0 ? "+" : ""}{fmt(Math.abs(data.yearChange), data.currency)}
            </p>
          </div>

          <div style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.18)", borderRadius: "14px", padding: "14px 16px" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>
              Hauptquelle
            </p>
            <p style={{ fontSize: "clamp(13px,2.5vw,15px)", fontWeight: 700, color: "#c084fc" }}>
              {data.sourceIcon} {data.mainSource}
            </p>
          </div>

          {data.annualIncome && (
            <div style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.18)", borderRadius: "14px", padding: "14px 16px" }}>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" }}>
                Wachstum p.a.
              </p>
              <p style={{ fontSize: "clamp(17px,3.5vw,22px)", fontWeight: 800, color: "#60a5fa" }}>
                +{fmt(data.annualIncome, data.currency)}
              </p>
            </div>
          )}
        </div>

        {/* Asset bar */}
        {data.assets.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px 18px", marginBottom: "16px" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>
              Vermögensmix
            </p>
            <AssetBar assets={data.assets} />
          </div>
        )}

        {/* Income source pills */}
        {data.incomeIcons.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {data.incomeIcons.map((icon, i) => (
              <span key={i} style={{ padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 600, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", color: "#c084fc" }}>
                {icon}
              </span>
            ))}
          </div>
        )}

        {/* Wealth clock */}
        {data.annualIncome && data.annualIncome > 0 && (
          <WealthClock annualIncome={data.annualIncome} currency={data.currency} />
        )}

        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "14px", lineHeight: 1.5 }}>
          * Schätzung basierend auf Forbes Real-Time Billionaires & Bloomberg Billionaires Index. Keine Anlageberatung.
        </p>
      </section>
    </>
  );
}
