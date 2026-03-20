const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 8787);
const dataDir = path.join(__dirname, 'data');
const leadsFile = path.join(dataDir, 'leads.jsonl');

app.use(express.json({ limit: '200kb' }));
app.use(express.static(__dirname));

function ensureStorage() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile, '');
}

function sanitise(input, max = 300) {
  return String(input || '').trim().slice(0, max);
}

app.post('/api/leads', (req, res) => {
  ensureStorage();

  const lead = {
    createdAt: new Date().toISOString(),
    name: sanitise(req.body.name, 120),
    email: sanitise(req.body.email, 180),
    company: sanitise(req.body.company, 180),
    preferredSetup: sanitise(req.body.preferredSetup, 40),
    goal: sanitise(req.body.goal, 800),
    source: 'agentstack.im-landing'
  };

  if (!lead.name || !lead.email || !lead.company || !lead.preferredSetup) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
  if (!emailOk) {
    return res.status(400).json({ ok: false, error: 'Invalid email address' });
  }

  fs.appendFileSync(leadsFile, JSON.stringify(lead) + '\n', 'utf8');
  res.json({ ok: true });
});

app.get('/api/leads', (req, res) => {
  ensureStorage();

  const token = process.env.LEADS_ADMIN_TOKEN;
  if (token && req.query.token !== token) {
    return res.status(401).json({ ok: false, error: 'Unauthorised' });
  }

  const lines = fs.readFileSync(leadsFile, 'utf8').trim().split('\n').filter(Boolean);
  const leads = lines.map((l) => JSON.parse(l)).reverse();
  res.json({ ok: true, count: leads.length, leads });
});

app.listen(port, () => {
  console.log(`AgentStack.im running on http://localhost:${port}`);
});
