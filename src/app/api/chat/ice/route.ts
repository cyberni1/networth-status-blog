import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Returns the ICE server list for WebRTC. STUN alone is not enough on many
// mobile / strict-NAT networks, so a TURN relay is needed for reliable voice.
//
// Configure your own TURN in Vercel (recommended for production):
//   TURN_URLS       comma-separated, e.g. "turn:turn.example.com:3478,turns:turn.example.com:5349"
//   TURN_USERNAME
//   TURN_CREDENTIAL
//
// Recommended free TURN: sign up at https://dashboard.metered.ca/signup
// Then set TURN_URLS, TURN_USERNAME, TURN_CREDENTIAL in Vercel env vars.
export async function GET() {
  const iceServers: RTCIceServer[] = [
    // Multiple STUN servers for reliability
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ];

  const turnUrls = process.env.TURN_URLS?.trim();
  const turnUser = process.env.TURN_USERNAME?.trim();
  const turnCred = process.env.TURN_CREDENTIAL?.trim();

  if (turnUrls && turnUser && turnCred) {
    iceServers.push({
      urls: turnUrls.split(",").map((u) => u.trim()).filter(Boolean),
      username: turnUser,
      credential: turnCred,
    });
  } else {
    // Public best-effort TURN fallbacks — not 100% reliable under heavy load.
    // Set TURN_URLS / TURN_USERNAME / TURN_CREDENTIAL in Vercel env vars for
    // production reliability (metered.ca free tier works great).
    iceServers.push({
      urls: [
        "turn:openrelay.metered.ca:80",
        "turn:openrelay.metered.ca:443",
        "turns:openrelay.metered.ca:443",
        "turn:openrelay.metered.ca:443?transport=tcp",
      ],
      username: "openrelayproject",
      credential: "openrelayproject",
    });
  }

  return NextResponse.json({ iceServers });
}
