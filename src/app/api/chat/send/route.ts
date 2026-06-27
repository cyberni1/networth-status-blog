import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Post a message to the room. kind: text | voice | system
export async function POST(req: Request) {
  try {
    const { userId, room, nickname, content, kind } = await req.json();
    const text = String(content || "").trim().slice(0, 2000);
    if (!text) return NextResponse.json({ error: "Leere Nachricht" }, { status: 400 });

    const roomId = String(room || "main").trim().slice(0, 40) || "main";
    const allowed = ["text", "voice", "system"];
    const messageKind = allowed.includes(kind) ? kind : "text";

    const msg = await prisma.chatMessage.create({
      data: {
        room: roomId,
        userId: userId ? String(userId) : null,
        nickname: String(nickname || "Anonym").slice(0, 24),
        kind: messageKind,
        content: text,
      },
    });

    return NextResponse.json({ id: msg.id, createdAt: msg.createdAt });
  } catch (e) {
    return NextResponse.json({ error: "Senden fehlgeschlagen" }, { status: 500 });
  }
}
