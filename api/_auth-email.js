const { safeString } = require('./_util');
const { zohoFindContact, zohoFindLead, zohoGetAccessToken, zohoUpsertContact } = require('./_zoho');
const { buildZohoContact, extractProfile } = require('./_zoho-profile');

const DEFAULT_PUBLIC_APP_URL = 'https://tyfys.net/app.html';

function getPublicAppUrl(req) {
  const configuredUrl = safeString(process.env.TYFYS_PUBLIC_APP_URL || process.env.TYFYS_APP_URL, 500);
  if (configuredUrl) return configuredUrl;

  const requestOrigin = safeString(req?.headers?.origin, 500);
  if (requestOrigin) {
    try {
      return new URL('/app.html', requestOrigin).toString();
    } catch (error) {
      // Fall through to the default app URL.
    }
  }

  return DEFAULT_PUBLIC_APP_URL;
}

function buildPasswordResetUrl(req, token) {
  const url = new URL(getPublicAppUrl(req));
  url.searchParams.set('resetToken', safeString(token, 240));
  return url.toString();
}

function isLocalRequest(req) {
  const host = String(req?.headers?.host || '').toLowerCase();
  return (
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('[::1]') ||
    host.startsWith('0.0.0.0')
  );
}

function buildPasswordResetContent(account, resetUrl) {
  const displayName = safeString(account?.displayName, 160) || 'there';
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;">
        <div style="background:#0f172a;color:#ffffff;padding:28px 32px;">
          <div style="font-size:12px;font-weight:800;letter-spacing:0.24em;text-transform:uppercase;color:#fde68a;">TYFYS Password Reset</div>
          <h1 style="margin:12px 0 0;font-size:30px;line-height:1.2;">Reset your TYFYS password</h1>
        </div>
        <div style="padding:32px;">
          <p style="font-size:16px;line-height:1.7;margin:0 0 16px;">Hi ${displayName},</p>
          <p style="font-size:16px;line-height:1.7;margin:0 0 16px;">
            We received a request to reset the password for your TYFYS account. Use the secure button below to choose a new password.
          </p>
          <p style="font-size:16px;line-height:1.7;margin:0 0 24px;">
            This link expires in 30 minutes. If you did not request this reset, you can ignore this email and your password will stay the same.
          </p>
          <p style="margin:0 0 28px;">
            <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:14px;font-weight:800;">
              Reset My Password
            </a>
          </p>
          <p style="font-size:14px;line-height:1.7;color:#475569;margin:0 0 8px;">If the button does not open, copy and paste this link into your browser:</p>
          <p style="font-size:13px;line-height:1.7;word-break:break-word;color:#0f172a;margin:0;">${resetUrl}</p>
        </div>
      </div>
    </div>
  `.trim();

  const text = [
    'Reset your TYFYS password',
    '',
    `Hi ${displayName},`,
    '',
    'We received a request to reset the password for your TYFYS account.',
    'Use the secure link below to choose a new password. This link expires in 30 minutes.',
    '',
    resetUrl,
    '',
    'If you did not request this reset, you can ignore this email and your password will stay the same.',
  ].join('\n');

  return {
    subject: 'Reset your TYFYS password',
    html,
    text,
  };
}

async function sendViaResend({ to, subject, html, text }) {
  const apiKey = safeString(process.env.RESEND_API_KEY, 400);
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const from =
    safeString(process.env.RESEND_FROM_EMAIL, 200) ||
    safeString(process.env.TYFYS_FROM_EMAIL, 200) ||
    'TYFYS Support <support@tyfys.net>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Resend email failed: ${response.status} ${JSON.stringify(payload)}`);
  }

  return {
    provider: 'resend',
    messageId: safeString(payload?.id, 200),
  };
}

function zohoApiDomain() {
  return process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com';
}

async function getZohoFromAddress(token) {
  const configuredEmail =
    safeString(process.env.TYFYS_RESET_FROM_EMAIL, 200) || safeString(process.env.ZOHO_FROM_EMAIL, 200);
  const configuredName = safeString(process.env.TYFYS_RESET_FROM_NAME, 120) || 'TYFYS Support';

  if (configuredEmail) {
    return {
      email: configuredEmail,
      name: configuredName,
      orgEmail: false,
    };
  }

  const response = await fetch(`${zohoApiDomain()}/crm/v8/settings/emails/actions/from_addresses`, {
    method: 'GET',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Zoho from-address lookup failed: ${response.status} ${JSON.stringify(payload)}`);
  }

  const addresses = Array.isArray(payload?.from_addresses) ? payload.from_addresses : [];
  const preferredAddress =
    addresses.find((item) => item?.is_default) || addresses.find((item) => item?.type === 'org_email') || addresses[0];

  if (!preferredAddress?.email) {
    throw new Error('Zoho did not return a usable from address.');
  }

  return {
    email: safeString(preferredAddress.email, 200),
    name: safeString(preferredAddress.user_name || preferredAddress.name || configuredName, 120) || configuredName,
    orgEmail: preferredAddress.type === 'org_email',
  };
}

async function resolveZohoResetTarget(account) {
  const email = safeString(account?.email, 160);
  const leadId = safeString(account?.leadId, 120);

  const contact = await zohoFindContact({ contactId: leadId, email });
  if (contact?.id) {
    return { moduleApiName: 'Contacts', recordId: safeString(contact.id, 120) };
  }

  const lead = await zohoFindLead({ leadId, email });
  if (lead?.id) {
    return { moduleApiName: 'Leads', recordId: safeString(lead.id, 120) };
  }

  return null;
}

function splitDisplayName(displayName) {
  const parts = safeString(displayName, 160)
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

async function ensureZohoResetTarget(account) {
  const existingTarget = await resolveZohoResetTarget(account);
  if (existingTarget?.recordId) return existingTarget;

  const name = splitDisplayName(account?.displayName);
  const profile = extractProfile({
    firstName: name.firstName,
    lastName: name.lastName || name.firstName || 'Veteran',
    email: safeString(account?.email, 160),
  });
  const contact = buildZohoContact(profile, 'TYFYS Password Reset', {
    header: 'TYFYS password reset',
    includeDescription: false,
  });
  const upsert = await zohoUpsertContact({
    contact,
    contactId: safeString(account?.leadId, 120),
    email: profile.email,
  });

  if (!upsert?.contactId) {
    throw new Error('Zoho CRM could not create a contact record for this account email.');
  }

  return {
    moduleApiName: 'Contacts',
    recordId: safeString(upsert.contactId, 120),
  };
}

async function sendViaZoho({ account, subject, html }) {
  const target = await ensureZohoResetTarget(account);
  if (!target?.recordId || !target?.moduleApiName) {
    throw new Error('Zoho CRM could not find a matching record for this account email.');
  }

  const token = await zohoGetAccessToken();
  const from = await getZohoFromAddress(token);
  const response = await fetch(
    `${zohoApiDomain()}/crm/v8/${target.moduleApiName}/${encodeURIComponent(target.recordId)}/actions/send_mail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        data: [
          {
            from: {
              email: from.email,
              user_name: from.name,
            },
            to: [
              {
                email: safeString(account?.email, 160),
                user_name: safeString(account?.displayName, 160) || 'TYFYS member',
              },
            ],
            subject,
            content: html,
            mail_format: 'html',
            org_email: Boolean(from.orgEmail),
          },
        ],
      }),
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Zoho reset email failed: ${response.status} ${JSON.stringify(payload)}`);
  }

  return {
    provider: 'zoho',
    messageId: safeString(payload?.data?.[0]?.details?.message_id, 200),
  };
}

async function sendPasswordResetEmail({ req, account, resetUrl }) {
  const to = safeString(account?.email, 160);
  if (!to) throw new Error('Account email is required for password reset.');

  const content = buildPasswordResetContent(account, resetUrl);

  if (safeString(process.env.RESEND_API_KEY, 400)) {
    return sendViaResend({ to, ...content });
  }

  return sendViaZoho({ account, ...content });
}

module.exports = {
  buildPasswordResetUrl,
  isLocalRequest,
  sendPasswordResetEmail,
};
