const Stripe = require('stripe');
const { json, readBody, safeString } = require('./_util');
const { zohoAddNote, zohoCreateDeal, zohoFindContact, zohoFindDealByName, zohoUpsertContact } = require('./_zoho');
const { buildZohoContact, extractProfile } = require('./_zoho-profile');

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

function splitDisplayName(displayName) {
  const parts = safeString(displayName, 160).split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
}

function planNameFromCode(plan) {
  const normalized = safeString(plan, 80).toLowerCase();
  if (normalized === 'pro_monthly' || normalized === '250_monthly') return 'Premium Membership';
  if (normalized === 'lite_monthly' || normalized === '35_monthly') return 'Starter Membership';
  if (normalized === 'special_yearly' || normalized === '250_yearly_special') return 'Premium Annual';
  return safeString(plan, 80) || 'TYFYS subscription';
}

function buildStripeProfile(session) {
  const customerName = safeString(
    session?.customer_details?.name || session?.metadata?.customer_name || '',
    160
  );
  const nameParts = splitDisplayName(customerName);
  return extractProfile({
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    email: session?.customer_details?.email || session?.customer_email || session?.metadata?.customer_email,
    phone: session?.customer_details?.phone || session?.metadata?.customer_phone,
  });
}

function buildStripePaymentNote(session, plan) {
  const amount = session?.amount_total ? Number(session.amount_total) / 100 : null;
  const lines = [
    'Stripe checkout.session.completed',
    `Plan: ${plan || '-'}`,
    `Session: ${safeString(session?.id, 160) || '-'}`,
    `Stripe Customer: ${safeString(session?.customer, 160) || '-'}`,
    `Amount: ${amount !== null ? amount : '-'}`,
    `Customer Email: ${safeString(session?.customer_details?.email || session?.customer_email, 160) || '-'}`,
    `Customer Phone: ${safeString(session?.customer_details?.phone || session?.metadata?.customer_phone, 80) || '-'}`,
    `Paid At: ${new Date().toISOString()}`,
  ];
  return lines.join('\n');
}

async function createDealWithContactFallback(deal) {
  try {
    return await zohoCreateDeal({ deal });
  } catch (error) {
    if (!deal?.Contact_Name) throw error;
    const fallbackDeal = { ...deal };
    delete fallbackDeal.Contact_Name;
    return zohoCreateDeal({ deal: fallbackDeal });
  }
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
      const requestedCrmId = safeString(
        session?.metadata?.zoho_contact_id || session?.metadata?.zoho_lead_id || session?.client_reference_id
      );
      const plan = safeString(session?.metadata?.plan);
      const planName = planNameFromCode(plan);
      const profile = buildStripeProfile(session);
      const dealName = safeString(`TYFYS_Checkout_${session?.id || evt.id}`, 120);
      const existingDeal = await zohoFindDealByName(dealName);

      if (!existingDeal) {
        let contactId = requestedCrmId;

        if (profile.lastName || profile.email || profile.phone || requestedCrmId) {
          const existingContact = await zohoFindContact({
            contactId: requestedCrmId,
            email: profile.email,
            phone: profile.phone,
          });

          if (existingContact?.id) {
            contactId = safeString(existingContact.id, 120);
          } else if (profile.lastName || profile.email || profile.phone) {
            const contact = buildZohoContact(profile, 'Stripe Checkout', {
              includeDescription: false,
            });
            const upsert = await zohoUpsertContact({
              contact,
              contactId: requestedCrmId,
              email: profile.email,
              phone: profile.phone,
            });
            contactId = upsert.contactId;
          }
        }

        const paymentNote = buildStripePaymentNote(session, planName);

        if (contactId) {
          await zohoAddNote({
            parentId: contactId,
            parentModule: 'Contacts',
            noteTitle: 'TYFYS Stripe payment',
            noteContent: paymentNote,
          });
        }

        try {
          const deal = {
            Deal_Name: dealName,
            Stage: process.env.ZOHO_DEAL_STAGE || 'Paid',
            Amount: session?.amount_total ? Number(session.amount_total) / 100 : undefined,
            Description: `Paid via Stripe Checkout. Plan=${planName}. Session=${session.id}. Customer=${safeString(
              session?.customer,
              160
            ) || '-'}. CRM Contact=${contactId || '-'}`,
            Lead_Source: 'TYFYS App',
            ...(contactId ? { Contact_Name: { id: contactId } } : {}),
          };

          const dealId = await createDealWithContactFallback(deal);
          await zohoAddNote({
            parentId: dealId,
            parentModule: 'Deals',
            noteTitle: 'TYFYS Stripe payment',
            noteContent: paymentNote,
          });
        } catch (dealError) {
          if (!contactId) throw dealError;
          await zohoAddNote({
            parentId: contactId,
            parentModule: 'Contacts',
            noteTitle: 'TYFYS payment sync warning',
            noteContent: `${paymentNote}\n\nDeal sync warning: ${safeString(dealError?.message || dealError, 2000)}`,
          });
        }
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
