#!/usr/bin/env node
/**
 * Generate a secure admin token and store it in the database
 * Run: node scripts/generate-admin-token.js
 */

const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function generateSecureToken() {
  const randomPart = crypto.randomBytes(32).toString("hex");
  return `admin_${randomPart}`;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function main() {
  const plainToken = generateSecureToken();
  const hashedToken = hashToken(plainToken);

  try {
    const token = await prisma.adminToken.create({
      data: {
        token: hashedToken,
        active: true,
      },
    });

    console.log("\n✅ Admin-Token erfolgreich generiert!\n");
    console.log("🔐 Verwende diese URL zum Login:\n");
    console.log(`   https://promivermögen.com/api/admin/token-login?token=${plainToken}\n`);
    console.log("⚠️  Speichere diese URL sicher. Sie wird nicht nochmal angezeigt!\n");
    console.log("Token-ID in der Datenbank:", token.id);
  } catch (err) {
    console.error("❌ Fehler beim Erstellen des Tokens:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
