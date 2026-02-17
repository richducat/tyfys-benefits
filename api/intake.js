const { json, readBody, safeString, sha256Hex } = require('./_util');
const { zohoCreateLead, zohoAddNote } = require('./_zoho');

// POST /api/intake
// Body: { answers: {...}, transcript: string, contact: { firstName,lastName,email,phone } }
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw.toString('utf8') || '{}');

    const contact = body.contact || {};
    const firstName = safeString(contact.firstName || body.firstName);
    const lastName = safeString(contact.lastName || body.lastName);
    const email = safeString(contact.email || body.email);
    const phone = safeString(contact.phone || body.phone);

    if (!lastName && !email && !phone) {
      return json(res, 400, { ok: false, error: 'Missing contact (need lastName or email or phone)' });
    }

    const answers = body.answers || {};
    const transcript = safeString(body.transcript || '', 200000);

    // Minimal Lead fields; we can map to custom fields later.
    const lead = {
      Last_Name: lastName || 'Unknown',
      First_Name: firstName || undefined,
      Email: email || undefined,
      Phone: phone || undefined,
      Lead_Source: 'vaclaimteam.com',
      Description: safeString(body.summary || '', 10000),
      // Store a stable fingerprint to help de-dupe later.
      // (We can add a proper custom field in Zoho after.)
      // NOTE: Zoho ignores unknown fields.
      Intake_Fingerprint: sha256Hex(JSON.stringify({ email, phone, lastName, firstName, answers }).slice(0, 100000)),
    };

    const leadId = await zohoCreateLead({ lead });

    if (transcript) {
      await zohoAddNote({ parentId: leadId, parentModule: 'Leads', noteContent: transcript });
    }

    return json(res, 200, { ok: true, leadId });
  } catch (e) {
    return json(res, 500, { ok: false, error: safeString(e?.message || e, 2000) });
  }
};
