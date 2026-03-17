const { json, readBody, safeString } = require('./_util');
const { zohoUpsertContact, zohoFindContact } = require('./_zoho');
const { extractProfile, buildZohoContact, mapZohoContactToProfile } = require('./_zoho-profile');

// POST /api/zoho-signup
// Body: { leadId?: string, profile: { firstName,lastName,email,phone,zip,... } }
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');
    const profile = extractProfile(body.profile || body);
    const leadId = safeString(body.leadId, 120);

    if (!profile.lastName && !profile.email && !profile.phone) {
      return json(res, 400, { ok: false, error: 'Need at least lastName, email, or phone.' });
    }

    const contact = buildZohoContact(profile, body.leadSource, {
      header: 'TYFYS app signup sync',
    });
    const upsert = await zohoUpsertContact({
      contact,
      contactId: leadId,
      email: profile.email,
      phone: profile.phone,
    });

    const crmContact = await zohoFindContact({ contactId: upsert.contactId });
    const mappedProfile = mapZohoContactToProfile(crmContact);
    return json(res, 200, {
      ok: true,
      action: upsert.action,
      leadId: upsert.contactId,
      crmModule: 'Contacts',
      profile: {
        ...profile,
        ...mappedProfile,
      },
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
