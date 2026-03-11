const { useEffect, useMemo, useState } = React;
const {
  Activity,
  AlertCircle,
  BellRing,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Eye,
  FileCheck,
  FileSignature,
  FileText,
  History,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  Pill,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Stethoscope,
  UserCheck,
  Users,
  Wallet,
  X
} = LucideReact;

const AUTH_KEY = "tyfys_clinic_auth_v2";
const WORKSPACE_KEY = "tyfys_clinic_workspace_v3";
const LOGIN_USERNAME = "admin";
const LOGIN_PASSWORD = "password";

const RAIL_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Shield },
  { id: "subjects", label: "Subjects", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "assistant", label: "Protocol AI", icon: Bot },
  { id: "audit", label: "Audit", icon: History }
];

const SUBJECT_TABS = [
  { id: "general", label: "General" },
  { id: "visits", label: "Visits" },
  { id: "study_logs", label: "Study Logs" },
  { id: "adverse_events", label: "Adverse Events" },
  { id: "conditions", label: "Medical Conditions" },
  { id: "medications", label: "Concomitant Medications" },
  { id: "deviations", label: "Protocol Deviations" },
  { id: "allergies", label: "Allergies" },
  { id: "surgical_history", label: "Surgical Conditions" },
  { id: "contacts", label: "Emergency Contacts" },
  { id: "notes", label: "Progress Notes" },
  { id: "edocs", label: "eDocs / Labs / Misc" },
  { id: "edocs_audit", label: "eDocs Audit Trail" }
];

const DEFAULT_MESSAGES = [
  {
    id: "msg-1",
    sender: "Daniel Burch",
    role: "CRC",
    text: "Subject 1074 is cleared for the Baseline D1 window. Please confirm stipend release after QC.",
    time: "09:14 AM",
    mine: false
  },
  {
    id: "msg-2",
    sender: "Richard Ducat",
    role: "Operations",
    text: "Copied. I also want the signed consent packet linked before monitor review.",
    time: "09:18 AM",
    mine: true
  }
];

const DEFAULT_ASSISTANT_MESSAGES = [
  {
    id: "ai-1",
    sender: "assistant",
    text: "Protocol assistant online. Ask about visits, stipends, signatures, or eligibility."
  }
];

const DEFAULT_AUDIT_LOG = [
  {
    id: "audit-1",
    timestamp: "2026-02-02 08:15:00",
    actor: "Daniel Burch",
    subjectNumber: "1074-A3A-201A",
    action: "Screening packet certified and attached to eDocs.",
    trace: "AUD-78C1"
  },
  {
    id: "audit-2",
    timestamp: "2026-02-02 09:02:00",
    actor: "System",
    subjectNumber: "1074-A3A-201A",
    action: "Baseline D1 visit window opened for stipend release queue.",
    trace: "SYS-5A11"
  }
];

const DEFAULT_SUBJECTS = [
  {
    id: "subject-1074",
    subjectNumber: "1074-A3A-201A",
    studyId: "230LE301",
    protocolVersion: "V4.0 / eSource 27 Oct 2025",
    firstName: "Elizabeth",
    middleInitial: "D",
    lastName: "Merrill",
    initials: "EDM",
    gender: "F",
    dob: "1970-02-24",
    email: "annmerrill70@yahoo.com",
    phone: "(772) 555-0120",
    site: "OpenDoor Clinical Research LLC",
    studyArm: "Part B (Phase 3)",
    randomizationNumber: "1074-A3A-201A",
    status: "randomized",
    statusTimeline: {
      screening: { complete: true, date: "2026-02-02", time: "08:00" },
      screen_failed: { complete: false, date: "", time: "" },
      randomized: { complete: true, date: "2026-02-02", time: "18:00" },
      enrolled: { complete: false, date: "", time: "" },
      dropped: { complete: false, date: "", time: "" }
    },
    visitType: "On site",
    sourceVerified: true,
    remoteMonitoring: false,
    stipendReleasedTotal: 150,
    pendingPayouts: 2,
    nextVisitLabel: "Baseline D1 -> Part B",
    nextVisitDate: "2026-02-16",
    lastUpdated: "2026-02-16 10:42",
    conditions: [
      {
        id: "condition-1",
        name: "Cutaneous lupus flare pattern",
        type: "Primary",
        severity: "High",
        impact: "Daily photosensitivity with work and driving disruption."
      },
      {
        id: "condition-2",
        name: "Chronic fatigue",
        type: "Secondary",
        severity: "Moderate",
        impact: "Needs afternoon rest and misses evening family activities."
      }
    ],
    medications: [
      { id: "med-1", name: "Hydroxychloroquine", dose: "200 mg BID", indication: "Lupus", status: "Active" },
      { id: "med-2", name: "Prednisone", dose: "10 mg PRN", indication: "Flares", status: "PRN" }
    ],
    adverseEvents: [
      { id: "ae-1", event: "Mild headache", severity: "Grade 1", relation: "Possible", status: "Open" }
    ],
    deviations: [
      {
        id: "dev-1",
        title: "Screening lab redraw completed outside preferred morning window",
        severity: "Minor",
        resolution: "Resolved",
        owner: "CRC"
      }
    ],
    allergies: [
      { id: "allergy-1", allergen: "Penicillin", reaction: "Hives", severity: "Moderate" },
      { id: "allergy-2", allergen: "Latex", reaction: "Skin irritation", severity: "Mild" }
    ],
    surgicalHistory: [
      { id: "surgery-1", procedure: "Skin biopsy", date: "2025-11-12", outcome: "Confirmed lupus lesion", status: "Documented" },
      { id: "surgery-2", procedure: "Right knee arthroscopy", date: "2021-05-02", outcome: "Recovered with intermittent pain", status: "Historical" }
    ],
    contacts: [
      { id: "contact-1", name: "James Merrill", relation: "Spouse", phone: "(772) 555-0144", email: "jmerrill@example.com" },
      { id: "contact-2", name: "Angela Brooks", relation: "Emergency contact", phone: "(772) 555-0188", email: "abrooks@example.com" }
    ],
    progressNotes: [
      {
        id: "note-1",
        author: "Daniel Burch",
        createdAt: "2026-02-16 09:20",
        text: "Participant arrived on time, confirmed kit accountability, and tolerated specimen draw without escalation."
      },
      {
        id: "note-2",
        author: "Richard Ducat",
        createdAt: "2026-02-16 10:05",
        text: "Reminder to attach stipend confirmation to the packet before monitor review."
      }
    ],
    studyLogs: [
      { id: "log-1", name: "Source Documentation Review", section: "Visits", owner: "CRC", status: "Approved", updatedAt: "2026-02-16 09:31" },
      { id: "log-2", name: "Delegation Worksheet", section: "Study Startup", owner: "PI", status: "In Review", updatedAt: "2026-02-15 16:10" },
      { id: "log-3", name: "Eligibility Checklist", section: "Screening", owner: "Coordinator", status: "Approved", updatedAt: "2026-02-14 12:08" },
      { id: "log-4", name: "Concomitant Medication Review", section: "Medical", owner: "CRC", status: "Needs Follow-up", updatedAt: "2026-02-16 08:52" }
    ],
    edocs: [
      {
        id: "edoc-1",
        name: "Signed ICF v4.0",
        category: "Consent",
        status: "Certified",
        certifiedCopy: true,
        signatureStatus: "Signed",
        expirationDate: "2027-02-02",
        uploadedBy: "Daniel Burch",
        uploadedAt: "2026-02-02 08:14"
      },
      {
        id: "edoc-2",
        name: "Insurance Card Scan",
        category: "Identity",
        status: "Uploaded",
        certifiedCopy: false,
        signatureStatus: "Not Required",
        expirationDate: "",
        uploadedBy: "Site Front Desk",
        uploadedAt: "2026-02-02 07:58"
      },
      {
        id: "edoc-3",
        name: "Lab Requisition Packet",
        category: "Labs",
        status: "Pending signature",
        certifiedCopy: false,
        signatureStatus: "Awaiting PI",
        expirationDate: "",
        uploadedBy: "Richard Ducat",
        uploadedAt: "2026-02-16 09:45"
      },
      {
        id: "edoc-5",
        name: "Week 2 Source Worksheet",
        category: "Source",
        status: "Uploaded",
        certifiedCopy: false,
        signatureStatus: "Needs Signature",
        expirationDate: "",
        uploadedBy: "Daniel Burch",
        uploadedAt: "2026-02-16 10:20"
      }
    ],
    visits: [
      {
        id: "visit-1",
        name: "Screening -1",
        protocol: "V4.0 / eSource 27 Oct 2025",
        arm: "Part B (Phase 3)",
        visitDate: "2026-02-02",
        visitTime: "08:00 AM",
        status: "Completed",
        visitType: "On site",
        sourceVerified: true,
        remoteMonitoring: false,
        edcEntered: true,
        qcReview: true,
        sponsorReviewDate: "2026-02-08",
        stipendStatus: "Paid",
        stipendAmount: 50,
        generalPayments: 0,
        notes: "Screening packet complete. Labs and demographics verified."
      },
      {
        id: "visit-2",
        name: "Baseline D1 -> Part B",
        protocol: "V4.0 / eSource 27 Oct 2025",
        arm: "Part B (Phase 3)",
        visitDate: "2026-02-16",
        visitTime: "05:00 AM",
        status: "Scheduled",
        visitType: "On site",
        sourceVerified: false,
        remoteMonitoring: true,
        edcEntered: false,
        qcReview: false,
        sponsorReviewDate: "",
        stipendStatus: "Ready",
        stipendAmount: 75,
        generalPayments: 0,
        notes: "Window open. Needs source verification before final QC."
      },
      {
        id: "visit-3",
        name: "Week 2 D15 +/- 2",
        protocol: "V4.0 / eSource 27 Oct 2025",
        arm: "Part B (Phase 3)",
        visitDate: "2026-03-01",
        visitTime: "08:30 AM",
        status: "Planned",
        visitType: "Televisit",
        sourceVerified: false,
        remoteMonitoring: false,
        edcEntered: false,
        qcReview: false,
        sponsorReviewDate: "",
        stipendStatus: "Pending",
        stipendAmount: 25,
        generalPayments: 0,
        notes: "Televisit plan drafted. Waiting on participant confirmation."
      }
    ]
  },
  {
    id: "subject-1088",
    subjectNumber: "1088-B1C-204F",
    studyId: "230LE301",
    protocolVersion: "V4.0 / eSource 27 Oct 2025",
    firstName: "Marcus",
    middleInitial: "J",
    lastName: "Thomas",
    initials: "MJT",
    gender: "M",
    dob: "1982-09-12",
    email: "marcusthomas@example.com",
    phone: "(561) 555-0112",
    site: "OpenDoor Clinical Research LLC",
    studyArm: "Part A (Screening)",
    randomizationNumber: "Pending",
    status: "screening",
    statusTimeline: {
      screening: { complete: true, date: "2026-02-12", time: "09:00" },
      screen_failed: { complete: false, date: "", time: "" },
      randomized: { complete: false, date: "", time: "" },
      enrolled: { complete: false, date: "", time: "" },
      dropped: { complete: false, date: "", time: "" }
    },
    visitType: "On site",
    sourceVerified: false,
    remoteMonitoring: false,
    stipendReleasedTotal: 0,
    pendingPayouts: 1,
    nextVisitLabel: "Eligibility review",
    nextVisitDate: "2026-02-18",
    lastUpdated: "2026-02-15 17:12",
    conditions: [
      {
        id: "condition-3",
        name: "Persistent rash flare",
        type: "Primary",
        severity: "Moderate",
        impact: "Symptoms worsen during long work shifts."
      }
    ],
    medications: [
      { id: "med-3", name: "Topical tacrolimus", dose: "PRN", indication: "Rash", status: "Active" }
    ],
    adverseEvents: [],
    deviations: [],
    allergies: [
      { id: "allergy-3", allergen: "Sulfa drugs", reaction: "Rash", severity: "Moderate" }
    ],
    surgicalHistory: [],
    contacts: [
      { id: "contact-3", name: "Keisha Thomas", relation: "Spouse", phone: "(561) 555-0181", email: "keisha@example.com" }
    ],
    progressNotes: [
      {
        id: "note-3",
        author: "Daniel Burch",
        createdAt: "2026-02-15 16:48",
        text: "Pending one eligibility lab result before randomization decision."
      }
    ],
    studyLogs: [
      { id: "log-5", name: "Eligibility Review", section: "Screening", owner: "PI", status: "In Review", updatedAt: "2026-02-15 16:47" },
      { id: "log-6", name: "Medication Reconciliation", section: "Medical", owner: "CRC", status: "Approved", updatedAt: "2026-02-15 15:22" }
    ],
    edocs: [
      {
        id: "edoc-4",
        name: "Photo ID",
        category: "Identity",
        status: "Uploaded",
        certifiedCopy: true,
        signatureStatus: "Not Required",
        expirationDate: "",
        uploadedBy: "Site Front Desk",
        uploadedAt: "2026-02-12 08:50"
      }
    ],
    visits: [
      {
        id: "visit-4",
        name: "Eligibility review",
        protocol: "V4.0 / eSource 27 Oct 2025",
        arm: "Part A (Screening)",
        visitDate: "2026-02-18",
        visitTime: "10:00 AM",
        status: "Scheduled",
        visitType: "On site",
        sourceVerified: false,
        remoteMonitoring: false,
        edcEntered: false,
        qcReview: false,
        sponsorReviewDate: "",
        stipendStatus: "Pending",
        stipendAmount: 50,
        generalPayments: 0,
        notes: "Awaiting central lab result and PI sign-off."
      }
    ]
  }
];

const createDefaultWorkspace = () => ({
  activeRail: "dashboard",
  activeSubjectTab: "general",
  selectedSubjectId: DEFAULT_SUBJECTS[0].id,
  selectedVisitId: DEFAULT_SUBJECTS[0].visits[1].id,
  subjectSearch: "",
  studyLogFilter: "all",
  monitorMode: false,
  subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
  messages: JSON.parse(JSON.stringify(DEFAULT_MESSAGES)),
  assistantMessages: JSON.parse(JSON.stringify(DEFAULT_ASSISTANT_MESSAGES)),
  auditLog: JSON.parse(JSON.stringify(DEFAULT_AUDIT_LOG))
});

function loadWorkspace() {
  try {
    const raw = window.localStorage.getItem(WORKSPACE_KEY);
    if (!raw) return createDefaultWorkspace();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return createDefaultWorkspace();
    return {
      ...createDefaultWorkspace(),
      ...parsed
    };
  } catch (error) {
    return createDefaultWorkspace();
  }
}

function saveWorkspace(workspace) {
  try {
    window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
  } catch (error) {
    // Storage can be unavailable in private browsing.
  }
}

function formatStatusLabel(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function nowStamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function traceId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeRedactionTerms(value) {
  const rawTerms = Array.isArray(value) ? value : String(value || "").split(/\n+/);
  const deduped = new Map();

  rawTerms
    .map((term) => String(term || "").trim())
    .filter(Boolean)
    .forEach((term) => {
      const key = term.toLowerCase();
      if (!deduped.has(key)) deduped.set(key, term.slice(0, 160));
    });

  return Array.from(deduped.values());
}

function buildRedactionPattern(terms) {
  const normalized = normalizeRedactionTerms(terms);
  if (!normalized.length) return null;

  return new RegExp(
    normalized
      .sort((left, right) => right.length - left.length)
      .map((term) => escapeRegExp(term))
      .join("|"),
    "gi"
  );
}

function redactPlainText(text, terms, replacement = "[REDACTED]") {
  const pattern = buildRedactionPattern(terms);
  if (!pattern) return String(text || "");
  return String(text || "").replace(pattern, replacement);
}

function countRedactionMatches(blocks, terms) {
  const pattern = buildRedactionPattern(terms);
  if (!pattern) return 0;

  return blocks.reduce((count, block) => {
    const matches = String(block || "").match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
}

function renderRedactedText(text, terms) {
  const pattern = buildRedactionPattern(terms);
  const value = String(text || "");
  if (!pattern) return value;

  const fragments = [];
  let cursor = 0;
  let match;
  pattern.lastIndex = 0;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) {
      fragments.push(value.slice(cursor, match.index));
    }

    const mask = "█".repeat(Math.max(4, Math.min(match[0].length, 24)));
    fragments.push(
      <span
        key={`${match.index}-${match[0].length}`}
        className="inline-flex rounded bg-slate-950 px-1.5 py-0.5 text-[11px] font-black tracking-[0.18em] text-slate-950 align-middle select-none"
        aria-label="Redacted text"
      >
        {mask}
      </span>
    );

    cursor = match.index + match[0].length;
    if (pattern.lastIndex === match.index) pattern.lastIndex += 1;
  }

  if (cursor < value.length) {
    fragments.push(value.slice(cursor));
  }

  return fragments;
}

function subjectDisplayName(subject) {
  return [subject?.firstName, subject?.middleInitial, subject?.lastName].filter(Boolean).join(" ");
}

function buildDocumentPreviewSections(subject, doc) {
  if (!subject || !doc) return [];

  const fullName = subjectDisplayName(subject);
  const latestVisit = subject.visits?.[0] || null;
  const nextVisit = subject.visits?.find((visit) => visit.status !== "Completed") || latestVisit;
  const primaryContact = subject.contacts?.[0] || null;
  const recentNote = subject.progressNotes?.[0]?.text || "No recent progress note is attached to this packet.";
  const conditionSummary =
    subject.conditions?.map((condition) => `${condition.name} (${condition.severity})`).join("; ") || "No active conditions listed.";
  const medicationSummary =
    subject.medications?.map((medication) => `${medication.name} ${medication.dose}`).join("; ") || "No concomitant medications listed.";
  const allergySummary =
    subject.allergies?.map((allergy) => `${allergy.allergen} (${allergy.reaction})`).join("; ") || "No allergy record on file.";
  const contactSummary = primaryContact
    ? `${primaryContact.name} (${primaryContact.relation}) can be reached at ${primaryContact.phone} and ${primaryContact.email}.`
    : "No emergency contact is attached to this subject record.";

  let categoryNarrative =
    `${doc.name} was uploaded by ${doc.uploadedBy} for ${fullName} under subject number ${subject.subjectNumber}.`;

  if (doc.category === "Consent") {
    categoryNarrative =
      `${fullName} reviewed the informed consent packet with ${doc.uploadedBy} and acknowledged the study protocol, risks, and signature requirements for ${subject.studyId}.`;
  } else if (doc.category === "Identity") {
    categoryNarrative =
      `Identity verification was completed against the legal name ${fullName}, date of birth ${subject.dob}, and the site contact record for ${subject.lastName}.`;
  } else if (doc.category === "Labs") {
    categoryNarrative =
      `The lab packet for ${fullName} includes collection timing, specimen handling instructions, and PI routing requirements for the ${nextVisit?.name || "current"} visit window.`;
  } else if (doc.category === "Source") {
    categoryNarrative =
      `${doc.name} captures source details for ${fullName}, including study arm ${subject.studyArm}, visit timing, and monitoring notes that must stay packet-ready.`;
  }

  return [
    {
      title: "Packet header",
      paragraphs: [
        `${doc.name} for ${fullName} (${subject.subjectNumber}) was uploaded by ${doc.uploadedBy} on ${doc.uploadedAt}.`,
        `${fullName} is enrolled at ${subject.site} under protocol ${subject.protocolVersion}. Current packet status is ${doc.status} with ${doc.signatureStatus} signature state.`
      ]
    },
    {
      title: "Participant identifiers",
      paragraphs: [
        `Participant name: ${fullName}. DOB: ${subject.dob}. Email: ${subject.email}. Phone: ${subject.phone}.`,
        `Randomization and arm details: ${subject.randomizationNumber}, ${subject.studyArm}. ${contactSummary}`
      ]
    },
    {
      title: "Clinical and source summary",
      paragraphs: [
        categoryNarrative,
        `Documented conditions for ${subject.lastName} include ${conditionSummary}. Current medications include ${medicationSummary}. Allergy record: ${allergySummary}.`
      ]
    },
    {
      title: "Operational notes",
      paragraphs: [
        `Most recent progress note for ${subject.firstName}: ${recentNote}`,
        nextVisit
          ? `Next visit ${nextVisit.name} is scheduled for ${nextVisit.visitDate} at ${nextVisit.visitTime}. Stipend status is ${nextVisit.stipendStatus} and source verification is ${nextVisit.sourceVerified ? "complete" : "pending"}.`
          : "No upcoming visit is currently attached to this subject packet.",
        latestVisit
          ? `Latest completed or scheduled packet activity references ${latestVisit.name}. Visit notes: ${latestVisit.notes}`
          : "No visit details are attached to this document yet."
      ]
    }
  ];
}

function statusTone(status) {
  const value = String(status || "").toLowerCase();
  if (["approved", "certified", "signed", "paid", "completed", "ready", "active"].includes(value)) {
    return "emerald";
  }
  if (["in review", "pending signature", "scheduled", "planned", "pending"].includes(value)) {
    return "amber";
  }
  if (["needs follow-up", "open", "screen_failed", "dropped"].includes(value)) {
    return "rose";
  }
  return "slate";
}

function pillClasses(status) {
  const tone = statusTone(status);
  if (tone === "emerald") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (tone === "amber") return "bg-amber-50 text-amber-700 border-amber-200";
  if (tone === "rose") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function canReleaseStipend(visit) {
  if (!visit) return false;
  return visit.stipendStatus !== "Paid" && Number(visit.stipendAmount || 0) > 0;
}

function canRequestSignature(doc) {
  if (!doc) return false;
  return !["Not Required", "Awaiting PI", "Signed"].includes(doc.signatureStatus);
}

function canCertifyDocument(doc) {
  if (!doc) return false;
  return doc.status !== "Certified" && !["Awaiting PI", "Needs Signature"].includes(doc.signatureStatus);
}

function summaryMetrics(subjects) {
  const visitQueue = subjects.flatMap((subject) =>
    subject.visits
      .filter((visit) => visit.status !== "Completed")
      .map((visit) => ({ ...visit, subjectNumber: subject.subjectNumber, subjectName: `${subject.firstName} ${subject.lastName}` }))
  );
  const payoutQueue = subjects.flatMap((subject) =>
    subject.visits
      .filter((visit) => visit.stipendStatus === "Ready" || visit.stipendStatus === "Pending")
      .map((visit) => ({ ...visit, subjectNumber: subject.subjectNumber, subjectName: `${subject.firstName} ${subject.lastName}` }))
  );
  const unresolvedLogs = subjects.flatMap((subject) =>
    subject.studyLogs
      .filter((log) => log.status !== "Approved")
      .map((log) => ({ ...log, subjectNumber: subject.subjectNumber }))
  );
  const pendingSignatures = subjects.flatMap((subject) =>
    subject.edocs
      .filter((doc) => doc.status === "Pending signature")
      .map((doc) => ({ ...doc, subjectNumber: subject.subjectNumber }))
  );

  return {
    visitQueue,
    payoutQueue,
    unresolvedLogs,
    pendingSignatures,
    totalPayouts: subjects.reduce((sum, subject) => sum + Number(subject.stipendReleasedTotal || 0), 0)
  };
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => window.sessionStorage.getItem(AUTH_KEY) === "1");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [workspace, setWorkspace] = useState(() => loadWorkspace());
  const [selectedVisitId, setSelectedVisitId] = useState(() => loadWorkspace().selectedVisitId);
  const [messageDraft, setMessageDraft] = useState("");
  const [assistantDraft, setAssistantDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [redactionDraft, setRedactionDraft] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [documentPreviewId, setDocumentPreviewId] = useState(null);

  useEffect(() => {
    saveWorkspace({ ...workspace, selectedVisitId });
  }, [workspace, selectedVisitId]);

  useEffect(() => {
    const hostname = String(window.location.hostname || "").toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return undefined;
    }

    let cancelled = false;

    const hydrateSession = async () => {
      try {
        const response = await fetch("/api/auth-session", { credentials: "include" });
        const payload = await response.json().catch(() => null);
        if (!cancelled && payload?.authenticated) {
          setConnectedAccount(payload.account || null);
        }
      } catch (error) {
        // Local static previews do not expose the API.
      }
    };

    hydrateSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSubject = useMemo(
    () => workspace.subjects.find((subject) => subject.id === workspace.selectedSubjectId) || workspace.subjects[0],
    [workspace.selectedSubjectId, workspace.subjects]
  );

  const filteredSubjects = useMemo(() => {
    const query = workspace.subjectSearch.trim().toLowerCase();
    if (!query) return workspace.subjects;
    return workspace.subjects.filter((subject) => {
      const haystack = [
        subject.subjectNumber,
        subject.firstName,
        subject.lastName,
        subject.studyArm,
        subject.status
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [workspace.subjectSearch, workspace.subjects]);

  const selectedVisit = useMemo(() => {
    if (!selectedSubject?.visits?.length) return null;
    return selectedSubject.visits.find((visit) => visit.id === selectedVisitId) || selectedSubject.visits[0];
  }, [selectedSubject, selectedVisitId]);

  const metrics = useMemo(() => summaryMetrics(workspace.subjects), [workspace.subjects]);
  const previewDocument = useMemo(
    () => selectedSubject?.edocs?.find((doc) => doc.id === documentPreviewId) || null,
    [documentPreviewId, selectedSubject]
  );
  const previewSections = useMemo(
    () => (previewDocument && selectedSubject ? buildDocumentPreviewSections(selectedSubject, previewDocument) : []),
    [previewDocument, selectedSubject]
  );
  const previewRedactionTerms = useMemo(
    () => normalizeRedactionTerms(previewDocument?.redactionTerms || []),
    [previewDocument?.redactionTerms]
  );
  const previewRedactionMatches = useMemo(
    () => countRedactionMatches(previewSections.flatMap((section) => [section.title, ...section.paragraphs]), previewRedactionTerms),
    [previewSections, previewRedactionTerms]
  );
  const selectedSubjectDocAudit = useMemo(
    () =>
      workspace.auditLog.filter(
        (entry) =>
          entry.subjectNumber === selectedSubject?.subjectNumber &&
          /(doc|signature|certif|packet|edoc|upload|redact)/i.test(entry.action)
      ),
    [selectedSubject?.subjectNumber, workspace.auditLog]
  );

  useEffect(() => {
    if (!selectedSubject?.visits?.length) return;
    const visitExists = selectedSubject.visits.some((visit) => visit.id === selectedVisitId);
    if (!visitExists) {
      setSelectedVisitId(selectedSubject.visits[0].id);
    }
  }, [selectedSubject, selectedVisitId]);

  useEffect(() => {
    if (documentPreviewId && !previewDocument) {
      setDocumentPreviewId(null);
    }
  }, [documentPreviewId, previewDocument]);

  useEffect(() => {
    if (!previewDocument) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setRedactionDraft("");
        setDocumentPreviewId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewDocument]);

  useEffect(() => {
    setRedactionDraft("");
  }, [previewDocument?.id]);

  const actorName = connectedAccount?.displayName || "Richard Ducat";

  const pushNotification = (message, tone = "slate") => {
    const id = `toast-${Date.now()}`;
    setNotifications((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((note) => note.id !== id));
    }, 2600);
  };

  const appendAuditEntry = (prev, action, subjectNumber = selectedSubject?.subjectNumber || "Study") => ({
    ...prev,
    auditLog: [
      {
        id: `audit-${Date.now()}`,
        timestamp: nowStamp(),
        actor: actorName,
        subjectNumber,
        action,
        trace: traceId("AUD")
      },
      ...prev.auditLog
    ]
  });

  const updateWorkspace = (updater) => {
    setWorkspace((prev) => (typeof updater === "function" ? updater(prev) : updater));
  };

  const updateSelectedSubject = (subjectUpdater) => {
    updateWorkspace((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) =>
        subject.id === prev.selectedSubjectId ? subjectUpdater(subject) : subject
      )
    }));
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (loginUsername === LOGIN_USERNAME && loginPassword === LOGIN_PASSWORD) {
      window.sessionStorage.setItem(AUTH_KEY, "1");
      setIsAuthenticated(true);
      setLoginError("");
      setLoginPassword("");
      pushNotification("Clinic workspace unlocked.", "emerald");
    } else {
      setLoginError("Invalid credentials.");
    }
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setLoginUsername("");
    setLoginPassword("");
    pushNotification("Session closed.", "slate");
  };

  const selectSubject = (subjectId) => {
    updateWorkspace((prev) => ({ ...prev, selectedSubjectId: subjectId, activeRail: "subjects" }));
    const nextSubject = workspace.subjects.find((subject) => subject.id === subjectId);
    if (nextSubject?.visits?.[0]) {
      setSelectedVisitId(nextSubject.visits[0].id);
    }
  };

  const setSubjectField = (field, value) => {
    updateSelectedSubject((subject) => ({
      ...subject,
      [field]: value,
      lastUpdated: nowStamp()
    }));
  };

  const setStatusState = (statusKey) => {
    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            status: statusKey,
            statusTimeline: {
              ...subject.statusTimeline,
              [statusKey]: {
                complete: true,
                date: subject.statusTimeline[statusKey]?.date || nowStamp().slice(0, 10),
                time: subject.statusTimeline[statusKey]?.time || nowStamp().slice(11, 16)
              }
            },
            lastUpdated: nowStamp()
          };
        })
      };
      return appendAuditEntry(next, `Status moved to ${formatStatusLabel(statusKey)}.`);
    });
    pushNotification(`Subject moved to ${formatStatusLabel(statusKey)}.`, "emerald");
  };

  const setVisitField = (visitId, field, value) => {
    updateSelectedSubject((subject) => ({
      ...subject,
      visits: subject.visits.map((visit) => (visit.id === visitId ? { ...visit, [field]: value } : visit)),
      lastUpdated: nowStamp()
    }));
  };

  const markVisitComplete = (visitId) => {
    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            visits: subject.visits.map((visit) =>
              visit.id === visitId
                ? {
                    ...visit,
                    status: "Completed",
                    edcEntered: true,
                    qcReview: true,
                    sourceVerified: true
                  }
                : visit
            ),
            lastUpdated: nowStamp()
          };
        })
      };
      const visitName = selectedSubject.visits.find((visit) => visit.id === visitId)?.name || "Visit";
      return appendAuditEntry(next, `${visitName} marked complete and ready for packet certification.`);
    });
    pushNotification("Visit marked complete.", "emerald");
  };

  const releaseStipend = (visitId) => {
    const currentVisit = selectedSubject?.visits?.find((visit) => visit.id === visitId);
    if (!canReleaseStipend(currentVisit)) {
      pushNotification("Stipend already released.", "amber");
      return;
    }

    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          const targetVisit = subject.visits.find((visit) => visit.id === visitId);
          return {
            ...subject,
            stipendReleasedTotal: Number(subject.stipendReleasedTotal || 0) + Number(targetVisit?.stipendAmount || 0),
            pendingPayouts: Math.max(0, Number(subject.pendingPayouts || 0) - 1),
            visits: subject.visits.map((visit) =>
              visit.id === visitId ? { ...visit, stipendStatus: "Paid" } : visit
            ),
            lastUpdated: nowStamp()
          };
        })
      };
      const visitName = selectedSubject.visits.find((visit) => visit.id === visitId)?.name || "Visit";
      const amount = selectedSubject.visits.find((visit) => visit.id === visitId)?.stipendAmount || 0;
      return appendAuditEntry(next, `Released $${amount} stipend for ${visitName}.`);
    });
    pushNotification("Stipend released.", "emerald");
  };

  const addGeneralPayment = (visitId) => {
    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            visits: subject.visits.map((visit) =>
              visit.id === visitId ? { ...visit, generalPayments: Number(visit.generalPayments || 0) + 1 } : visit
            ),
            lastUpdated: nowStamp()
          };
        })
      };
      const visitName = selectedSubject.visits.find((visit) => visit.id === visitId)?.name || "Visit";
      return appendAuditEntry(next, `Queued general payment request for ${visitName}.`);
    });
    pushNotification("General payment queued.", "amber");
  };

  const updateStudyLogStatus = (logId, status) => {
    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            studyLogs: subject.studyLogs.map((log) =>
              log.id === logId ? { ...log, status, updatedAt: nowStamp().slice(0, 16) } : log
            ),
            lastUpdated: nowStamp()
          };
        })
      };
      const name = selectedSubject.studyLogs.find((log) => log.id === logId)?.name || "Study log";
      return appendAuditEntry(next, `${name} updated to ${status}.`);
    });
    pushNotification("Study log updated.", status === "Approved" ? "emerald" : "amber");
  };

  const certifyDocument = (docId) => {
    const targetDoc = selectedSubject?.edocs?.find((doc) => doc.id === docId);
    if (!canCertifyDocument(targetDoc)) {
      pushNotification("Document is not ready for certification.", "amber");
      return;
    }

    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            edocs: subject.edocs.map((doc) =>
              doc.id === docId
                ? {
                    ...doc,
                    status: "Certified",
                    certifiedCopy: true,
                    signatureStatus: "Signed"
                  }
                : doc
            ),
            lastUpdated: nowStamp()
          };
        })
      };
      const name = selectedSubject.edocs.find((doc) => doc.id === docId)?.name || "Document";
      return appendAuditEntry(next, `${name} certified for site packet use.`);
    });
    pushNotification("Document certified.", "emerald");
  };

  const requestSignature = (docId) => {
    const targetDoc = selectedSubject?.edocs?.find((doc) => doc.id === docId);
    if (!canRequestSignature(targetDoc)) {
      pushNotification("This document does not need a signature.", "amber");
      return;
    }

    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            edocs: subject.edocs.map((doc) =>
              doc.id === docId ? { ...doc, status: "Pending signature", signatureStatus: "Awaiting PI" } : doc
            ),
            lastUpdated: nowStamp()
          };
        })
      };
      const name = selectedSubject.edocs.find((doc) => doc.id === docId)?.name || "Document";
      return appendAuditEntry(next, `${name} routed for PI signature.`);
    });
    pushNotification("Signature requested.", "amber");
  };

  const signVisitProcedure = (visitId) => {
    const visit = selectedSubject?.visits?.find((item) => item.id === visitId);
    if (!visit) return;

    if (visit.sourceVerified) {
      pushNotification("Procedure already signed.", "amber");
      return;
    }

    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            visits: subject.visits.map((item) =>
              item.id === visitId ? { ...item, sourceVerified: true, qcReview: true } : item
            ),
            lastUpdated: nowStamp()
          };
        })
      };
      return appendAuditEntry(next, `${visit.name} procedure signed and source verified.`);
    });

    pushNotification("Procedure signed.", "emerald");
  };

  const downloadVisitProcedure = (visitId) => {
    const visit = selectedSubject?.visits?.find((item) => item.id === visitId);
    if (!visit) return;

    const content = [
      `Study: ${selectedSubject.studyId}`,
      `Subject: ${selectedSubject.subjectNumber} - ${selectedSubject.firstName} ${selectedSubject.lastName}`,
      `Visit: ${visit.name}`,
      `Protocol: ${visit.protocol}`,
      `Date: ${visit.visitDate} ${visit.visitTime}`,
      `Visit type: ${visit.visitType}`,
      `Source verified: ${visit.sourceVerified ? "Yes" : "No"}`,
      `Remote monitoring: ${visit.remoteMonitoring ? "Enabled" : "Disabled"}`,
      "",
      "Notes:",
      visit.notes || "None"
    ].join("\n");

    downloadTextFile(
      `${selectedSubject.subjectNumber}-${visit.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-procedure.txt`,
      content
    );
    pushNotification("Procedure summary downloaded.", "slate");
  };

  const openDocumentPreview = (docId) => {
    const doc = selectedSubject?.edocs?.find((item) => item.id === docId);
    if (!doc) return;
    setRedactionDraft("");
    setDocumentPreviewId(doc.id);
    pushNotification("Document preview opened.", "slate");
  };

  const appendTermsToDraft = (terms) => {
    const nextTerms = normalizeRedactionTerms([...normalizeRedactionTerms(redactionDraft), ...normalizeRedactionTerms(terms)]);
    setRedactionDraft(nextTerms.join("\n"));
  };

  const applyDocumentRedactions = (event) => {
    event.preventDefault();
    if (!previewDocument) return;

    const incomingTerms = normalizeRedactionTerms(redactionDraft);
    if (!incomingTerms.length) {
      pushNotification("Enter at least one redaction term.", "amber");
      return;
    }

    const existingTerms = normalizeRedactionTerms(previewDocument.redactionTerms || []);
    const mergedTerms = normalizeRedactionTerms([...existingTerms, ...incomingTerms]);

    if (mergedTerms.length === existingTerms.length) {
      pushNotification("Those redaction terms are already saved.", "amber");
      return;
    }

    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            edocs: subject.edocs.map((doc) =>
              doc.id === previewDocument.id
                ? {
                    ...doc,
                    redactionTerms: mergedTerms,
                    lastRedactedAt: nowStamp(),
                    lastRedactedBy: actorName
                  }
                : doc
            ),
            lastUpdated: nowStamp()
          };
        })
      };
      return appendAuditEntry(next, `${previewDocument.name} updated with ${mergedTerms.length} bulk redaction term(s).`);
    });

    setRedactionDraft("");
    pushNotification("Bulk redactions applied.", "emerald");
  };

  const removeDocumentRedaction = (term) => {
    if (!previewDocument) return;

    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            edocs: subject.edocs.map((doc) =>
              doc.id === previewDocument.id
                ? {
                    ...doc,
                    redactionTerms: normalizeRedactionTerms((doc.redactionTerms || []).filter((item) => item.toLowerCase() !== term.toLowerCase())),
                    lastRedactedAt: nowStamp(),
                    lastRedactedBy: actorName
                  }
                : doc
            ),
            lastUpdated: nowStamp()
          };
        })
      };
      return appendAuditEntry(next, `${previewDocument.name} removed redaction term "${term}".`);
    });

    pushNotification("Redaction term removed.", "slate");
  };

  const clearDocumentRedactions = () => {
    if (!previewDocument || !previewRedactionTerms.length) return;

    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            edocs: subject.edocs.map((doc) =>
              doc.id === previewDocument.id
                ? {
                    ...doc,
                    redactionTerms: [],
                    lastRedactedAt: nowStamp(),
                    lastRedactedBy: actorName
                  }
                : doc
            ),
            lastUpdated: nowStamp()
          };
        })
      };
      return appendAuditEntry(next, `Cleared bulk redaction terms from ${previewDocument.name}.`);
    });

    setRedactionDraft("");
    pushNotification("Document redactions cleared.", "amber");
  };

  const downloadRedactedDocument = (docId) => {
    const doc = selectedSubject?.edocs?.find((item) => item.id === docId);
    if (!doc) return;

    const terms = normalizeRedactionTerms(doc.redactionTerms || []);
    if (!terms.length) {
      pushNotification("Add at least one redaction term first.", "amber");
      return;
    }

    const content = buildDocumentPreviewSections(selectedSubject, doc)
      .map((section) => [
        section.title.toUpperCase(),
        ...section.paragraphs.map((paragraph) => redactPlainText(paragraph, terms))
      ].join("\n"))
      .join("\n\n");

    downloadTextFile(
      `${selectedSubject.subjectNumber}-${doc.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-redacted.txt`,
      content
    );

    updateWorkspace((prev) => appendAuditEntry(prev, `Downloaded redacted copy of ${doc.name}.`));
    pushNotification("Redacted copy downloaded.", "slate");
  };

  const showVisitAlerts = (visitId) => {
    const visit = selectedSubject?.visits?.find((item) => item.id === visitId);
    if (!visit) return;

    const alerts = [];
    if (!visit.sourceVerified) alerts.push("Source verification is still incomplete.");
    if (!visit.qcReview) alerts.push("QC review has not been completed.");
    if (selectedSubject.edocs.some((doc) => doc.status === "Pending signature")) alerts.push("A packet document is still waiting on PI signature.");
    if (!alerts.length) alerts.push("No validation blockers found for the selected visit.");

    pushNotification(alerts[0], alerts.length === 1 && alerts[0].startsWith("No") ? "emerald" : "amber");
  };

  const addProgressNote = (event) => {
    event.preventDefault();
    const text = noteDraft.trim();
    if (!text) return;
    updateWorkspace((prev) => {
      const next = {
        ...prev,
        subjects: prev.subjects.map((subject) => {
          if (subject.id !== prev.selectedSubjectId) return subject;
          return {
            ...subject,
            progressNotes: [
              {
                id: `note-${Date.now()}`,
                author: actorName,
                createdAt: nowStamp().slice(0, 16),
                text
              },
              ...subject.progressNotes
            ],
            lastUpdated: nowStamp()
          };
        })
      };
      return appendAuditEntry(next, "Added progress note to subject timeline.");
    });
    setNoteDraft("");
    pushNotification("Progress note added.", "emerald");
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const text = messageDraft.trim();
    if (!text) return;
    updateWorkspace((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: `msg-${Date.now()}`,
          sender: actorName,
          role: connectedAccount?.email ? "TYFYS" : "Operations",
          text,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          mine: true
        }
      ]
    }));
    setMessageDraft("");
    pushNotification("Secure message sent.", "slate");
  };

  const askAssistant = (event) => {
    event.preventDefault();
    const prompt = assistantDraft.trim();
    if (!prompt) return;

    updateWorkspace((prev) => ({
      ...prev,
      assistantMessages: [
        ...prev.assistantMessages,
        { id: `ai-user-${Date.now()}`, sender: "user", text: prompt }
      ]
    }));

    const lower = prompt.toLowerCase();
    let response =
      "Recommended next step: verify the selected visit, confirm eDocs signature status, and clear stipend blockers before sponsor review.";
    if (lower.includes("stipend")) {
      response =
        "Baseline D1 is the only ready stipend in queue for the selected subject. Once you release it, attach the payment confirmation to eDocs for monitor review.";
    } else if (lower.includes("eligibility") || lower.includes("screen")) {
      response =
        "Eligibility is still tied to the screening log and unresolved medication review. Close those before moving the subject to randomized.";
    } else if (lower.includes("signature") || lower.includes("consent")) {
      response =
        "There is one pending signature packet in eDocs. Route it to PI review, then certify the copy so the site packet stays monitor-ready.";
    } else if (lower.includes("visit")) {
      response =
        "The next operational step is the Baseline D1 visit. Mark source verification, complete QC, then finalize stipend release.";
    }

    window.setTimeout(() => {
      updateWorkspace((prev) => ({
        ...prev,
        assistantMessages: [
          ...prev.assistantMessages,
          { id: `ai-bot-${Date.now()}`, sender: "assistant", text: response }
        ]
      }));
    }, 500);

    setAssistantDraft("");
  };

  const DashboardMetric = ({ label, value, tone }) => {
    const tones = {
      slate: "bg-slate-900 text-white",
      emerald: "bg-emerald-600 text-white",
      amber: "bg-amber-500 text-slate-950",
      white: "bg-white text-slate-900 border border-slate-200"
    };
    return (
      <div className={`rounded-[1.75rem] p-6 shadow-sm ${tones[tone] || tones.white}`}>
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">{label}</p>
        <p className="text-3xl font-black tracking-tight mt-3">{value}</p>
      </div>
    );
  };

  const StatusPill = ({ value }) => (
    <span className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.18em] ${pillClasses(value)}`}>
      <span className="w-2 h-2 rounded-full bg-current opacity-70" />
      {formatStatusLabel(value)}
    </span>
  );

  const Panel = ({ title, subtitle, action, children }) => (
    <section className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-900">{title}</h3>
          {subtitle ? <p className="text-sm text-slate-500 mt-1">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardMetric label="Active subjects" value={workspace.subjects.length} tone="slate" />
        <DashboardMetric label="Visits in queue" value={metrics.visitQueue.length} tone="white" />
        <DashboardMetric label="Pending payouts" value={metrics.payoutQueue.length} tone="amber" />
        <DashboardMetric label="Total released" value={`$${metrics.totalPayouts}`} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-6">
        <Panel
          title="Visit queue"
          subtitle="Matches the second-half visit grid workflow: site team, QC, payout, and sponsor readiness."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Visit</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Stipend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.visitQueue.map((visit) => (
                  <tr key={`${visit.subjectNumber}-${visit.id}`} className="text-sm">
                    <td className="py-4 font-bold text-slate-900">{visit.subjectNumber}</td>
                    <td className="py-4">
                      <p className="font-semibold text-slate-800">{visit.name}</p>
                      <p className="text-slate-500">{visit.subjectName}</p>
                    </td>
                    <td className="py-4 text-slate-600">
                      {visit.visitDate} <span className="text-slate-400">at {visit.visitTime}</span>
                    </td>
                    <td className="py-4">
                      <StatusPill value={visit.status} />
                    </td>
                    <td className="py-4">
                      <StatusPill value={visit.stipendStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Packet blockers" subtitle="Logs, signatures, and payout items still blocking sponsor-ready packets.">
            <div className="space-y-4">
              {metrics.unresolvedLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{log.name}</p>
                      <p className="text-sm text-slate-500">{log.subjectNumber} · {log.section}</p>
                    </div>
                    <StatusPill value={log.status} />
                  </div>
                </div>
              ))}
              {!metrics.unresolvedLogs.length && (
                <p className="text-sm text-slate-500">No unresolved logs. The site packet is clean.</p>
              )}
            </div>
          </Panel>

          <Panel title="Signature queue" subtitle="Documents waiting for PI or certified-copy completion.">
            <div className="space-y-3">
              {metrics.pendingSignatures.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-bold text-slate-900">{doc.name}</p>
                    <p className="text-sm text-slate-500">{doc.subjectNumber}</p>
                  </div>
                  <StatusPill value={doc.status} />
                </div>
              ))}
              {!metrics.pendingSignatures.length && <p className="text-sm text-slate-500">No documents are waiting on signature.</p>}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <Panel title="Subject profile" subtitle="Editable general tab modeled on the second-half screening and status screen.">
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Subject Number</span>
              <input value={selectedSubject.subjectNumber} onChange={(event) => setSubjectField("subjectNumber", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Randomization Number</span>
              <input value={selectedSubject.randomizationNumber} onChange={(event) => setSubjectField("randomizationNumber", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">First Name</span>
              <input value={selectedSubject.firstName} onChange={(event) => setSubjectField("firstName", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Last Name</span>
              <input value={selectedSubject.lastName} onChange={(event) => setSubjectField("lastName", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Initials</span>
              <input value={selectedSubject.initials} onChange={(event) => setSubjectField("initials", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Gender</span>
              <input value={selectedSubject.gender} onChange={(event) => setSubjectField("gender", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">DOB</span>
              <input type="date" value={selectedSubject.dob} onChange={(event) => setSubjectField("dob", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Email</span>
              <input value={selectedSubject.email} onChange={(event) => setSubjectField("email", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" />
            </label>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Status</p>
                <h4 className="text-xl font-black text-slate-900 mt-1">Enrollment Progress</h4>
              </div>
              <StatusPill value={selectedSubject.status} />
            </div>
            <div className="space-y-3">
              {Object.entries(selectedSubject.statusTimeline).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusState(key)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selectedSubject.status === key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black uppercase tracking-[0.16em] text-[11px] opacity-70">{formatStatusLabel(key)}</p>
                      <p className="text-sm mt-1">{value.date ? `${value.date} ${value.time}` : "Not yet recorded"}</p>
                    </div>
                    {value.complete ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );

  const renderVisitsTab = () => (
    <div className="space-y-6">
      <Panel title="Visit workbench" subtitle="Scheduling, QC, remote monitoring, and stipend flow copied into a subject-first clinic view.">
        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.85fr] gap-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[760px]">
              <thead className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="pb-3">Visit</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">EDC</th>
                  <th className="pb-3">QC</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Subject Stipend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedSubject.visits.map((visit) => (
                  <tr
                    key={visit.id}
                    className={`text-sm cursor-pointer transition ${selectedVisit?.id === visit.id ? "bg-slate-50" : "hover:bg-slate-50/70"}`}
                    onClick={() => setSelectedVisitId(visit.id)}
                  >
                    <td className="py-4">
                      <p className="font-bold text-slate-900">{visit.name}</p>
                      <p className="text-slate-500">{visit.arm}</p>
                    </td>
                    <td className="py-4 text-slate-600">{visit.visitDate} · {visit.visitTime}</td>
                    <td className="py-4">{visit.edcEntered ? <StatusPill value="Completed" /> : <StatusPill value="Pending" />}</td>
                    <td className="py-4">{visit.qcReview ? <StatusPill value="Approved" /> : <StatusPill value="Pending" />}</td>
                    <td className="py-4"><StatusPill value={visit.status} /></td>
                    <td className="py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            releaseStipend(visit.id);
                          }}
                          disabled={!canReleaseStipend(visit)}
                          className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                            canReleaseStipend(visit)
                              ? "bg-cyan-500 text-white hover:bg-cyan-600"
                              : "bg-slate-200 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {visit.stipendStatus === "Paid" ? "Paid" : "Pay stipend"}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            addGeneralPayment(visit.id);
                          }}
                          className="rounded-xl bg-amber-400 text-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] hover:bg-amber-300 transition"
                        >
                          Add general payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedVisit ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Current visit</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">{selectedVisit.name}</h4>
                </div>
                <StatusPill value={selectedVisit.status} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => signVisitProcedure(selectedVisit.id)} className="rounded-xl bg-yellow-300 text-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] hover:bg-yellow-200 transition">
                  Sign procedure
                </button>
                <button type="button" onClick={() => downloadVisitProcedure(selectedVisit.id)} className="rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] hover:border-slate-400 transition">
                  Download procedure
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateWorkspace((prev) => ({ ...prev, activeRail: "subjects", activeSubjectTab: "notes" }));
                    setNoteDraft(`Follow-up for ${selectedVisit.name}: `);
                  }}
                  className="rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] hover:border-slate-400 transition"
                >
                  Add note
                </button>
                <button
                  type="button"
                  onClick={() => updateWorkspace((prev) => ({ ...prev, activeRail: "audit" }))}
                  className="rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] hover:border-slate-400 transition"
                >
                  Audit trail
                </button>
              </div>

              <button
                type="button"
                onClick={() => showVisitAlerts(selectedVisit.id)}
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] hover:border-slate-400 transition"
              >
                Validation alerts
              </button>

              <label className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 border border-slate-200">
                <span className="font-semibold text-slate-700">Source verified</span>
                <input type="checkbox" checked={selectedVisit.sourceVerified} onChange={(event) => setVisitField(selectedVisit.id, "sourceVerified", event.target.checked)} />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 border border-slate-200">
                <span className="font-semibold text-slate-700">Remote monitoring enabled</span>
                <input type="checkbox" checked={selectedVisit.remoteMonitoring} onChange={(event) => setVisitField(selectedVisit.id, "remoteMonitoring", event.target.checked)} />
              </label>

              <label className="space-y-2 block">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Visit type</span>
                <select value={selectedVisit.visitType} onChange={(event) => setVisitField(selectedVisit.id, "visitType", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-white font-semibold outline-none focus:border-slate-400">
                  <option>On site</option>
                  <option>Televisit</option>
                  <option>Phone follow-up</option>
                </select>
              </label>

              <label className="space-y-2 block">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Visit notes</span>
                <textarea value={selectedVisit.notes} onChange={(event) => setVisitField(selectedVisit.id, "notes", event.target.value)} className="w-full min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3 bg-white font-medium outline-none focus:border-slate-400" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => markVisitComplete(selectedVisit.id)} className="rounded-2xl bg-slate-900 text-white px-4 py-3 font-black hover:bg-slate-800 transition">
                  Mark complete
                </button>
                <button
                  type="button"
                  onClick={() => releaseStipend(selectedVisit.id)}
                  disabled={!canReleaseStipend(selectedVisit)}
                  className={`rounded-2xl px-4 py-3 font-black transition ${
                    canReleaseStipend(selectedVisit)
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {selectedVisit.stipendStatus === "Paid" ? "Stipend paid" : "Release stipend"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>
    </div>
  );

  const renderStudyLogsTab = () => (
    <div className="space-y-6">
      <Panel title="Study logs" subtitle="Operational log list like the walkthrough: quick status control by section and owner.">
        <div className="space-y-4">
          {selectedSubject.studyLogs.map((log) => (
            <div key={log.id} className="rounded-[1.75rem] border border-slate-200 p-5 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <p className="font-black text-slate-900">{log.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{log.section} · {log.owner} · Updated {log.updatedAt}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill value={log.status} />
                  <select
                    value={log.status}
                    onChange={(event) => updateStudyLogStatus(log.id, event.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-sm font-semibold outline-none focus:border-slate-400"
                  >
                    <option>Approved</option>
                    <option>In Review</option>
                    <option>Needs Follow-up</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );

  const renderConditionsTab = () => (
    <Panel title="Medical conditions" subtitle="Condition impact statements stay visible for provider packet prep.">
      <div className="space-y-4">
        {selectedSubject.conditions.map((condition) => (
          <div key={condition.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black text-slate-900">{condition.name}</p>
                <p className="text-sm text-slate-500 mt-1">{condition.type} · {condition.severity}</p>
              </div>
              <StatusPill value={condition.severity} />
            </div>
            <p className="text-sm text-slate-700 mt-4 leading-relaxed">{condition.impact}</p>
          </div>
        ))}
      </div>
    </Panel>
  );

  const renderAdverseEventsTab = () => (
    <Panel title="Adverse events" subtitle="Dedicated AE coverage to match the source clinic workflow instead of hiding events inside another tab.">
      <div className="space-y-4">
        {selectedSubject.adverseEvents.length ? selectedSubject.adverseEvents.map((eventItem) => (
          <div key={eventItem.id} className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-slate-900">{eventItem.event}</p>
                <p className="text-sm text-slate-600 mt-1">{eventItem.severity} · Relation: {eventItem.relation}</p>
              </div>
              <StatusPill value={eventItem.status} />
            </div>
          </div>
        )) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No adverse events are open for this subject.
          </div>
        )}
      </div>
    </Panel>
  );

  const renderMedicationsTab = () => (
    <Panel title="Concomitant medications" subtitle="Medication reconciliation is kept separate from AE review, matching the recorded CTMS layout.">
      <div className="space-y-4">
        {selectedSubject.medications.map((medication) => (
          <div key={medication.id} className="rounded-[1.75rem] border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-slate-900">{medication.name}</p>
                <p className="text-sm text-slate-500 mt-1">{medication.dose} · {medication.indication}</p>
              </div>
              <StatusPill value={medication.status} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );

  const renderDeviationsTab = () => (
    <Panel title="Protocol deviations" subtitle="Deviation tracking keeps ownership and resolution attached to the subject packet.">
      <div className="space-y-4">
        {selectedSubject.deviations.length ? selectedSubject.deviations.map((deviation) => (
          <div key={deviation.id} className="rounded-[1.75rem] border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-slate-900">{deviation.title}</p>
                <p className="text-sm text-slate-500 mt-1">Owner: {deviation.owner}</p>
              </div>
              <StatusPill value={deviation.resolution} />
            </div>
            <p className="text-sm text-slate-600 mt-4">Severity: {deviation.severity}</p>
          </div>
        )) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No deviations recorded.
          </div>
        )}
      </div>
    </Panel>
  );

  const renderAllergiesTab = () => (
    <Panel title="Allergies" subtitle="Pulled forward from the source app so patient safety flags stay one click away.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {selectedSubject.allergies.map((allergy) => (
          <div key={allergy.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-slate-900">{allergy.allergen}</p>
              <StatusPill value={allergy.severity} />
            </div>
            <p className="text-sm text-slate-600 mt-3">{allergy.reaction}</p>
          </div>
        ))}
      </div>
    </Panel>
  );

  const renderSurgicalHistoryTab = () => (
    <Panel title="Surgical conditions" subtitle="Surgical history stays visible as a standalone module, just like the source navigation.">
      <div className="space-y-4">
        {selectedSubject.surgicalHistory.length ? selectedSubject.surgicalHistory.map((item) => (
          <div key={item.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-slate-900">{item.procedure}</p>
                <p className="text-sm text-slate-500 mt-1">{item.date}</p>
              </div>
              <StatusPill value={item.status} />
            </div>
            <p className="text-sm text-slate-600 mt-4">{item.outcome}</p>
          </div>
        )) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No surgical history recorded.
          </div>
        )}
      </div>
    </Panel>
  );

  const renderContactsTab = () => (
    <Panel title="Emergency contacts" subtitle="Caretaker and contact details stay in the same subject workbench rather than in a separate portal.">
      <div className="space-y-4">
        {selectedSubject.contacts.map((contact) => (
          <div key={contact.id} className="rounded-[1.75rem] border border-slate-200 p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-black text-slate-900">{contact.name}</p>
                <p className="text-sm text-slate-500 mt-1">{contact.relation}</p>
              </div>
              <div className="text-sm text-slate-600 flex flex-col md:items-end">
                <span>{contact.phone}</span>
                <span>{contact.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );

  const renderNotesTab = () => (
    <div className="space-y-6">
      <Panel title="Progress notes" subtitle="Operational notes now append directly into the subject timeline.">
        <form onSubmit={addProgressNote} className="space-y-4 mb-6">
          <textarea
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder="Add a site note, coordinator update, or packet reminder."
            className="w-full min-h-[120px] rounded-[1.75rem] border border-slate-200 px-4 py-4 outline-none focus:border-slate-400"
          />
          <button type="submit" className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-black hover:bg-slate-800 transition">
            Add progress note
          </button>
        </form>
        <div className="space-y-4">
          {selectedSubject.progressNotes.map((note) => (
            <div key={note.id} className="rounded-[1.75rem] border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-slate-900">{note.author}</p>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{note.createdAt}</p>
              </div>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">{note.text}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );

  const renderEDocsTab = () => (
    <Panel
      title="eDocs / labs / misc"
      subtitle="Certified-copy, signature, and redaction controls are wired into the clinic packet. Use Open / Redact to launch the bulk blackout workspace."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="pb-3">Document</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Signature</th>
              <th className="pb-3">Expiration</th>
              <th className="pb-3">Uploaded By</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {selectedSubject.edocs.map((doc) => (
              <tr key={doc.id} className="text-sm">
                <td className="py-4">
                  <p className="font-bold text-slate-900">{doc.name}</p>
                  <p className="text-slate-500">{doc.status}</p>
                  {doc.redactionTerms?.length ? (
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 mt-1">
                      {doc.redactionTerms.length} redaction term(s) saved
                    </p>
                  ) : null}
                </td>
                <td className="py-4 text-slate-600">{doc.category}</td>
                <td className="py-4"><StatusPill value={doc.signatureStatus} /></td>
                <td className="py-4 text-slate-600">{doc.expirationDate || "None"}</td>
                <td className="py-4 text-slate-600">{doc.uploadedBy}</td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openDocumentPreview(doc.id)}
                      className="rounded-xl bg-white border border-slate-200 text-slate-700 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] hover:border-slate-400 transition"
                    >
                      Open / Redact
                    </button>
                    <button
                      type="button"
                      onClick={() => certifyDocument(doc.id)}
                      disabled={!canCertifyDocument(doc)}
                      className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                        canCertifyDocument(doc)
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      Certify
                    </button>
                    <button
                      type="button"
                      onClick={() => requestSignature(doc.id)}
                      disabled={!canRequestSignature(doc)}
                      className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                        canRequestSignature(doc)
                          ? "bg-white border border-slate-200 text-slate-700 hover:border-slate-400"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      Request signature
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );

  const renderEDocsAuditTab = () => (
    <Panel title="eDocs audit trail" subtitle="Subject-scoped document activity for certifications, signature routing, and packet changes.">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[720px]">
          <thead className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="pb-3">Time</th>
              <th className="pb-3">Actor</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {selectedSubjectDocAudit.length ? selectedSubjectDocAudit.map((entry) => (
              <tr key={entry.id} className="text-sm">
                <td className="py-4 text-slate-500">{entry.timestamp}</td>
                <td className="py-4 font-bold text-slate-900">{entry.actor}</td>
                <td className="py-4 text-slate-700">{entry.action}</td>
                <td className="py-4 font-mono text-[12px] text-indigo-600">{entry.trace}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="py-8 text-sm text-slate-500">No eDocs audit entries for this subject yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );

  const renderSubjectWorkbench = () => {
    if (!selectedSubject) return null;

    if (workspace.activeSubjectTab === "general") return renderGeneralTab();
    if (workspace.activeSubjectTab === "visits") return renderVisitsTab();
    if (workspace.activeSubjectTab === "study_logs") return renderStudyLogsTab();
    if (workspace.activeSubjectTab === "adverse_events") return renderAdverseEventsTab();
    if (workspace.activeSubjectTab === "conditions") return renderConditionsTab();
    if (workspace.activeSubjectTab === "medications") return renderMedicationsTab();
    if (workspace.activeSubjectTab === "deviations") return renderDeviationsTab();
    if (workspace.activeSubjectTab === "allergies") return renderAllergiesTab();
    if (workspace.activeSubjectTab === "surgical_history") return renderSurgicalHistoryTab();
    if (workspace.activeSubjectTab === "contacts") return renderContactsTab();
    if (workspace.activeSubjectTab === "notes") return renderNotesTab();
    if (workspace.activeSubjectTab === "edocs") return renderEDocsTab();
    return renderEDocsAuditTab();
  };

  const renderMessages = () => (
    <Panel title="Secure site messaging" subtitle="Team chat stays inside the clinic app instead of breaking into another tool.">
      <div className="flex flex-col h-[65vh]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {workspace.messages.map((message) => (
            <div key={message.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-[1.75rem] px-5 py-4 ${message.mine ? "bg-slate-900 text-white rounded-tr-md" : "bg-slate-100 text-slate-800 rounded-tl-md"}`}>
                <p className="text-xs font-black uppercase tracking-[0.16em] opacity-60 mb-2">{message.sender} · {message.role}</p>
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className="text-[11px] font-bold opacity-60 mt-3">{message.time}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="pt-4 mt-4 border-t border-slate-100 flex gap-3">
          <input
            value={messageDraft}
            onChange={(event) => setMessageDraft(event.target.value)}
            placeholder="Message the study team..."
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
          />
          <button type="submit" className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-black hover:bg-slate-800 transition">
            Send
          </button>
        </form>
      </div>
    </Panel>
  );

  const renderAssistant = () => (
    <Panel title="Protocol assistant" subtitle="Covers the AI helper shown in the walkthrough without leaving the clinic workspace.">
      <div className="flex flex-col h-[65vh]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {workspace.assistantMessages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-[1.75rem] px-5 py-4 ${message.sender === "user" ? "bg-indigo-600 text-white rounded-tr-md" : "bg-indigo-50 text-slate-900 rounded-tl-md border border-indigo-100"}`}>
                <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70 mb-2">{message.sender === "user" ? actorName : "Protocol AI"}</p>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={askAssistant} className="pt-4 mt-4 border-t border-slate-100 flex gap-3">
          <input
            value={assistantDraft}
            onChange={(event) => setAssistantDraft(event.target.value)}
            placeholder="Ask about visits, stipends, eligibility, or signatures..."
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
          />
          <button type="submit" className="rounded-2xl bg-indigo-600 text-white px-5 py-3 font-black hover:bg-indigo-700 transition">
            Ask
          </button>
        </form>
      </div>
    </Panel>
  );

  const renderAudit = () => (
    <Panel title="Immutable audit trail" subtitle="Every subject action feeds the same ledger: visits, payments, logs, signatures, and notes.">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="pb-3">Time</th>
              <th className="pb-3">Actor</th>
              <th className="pb-3">Subject</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workspace.auditLog.map((entry) => (
              <tr key={entry.id} className="text-sm">
                <td className="py-4 text-slate-500">{entry.timestamp}</td>
                <td className="py-4 font-bold text-slate-900">{entry.actor}</td>
                <td className="py-4 text-slate-600">{entry.subjectNumber}</td>
                <td className="py-4 text-slate-700">{entry.action}</td>
                <td className="py-4 font-mono text-[12px] text-indigo-600">{entry.trace}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-950 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-white/10">
                <Lock size={22} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">TYFYS Clinic</p>
                <h1 className="text-2xl font-black tracking-tight mt-1">Subject operations console</h1>
              </div>
            </div>
            <p className="text-slate-300 text-sm">This route now mirrors the CTMS-style workflow from the second half of your recording.</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">Username</label>
              <input value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" autoComplete="username" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2">Password</label>
              <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" autoComplete="current-password" />
            </div>
            {loginError ? <p className="text-sm font-bold text-rose-600">{loginError}</p> : null}
            <button type="submit" className="w-full rounded-2xl bg-slate-900 text-white py-3 font-black hover:bg-slate-800 transition">
              Unlock clinic app
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-900 ${workspace.monitorMode ? "selection:bg-amber-200" : ""}`}>
      <div className="lg:h-screen lg:flex">
        <aside className="bg-slate-950 text-white lg:w-24 px-4 py-5 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="flex lg:flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-[1.35rem] bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <Activity size={24} />
            </div>
            <div className="lg:hidden">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">TYFYS Clinic</p>
              <p className="text-sm text-slate-300">Operations workbench</p>
            </div>
          </div>
          <nav className="mt-8 flex lg:flex-col gap-2 overflow-x-auto">
            {RAIL_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = workspace.activeRail === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateWorkspace((prev) => ({ ...prev, activeRail: item.id }))}
                  className={`min-w-[88px] lg:min-w-0 lg:w-full rounded-[1.35rem] px-3 py-3 flex lg:flex-col items-center gap-2 transition ${active ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.16em] text-center">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <aside className="lg:w-[20rem] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Subject navigator</p>
            <div className="mt-4 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={workspace.subjectSearch}
                onChange={(event) => updateWorkspace((prev) => ({ ...prev, subjectSearch: event.target.value }))}
                placeholder="Search subject, arm, or status"
                className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3 border-b border-slate-100">
              {filteredSubjects.map((subject) => {
                const active = subject.id === workspace.selectedSubjectId;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => selectSubject(subject.id)}
                    className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:border-slate-300 bg-slate-50"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`font-black ${active ? "text-white" : "text-slate-900"}`}>{subject.subjectNumber}</p>
                        <p className={`text-sm mt-1 ${active ? "text-slate-300" : "text-slate-500"}`}>{subject.firstName} {subject.lastName}</p>
                      </div>
                      <StatusPill value={subject.status} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Subject modules</p>
              <div className="space-y-2">
                {SUBJECT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => updateWorkspace((prev) => ({ ...prev, activeRail: "subjects", activeSubjectTab: tab.id }))}
                    className={`w-full rounded-2xl px-4 py-3 flex items-center justify-between text-left transition ${workspace.activeSubjectTab === tab.id && workspace.activeRail === "subjects" ? "bg-slate-900 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-700"}`}
                  >
                    <span className="font-bold">{tab.label}</span>
                    <ChevronRight size={16} className="opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="bg-white border-b border-slate-200 px-6 py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-600">{selectedSubject.studyId}</p>
                <span className="h-4 w-px bg-slate-200" />
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">{selectedSubject.protocolVersion}</p>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
                {selectedSubject.firstName} {selectedSubject.middleInitial} {selectedSubject.lastName}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Study arm: {selectedSubject.studyArm} · Site: {selectedSubject.site}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => updateWorkspace((prev) => ({ ...prev, monitorMode: !prev.monitorMode }))}
                className={`rounded-2xl px-4 py-3 font-black text-sm border transition ${workspace.monitorMode ? "bg-amber-100 border-amber-200 text-amber-800" : "bg-slate-50 border-slate-200 text-slate-700"}`}
              >
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  {workspace.monitorMode ? "Monitor mode on" : "Monitor mode off"}
                </div>
              </button>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Connected account</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{connectedAccount?.displayName || actorName}</p>
              </div>
              <button type="button" onClick={handleLogout} className="rounded-2xl bg-slate-900 text-white p-3 hover:bg-slate-800 transition" title="Log out">
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <div className="p-6 pb-24">
            {workspace.activeRail === "dashboard" && renderDashboard()}
            {workspace.activeRail === "subjects" && renderSubjectWorkbench()}
            {workspace.activeRail === "messages" && renderMessages()}
            {workspace.activeRail === "assistant" && renderAssistant()}
            {workspace.activeRail === "audit" && renderAudit()}
          </div>
        </main>

        <aside className="xl:w-[22rem] bg-white border-t xl:border-t-0 xl:border-l border-slate-200 p-6 space-y-6">
          <Panel title="Subject snapshot" subtitle="Live summary tied to the selected workbench subject.">
            <div className="space-y-4">
              <div className="rounded-[1.75rem] bg-slate-950 text-white p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Current subject</p>
                <p className="text-xl font-black mt-2">{selectedSubject.subjectNumber}</p>
                <p className="text-sm text-slate-300 mt-1">{selectedSubject.firstName} {selectedSubject.lastName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Status</p>
                  <p className="font-black text-slate-900 mt-2">{formatStatusLabel(selectedSubject.status)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Next visit</p>
                  <p className="font-black text-slate-900 mt-2">{selectedSubject.nextVisitDate}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Released</p>
                  <p className="font-black text-slate-900 mt-2">${selectedSubject.stipendReleasedTotal}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Pending payouts</p>
                  <p className="font-black text-slate-900 mt-2">{selectedSubject.pendingPayouts}</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Action queue" subtitle="Fast-glance blockers for the selected subject.">
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 p-4 flex items-start gap-3">
                <BellRing size={18} className="text-amber-500 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Visit readiness</p>
                  <p className="text-sm text-slate-500 mt-1">{selectedSubject.nextVisitLabel} is next in line.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 flex items-start gap-3">
                <FileSignature size={18} className="text-slate-700 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Signature queue</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedSubject.edocs.filter((doc) => doc.status === "Pending signature").length} pending document(s).
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 flex items-start gap-3">
                <Wallet size={18} className="text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Payouts</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedSubject.visits.filter((visit) => visit.stipendStatus === "Ready").length} stipend(s) ready to release.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </aside>
      </div>

      {previewDocument ? (
        <div className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">TYFYS eDocs Preview</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">{previewDocument.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedSubject.subjectNumber} · {selectedSubject.firstName} {selectedSubject.lastName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRedactionDraft("");
                  setDocumentPreviewId(null);
                }}
                className="rounded-2xl border border-slate-200 p-3 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Close document preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[calc(90vh-112px)] overflow-y-auto bg-slate-50 p-5 md:p-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Category</p>
                    <p className="mt-2 text-lg font-black text-slate-900">{previewDocument.category}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Signature</p>
                    <div className="mt-2">
                      <StatusPill value={previewDocument.signatureStatus} />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Packet status</p>
                    <p className="mt-2 text-lg font-black text-slate-900">{previewDocument.status}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Expiration</p>
                    <p className="mt-2 text-lg font-black text-slate-900">{previewDocument.expirationDate || "None"}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Saved redactions</p>
                  <p className="mt-2 text-3xl font-black">{previewRedactionTerms.length}</p>
                  <p className="mt-2 text-sm text-slate-300">Terms or phrases stored with this document.</p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">Auto-blackout hits</p>
                  <p className="mt-2 text-3xl font-black">{previewRedactionMatches}</p>
                  <p className="mt-2 text-sm text-slate-300">Case-insensitive matches across the preview.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[320px,minmax(0,1fr)]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm h-fit">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Bulk redaction</p>
                      <h4 className="mt-2 text-xl font-black text-slate-900">Auto blackout terms</h4>
                    </div>
                    <FileText size={20} className="text-slate-400" />
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Type one or more words, phrases, sentences, or names. Every matching occurrence in this document preview
                    is blacked out in bulk and saved with the document.
                  </p>

                  <form onSubmit={applyDocumentRedactions} className="mt-5 space-y-3">
                    <textarea
                      value={redactionDraft}
                      onChange={(event) => setRedactionDraft(event.target.value)}
                      placeholder={`Elizabeth Merrill\nMerrill\nannmerrill70@yahoo.com`}
                      className="w-full min-h-[150px] rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-black uppercase tracking-[0.16em] hover:bg-slate-800 transition"
                    >
                      Redact all matches
                    </button>
                  </form>

                  <div className="mt-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Quick add</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        subjectDisplayName(selectedSubject),
                        selectedSubject.firstName,
                        selectedSubject.lastName,
                        selectedSubject.email,
                        selectedSubject.phone
                      ]
                        .filter(Boolean)
                        .map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => appendTermsToDraft([term])}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-700 hover:border-slate-300"
                          >
                            {term}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => downloadRedactedDocument(previewDocument.id)}
                      disabled={!previewRedactionTerms.length}
                      className={`flex-1 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                        previewRedactionTerms.length
                          ? "bg-cyan-600 text-white hover:bg-cyan-700"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      Download redacted copy
                    </button>
                    <button
                      type="button"
                      onClick={clearDocumentRedactions}
                      disabled={!previewRedactionTerms.length}
                      className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${
                        previewRedactionTerms.length
                          ? "bg-white border border-slate-200 text-slate-700 hover:border-slate-400"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Active rules</p>
                    {previewRedactionTerms.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {previewRedactionTerms.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => removeDocumentRedaction(term)}
                            className="rounded-full bg-slate-900 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white hover:bg-slate-800"
                          >
                            {term} ×
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">No redaction rules saved yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Document body</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Terms are matched case-insensitively across the full preview.
                      </p>
                    </div>
                    <div className="rounded-full bg-slate-950 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white">
                      {previewRedactionTerms.length} active term(s)
                    </div>
                  </div>

                  <div className="mt-6 space-y-6">
                    {previewSections.map((section) => (
                      <section key={section.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{section.title}</p>
                        <div className="mt-4 space-y-4">
                          {section.paragraphs.map((paragraph, index) => (
                            <p key={`${section.title}-${index}`} className="text-sm leading-7 text-slate-700">
                              {renderRedactedText(paragraph, previewRedactionTerms)}
                            </p>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        {notifications.map((note) => (
          <div
            key={note.id}
            className={`rounded-2xl px-5 py-4 shadow-2xl text-sm font-black uppercase tracking-[0.16em] ${
              note.tone === "emerald"
                ? "bg-emerald-600 text-white"
                : note.tone === "amber"
                  ? "bg-amber-400 text-slate-950"
                  : "bg-slate-950 text-white"
            }`}
          >
            {note.message}
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("clinic-root")).render(<App />);
