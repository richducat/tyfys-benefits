const { safeString } = require('./_util');

function normalizePhone(phone) {
  return safeString(phone, 80).replace(/[^\d+]/g, '');
}

function listToText(value) {
  if (Array.isArray(value)) return value.map((item) => safeString(item, 120)).filter(Boolean).join(', ');
  return safeString(value, 1000);
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;

  const normalized = safeString(value, 20).toLowerCase();
  if (!normalized) return null;
  if (['true', 'yes', 'y', '1', 'on'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0', 'off'].includes(normalized)) return false;
  return null;
}

function booleanToText(value) {
  const normalized = normalizeBoolean(value);
  if (normalized === null) return '-';
  return normalized ? 'Yes' : 'No';
}

function pickFirstDefined(source, keys) {
  const input = source && typeof source === 'object' ? source : {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      return input[key];
    }
  }
  return undefined;
}

const KNOWN_PROFILE_KEYS = new Set([
  'firstName',
  'First_Name',
  'lastName',
  'Last_Name',
  'email',
  'Email',
  'phone',
  'Phone',
  'mobile',
  'Mobile',
  'zip',
  'zipCode',
  'Zip_Code',
  'Mailing_Zip',
  'branch',
  'era',
  'rating',
  'pain_categories',
  'painCategories',
  'pain_points',
  'painPoints',
  'privateOrg',
  'terms',
  'attorney',
  'appeal',
  'discharge',
  'claims_pending',
  'claimsPending',
  'leadId',
  'contactId',
  'leadSource',
  'crmModule',
  'description',
  'Description',
  'appPassword',
  'confirmPassword',
  'securityAnswer',
  'website_hp',
]);

function extractExtraFields(profile) {
  const extras = {};
  Object.entries(profile || {}).forEach(([key, value]) => {
    if (KNOWN_PROFILE_KEYS.has(key)) return;
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      const text = value.map((item) => safeString(item, 120)).filter(Boolean).join(', ');
      if (text) extras[key] = text;
      return;
    }

    if (typeof value === 'object') {
      const text = safeString(JSON.stringify(value), 2000);
      if (text && text !== '{}') extras[key] = text;
      return;
    }

    const text = safeString(value, 500);
    if (text) extras[key] = text;
  });
  return extras;
}

function extractProfile(rawProfile) {
  const profile = rawProfile && typeof rawProfile === 'object' ? rawProfile : {};
  return {
    firstName: safeString(profile.firstName || profile.First_Name, 80),
    lastName: safeString(profile.lastName || profile.Last_Name, 80),
    email: safeString(profile.email || profile.Email, 160),
    phone: normalizePhone(profile.phone || profile.Phone || profile.mobile || profile.Mobile),
    zip: safeString(profile.zip || profile.zipCode || profile.Zip_Code, 20),
    branch: safeString(profile.branch, 80),
    era: safeString(profile.era, 80),
    attorney: normalizeBoolean(pickFirstDefined(profile, ['attorney'])),
    appeal: normalizeBoolean(pickFirstDefined(profile, ['appeal'])),
    discharge: normalizeBoolean(pickFirstDefined(profile, ['discharge'])),
    claimsPending: normalizeBoolean(pickFirstDefined(profile, ['claims_pending', 'claimsPending'])),
    rating: toNumber(profile.rating, 0),
    painCategories: listToText(profile.pain_categories || profile.painCategories),
    painPoints: listToText(profile.pain_points || profile.painPoints),
    privateOrg: normalizeBoolean(pickFirstDefined(profile, ['privateOrg'])),
    terms: normalizeBoolean(pickFirstDefined(profile, ['terms'])),
    extras: extractExtraFields(profile),
  };
}

function buildProfileDescription(profile, options = {}) {
  const header = safeString(options.header || 'TYFYS app profile sync', 160) || 'TYFYS app profile sync';
  const extraLines = Array.isArray(options.extraLines)
    ? options.extraLines.map((line) => safeString(line, 500)).filter(Boolean)
    : [];
  const extras = profile?.extras && typeof profile.extras === 'object' ? profile.extras : {};

  const lines = [
    header,
    `Branch: ${profile.branch || '-'}`,
    `Era: ${profile.era || '-'}`,
    `Eligible discharge: ${booleanToText(profile.discharge)}`,
    `Working with accredited attorney: ${booleanToText(profile.attorney)}`,
    `Active BVA appeal: ${booleanToText(profile.appeal)}`,
    `Claims pending: ${booleanToText(profile.claimsPending)}`,
    `Rating: ${profile.rating || 0}%`,
    `Pain Categories: ${profile.painCategories || '-'}`,
    `Pain Points: ${profile.painPoints || '-'}`,
    `Private company acknowledgement: ${booleanToText(profile.privateOrg)}`,
    `Terms accepted: ${booleanToText(profile.terms)}`,
    ...extraLines,
    `Synced At: ${new Date().toISOString()}`,
  ];

  Object.keys(extras)
    .sort()
    .forEach((key) => {
      lines.push(`${key}: ${extras[key]}`);
    });

  return safeString(lines.join('\n'), 10000);
}

function buildZohoLead(profile, leadSource = 'TYFYS App', options = {}) {
  return {
    Last_Name: profile.lastName || profile.firstName || 'Veteran',
    First_Name: profile.firstName || undefined,
    Email: profile.email || undefined,
    Phone: profile.phone || undefined,
    Mobile: profile.phone || undefined,
    Zip_Code: profile.zip || undefined,
    Company: 'TYFYS',
    Lead_Source: safeString(leadSource || 'TYFYS App', 80),
    Description: buildProfileDescription(profile, options),
  };
}

function buildZohoContact(profile, leadSource = 'TYFYS App', options = {}) {
  const includeDescription = options.includeDescription !== false;
  return {
    Last_Name: profile.lastName || profile.firstName || 'Veteran',
    First_Name: profile.firstName || undefined,
    Email: profile.email || undefined,
    Phone: profile.phone || undefined,
    Mobile: profile.phone || undefined,
    Mailing_Zip: profile.zip || undefined,
    Lead_Source: safeString(leadSource || 'TYFYS App', 80),
    Description: includeDescription ? buildProfileDescription(profile, options) : undefined,
  };
}

function mapZohoLeadToProfile(lead) {
  const record = lead && typeof lead === 'object' ? lead : {};
  return {
    leadId: safeString(record.id, 120),
    firstName: safeString(record.First_Name, 80),
    lastName: safeString(record.Last_Name, 80),
    email: safeString(record.Email, 160),
    phone: normalizePhone(record.Phone || record.Mobile),
    zip: safeString(record.Zip_Code, 20),
    company: safeString(record.Company, 120),
    leadSource: safeString(record.Lead_Source, 120),
    leadStatus: safeString(record.Lead_Status || record.Status, 120),
    crmModule: 'Leads',
  };
}

function mapZohoContactToProfile(contact) {
  const record = contact && typeof contact === 'object' ? contact : {};
  return {
    contactId: safeString(record.id, 120),
    leadId: safeString(record.id, 120),
    firstName: safeString(record.First_Name, 80),
    lastName: safeString(record.Last_Name, 80),
    email: safeString(record.Email, 160),
    phone: normalizePhone(record.Phone || record.Mobile),
    zip: safeString(record.Mailing_Zip, 20),
    leadSource: safeString(record.Lead_Source, 120),
    crmModule: 'Contacts',
  };
}

module.exports = {
  extractProfile,
  buildProfileDescription,
  buildZohoLead,
  buildZohoContact,
  mapZohoContactToProfile,
  mapZohoLeadToProfile,
};
