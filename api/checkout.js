const Stripe = require('stripe');
const { json, readBody, safeString } = require('./_util');

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

function priceIdForPlan(plan) {
  const p = String(plan || '').toLowerCase();
  if (p === 'pro_monthly' || p === '250_monthly') return 'price_1T1clDByTro6FO6kLGl0wAaR';
  if (p === 'lite_monthly' || p === '35_monthly') return 'price_1T1cmaByTro6FO6kHN6maXmE';
  if (p === 'special_yearly' || p === '250_yearly_special') return 'price_1T1cmCByTro6FO6kJieu5lSi';
  return null;
}

// POST /api/checkout
// Body: { leadId, plan }
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');

    const leadId = safeString(body.leadId);
    const plan = safeString(body.plan);
    if (!leadId) return json(res, 400, { ok: false, error: 'Missing leadId' });

    const price = priceIdForPlan(plan);
    if (!price) return json(res, 400, { ok: false, error: 'Unknown plan' });

    const stripe = stripeClient();

    const origin = req.headers.origin || 'https://tyfys.net';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/app.html?leadId=${encodeURIComponent(leadId)}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app.html?leadId=${encodeURIComponent(leadId)}&checkout=cancel`,
      metadata: {
        zoho_lead_id: leadId,
        plan,
      },
    });

    return json(res, 200, { ok: true, url: session.url, sessionId: session.id });
  } catch (e) {
    return json(res, 500, { ok: false, error: safeString(e?.message || e, 2000) });
  }
};
