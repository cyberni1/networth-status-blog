import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

// GET: fetch vote stats for a post
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  const votes = await prisma.postVote.findMany({ where: { postId } });
  const count = votes.length;
  const avg = count > 0 ? votes.reduce((sum, v) => sum + v.stars, 0) / count : 0;

  // Check if this session already voted
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("nws_session")?.value ?? "";
  const myVote = votes.find((v) => v.sessionId === sessionId);

  return NextResponse.json({ count, avg: Math.round(avg * 10) / 10, myVote: myVote?.stars ?? null });
}

// POST: submit a vote
export async function POST(req: Request) {
  const { postId, stars } = await req.json();
  if (!postId || !stars || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get("nws_session")?.value;
  const isNew = !sessionId;
  if (!sessionId) sessionId = randomUUID();

  await prisma.postVote.upsert({
    where: { postId_sessionId: { postId, sessionId } },
    create: { postId, sessionId, stars },
    update: { stars },
  });

  const response = NextResponse.json({ success: true });
  if (isNew) {
    response.cookies.set("nws_session", sessionId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
    });
  }
  return response;
}
