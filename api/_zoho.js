const { safeString } = require('./_util');

async function zohoGetAccessToken() {
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const dc = process.env.ZOHO_DC || 'com';

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing Zoho env (ZOHO_REFRESH_TOKEN/ZOHO_CLIENT_ID/ZOHO_CLIENT_SECRET)');
  }

  const url = `https://accounts.zoho.${dc}/oauth/v2/token`;
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.access_token) {
    throw new Error(`Zoho token refresh failed: ${res.status} ${JSON.stringify(j)}`);
  }
  return j.access_token;
}

function zohoApiDomain() {
  return process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com';
}

async function zohoCreateLead({ lead }) {
  const token = await zohoGetAccessToken();
  const domain = zohoApiDomain();
  const res = await fetch(`${domain}/crm/v2/Leads`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ data: [lead] }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Zoho create Lead failed: ${res.status} ${JSON.stringify(j)}`);
  const id = j?.data?.[0]?.details?.id;
  if (!id) throw new Error(`Zoho create Lead missing id: ${JSON.stringify(j)}`);
  return id;
}

async function zohoCreateDeal({ deal }) {
  const token = await zohoGetAccessToken();
  const domain = zohoApiDomain();
  const res = await fetch(`${domain}/crm/v2/Deals`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ data: [deal] }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Zoho create Deal failed: ${res.status} ${JSON.stringify(j)}`);
  const id = j?.data?.[0]?.details?.id;
  if (!id) throw new Error(`Zoho create Deal missing id: ${JSON.stringify(j)}`);
  return id;
}

async function zohoAddNote({ parentId, parentModule, noteContent }) {
  const token = await zohoGetAccessToken();
  const domain = zohoApiDomain();
  const note = {
    Note_Title: 'vaclaimteam intake transcript',
    Note_Content: safeString(noteContent, 100000),
    Parent_Id: parentId,
    se_module: parentModule,
  };
  const res = await fetch(`${domain}/crm/v2/Notes`, {
    method: 'POST',
    headers: { Authorization: `Zoho-oauthtoken ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ data: [note] }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Zoho add note failed: ${res.status} ${JSON.stringify(j)}`);
  return true;
}

module.exports = { zohoCreateLead, zohoCreateDeal, zohoAddNote };
