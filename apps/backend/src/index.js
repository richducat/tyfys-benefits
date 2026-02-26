import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const PORT = process.env.PORT || 4000;
const MOCK_ZOHO = (process.env.MOCK_ZOHO || 'true') === 'true';

const claimAssistantRoot = path.resolve(__dirname, '../..', 'claim-assistant');
const claimAssistantPublic = path.join(claimAssistantRoot, 'public');
const claimAssistantTemplate = path.join(claimAssistantRoot, 'templates', 'vba-21-526ez-are.pdf');

function safeSetText(form, name, value) {
  if (value == null || value === '') return;
  try {
    const field = form.getTextField(name);
    field.setText(String(value));
  } catch (err) {
    console.warn('Text field not found:', name);
  }
}

function safeCheckBox(form, name, checked) {
  if (!checked) return;
  try {
    const field = form.getCheckBox(name);
    field.check();
  } catch (err) {
    console.warn('Checkbox field not found:', name);
  }
}

function mapDataToPdf(form, data) {
  const id = data.identification || {};
  const addr = id.address || {};

  const fullName = [id.firstName, id.middleInitial, id.lastName]
    .filter(Boolean)
    .join(' ');

  safeSetText(form, '2. Veteran / Service Member Name. Enter First Name.:', id.firstName);
  safeSetText(form, '2. Veteran / Service Member Name. Enter Middle Initial.:', id.middleInitial);
  safeSetText(form, '2. Veteran / Service Member Name. Enter Last Name.:', id.lastName);

  const ssn = (id.ssn || '').replace(/\D/g, '');
  safeSetText(form, "Veteran's Social Security Number. Enter first three numbers.:", ssn.slice(0, 3));
  safeSetText(form, "Veteran's Social Security Number. Enter middle two numbers.:", ssn.slice(3, 5));
  safeSetText(form, "Veteran's Social Security Number. Enter last four numbers.:", ssn.slice(5));

  if (id.dob) {
    const [y, m, d] = id.dob.split('-');
    safeSetText(form, '6. Date of Birth. Enter 2 digit Month.  :', (m || '').padStart(2, '0'));
    safeSetText(form, '6. Date of Birth. Enter 2 digit day.:', (d || '').padStart(2, '0'));
    safeSetText(form, '6. Date of Birth. Enter 4 digit year.:', y || '');
  }

  safeSetText(form, '11. EMAIL ADDRESS (Optional). Line 2.:', id.email);
  safeSetText(form, '9. TELEPHONE NUMBER(S) (Optional) (Include Area Code). Enter Area Code.:', id.phone);

  safeSetText(form, '10. Current Mailing Address. Enter Number and Street.:', addr.street);
  safeSetText(form, '10. Current Mailing Address. Enter Apartment or Unit Number.:', addr.unit);
  safeSetText(form, '10. Current Mailing Address. Enter City.:', addr.city);
  safeSetText(form, '10. Current Mailing Address. Enter State or Province.:', addr.state);
  safeSetText(form, '10. Current Mailing Address. Enter Country.:', addr.country);
  safeSetText(form, '10. Current Mailing Address. Enter ZIP or Postal Code. First 5 digits.:', (addr.zip || '').slice(0, 5));
  safeSetText(
    form,
    '10. Current Mailing Address. Enter ZIP or Postal Code. Enter last 4 digits.:',
    (addr.zip || '').slice(5)
  );

  safeSetText(form, '7. Service Number (If applicable). Enter 9 digits.:', id.dodId || '');

  const claimType = data.claimProcessType;
  safeCheckBox(
    form,
    '1. SELECT THE TYPE OF CLAIM PROGRAM/PROCESS THAT APPLIES TO YOU. Check box. FDC PROGRAM.: 0',
    claimType === 'FDC'
  );
  safeCheckBox(form, '1. Check box. Standard Claim Process.: 0', claimType === 'STANDARD');
  safeCheckBox(
    form,
    '1. Check box. BDD Program Claim. (Select this option only if you meet the criteria for the BDD Program specified on Instruction Page 5).: 0',
    claimType === 'BDD'
  );
  safeCheckBox(
    form,
    '1. Check box. IDES (Select this option only if you have been referred to the IDES Program by your Military Service Department).: 0',
    claimType === 'IDES'
  );

  if (claimType === 'BDD' && id.bddReleaseDate) {
    const [y2, m2, d2] = id.bddReleaseDate.split('-');
    safeSetText(form, '8. B. D. D. CLAIMS ONLY: PROVIDE THE DATE OR ANTICIPATED DATE OF RELEASE FROM ACTIVE DUTY.  Enter 2 digit Month.  :', (m2 || '').padStart(2, '0'));
    safeSetText(form, '8. B. D. D. CLAIMS ONLY: PROVIDE THE DATE OR ANTICIPATED DATE OF RELEASE FROM ACTIVE DUTY.  Enter 2 digit Day.  :', (d2 || '').padStart(2, '0'));
    safeSetText(form, '8. B. D. D. CLAIMS ONLY: PROVIDE THE DATE OR ANTICIPATED DATE OF RELEASE FROM ACTIVE DUTY.  Enter 4 digit year.:', y2 || '');
  }

  const h = data.homeless || {};
  if (h.isHomeless === 'YES') safeCheckBox(form, '14A. ARE YOU CURRENTLY HOMELESS? YES', true);
  if (h.isHomeless === 'NO') safeCheckBox(form, '14A. ARE YOU CURRENTLY HOMELESS? NO', true);

  if (h.homelessSituation === 'SHELTER')
    safeCheckBox(
      form,
      '14. B. CHECK THE BOX THAT APPLIES TO YOUR LIVING SITUATION. Check box. Living in a homeless shelter.: 0',
      true
    );
  if (h.homelessSituation === 'UNSHELTERED')
    safeCheckBox(
      form,
      '14. B. Check box. Not currently in a sheltered environment (e.g., living in a car or tent).: 0',
      true
    );
  if (h.homelessSituation === 'STAYING_WITH_OTHERS')
    safeCheckBox(form, '14. B. Check box. Staying with another person.: 0', true);
  if (h.homelessSituation === 'FLEEING')
    safeCheckBox(form, '14. B. Check box. Fleeing current residence.: 0', true);

  if (h.atRisk === 'YES') safeCheckBox(form, '14C. ARE YOU CURRENTLY AT RISK OF BECOMING HOMELESS? YES', true);
  if (h.atRisk === 'NO') safeCheckBox(form, '14C. ARE YOU CURRENTLY AT RISK OF BECOMING HOMELESS? NO', true);

  if (h.atRiskSituation === 'WILL_LOSE_HOUSING')
    safeCheckBox(
      form,
      '14. D. CHECK THE BOX THAT APPLIES TO YOUR LIVING SITUATION. Check box. Housing will be lost in 30 days.: 0',
      true
    );
  if (h.atRiskSituation === 'LEAVING_SYSTEM')
    safeCheckBox(
      form,
      '14. D. Check box. Leaving publicly funded system of care. (e.g., homeless shelter).: 0',
      true
    );

  safeSetText(form, '14. E. POINT OF CONTACT (Name of person VA can contact in order to get in touch with you): ', h.pocName || '');
  safeSetText(form, '14. F. POINT OF CONTACT TELEPHONE NUMBER (Include Area Code). Enter Area Code.: ', h.pocPhone || '');

  const ex = data.exposures || {};
  if (ex.hasToxicExposure === 'YES') safeCheckBox(form, '15A. ARE YOU CLAIMING ANY CONDITIONS RELATED TO TOXIC EXPOSURES? YES', true);
  if (ex.hasToxicExposure === 'NO') safeCheckBox(form, '15A. ARE YOU CLAIMING ANY CONDITIONS RELATED TO TOXIC EXPOSURES? NO', true);

  const gw = ex.gulfWar || {};
  if (gw.served === 'YES') safeCheckBox(form, '15B.  DID YOU SERVE IN ANY OF THE FOLLOWING GULF WAR HAZARD LOCATIONS? YES', true);
  if (gw.served === 'NO') safeCheckBox(form, '15B.  DID YOU SERVE IN ANY OF THE FOLLOWING GULF WAR HAZARD LOCATIONS? NO', true);
  safeSetText(form, '15B. WHEN DID YOU SERVE IN THESE LOCATIONS? (MM-YYYY)', gw.from || '');

  const herb = ex.herbicide || {};
  if (herb.served === 'YES')
    safeCheckBox(
      form,
      '15. C.  DID YOU SERVE IN ANY OF THE FOLLOWING HERBICIDE (e.g. Agent Orange) LOCATIONS? Yes. Check box.: ',
      true
    );
  if (herb.served === 'NO') safeCheckBox(form, '15. C. No. Check box.: ', true);
  safeSetText(
    form,
    '15. C.DID YOU SERVE IN ANY OF THE FOLLOWING HERBICIDE (e.g., Agent Orange) LOCATIONS? WHEN DID YOU SERVE IN THESE LOCATIONS? (MM-YYYY)',
    herb.from || ''
  );
  safeSetText(form, '15. C. Please list other location(s) where you served, if not listed above: :', ex.otherLocations || '');

  const types = ex.exposureTypes || {};
  if (types.asbestos) safeCheckBox(form, '15. D. HAVE YOU BEEN EXPOSED TO ANY OF THE FOLLOWING? (Check all that apply)Check box. Asbestos.: 0', true);
  if (types.radiation) safeCheckBox(form, '15. D. Check box. Radiation: 0', true);
  if (types.mustardGas) safeCheckBox(form, '15. D. Check box. Mustard Gas: 0', true);
  if (types.shad) safeCheckBox(form, '15. D. Check box. SHAD (Shipboard Hazard and Defense).: 0', true);
  if (types.campLejeune) safeCheckBox(form, '15. D. Check box. CONTAMINATED WATER AT CAMP LEJEUNE.: 0', true);
  if (types.mosToxin) safeCheckBox(form, '15. D. Military Occupational Specialty (MOS)-related toxin.: 0', true);
  if (types.other) safeCheckBox(form, '15. D. Check box. Other (Specify).: 0', true);
  safeSetText(form, '15. D. OTHER (Specify): ', ex.exposureOtherDescription || '');
  safeSetText(form, '15. E. IF YOU WERE EXPOSED MULTIPLE TIMES, PLEASE PROVIDE ALL ADDITIONAL DATES AND LOCATIONS OF POTENTIAL EXPOSURE.: ', ex.additionalDetails || '');

  const conditions = (data.claim && data.claim.conditions) || [];
  conditions.slice(0, 5).forEach((c, idx) => {
    const line = idx + 1;
    safeSetText(form, `CURRENT DISABILITY(IES). Line ${line} of 20.: `, c.name || '');
    safeSetText(
      form,
      `APPROXIMATE DATE DISABILITY BEGAN OR WORSENED. Enter 2 digit month, 2 digit day and 4 digit year. Line ${line} of 20.: `,
      c.approxOnset || ''
    );
    safeSetText(
      form,
      `SPECIFY TYPE OF EXPOSURE, EVENT OR INJURY.  PLEASE SPECIFY
(e.g., Agent Orange, radiation,
burn pits). Line ${line} of 20.
: `,
      c.exposureDetail || ''
    );
    safeSetText(
      form,
      `EXPLAIN HOW THE DISABILITY(IES) RELATES TO THE IN-SERVICE EVENT/EXPOSURE/INJURY. Line ${line} of 20.: `,
      c.relationToService || ''
    );
  });

  const facilities = (data.treatment && data.treatment.facilities) || [];
  facilities.slice(0, 3).forEach((f, idx) => {
    const line = idx + 1;
    safeSetText(
      form,
      `17. A. Enter the Disability Treated and Name and Location of the Treatment Facility. Line ${line} of 3.: `,
      `${f.disability || ''} – ${f.facility || ''}`.trim()
    );
    if (!f.noDate) {
      safeSetText(form, '17. B. DATE OF TREATMENT. Enter 2 digit Month.  :', f.fromDate || '');
    } else {
      safeCheckBox(form, '17. C. CHECK THE BOX IF YOU DO NOT HAVE DATE OF TREATMENT. Line 3 of 3.: 0', true);
    }
  });

  const svc = data.service || {};
  if (svc.branch === 'ARMY') safeCheckBox(form, '19. A. BRANCH OF SERVICE. ARMY', true);
  if (svc.branch === 'NAVY') safeCheckBox(form, '19. A. BRANCH OF SERVICE. NAVY', true);
  if (svc.branch === 'MARINE CORPS') safeCheckBox(form, '19. A. BRANCH OF SERVICE. MARINE CORPS', true);
  if (svc.branch === 'AIR FORCE') safeCheckBox(form, '19. A. BRANCH OF SERVICE. AIR FORCE', true);
  if (svc.branch === 'SPACE FORCE') safeCheckBox(form, '19. A. BRANCH OF SERVICE. SPACE FORCE', true);
  if (svc.branch === 'COAST GUARD') safeCheckBox(form, '19. A. BRANCH OF SERVICE. COAST GUARD', true);
  if (svc.branch === 'NOAA') safeCheckBox(form, '19. A. BRANCH OF SERVICE. NOAA', true);
  if (svc.branch === 'USPHS') safeCheckBox(form, '19. A. BRANCH OF SERVICE. USPHS', true);

  if (svc.component === 'ACTIVE') safeCheckBox(form, '19. B. COMPONENT. Check box. ACTIVE: ', true);
  if (svc.component === 'RESERVES') safeCheckBox(form, '19. B. Check box. RESERVES.: ', true);
  if (svc.component === 'NATIONAL_GUARD') safeCheckBox(form, '19. B. Check box. NATIONAL GUARD.: ', true);

  if (svc.entryDate) {
    const [y, m, d] = svc.entryDate.split('-');
    safeSetText(form, '20. A. Most recent active service date(s). Enter 2 digit month.: ', (m || '').padStart(2, '0'));
    safeSetText(form, '20. A. Most recent active service date. Enter 2 digit day.: ', (d || '').padStart(2, '0'));
    safeSetText(form, '20. A. Most recent active service date. Enter 4 digit Year.: ', y || '');
  }
  if (svc.exitDate) {
    const [y, m, d] = svc.exitDate.split('-');
    safeSetText(form, '20. A. Most recent active service exit date. Enter 2 digit month.: ', (m || '').padStart(2, '0'));
    safeSetText(form, '20. A. Most recent active service exit date. Enter 2 digit day.: ', (d || '').padStart(2, '0'));
    safeSetText(form, '20. A. Most recent active service exit date. Enter 4 digit Year.: ', y || '');
  }

  safeSetText(form, '20. B. Place of last or anticipated separation. Line 2 of 2.: ', svc.lastSeparationPlace || '');

  if (svc.combatSince911 === 'YES') safeCheckBox(form, '20C. DID YOU SERVE IN A COMBAT ZONE SINCE 9-11-2001? YES', true);
  if (svc.combatSince911 === 'NO') safeCheckBox(form, '20C. DID YOU SERVE IN A COMBAT ZONE SINCE 9-11-2001? NO', true);

  if (svc.reserveGuardService === 'YES')
    safeCheckBox(form, '21A. ARE YOU CURRENTLY SERVING OR HAVE YOU EVER SERVED IN THE RESERVES OR NATIONAL GUARD? YES', true);
  if (svc.reserveGuardService === 'NO')
    safeCheckBox(form, '21A. ARE YOU CURRENTLY SERVING OR HAVE YOU EVER SERVED IN THE RESERVES OR NATIONAL GUARD? NO', true);

  const pay = data.servicePay || {};
  if (pay.receivingRetiredPay === 'YES') safeCheckBox(form, '24A. ARE YOU RECEIVING MILITARY RETIRED PAY? YES', true);
  if (pay.receivingRetiredPay === 'NO') safeCheckBox(form, '24A. ARE YOU RECEIVING MILITARY RETIRED PAY? NO', true);
  if (pay.willReceiveRetiredPay === 'YES') safeCheckBox(form, '24B. WILL YOU RECEIVE MILITARY RETIRED PAY IN THE FUTURE? YES', true);
  if (pay.willReceiveRetiredPay === 'NO') safeCheckBox(form, '24B. NO. :', true);

  if (pay.retiredBranch) {
    safeSetText(form, '24. B. EXPLAIN.: ', pay.retiredFutureExplanation || '');
  }
  if (pay.retiredMonthlyAmount) {
    const clean = pay.retiredMonthlyAmount.replace(/[^\d.]/g, '');
    safeSetText(form, '24. D. MONTHLY AMOUNT IN DOLLARS. Last 3 digit spaces.: ', clean);
  }

  if (pay.doNotPayCompForRetiredPay) {
    safeCheckBox(
      form,
      '26. Do NOT pay me V. A. compensation. I do NOT want to receive V. A. compensation in lieu of retired pay.: 0',
      true
    );
  }

  if (pay.receivedSeparationPay === 'YES')
    safeCheckBox(
      form,
      '27. A. HAVE YOU EVER RECEIVED SEPARATION PAY, DISABILITY SEVERANCE PAY, OR ANY OTHER LUMP SUM PAYMENT FROM YOUR BRANCH OF SERVICE? YES. If "Yes," complete Items 27B through 27D.: ',
      true
    );
  if (pay.receivedSeparationPay === 'NO') safeCheckBox(form, '27. A. NO. :', true);

  if (pay.separationDate) {
    const [y, m, d] = pay.separationDate.split('-');
    safeSetText(form, '27. B. Date payment received. Enter 2 digit month.: ', (m || '').padStart(2, '0'));
    safeSetText(form, '27. B. Date payment received. Enter 2 digit day.: ', (d || '').padStart(2, '0'));
    safeSetText(form, '27. B. Date payment received. Enter 4 digit Year.: ', y || '');
  }
  if (pay.separationAmount) {
    const cleanSep = pay.separationAmount.replace(/[^\d.]/g, '');
    safeSetText(form, '27. D. AMOUNT RECEIVED (Provide pre-tax amount). Last 3 digits.: ', cleanSep);
  }

  if (pay.doNotPayCompForTrainingPay) {
    safeCheckBox(
      form,
      '28. Do NOT pay me V. A. compensation. I do NOT want to receive V. A. compensation in lieu of training pay. : 0',
      true
    );
  }

  const dd = data.directDeposit || {};
  if (dd.hasBankAccount === 'NO') {
    safeCheckBox(
      form,
      '29. Check box. I CERTIFY THAT I DO NOT HAVE AN ACCOUNT WITH A FINANCIAL INSTITUTION OR CERTIFIED PAYMENT AGENT (If you check this box skip to Section 9).: 0',
      true
    );
  } else if (dd.hasBankAccount === 'YES') {
    safeSetText(
      form,
      '31. NAME OF FINANCIAL INSTITUTION (Provide the name of the bank where you want your direct deposit).: ',
      dd.bankName || ''
    );
    safeSetText(
      form,
      '32. ROUTING OR TRANSIT NUMBER (The first nine numbers located at the bottom left of your check).: ',
      dd.routingNumber || ''
    );
    safeSetText(
      form,
      '30. Account Number. Check only one box below and provide the account number. Enter account number.: ',
      dd.accountNumber || ''
    );
    if (dd.accountType === 'CHECKING') safeCheckBox(form, '30. CHECKING ACCOUNT. : ', true);
    if (dd.accountType === 'SAVINGS') safeCheckBox(form, '30. SAVINGS ACCOUNT. : ', true);
  }

  const sig = data.signature || {};
  safeSetText(form, '33A. VETERAN/SERVICE MEMBER SIGNATURE (REQUIRED)', sig.typedName || '');
  if (sig.signedDate) {
    const [y, m, d] = sig.signedDate.split('-');
    safeSetText(form, '33B. DATE SIGNED (MM-DD-YYYY) - Month', (m || '').padStart(2, '0'));
    safeSetText(form, '33B. DATE SIGNED (MM-DD-YYYY) - Day', (d || '').padStart(2, '0'));
    safeSetText(form, '33B. DATE SIGNED (MM-DD-YYYY) - Year', y || '');
  }
}

const trackerConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../config/tracker-stages.json'), 'utf-8')
);

const trackers = new Map();

function recomputeTracker(tracker) {
  tracker.stages = trackerConfig.map((stage, index) => {
    const requirementsMet = (stage.requirements || []).every((req) => tracker.events.has(req));
    const previousComplete = index === 0 || tracker.events.has(`${trackerConfig[index - 1].id}:complete`);
    let status = 'locked';
    if (index === 0 || (requirementsMet && previousComplete)) {
      status = tracker.events.has(`${stage.id}:complete`) ? 'complete' : 'current';
    }
    return { ...stage, status, requirementsMet };
  });
  const active = tracker.stages.find((s) => s.status === 'current') || tracker.stages[tracker.stages.length - 1];
  tracker.currentStage = active?.id;
  tracker.percentComplete = Math.round(
    (tracker.stages.filter((s) => s.status === 'complete').length / tracker.stages.length) * 100
  );
  tracker.updatedAt = new Date().toISOString();
  return tracker;
}

function serializeTracker(tracker) {
  return {
    ...tracker,
    events: Array.from(tracker.events),
  };
}

function createTracker() {
  const dealId = nanoid(8);
  const tracker = {
    dealId,
    events: new Set(),
    stages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  trackers.set(dealId, tracker);
  return recomputeTracker(tracker);
}

function markEvent(dealId, event) {
  const tracker = trackers.get(dealId);
  if (!tracker) return null;
  tracker.events.add(event);
  return recomputeTracker(tracker);
}

app.post('/api/signup', (_req, res) => {
  const tracker = createTracker();
  res.json(serializeTracker(tracker));
});

app.get('/api/tracker/:dealId', (req, res) => {
  const tracker = trackers.get(req.params.dealId);
  if (!tracker) return res.status(404).json({ error: 'Tracker not found' });
  res.json(serializeTracker(tracker));
});

app.post('/api/contracts/:templateId/create', (req, res) => {
  const { templateId } = req.params;
  const { dealId } = req.body || {};
  const signingUrl = MOCK_ZOHO
    ? `https://mock.zoho-sign/embedded/${templateId}/${dealId || 'demo'}`
    : 'https://zoho.com/sign';
  if (dealId) {
    markEvent(dealId, 'offer:contract_signed');
  }
  res.json({ signingUrl, mock: MOCK_ZOHO });
});

app.post('/api/webhooks/zoho-sign', (req, res) => {
  const { dealId, event = 'offer:contract_signed' } = req.body || {};
  if (!dealId) return res.status(400).json({ error: 'dealId required' });
  const tracker = markEvent(dealId, event);
  if (!tracker) return res.status(404).json({ error: 'Tracker not found' });
  res.json({ ok: true, tracker: serializeTracker(tracker) });
});

app.post('/api/webhooks/zoho-forms', (req, res) => {
  const { dealId, event = 'mdbq:completed' } = req.body || {};
  if (!dealId) return res.status(400).json({ error: 'dealId required' });
  const tracker = markEvent(dealId, event);
  if (!tracker) return res.status(404).json({ error: 'Tracker not found' });
  res.json({ ok: true, tracker: serializeTracker(tracker) });
});

app.post('/api/appointments/:dealId/schedule', (req, res) => {
  const { dealId } = req.params;
  const { attended = false } = req.body || {};
  const tracker = markEvent(dealId, attended ? 'provider:attended' : 'provider:scheduled');
  if (!tracker) return res.status(404).json({ error: 'Tracker not found' });
  res.json({ ok: true, tracker: serializeTracker(tracker) });
});

app.post('/api/mock/:dealId/complete', (req, res) => {
  const { dealId } = req.params;
  const { stage } = req.body || {};
  if (!stage) return res.status(400).json({ error: 'stage required' });
  const tracker = markEvent(dealId, `${stage}:complete`);
  if (!tracker) return res.status(404).json({ error: 'Tracker not found' });
  res.json({ ok: true, tracker: serializeTracker(tracker) });
});

if (fs.existsSync(claimAssistantPublic)) {
  app.use('/claim-assistant', express.static(claimAssistantPublic));
  app.get('/claim-assistant', (_req, res) => {
    res.sendFile(path.join(claimAssistantPublic, 'index.html'));
  });
}

app.post('/claim-assistant/generate-pdf', async (req, res) => {
  try {
    if (!fs.existsSync(claimAssistantTemplate)) {
      return res.status(500).json({
        error: 'Template not found. Add vba-21-526ez-are.pdf to apps/claim-assistant/templates/.'
      });
    }

    const existingPdfBytes = fs.readFileSync(claimAssistantTemplate);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    mapDataToPdf(form, req.body || {});

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="VA-Form-21-526EZ-Claim.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to generate filled VA Form 21-526EZ.' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`TYFYS backend listening on ${PORT} (mock Zoho: ${MOCK_ZOHO})`);
});
