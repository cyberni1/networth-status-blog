import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/chat-auth";

export const dynamic = "force-dynamic";

// Admin-only: grant or revoke a guest's permission to speak (use the mic).
export async function POST(req: Request) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: "Nur der Admin darf freischalten" }, { status: 403 });
    }

    const { targetUserId, canSpeak, room } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: "Kein Ziel" }, { status: 400 });
    }
    const roomId = String(room || "main").trim().slice(0, 40) || "main";
    const allow = !!canSpeak;

    const target = await prisma.chatUser.findUnique({ where: { id: String(targetUserId) } });
    if (!target) return NextResponse.json({ error: "Gast nicht gefunden" }, { status: 404 });

    await prisma.chatUser.update({
      where: { id: String(targetUserId) },
      data: {
        canSpeak: allow,
        // if speaking is revoked, also drop them from the voice channel
        ...(allow ? {} : { inVoice: false, speaking: false }),
      },
    });

    await prisma.chatMessage.create({
      data: {
        room: roomId,
        kind: "system",
        nickname: target.nickname,
        content: allow
          ? `${target.nickname} wurde vom Admin zum Sprechen freigeschaltet. 🎤`
          : `${target.nickname} wurde das Sprechen vom Admin entzogen. 🔇`,
      },
    });

    return NextResponse.json({ ok: true, canSpeak: allow });
  } catch (e) {
    return NextResponse.json({ error: "Freischalten fehlgeschlagen" }, { status: 500 });
  }
}
