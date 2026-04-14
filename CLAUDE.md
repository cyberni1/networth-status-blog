# PROMIVERMÖGEN — Projektgedächtnis

## Branding
- **Alter Name:** Networth Status
- **Neuer Name:** PROMIVERMÖGEN
- **Domain:** promivermögen.com (in Vercel verknüpfen!)

## Vercel
- Projekt: `networth-status-blog`
- Bisherige URL: https://networth-status-blog.vercel.app
- Neue Domain: https://promivermögen.com (Custom Domain in Vercel Settings eintragen)
- Branch für Deployment: `main`

## Vercel Env Vars — alle eingetragen ✅
- `AUTH_SECRET` ✅
- `GOOGLE_CLIENT_ID` ✅
- `GOOGLE_CLIENT_SECRET` ✅
- `DATABASE_URL` ✅ (Neon PostgreSQL Pooled)
- `DIRECT_URL` ✅ (Neon PostgreSQL Direct)
- `ANTHROPIC_API_KEY` ✅

## Datenbank
- Provider: Neon PostgreSQL (neon.tech)
- Projekt: ep-weathered-bird-alspqg2n
- Region: EU Central (Frankfurt)
- Schema: via `prisma db push` — läuft automatisch beim Vercel-Build

## Google OAuth
- Client-Typ: Web Application
- Autorisierte Redirect-URI: https://networth-status-blog.vercel.app/api/auth/callback/google
- Test-User bereits hinzugefügt

## Tech Stack
- Next.js 16.2.3 (App Router)
- next-auth v5 (JWT-Strategie, kein Datenbankadapter)
- Prisma + PostgreSQL (Neon)
- TipTap Rich Text Editor
- Sharp für Bildoptimierung (→ WebP)
- Anthropic SDK für KI-Metadaten
- Tailwind CSS + Glassmorphism Design

## Kategorien
KUENSTLER, SPORTLER, UNTERNEHMER, INFLUENCER

## Git Branch
Entwicklung auf: `claude/setup-gws-auth-GeK9J`

## Aktueller Stand
- Alle Env Vars in Vercel eingetragen ✅
- Zuckerberg-Artikel wird automatisch beim Build geseeded ✅
- Sitemap + robots.txt vorhanden ✅
- WealthDashboard, VoteWidget, PdfButton implementiert ✅
- Team-Seite mit Premium-Avataren implementiert ✅

## Nächste Schritte
- Mehr Artikel über Admin-Panel erstellen (Ziel: 10-15 Artikel)
- Zuckerberg Cover-Bild manuell über Admin hochladen
- Google Search Console einrichten + Sitemap einreichen
