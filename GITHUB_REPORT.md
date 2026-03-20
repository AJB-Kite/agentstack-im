# AgentStack.im — Go-Live Report

## What is now production-ready
The website is now structured for live deployment with secure lead capture using **Supabase + serverless API + bot protection + Telegram notifications**.

## Stack choice (recommended)
- **Hosting:** Vercel (best fit for speed + GitHub integration + serverless API)
- **Database:** Supabase Postgres
- **Bot protection:** Cloudflare Turnstile
- **Lead alerts:** Telegram bot message on every new lead

## Implemented components
- `index.html`
  - UK English copy
  - lead form wired to `/api/lead`
  - consent checkbox
  - honeypot anti-spam field
  - Turnstile widget placeholder (`__TURNSTILE_SITE_KEY__`)
- `api/lead.js`
  - validates and sanitises fields
  - verifies Turnstile token
  - writes lead to Supabase `public.leads`
  - sends Telegram new-lead alert
- `api/leads.js`
  - admin endpoint to list latest leads (token-protected)
- `supabase/schema.sql`
  - secure table + indexes + RLS policies
- `.env.example`
  - all required environment variables
- `vercel.json`
  - Node 22 serverless function runtime

## Security posture
- Required consent field
- Bot check (Turnstile verification server-side)
- Hidden honeypot field for spam bots
- Server-side validation and email format checks
- Admin read endpoint protected by `LEADS_ADMIN_TOKEN`
- Supabase RLS enabled to block anonymous access

## Required env vars (Vercel)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LEADS_ADMIN_TOKEN`
- `TURNSTILE_SECRET_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Go-live checklist
1. Create Supabase project and run `supabase/schema.sql`.
2. Create Cloudflare Turnstile site + secret keys.
3. Replace `__TURNSTILE_SITE_KEY__` in `index.html` with real site key.
4. Add all env vars in Vercel project settings.
5. Deploy from GitHub repo `AJB-Kite/agentstack-im`.
6. Test form submit and verify:
   - row appears in Supabase `public.leads`
   - Telegram alert arrives
7. Test admin endpoint:
   - `/api/leads?token=<LEADS_ADMIN_TOKEN>`

## Notes
- This setup is intentionally lean and robust for lead capture.
- If needed next: add rate limiting, privacy policy page, and CRM sync (HubSpot/Airtable).
