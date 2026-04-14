export default function LogoSVG({ height = 38 }: { height?: number }) {
  const w = Math.round(height * (175 / 46));

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 175 46"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PROMIVERMÖGEN"
      role="img"
    >
      <defs>
        <linearGradient id="pv-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7d060" />
          <stop offset="100%" stopColor="#c08b0a" />
        </linearGradient>
        <linearGradient id="pv-gold2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe680" />
          <stop offset="100%" stopColor="#c08b0a" />
        </linearGradient>
      </defs>

      {/* ── Star (5-pointed, gold outline) ── */}
      <polygon
        points="22,1.5 26.5,14.5 40.5,14.8 30,22.5 33.8,36 22,28.2 10.2,36 14,22.5 3.5,14.8 17.5,14.5"
        fill="none"
        stroke="url(#pv-gold)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* ── Swoosh arc ── */}
      <path
        d="M 5 37 Q 22 44 39 37"
        fill="none"
        stroke="url(#pv-gold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* ── Sparkles ── */}
      {/* top */}
      <path d="M22 -1.5 L23.1 2 L22 5.5 L20.9 2 Z" fill="#f7d060" opacity="0.75" />
      {/* top-right */}
      <path d="M42 7 L43.1 10 L42 13 L40.9 10 Z" fill="#f7d060" opacity="0.6" />
      {/* top-left */}
      <path d="M2 7 L3.1 10 L2 13 L0.9 10 Z" fill="#f7d060" opacity="0.5" />
      {/* right */}
      <path d="M44 22 L44.9 24.5 L44 27 L43.1 24.5 Z" fill="#f7d060" opacity="0.45" />

      {/* ── Thin separator ── */}
      <line x1="48" y1="7" x2="48" y2="40" stroke="rgba(245,200,66,0.25)" strokeWidth="0.8" />

      {/* ── PROMI – gold serif ── */}
      <text
        x="55"
        y="23"
        fontFamily="Georgia, 'Book Antiqua', Palatino, serif"
        fontWeight="700"
        fontSize="19"
        fill="url(#pv-gold2)"
        letterSpacing="2"
      >
        PROMI
      </text>

      {/* ── VERMÖGEN – white, spaced ── */}
      <text
        x="55"
        y="39"
        fontFamily="Georgia, 'Book Antiqua', Palatino, serif"
        fontWeight="600"
        fontSize="13"
        fill="rgba(255,255,255,0.88)"
        letterSpacing="3.2"
      >
        VERMÖGEN
      </text>
    </svg>
  );
}
