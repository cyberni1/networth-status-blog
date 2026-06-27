import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// WebRTC signaling relay over the DB (serverless-friendly).
// POST: deliver a signal (offer/answer/ice/bye) to another peer.
export async function POST(req: Request) {
  try {
    const { room, fromId, toId, kind, payload } = await req.json();
    if (!fromId || !toId || !kind) {
      return NextResponse.json({ error: "Ungültiges Signal" }, { status: 400 });
    }
    const roomId = String(room || "main").trim().slice(0, 40) || "main";

    await prisma.chatSignal.create({
      data: {
        room: roomId,
        fromId: String(fromId),
        toId: String(toId),
        kind: String(kind),
        payload: typeof payload === "string" ? payload : JSON.stringify(payload ?? null),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Signal fehlgeschlagen" }, { status: 500 });
  }
}

// GET: drain pending signals addressed to ?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ signals: [] });

    const signals = await prisma.chatSignal.findMany({
      where: { toId: userId },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    if (signals.length) {
      await prisma.chatSignal.deleteMany({ where: { id: { in: signals.map((s) => s.id) } } });
    }

    return NextResponse.json({
      signals: signals.map((s) => ({ fromId: s.fromId, kind: s.kind, payload: s.payload })),
    });
  } catch (e) {
    return NextResponse.json({ signals: [] });
  }
}
