export default function KiRevolutionLogo({
  size = 40,
  withWordmark = false,
}: {
  size?: number;
  withWordmark?: boolean;
}) {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="KI REVOLUTION"
    >
      <defs>
        <linearGradient id="kir-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Badge */}
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#kir-bg)" />

      {/* Microphone */}
      <rect x="19" y="11" width="10" height="17" rx="5" fill="#fff" />
      <path
        d="M15 24 a9 9 0 0 0 18 0"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <line x1="24" y1="33" x2="24" y2="37" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="19" y1="37.5" x2="29" y2="37.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />

      {/* Spark — the "revolution" accent */}
      <path
        d="M36 8 l1.5 4.3 4.3 1.5 -4.3 1.5 -1.5 4.3 -1.5 -4.3 -4.3 -1.5 4.3 -1.5 z"
        fill="#ffe680"
      />
    </svg>
  );

  if (!withWordmark) return mark;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {mark}
      <span
        style={{
          fontWeight: 900,
          fontSize: size * 0.42,
          letterSpacing: 0.5,
          background: "linear-gradient(90deg,#e879f9,#818cf8)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          whiteSpace: "nowrap",
        }}
      >
        KI REVOLUTION
      </span>
    </span>
  );
}
