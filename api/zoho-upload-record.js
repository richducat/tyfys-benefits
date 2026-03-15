const { json, safeString } = require('./_util');
const { zohoFindContact, zohoFindLead, zohoUploadAttachment, zohoAddNote } = require('./_zoho');

function normalizeCrmModule(value) {
  const normalized = safeString(value, 40).toLowerCase();
  if (!normalized) return '';
  if (normalized === 'contact' || normalized === 'contacts') return 'Contacts';
  if (normalized === 'lead' || normalized === 'leads') return 'Leads';
  if (normalized === 'deal' || normalized === 'deals') return 'Deals';
  return '';
}

async function readMultipartForm(req) {
  const origin = req.headers.host ? `https://${req.headers.host}` : 'https://tyfys.local';
  const request = new Request(new URL(req.url || '/', origin), {
    method: req.method,
    headers: req.headers,
    body: req,
    duplex: 'half',
  });
  return request.formData();
}

async function resolveCrmTarget({ crmModule, recordId, email, phone }) {
  const normalizedModule = normalizeCrmModule(crmModule);
  const normalizedRecordId = safeString(recordId, 120);

  if (normalizedModule === 'Deals') {
    if (!normalizedRecordId) {
      throw new Error('Deal uploads require a Zoho deal id.');
    }
    return { crmModule: 'Deals', recordId: normalizedRecordId };
  }

  if (normalizedModule === 'Contacts' && normalizedRecordId) {
    return { crmModule: 'Contacts', recordId: normalizedRecordId };
  }

  if (normalizedModule === 'Leads' && normalizedRecordId) {
    return { crmModule: 'Leads', recordId: normalizedRecordId };
  }

  const contact = await zohoFindContact({
    contactId: normalizedRecordId,
    email,
    phone,
  });
  if (contact?.id) {
    return { crmModule: 'Contacts', recordId: safeString(contact.id, 120) };
  }

  const lead = await zohoFindLead({
    leadId: normalizedRecordId,
    email,
    phone,
  });
  if (lead?.id) {
    return { crmModule: 'Leads', recordId: safeString(lead.id, 120) };
  }

  throw new Error('No Zoho lead or contact record was found for this upload.');
}

function buildUploadNote({ title, type, condition, notes, fileName, fileSize }) {
  const lines = [
    'TYFYS intake record upload',
    `Title: ${title || fileName || '-'}`,
    `Document Type: ${type || '-'}`,
    `Condition: ${condition || '-'}`,
    `Original File: ${fileName || '-'}`,
    `File Size: ${Number(fileSize) > 0 ? `${Math.round(Number(fileSize) / 1024)} KB` : '-'}`,
  ];

  if (notes) {
    lines.push(`Notes: ${notes}`);
  }

  lines.push(`Uploaded At: ${new Date().toISOString()}`);
  return lines.join('\n');
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, { ok: true });
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed' });

  try {
    const form = await readMultipartForm(req);
    const file = form.get('file');

    if (!file || typeof file.arrayBuffer !== 'function' || Number(file.size) <= 0) {
      return json(res, 400, { ok: false, error: 'Attach a PDF or image file before uploading.' });
    }

    const email = safeString(form.get('email'), 160);
    const phone = safeString(form.get('phone'), 80);
    const crmTarget = await resolveCrmTarget({
      crmModule: form.get('crmModule') || form.get('recordModule'),
      recordId: form.get('recordId') || form.get('leadId'),
      email,
      phone,
    });

    const title = safeString(form.get('title'), 200);
    const type = safeString(form.get('type'), 120);
    const condition = safeString(form.get('condition'), 120);
    const notes = safeString(form.get('notes'), 4000);
    const fileName = safeString(file.name, 180) || 'upload.bin';
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const upload = await zohoUploadAttachment({
      moduleApiName: crmTarget.crmModule,
      recordId: crmTarget.recordId,
      fileName,
      fileBuffer,
      contentType: safeString(file.type, 160),
    });

    await zohoAddNote({
      parentId: crmTarget.recordId,
      parentModule: crmTarget.crmModule,
      noteTitle: `Intake upload: ${title || fileName}`,
      noteContent: buildUploadNote({
        title,
        type,
        condition,
        notes,
        fileName,
        fileSize: file.size,
      }),
    });

    return json(res, 200, {
      ok: true,
      crmModule: crmTarget.crmModule,
      recordId: crmTarget.recordId,
      attachmentId: upload.attachmentId,
      fileName: upload.fileName || fileName,
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: safeString(error?.message || error, 2000) });
  }
};
