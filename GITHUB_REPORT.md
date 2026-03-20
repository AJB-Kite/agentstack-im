# AgentStack.im — Build Report

## Summary
A conversion-focused landing page was created for **AgentStack.im** (UK English), tailored for Isle of Man OpenClaw setup services.

## What was delivered
- Distinctive visual branding (midnight/cyan/violet/lime palette)
- Clear value proposition and 48-hour setup framing
- Transparent pricing:
  - £699 local machine setup
  - £999 hosted VM setup
  - £1,299 team setup (up to 5 users)
  - Optional retainers: £149/mo Lite, £299/mo Pro
- Single-goal lead capture section with short form
- FAQs + repeated CTA for conversion

## Lead capture system added
A lightweight backend lead capture API is now implemented.

### Endpoints
- `POST /api/leads` — captures form submissions
- `GET /api/leads?token=...` — admin retrieval of captured leads

### Storage
- Leads are stored in `data/leads.jsonl` (one JSON object per line)
- `data/` is excluded via `.gitignore`

### Required fields validated
- Name
- Email (format checked)
- Business name
- Preferred setup

## Files added/updated
- `index.html` (form now posts to backend)
- `server.js` (Express lead capture API + static hosting)
- `package.json`
- `.gitignore`
- `GITHUB_REPORT.md`

## Run locally
```bash
cd agentstack-im
npm install
LEADS_ADMIN_TOKEN="change-me" npm start
```

Then open:
- Landing page: `http://localhost:8787/`
- Leads API (admin): `http://localhost:8787/api/leads?token=change-me`

## Suggested next steps
1. Send lead notifications to Telegram/email on new submission.
2. Add GDPR/Privacy notice and consent checkbox.
3. Pipe leads to Supabase or Airtable for CRM workflows.
4. Deploy with HTTPS and bot protection (Cloudflare Turnstile/hCaptcha).
