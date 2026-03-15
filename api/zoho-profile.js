const { json, readBody, safeString } = require('./_util');
const { zohoFindContact, zohoFindLead } = require('./_zoho');
const { mapZohoContactToProfile, mapZohoLeadToProfile } = require('./_zoho-profile');

function readLookupFromQuery(req) {
  const url = new URL(req.url || '/', 'https://tyfys.local');
  return {
    leadId: safeString(url.searchParams.get('leadId'), 120),
    email: safeString(url.searchParams.get('email'), 160),
    phone: safeString(url.searchParams.get('phone'), 80),
  };
}

// GET /api/zoho-profile?leadId=...&email=...&phone=...
// POST /api/zoho-profile { leadId, email, phone }
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (!['GET', 'POST'].includes(req.method)) return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    let lookup = readLookupFromQuery(req);
    if (req.method === 'POST') {
      const raw = await readBody(req);
      const body = JSON.parse(raw.toString('utf8') || '{}');
      lookup = {
        leadId: safeString(body.leadId, 120) || lookup.leadId,
        email: safeString(body.email, 160) || lookup.email,
        phone: safeString(body.phone, 80) || lookup.phone,
      };
    }

    if (!lookup.leadId && !lookup.email && !lookup.phone) {
      return json(res, 400, { ok: false, error: 'Need leadId, email, or phone.' });
    }

    const contact = await zohoFindContact({
      contactId: lookup.leadId,
      email: lookup.email,
      phone: lookup.phone,
    });
    if (contact) {
      return json(res, 200, {
        ok: true,
        found: true,
        crmModule: 'Contacts',
        leadId: safeString(contact.id, 120),
        profile: mapZohoContactToProfile(contact),
      });
    }

    const lead = await zohoFindLead(lookup);
    if (!lead) return json(res, 200, { ok: true, found: false });

    return json(res, 200, {
      ok: true,
      found: true,
      crmModule: 'Leads',
      leadId: safeString(lead.id, 120),
      profile: mapZohoLeadToProfile(lead),
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
