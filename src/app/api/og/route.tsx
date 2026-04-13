import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const CATEGORY_LABELS: Record<string, string> = {
  KUENSTLER: "Künstler",
  SPORTLER: "Sportler",
  UNTERNEHMER: "Unternehmer",
  INFLUENCER: "Influencer",
};

const CATEGORY_COLORS: Record<string, string> = {
  KUENSTLER: "#f472b6",
  SPORTLER: "#4ade80",
  UNTERNEHMER: "#fde047",
  INFLUENCER: "#a5b4fc",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Networth Status";
  const category = searchParams.get("category") ?? "";
  const catLabel = CATEGORY_LABELS[category] ?? "";
  const catColor = CATEGORY_COLORS[category] ?? "#a855f7";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px",
          background: "linear-gradient(135deg, #0a0a14 0%, #12121f 50%, #0a0a14 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,200,66,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Brand */}
        <div
          style={{
            position: "absolute",
            top: "48px",
            left: "60px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #f5c842, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #f5c842, #c084fc)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "2px",
            }}
          >
            NETWORTH STATUS
          </span>
        </div>

        {/* Category badge */}
        {catLabel && (
          <div
            style={{
              display: "flex",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: catColor,
                background: `${catColor}20`,
                border: `1px solid ${catColor}50`,
                padding: "6px 16px",
                borderRadius: "100px",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {catLabel}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: title.length > 60 ? "48px" : "60px",
            fontWeight: 900,
            color: "white",
            lineHeight: 1.2,
            margin: 0,
            maxWidth: "900px",
            letterSpacing: "-1px",
          }}
        >
          {title}
        </h1>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              height: "3px",
              width: "60px",
              background: "linear-gradient(90deg, #f5c842, #a855f7)",
              borderRadius: "2px",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px" }}>
            networth-status-blog.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
