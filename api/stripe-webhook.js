const Stripe = require('stripe');
const { json, readBody, safeString } = require('./_util');
const { zohoCreateDeal, zohoAddNote } = require('./_zoho');

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

// POST /api/stripe-webhook
module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const sig = req.headers['stripe-signature'];
    const whsec = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !whsec) return json(res, 400, { ok: false, error: 'Missing webhook signature/secret' });

    const raw = await readBody(req);
    const stripe = stripeClient();
    const evt = stripe.webhooks.constructEvent(raw, sig, whsec);

    if (evt.type === 'checkout.session.completed') {
      const session = evt.data.object;
      const leadId = safeString(session?.metadata?.zoho_lead_id);
      const plan = safeString(session?.metadata?.plan);

      if (leadId) {
        // Minimal Deal payload; we can enrich with custom fields later.
        const deal = {
          Deal_Name: `TYFYS subscription — ${leadId}`,
          Stage: 'Paid',
          Amount: session?.amount_total ? Number(session.amount_total) / 100 : undefined,
          Description: `Paid via Stripe Checkout. plan=${plan} session=${session.id} customer=${session.customer}`,
          Lead_Source: 'vaclaimteam.com',
        };

        const dealId = await zohoCreateDeal({ deal });
        await zohoAddNote({ parentId: dealId, parentModule: 'Deals', noteContent: `Stripe checkout.session.completed\nleadId=${leadId}\nplan=${plan}\nsession=${session.id}` });
      }
    }

    // ack
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ received: true }));
  } catch (e) {
    // Stripe expects 4xx on signature errors; 500 will retry.
    res.statusCode = 400;
    res.end(String(e?.message || e));
  }
};
