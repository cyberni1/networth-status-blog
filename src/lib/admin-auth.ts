import { createHash, randomBytes } from "crypto";

/**
 * Generate a secure random token
 * Format: admin_<64-hex-chars>
 */
export function generateSecureToken(): string {
  const randomPart = randomBytes(32).toString("hex");
  return `admin_${randomPart}`;
}

/**
 * Hash token with SHA-256 for storage
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Verify plaintext token against hashed token
 */
export function verifyToken(plainToken: string, hashedToken: string): boolean {
  return hashToken(plainToken) === hashedToken;
}

/**
 * Extract token from URL or return null
 * URL Format: /admin/secret-<token>
 */
export function extractTokenFromPath(path: string): string | null {
  const match = path.match(/\/admin\/secret-([a-z0-9_]+)$/i);
  return match ? `admin_${match[1]}` : null;
}
