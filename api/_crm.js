const crypto = require('crypto');
const { safeString } = require('./_util');

const CRM_PIPELINE_STAGES = [
  {
    id: 'welcome',
    label: 'Welcome',
    description: 'New customer or account that still needs a first-touch review.',
  },
  {
    id: 'offer',
    label: 'Offer',
    description: 'Qualified lead reviewing pricing, fit, or account setup details.',
  },
  {
    id: 'contract_signed',
    label: 'Contract Signed',
    description: 'Paid customer with app access or service agreement already in place.',
  },
  {
    id: 'dd214_itf',
    label: 'DD214 / ITF',
    description: 'Working on service records, intent to file, or claim kickoff prerequisites.',
  },
  {
    id: 'records',
    label: 'Records',
    description: 'Collecting, syncing, or organizing medical and military records.',
  },
  {
    id: 'intake',
    label: 'Intake',
    description: 'Questionnaires, intake cleanup, and case prep are underway.',
  },
  {
    id: 'mdbqs',
    label: 'MDBQs',
    description: 'Mini-DBQs and condition-specific evidence prompts are being completed.',
  },
  {
    id: 'provider',
    label: 'Provider',
    description: 'Provider scheduling, evaluations, or follow-up medical documentation.',
  },
  {
    id: 'evidence_packet',
    label: 'Evidence Packet',
    description: 'Assembling final packet, reports, and supporting materials.',
  },
  {
    id: 'ready_to_submit',
    label: 'Ready to Submit',
    description: 'Customer has what they need to submit through the VA or an accredited rep.',
  },
];

const CRM_STAGE_IDS = new Set(CRM_PIPELINE_STAGES.map((stage) => stage.id));
const CRM_PRIORITY_IDS = new Set(['low', 'normal', 'high', 'urgent']);
const CRM_STATUS_IDS = new Set(['active', 'paused', 'closed']);
const DEFAULT_ALLOWED_DOMAINS = ['tyfys.net', 'thankyouforyourservice.co'];
const DEFAULT_CRM_STAFF = [
  {
    id: 'karen',
    displayName: 'Karen',
    email: 'karen@thankyouforyourservice.co',
    password: 'karen',
  },
  {
    id: 'devin',
    displayName: 'Devin',
    email: 'devin@thankyouforyourservice.co',
    password: 'devin',
  },
  {
    id: 'richard',
    displayName: 'Richard',
    email: 'richard@thankyouforyourservice.co',
    password: 'richard',
  },
];

const DEFAULT_SOP_TASKS = [
  { id: 'fit_review', label: 'Confirm fit and claim goals', stageId: 'offer' },
  { id: 'service_agreement', label: 'Service agreement and deposit confirmed', stageId: 'contract_signed' },
  { id: 'dd214_received', label: 'DD-214 verified', stageId: 'dd214_itf' },
  { id: 'itf_confirmed', label: 'Intent to File confirmed', stageId: 'dd214_itf' },
  { id: 'records_collected', label: 'Core military and civilian records collected', stageId: 'records' },
  { id: 'intake_complete', label: 'Intake and questionnaires complete', stageId: 'intake' },
  { id: 'mdbqs_complete', label: 'Mini-DBQs reviewed for all target conditions', stageId: 'mdbqs' },
  { id: 'provider_booked', label: 'Provider appointment booked', stageId: 'provider' },
  { id: 'provider_docs_received', label: 'Provider reports or DBQs received', stageId: 'provider' },
  { id: 'packet_assembled', label: 'Evidence packet assembled', stageId: 'evidence_packet' },
  { id: 'submission_ready', label: 'Customer is ready to submit', stageId: 'ready_to_submit' },
];

function parseEnvList(value, { maxItems = 50, maxLength = 160 } = {}) {
  return Array.from(
    new Set(
      String(value || '')
        .split(',')
        .map((item) => safeString(item, maxLength).toLowerCase())
        .filter(Boolean)
        .slice(0, maxItems)
    )
  );
}

function getCrmAllowedEmails() {
  return new Set([
    ...DEFAULT_CRM_STAFF.map((staffUser) => staffUser.email),
    ...parseEnvList(
      process.env.TYFYS_CRM_ALLOWED_EMAILS ||
        process.env.TYFYS_INTERNAL_USERS ||
        process.env.TYFYS_STAFF_EMAILS
    ),
  ]);
}

function getCrmAllowedDomains() {
  const envDomains = parseEnvList(process.env.TYFYS_CRM_ALLOWED_DOMAINS || process.env.TYFYS_INTERNAL_DOMAINS, {
    maxItems: 20,
    maxLength: 80,
  }).map((domain) => domain.replace(/^@+/, ''));
  return Array.from(new Set([...DEFAULT_ALLOWED_DOMAINS, ...envDomains]));
}

function canAccessCrm(user) {
  const email = safeString(user?.email, 160).toLowerCase();
  if (!email) return false;

  const allowedEmails = getCrmAllowedEmails();
  if (allowedEmails.has(email)) return true;

  const allowedDomains = getCrmAllowedDomains();
  return allowedDomains.some((domain) => email.endsWith(`@${domain}`));
}

function getCrmStaffUsers() {
  return DEFAULT_CRM_STAFF.map((staffUser) => ({ ...staffUser }));
}

function getCrmStaffUserById(value) {
  const normalized = safeString(value, 80).toLowerCase();
  return getCrmStaffUsers().find((staffUser) => staffUser.id === normalized) || null;
}

function getCrmStaffUserByEmail(value) {
  const normalized = safeString(value, 160).toLowerCase();
  return getCrmStaffUsers().find((staffUser) => staffUser.email === normalized) || null;
}

function buildDisplayName(user) {
  const profile = user?.state?.userProfile || {};
  const firstName = safeString(profile.firstName, 80);
  const lastName = safeString(profile.lastName, 80);
  const combined = `${firstName} ${lastName}`.trim();
  return (
    safeString(user?.displayName, 160) ||
    combined ||
    safeString(profile.fullName, 160) ||
    safeString(profile.email, 160) ||
    safeString(user?.email, 160) ||
    'Unnamed customer'
  );
}

function normalizeStageId(value, fallback = 'welcome') {
  const normalized = safeString(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return CRM_STAGE_IDS.has(normalized) ? normalized : fallback;
}

function normalizePriority(value, fallback = 'normal') {
  const normalized = safeString(value, 40).toLowerCase();
  return CRM_PRIORITY_IDS.has(normalized) ? normalized : fallback;
}

function normalizeStatus(value, fallback = 'active') {
  const normalized = safeString(value, 40).toLowerCase();
  return CRM_STATUS_IDS.has(normalized) ? normalized : fallback;
}

function normalizeDate(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

function normalizeStringList(value, { maxItems = 12, maxLength = 120 } = {}) {
  const source = Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .map((item) => item.trim());

  return Array.from(
    new Set(
      source
        .map((item) => safeString(item, maxLength))
        .filter(Boolean)
        .slice(0, maxItems)
    )
  );
}

function deriveStageFromUser(user) {
  const state = user?.state || {};
  const paymentState = state?.paymentState || {};
  const dossier = Array.isArray(state?.dossier) ? state.dossier : [];
  const syncedCount = dossier.filter((item) => item?.crmSync?.status === 'synced').length;

  if (paymentState?.completed && syncedCount >= 3) return 'records';
  if (paymentState?.completed && dossier.length > 0) return 'records';
  if (paymentState?.completed) return 'contract_signed';
  if (state?.onboardingComplete || state?.hasStarted || safeString(user?.lastLoginAt, 80)) return 'offer';
  return 'welcome';
}

function normalizeTask(task, fallbackTask = {}) {
  const done = Boolean(task?.done);
  return {
    id: safeString(task?.id || fallbackTask.id, 80),
    label: safeString(task?.label || fallbackTask.label, 200),
    stageId: normalizeStageId(task?.stageId || fallbackTask.stageId || 'welcome'),
    done,
    completedAt: done ? normalizeDate(task?.completedAt) || new Date().toISOString() : '',
  };
}

function mergeSopTasks(value) {
  const incomingTasks = Array.isArray(value) ? value : [];
  const incomingById = new Map();

  for (const task of incomingTasks) {
    const taskId = safeString(task?.id, 80);
    if (taskId) incomingById.set(taskId, task);
  }

  return DEFAULT_SOP_TASKS.map((defaultTask) => normalizeTask(incomingById.get(defaultTask.id), defaultTask));
}

function normalizeNote(note) {
  const text = safeString(note?.text, 4000);
  if (!text) return null;

  return {
    id: safeString(note?.id, 120) || `note_${crypto.randomUUID()}`,
    text,
    author: safeString(note?.author, 160) || 'TYFYS CRM',
    createdAt: normalizeDate(note?.createdAt) || new Date().toISOString(),
  };
}

function normalizeCrmRecord(raw, user) {
  const source = raw && typeof raw === 'object' ? raw : {};

  return {
    stage: normalizeStageId(source.stage, deriveStageFromUser(user)),
    owner: safeString(source.owner, 120),
    priority: normalizePriority(source.priority, 'normal'),
    status: normalizeStatus(source.status, 'active'),
    nextStep: safeString(source.nextStep, 240),
    dueAt: normalizeDate(source.dueAt),
    lastContactAt: normalizeDate(source.lastContactAt),
    tags: normalizeStringList(source.tags, { maxItems: 8, maxLength: 40 }),
    blockers: normalizeStringList(source.blockers, { maxItems: 8, maxLength: 140 }),
    tasks: mergeSopTasks(source.tasks),
    notes: Array.isArray(source.notes)
      ? source.notes.map((note) => normalizeNote(note)).filter(Boolean).slice(-40)
      : [],
    updatedAt: normalizeDate(source.updatedAt),
    updatedBy: safeString(source.updatedBy, 160),
  };
}

function isLikelyCustomer(user) {
  if (!user || typeof user !== 'object') return false;
  if (safeString(user.leadId, 120)) return true;
  const state = user.state && typeof user.state === 'object' ? user.state : null;
  if (state && Object.keys(state).length > 0) return true;
  return !canAccessCrm(user);
}

function buildCrmCustomer(user) {
  const state = user?.state || {};
  const profile = state?.userProfile || {};
  const dossier = Array.isArray(state?.dossier) ? state.dossier : [];
  const addedClaims = Array.isArray(state?.addedClaims) ? state.addedClaims : [];
  const crm = normalizeCrmRecord(user?.crm, user);
  const stageMeta = CRM_PIPELINE_STAGES.find((stage) => stage.id === crm.stage) || CRM_PIPELINE_STAGES[0];
  const syncedRecordCount = dossier.filter((item) => item?.crmSync?.status === 'synced').length;
  const failedRecordCount = dossier.filter((item) => item?.crmSync?.status === 'failed').length;

  return {
    userId: safeString(user?.userId, 120),
    displayName: buildDisplayName(user),
    email: safeString(user?.email || profile?.email, 160),
    phone: safeString(profile?.phone, 80),
    leadId: safeString(user?.leadId || state?.zohoLeadId, 120),
    createdAt: normalizeDate(user?.createdAt),
    updatedAt: normalizeDate(user?.updatedAt),
    lastLoginAt: normalizeDate(user?.lastLoginAt),
    authProviders: Array.isArray(user?.authProviders) ? user.authProviders.slice(0, 4) : [],
    stage: stageMeta.id,
    stageLabel: stageMeta.label,
    stageDescription: stageMeta.description,
    owner: crm.owner,
    priority: crm.priority,
    status: crm.status,
    nextStep: crm.nextStep,
    dueAt: crm.dueAt,
    lastContactAt: crm.lastContactAt,
    tags: crm.tags,
    blockers: crm.blockers,
    notes: crm.notes,
    tasks: crm.tasks,
    currentRating: Number.isFinite(Number(state?.currentRating)) ? Number(state.currentRating) : null,
    claimType: safeString(state?.claimType, 80),
    addedClaims: addedClaims
      .map((claim) => safeString(claim?.label || claim?.name || claim?.condition, 120))
      .filter(Boolean)
      .slice(0, 20),
    dossierCount: dossier.length,
    syncedRecordCount,
    failedRecordCount,
    paymentCompleted: Boolean(state?.paymentState?.completed),
    paymentPlanName: safeString(state?.paymentState?.planName, 160),
    crm,
  };
}

function buildCrmMetrics(customers) {
  const metrics = {
    totalCustomers: customers.length,
    activeCustomers: 0,
    paidCustomers: 0,
    recordsInFlight: 0,
    readyToSubmit: 0,
    urgent: 0,
  };

  for (const customer of customers) {
    if (customer.status === 'active') metrics.activeCustomers += 1;
    if (customer.paymentCompleted) metrics.paidCustomers += 1;
    if (customer.dossierCount > 0) metrics.recordsInFlight += 1;
    if (customer.stage === 'ready_to_submit') metrics.readyToSubmit += 1;
    if (customer.priority === 'urgent') metrics.urgent += 1;
  }

  return metrics;
}

function applyCrmUpdate(currentCrm, patch, actorLabel) {
  const source = patch && typeof patch === 'object' ? patch : {};
  const nextNotes = Array.isArray(currentCrm?.notes) ? currentCrm.notes.slice() : [];
  const appendedNote = normalizeNote({
    text: source.addNote,
    author: actorLabel,
    createdAt: new Date().toISOString(),
  });

  if (appendedNote) {
    nextNotes.push(appendedNote);
  }

  return normalizeCrmRecord(
    {
      ...currentCrm,
      stage: Object.prototype.hasOwnProperty.call(source, 'stage') ? source.stage : currentCrm.stage,
      owner: Object.prototype.hasOwnProperty.call(source, 'owner') ? source.owner : currentCrm.owner,
      priority: Object.prototype.hasOwnProperty.call(source, 'priority') ? source.priority : currentCrm.priority,
      status: Object.prototype.hasOwnProperty.call(source, 'status') ? source.status : currentCrm.status,
      nextStep: Object.prototype.hasOwnProperty.call(source, 'nextStep') ? source.nextStep : currentCrm.nextStep,
      dueAt: Object.prototype.hasOwnProperty.call(source, 'dueAt') ? source.dueAt : currentCrm.dueAt,
      lastContactAt:
        Object.prototype.hasOwnProperty.call(source, 'lastContactAt') || appendedNote
          ? source.lastContactAt || appendedNote?.createdAt || currentCrm.lastContactAt
          : currentCrm.lastContactAt,
      tags: Object.prototype.hasOwnProperty.call(source, 'tags') ? source.tags : currentCrm.tags,
      blockers: Object.prototype.hasOwnProperty.call(source, 'blockers') ? source.blockers : currentCrm.blockers,
      tasks: Object.prototype.hasOwnProperty.call(source, 'tasks') ? source.tasks : currentCrm.tasks,
      notes: nextNotes,
      updatedAt: new Date().toISOString(),
      updatedBy: actorLabel,
    },
    null
  );
}

module.exports = {
  CRM_PIPELINE_STAGES,
  DEFAULT_SOP_TASKS,
  applyCrmUpdate,
  buildCrmCustomer,
  buildCrmMetrics,
  canAccessCrm,
  getCrmStaffUserByEmail,
  getCrmStaffUserById,
  getCrmStaffUsers,
  isLikelyCustomer,
  normalizeCrmRecord,
};
