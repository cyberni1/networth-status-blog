import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSecureToken, hashToken } from "@/lib/admin-auth";

const prisma = new PrismaClient();

/**
 * GET /api/admin/generate-token?secret=<CRON_SECRET>
 * POST /api/admin/generate-token?secret=<CRON_SECRET>
 *
 * Generates a new admin token, protected by CRON_SECRET
 */
export async function GET(req: NextRequest) {
  return generateTokenHandler(req);
}

export async function POST(req: NextRequest) {
  return generateTokenHandler(req);
}

async function generateTokenHandler(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json(
      { error: "Ungültiges oder fehlendes Secret" },
      { status: 401 }
    );
  }

  try {
    const plainToken = generateSecureToken();
    const hashedToken = hashToken(plainToken);

    const token = await prisma.adminToken.create({
      data: {
        token: hashedToken,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      tokenId: token.id,
      loginUrl: `https://promivermögen.com/api/admin/token-login?token=${plainToken}`,
      plainToken,
      note: "Diesen Token sicher speichern - wird nicht nochmal angezeigt!",
    });
  } catch (err) {
    console.error("Fehler beim Token-Generieren:", err);
    return NextResponse.json(
      { error: "Fehler beim Generieren des Tokens" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
