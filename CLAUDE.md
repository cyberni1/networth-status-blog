# Networth Status Blog — Projektgedächtnis

## Vercel
- Projekt: `networth-status-blog`
- URL: https://networth-status-blog.vercel.app
- Branch für Deployment: `claude/setup-gws-auth-GeK9J` (wird in main gemergt)

## Bereits in Vercel eingetragene Env Vars
- `AUTH_SECRET` ✅
- `GOOGLE_CLIENT_ID` ✅
- `GOOGLE_CLIENT_SECRET` ✅

## Noch einzutragen in Vercel
- `DATABASE_URL` — Neon PostgreSQL (Pooled)
- `DIRECT_URL` — Neon PostgreSQL (Direct)
- `ANTHROPIC_API_KEY` — für KI-Metadaten-Generierung

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

## Was noch fehlt
- `DATABASE_URL` + `DIRECT_URL` in Vercel eintragen
- `ANTHROPIC_API_KEY` besorgen und eintragen
- Redeploy auslösen nach Env Vars
