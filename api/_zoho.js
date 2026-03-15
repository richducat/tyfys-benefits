const { safeString } = require('./_util');

function zohoNoData(code, message) {
  const normalizedCode = safeString(code).toUpperCase();
  const normalizedMessage = safeString(message).toLowerCase();
  return normalizedCode === 'NO_CONTENT' || normalizedMessage.includes('no data');
}

async function parseJson(res) {
  const raw = await res.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { raw };
  }
}

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
  const j = await parseJson(res);
  if (!res.ok || !j.access_token) {
    throw new Error(`Zoho token refresh failed: ${res.status} ${JSON.stringify(j)}`);
  }
  return j.access_token;
}

function zohoApiDomain() {
  return process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com';
}

async function zohoRequest(path, { method = 'GET', body } = {}) {
  const token = await zohoGetAccessToken();
  const res = await fetch(`${zohoApiDomain()}${path}`, {
    method,
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await parseJson(res);
  return { res, json };
}

async function zohoCreateRecord(moduleApiName, record) {
  const moduleName = safeString(moduleApiName, 120);
  const { res, json } = await zohoRequest(`/crm/v2/${moduleName}`, {
    method: 'POST',
    body: { data: [record] },
  });
  if (!res.ok) {
    throw new Error(`Zoho create ${moduleName} failed: ${res.status} ${JSON.stringify(json)}`);
  }
  const id = json?.data?.[0]?.details?.id;
  if (!id) {
    throw new Error(`Zoho create ${moduleName} missing id: ${JSON.stringify(json)}`);
  }
  return id;
}

async function zohoUpdateRecord({ moduleApiName, recordId, record }) {
  const moduleName = safeString(moduleApiName, 120);
  const payload = {
    ...record,
    id: safeString(recordId, 120),
  };
  const { res, json } = await zohoRequest(`/crm/v2/${moduleName}`, {
    method: 'PUT',
    body: { data: [payload] },
  });
  if (!res.ok) {
    throw new Error(`Zoho update ${moduleName} failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json?.data?.[0]?.details?.id || payload.id;
}

async function zohoGetRecordById(moduleApiName, recordId) {
  const moduleName = safeString(moduleApiName, 120);
  const id = safeString(recordId, 120);
  if (!id) return null;

  const { res, json } = await zohoRequest(`/crm/v2/${moduleName}/${encodeURIComponent(id)}`);
  if (res.status === 404 || (res.status === 400 && zohoNoData(json?.code, json?.message))) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Zoho get ${moduleName} failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json?.data?.[0] || null;
}

async function zohoSearchRecordsByUrl(url, moduleApiName) {
  const token = await zohoGetAccessToken();
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (res.status === 204) return [];

  const json = await parseJson(res);
  if (!res.ok) {
    if (res.status === 400 && zohoNoData(json?.code, json?.message)) return [];
    throw new Error(`Zoho ${moduleApiName} search failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return Array.isArray(json?.data) ? json.data : [];
}

function normalizePhone(phone) {
  return safeString(phone, 80).replace(/[^\d+]/g, '');
}

function sanitizeCriteriaValue(value, max = 160) {
  return safeString(value, max).replace(/[()]/g, '').replace(/,/g, ' ');
}

async function zohoSearchRecordsByEmail(moduleApiName, email) {
  const moduleName = safeString(moduleApiName, 120);
  const value = safeString(email, 160);
  if (!value) return [];
  return zohoSearchRecordsByUrl(
    `${zohoApiDomain()}/crm/v2/${moduleName}/search?email=${encodeURIComponent(value)}`,
    moduleName
  );
}

async function zohoSearchRecordsByCriteria(moduleApiName, criteria) {
  const moduleName = safeString(moduleApiName, 120);
  const value = safeString(criteria, 500);
  if (!value) return [];
  return zohoSearchRecordsByUrl(
    `${zohoApiDomain()}/crm/v2/${moduleName}/search?criteria=${encodeURIComponent(value)}`,
    moduleName
  );
}

async function zohoSearchRecordsByPhone(moduleApiName, phone) {
  const moduleName = safeString(moduleApiName, 120);
  const value = normalizePhone(phone);
  if (!value) return [];

  try {
    return await zohoSearchRecordsByUrl(
      `${zohoApiDomain()}/crm/v2/${moduleName}/search?phone=${encodeURIComponent(value)}`,
      moduleName
    );
  } catch (error) {
    const criteria = `(Phone:equals:${sanitizeCriteriaValue(value, 80)}) or (Mobile:equals:${sanitizeCriteriaValue(
      value,
      80
    )})`;
    return zohoSearchRecordsByCriteria(moduleName, criteria);
  }
}

async function zohoFindRecord({ moduleApiName, recordId, email, phone }) {
  const byId = await zohoGetRecordById(moduleApiName, recordId);
  if (byId) return byId;

  const byEmail = await zohoSearchRecordsByEmail(moduleApiName, email);
  if (byEmail.length > 0) return byEmail[0];

  const byPhone = await zohoSearchRecordsByPhone(moduleApiName, phone);
  if (byPhone.length > 0) return byPhone[0];

  return null;
}

async function zohoUpsertRecord({ moduleApiName, record, recordId, email, phone }) {
  const existing = await zohoFindRecord({
    moduleApiName,
    recordId,
    email,
    phone,
  });

  if (existing?.id) {
    const updatedId = await zohoUpdateRecord({
      moduleApiName,
      recordId: existing.id,
      record,
    });
    return { recordId: updatedId, action: 'updated' };
  }

  const createdId = await zohoCreateRecord(moduleApiName, record);
  return { recordId: createdId, action: 'created' };
}

async function zohoCreateLead({ lead }) {
  return zohoCreateRecord('Leads', lead);
}

async function zohoUpdateLead({ leadId, lead }) {
  return zohoUpdateRecord({ moduleApiName: 'Leads', recordId: leadId, record: lead });
}

async function zohoGetLeadById(leadId) {
  return zohoGetRecordById('Leads', leadId);
}

async function zohoSearchLeadsByEmail(email) {
  return zohoSearchRecordsByEmail('Leads', email);
}

async function zohoSearchLeadsByPhone(phone) {
  return zohoSearchRecordsByPhone('Leads', phone);
}

async function zohoFindLead({ leadId, email, phone }) {
  return zohoFindRecord({
    moduleApiName: 'Leads',
    recordId: leadId,
    email,
    phone,
  });
}

async function zohoUpsertLead({ lead, leadId, email, phone }) {
  const upsert = await zohoUpsertRecord({
    moduleApiName: 'Leads',
    record: lead,
    recordId: leadId,
    email: email || lead?.Email,
    phone: phone || lead?.Phone || lead?.Mobile,
  });
  return { leadId: upsert.recordId, action: upsert.action };
}

async function zohoCreateContact({ contact }) {
  return zohoCreateRecord('Contacts', contact);
}

async function zohoUpdateContact({ contactId, contact }) {
  return zohoUpdateRecord({ moduleApiName: 'Contacts', recordId: contactId, record: contact });
}

async function zohoGetContactById(contactId) {
  return zohoGetRecordById('Contacts', contactId);
}

async function zohoFindContact({ contactId, email, phone }) {
  return zohoFindRecord({
    moduleApiName: 'Contacts',
    recordId: contactId,
    email,
    phone,
  });
}

async function zohoUpsertContact({ contact, contactId, email, phone }) {
  const upsert = await zohoUpsertRecord({
    moduleApiName: 'Contacts',
    record: contact,
    recordId: contactId,
    email: email || contact?.Email,
    phone: phone || contact?.Phone || contact?.Mobile,
  });
  return { contactId: upsert.recordId, action: upsert.action };
}

async function zohoFindDealByName(dealName) {
  const normalizedName = sanitizeCriteriaValue(dealName, 200);
  if (!normalizedName) return null;
  const matches = await zohoSearchRecordsByCriteria('Deals', `(Deal_Name:equals:${normalizedName})`);
  return matches[0] || null;
}

async function zohoCreateDeal({ deal }) {
  return zohoCreateRecord('Deals', deal);
}

async function zohoUploadAttachment({ moduleApiName, recordId, fileName, fileBuffer, contentType }) {
  const moduleName = safeString(moduleApiName, 120);
  const parentId = safeString(recordId, 120);
  const uploadName = safeString(fileName, 180) || 'upload.bin';

  if (!moduleName || !parentId) {
    throw new Error('Zoho attachment upload requires moduleApiName and recordId');
  }

  const token = await zohoGetAccessToken();
  const formData = new FormData();
  const blob = new Blob([fileBuffer], {
    type: safeString(contentType, 160) || 'application/octet-stream',
  });
  formData.set('file', blob, uploadName);

  const res = await fetch(`${zohoApiDomain()}/crm/v8/${moduleName}/${encodeURIComponent(parentId)}/Attachments`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
    },
    body: formData,
  });
  const json = await parseJson(res);
  if (!res.ok) {
    throw new Error(`Zoho upload attachment failed: ${res.status} ${JSON.stringify(json)}`);
  }

  const details = json?.data?.[0]?.details || {};
  return {
    attachmentId: safeString(details.id, 120),
    fileName: safeString(details.name || uploadName, 180) || uploadName,
  };
}

async function zohoAddNote({ parentId, parentModule, noteContent, noteTitle = 'TYFYS CRM sync' }) {
  const note = {
    Note_Title: safeString(noteTitle, 200) || 'TYFYS CRM sync',
    Note_Content: safeString(noteContent, 100000),
    Parent_Id: parentId,
    se_module: parentModule,
  };
  await zohoCreateRecord('Notes', note);
  return true;
}

module.exports = {
  zohoGetAccessToken,
  zohoCreateLead,
  zohoUpdateLead,
  zohoGetLeadById,
  zohoSearchLeadsByEmail,
  zohoSearchLeadsByPhone,
  zohoFindLead,
  zohoUpsertLead,
  zohoCreateContact,
  zohoUpdateContact,
  zohoGetContactById,
  zohoFindContact,
  zohoUpsertContact,
  zohoFindDealByName,
  zohoCreateDeal,
  zohoUploadAttachment,
  zohoAddNote,
};
