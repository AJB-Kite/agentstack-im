# AgentStack.im

Landing page + secure lead capture for OpenClaw setup services.

## Hosting recommendation
**Vercel + Supabase**

Why:
- very fast setup from GitHub
- built-in serverless API routes
- easy env secret management
- reliable global edge delivery

## Architecture
- Static landing page: `index.html`
- Lead ingest API: `api/lead.js`
- Leads admin API: `api/leads.js`
- Database: Supabase `public.leads`
- Notifications: Telegram bot alert on new lead
- Bot defence: Cloudflare Turnstile + honeypot field

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in SQL editor.
3. Create a Turnstile site and secret.
4. Replace `__TURNSTILE_SITE_KEY__` in `index.html`.
5. Configure Vercel env vars from `.env.example`.
6. Deploy this repo on Vercel.

## Env vars
See `.env.example`.

## Admin leads endpoint
`/api/leads?token=<LEADS_ADMIN_TOKEN>`
