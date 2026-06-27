import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/chat-auth";

export const dynamic = "force-dynamic";

// Register a nickname in a room (no password needed) and return a user id.
// The Windows 11 admin (valid admin cookie) is flagged isAdmin + may always speak.
export async function POST(req: Request) {
  try {
    const { nickname, room } = await req.json();
    const clean = String(nickname || "").trim().slice(0, 24);
    if (!clean) {
      return NextResponse.json({ error: "Nickname fehlt" }, { status: 400 });
    }
    const roomId = String(room || "main").trim().slice(0, 40) || "main";

    const admin = await isAdminRequest();

    const user = await prisma.chatUser.create({
      data: {
        nickname: admin ? `${clean} 👑` : clean,
        room: roomId,
        lastSeen: new Date(),
        inVoice: false,
        isAdmin: admin,
        canSpeak: admin, // admin can always speak; guests must be unlocked
      },
    });

    await prisma.chatMessage.create({
      data: {
        room: roomId,
        kind: "system",
        nickname: user.nickname,
        content: `${user.nickname} ist dem Raum beigetreten.`,
      },
    });

    return NextResponse.json({
      userId: user.id,
      nickname: user.nickname,
      room: roomId,
      isAdmin: admin,
      canSpeak: admin,
    });
  } catch (e) {
    return NextResponse.json({ error: "Beitritt fehlgeschlagen" }, { status: 500 });
  }
}
