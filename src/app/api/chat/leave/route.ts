import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Leave the room: remove the user and post a system message.
export async function POST(req: Request) {
  try {
    const { userId, room, nickname } = await req.json();
    const roomId = String(room || "main").trim().slice(0, 40) || "main";

    if (userId) {
      await prisma.chatUser.deleteMany({ where: { id: String(userId) } });
      await prisma.chatSignal.deleteMany({
        where: { OR: [{ fromId: String(userId) }, { toId: String(userId) }] },
      });
    }
    if (nickname) {
      await prisma.chatMessage.create({
        data: { room: roomId, kind: "system", nickname: String(nickname).slice(0, 24), content: `${nickname} hat den Raum verlassen.` },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
