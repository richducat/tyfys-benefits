const Stripe = require('stripe');
const { json, readBody, safeString } = require('./_util');
const { zohoFindContact, zohoUpsertContact } = require('./_zoho');
const { buildZohoContact, extractProfile } = require('./_zoho-profile');

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

function splitDisplayName(displayName) {
  const parts = safeString(displayName, 160).split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
}

function buildCheckoutProfile(body) {
  const sourceProfile = body.profile || body.contact || body.userProfile || body;
  const profile = extractProfile(sourceProfile);
  const nameParts = splitDisplayName(body.displayName);

  return {
    ...profile,
    firstName: profile.firstName || nameParts.firstName,
    lastName: profile.lastName || nameParts.lastName,
    email: profile.email || safeString(body.email || body.accountEmail, 160),
    phone: profile.phone || safeString(body.phone, 80),
  };
}

// POST /api/checkout
// Body: { leadId, plan, profile? }
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');

    const requestedCrmId = safeString(body.leadId);
    const plan = safeString(body.plan);
    const price = priceIdForPlan(plan);
    if (!price) return json(res, 400, { ok: false, error: 'Unknown plan' });

    const profile = buildCheckoutProfile(body);
    let crmRecordId = requestedCrmId;

    if (!profile.lastName && !profile.email && !profile.phone) {
      if (!requestedCrmId) {
        return json(res, 400, { ok: false, error: 'Missing customer profile for CRM sync' });
      }
      const existingContact = await zohoFindContact({ contactId: requestedCrmId });
      if (!existingContact?.id) {
        return json(res, 400, { ok: false, error: 'CRM customer profile could not be resolved for checkout' });
      }
      crmRecordId = safeString(existingContact.id, 120);
    } else {
      const contact = buildZohoContact(profile, 'TYFYS Checkout', {
        header: 'TYFYS checkout started',
        extraLines: [`Checkout Plan: ${plan}`],
      });
      const upsert = await zohoUpsertContact({
        contact,
        contactId: requestedCrmId,
        email: profile.email,
        phone: profile.phone,
      });
      crmRecordId = upsert.contactId;
    }

    const stripe = stripeClient();

    const origin = req.headers.origin || 'https://tyfys.net';
    const customerName = safeString(
      `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || body.displayName,
      160
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: crmRecordId || undefined,
      customer_email: profile.email || undefined,
      success_url: `${origin}/app.html?leadId=${encodeURIComponent(crmRecordId)}&plan=${encodeURIComponent(plan)}&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app.html?leadId=${encodeURIComponent(crmRecordId)}&plan=${encodeURIComponent(plan)}&checkout=cancel`,
      metadata: {
        zoho_contact_id: crmRecordId,
        zoho_lead_id: crmRecordId,
        plan,
        customer_name: customerName,
        customer_email: safeString(profile.email, 160),
        customer_phone: safeString(profile.phone, 80),
      },
    });

    return json(res, 200, { ok: true, url: session.url, sessionId: session.id, leadId: crmRecordId });
  } catch (e) {
    return json(res, 500, { ok: false, error: safeString(e?.message || e, 2000) });
  }
};
