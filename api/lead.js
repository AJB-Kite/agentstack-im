const MAX_LEN = {
  name: 120,
  email: 180,
  company: 180,
  preferredSetup: 40,
  goal: 1200,
  source: 120,
};

const clean = (v, len) => String(v || '').trim().slice(0, len);

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: false, reason: 'Missing TURNSTILE_SECRET_KEY' };
  if (!token) return { ok: false, reason: 'Missing turnstile token' };

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip || '',
  });

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  return { ok: !!data.success, details: data };
}

async function insertLead(lead) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

  const res = await fetch(`${url}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(lead),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase insert failed: ${res.status} ${txt}`);
  }

  const rows = await res.json();
  return rows?.[0] || null;
}

async function notifyTelegram(lead) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  const text = [
    '🔥 New AgentStack lead',
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company}`,
    `Setup: ${lead.preferred_setup}`,
    lead.goal ? `Goal: ${lead.goal}` : null,
    lead.source ? `Source: ${lead.source}` : null,
  ].filter(Boolean).join('\n');

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const ip = req.headers['x-forwarded-for']?.split(',')?.[0]?.trim() || '';

    // Honeypot: bots fill hidden field.
    if (clean(req.body.website, 200)) {
      return res.status(200).json({ ok: true });
    }

    if (!req.body.consent) {
      return res.status(400).json({ ok: false, error: 'Consent is required' });
    }

    const turnstile = await verifyTurnstile(clean(req.body.turnstileToken, 4000), ip);
    if (!turnstile.ok) {
      return res.status(400).json({ ok: false, error: 'Bot check failed' });
    }

    const lead = {
      name: clean(req.body.name, MAX_LEN.name),
      email: clean(req.body.email, MAX_LEN.email).toLowerCase(),
      company: clean(req.body.company, MAX_LEN.company),
      preferred_setup: clean(req.body.preferredSetup, MAX_LEN.preferredSetup),
      goal: clean(req.body.goal, MAX_LEN.goal),
      source: clean(req.body.source || 'agentstack.im-landing', MAX_LEN.source),
      ip_hash: null,
      user_agent: clean(req.headers['user-agent'], 400),
    };

    if (!lead.name || !lead.email || !lead.company || !lead.preferred_setup) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
    if (!emailOk) {
      return res.status(400).json({ ok: false, error: 'Invalid email address' });
    }

    const inserted = await insertLead(lead);
    await notifyTelegram(inserted || lead);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Lead capture error:', err);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
};
