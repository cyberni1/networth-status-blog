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
// If those are not set, a best-effort public TURN fallback is used.
export async function GET() {
  const iceServers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
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
    // Public best-effort fallback (Open Relay). Replace with your own TURN
    // for production-grade reliability by setting the env vars above.
    iceServers.push(
      {
        urls: [
          "turn:openrelay.metered.ca:80",
          "turn:openrelay.metered.ca:443",
          "turn:openrelay.metered.ca:443?transport=tcp",
        ],
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    );
  }

  return NextResponse.json({ iceServers });
}
