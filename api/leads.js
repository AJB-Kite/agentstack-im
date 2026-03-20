module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = process.env.LEADS_ADMIN_TOKEN;
  if (!token || req.query.token !== token) {
    return res.status(401).json({ ok: false, error: 'Unauthorised' });
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return res.status(500).json({ ok: false, error: 'Supabase env missing' });
    }

    const q = new URL(`${url}/rest/v1/leads`);
    q.searchParams.set('select', 'id,created_at,name,email,company,preferred_setup,goal,source');
    q.searchParams.set('order', 'created_at.desc');
    q.searchParams.set('limit', '100');

    const r = await fetch(q.toString(), {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).json({ ok: false, error: txt });
    }

    const leads = await r.json();
    return res.status(200).json({ ok: true, count: leads.length, leads });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
};
