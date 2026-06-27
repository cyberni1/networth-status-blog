import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ONLINE_WINDOW_MS = 15_000; // user counts as online if seen within 15s

// One combined poll: updates heartbeat + presence, returns new messages + active users.
export async function POST(req: Request) {
  try {
    const { userId, room, after, inVoice, speaking } = await req.json();
    const roomId = String(room || "main").trim().slice(0, 40) || "main";
    const now = new Date();

    // Heartbeat: keep this user alive + sync voice state.
    if (userId) {
      await prisma.chatUser.updateMany({
        where: { id: String(userId) },
        data: {
          lastSeen: now,
          ...(typeof inVoice === "boolean" ? { inVoice } : {}),
          ...(typeof speaking === "boolean" ? { speaking } : {}),
        },
      });
    }

    const since = after ? new Date(after) : new Date(now.getTime() - 60_000);

    const [messages, users] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { room: roomId, createdAt: { gt: since } },
        orderBy: { createdAt: "asc" },
        take: 100,
      }),
      prisma.chatUser.findMany({
        where: { room: roomId, lastSeen: { gt: new Date(now.getTime() - ONLINE_WINDOW_MS) } },
        orderBy: { createdAt: "asc" },
        select: { id: true, nickname: true, inVoice: true, speaking: true, isAdmin: true, canSpeak: true },
      }),
    ]);

    // Opportunistic cleanup so the DB stays lean (cheap, best-effort).
    prisma.chatSignal
      .deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - 120_000) } } })
      .catch(() => {});

    return NextResponse.json({
      serverTime: now.toISOString(),
      messages,
      users,
    });
  } catch (e) {
    return NextResponse.json({ error: "Poll fehlgeschlagen" }, { status: 500 });
  }
}
