(() => {
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
    }
  }
  function formatStatusLabel(value) {
    return String(value || "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  function nowStamp() {
    return (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
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
    const deduped = /* @__PURE__ */ new Map();
    rawTerms.map((term) => String(term || "").trim()).filter(Boolean).forEach((term) => {
      const key = term.toLowerCase();
      if (!deduped.has(key)) deduped.set(key, term.slice(0, 160));
    });
    return Array.from(deduped.values());
  }
  function buildRedactionPattern(terms) {
    const normalized = normalizeRedactionTerms(terms);
    if (!normalized.length) return null;
    return new RegExp(
      normalized.sort((left, right) => right.length - left.length).map((term) => escapeRegExp(term)).join("|"),
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
      const mask = "\u2588".repeat(Math.max(4, Math.min(match[0].length, 24)));
      fragments.push(
        /* @__PURE__ */ React.createElement(
          "span",
          {
            key: `${match.index}-${match[0].length}`,
            className: "inline-flex rounded bg-slate-950 px-1.5 py-0.5 text-[11px] font-black tracking-[0.18em] text-slate-950 align-middle select-none",
            "aria-label": "Redacted text"
          },
          mask
        )
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
    const conditionSummary = subject.conditions?.map((condition) => `${condition.name} (${condition.severity})`).join("; ") || "No active conditions listed.";
    const medicationSummary = subject.medications?.map((medication) => `${medication.name} ${medication.dose}`).join("; ") || "No concomitant medications listed.";
    const allergySummary = subject.allergies?.map((allergy) => `${allergy.allergen} (${allergy.reaction})`).join("; ") || "No allergy record on file.";
    const contactSummary = primaryContact ? `${primaryContact.name} (${primaryContact.relation}) can be reached at ${primaryContact.phone} and ${primaryContact.email}.` : "No emergency contact is attached to this subject record.";
    let categoryNarrative = `${doc.name} was uploaded by ${doc.uploadedBy} for ${fullName} under subject number ${subject.subjectNumber}.`;
    if (doc.category === "Consent") {
      categoryNarrative = `${fullName} reviewed the informed consent packet with ${doc.uploadedBy} and acknowledged the study protocol, risks, and signature requirements for ${subject.studyId}.`;
    } else if (doc.category === "Identity") {
      categoryNarrative = `Identity verification was completed against the legal name ${fullName}, date of birth ${subject.dob}, and the site contact record for ${subject.lastName}.`;
    } else if (doc.category === "Labs") {
      categoryNarrative = `The lab packet for ${fullName} includes collection timing, specimen handling instructions, and PI routing requirements for the ${nextVisit?.name || "current"} visit window.`;
    } else if (doc.category === "Source") {
      categoryNarrative = `${doc.name} captures source details for ${fullName}, including study arm ${subject.studyArm}, visit timing, and monitoring notes that must stay packet-ready.`;
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
          nextVisit ? `Next visit ${nextVisit.name} is scheduled for ${nextVisit.visitDate} at ${nextVisit.visitTime}. Stipend status is ${nextVisit.stipendStatus} and source verification is ${nextVisit.sourceVerified ? "complete" : "pending"}.` : "No upcoming visit is currently attached to this subject packet.",
          latestVisit ? `Latest completed or scheduled packet activity references ${latestVisit.name}. Visit notes: ${latestVisit.notes}` : "No visit details are attached to this document yet."
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
    const visitQueue = subjects.flatMap(
      (subject) => subject.visits.filter((visit) => visit.status !== "Completed").map((visit) => ({ ...visit, subjectNumber: subject.subjectNumber, subjectName: `${subject.firstName} ${subject.lastName}` }))
    );
    const payoutQueue = subjects.flatMap(
      (subject) => subject.visits.filter((visit) => visit.stipendStatus === "Ready" || visit.stipendStatus === "Pending").map((visit) => ({ ...visit, subjectNumber: subject.subjectNumber, subjectName: `${subject.firstName} ${subject.lastName}` }))
    );
    const unresolvedLogs = subjects.flatMap(
      (subject) => subject.studyLogs.filter((log) => log.status !== "Approved").map((log) => ({ ...log, subjectNumber: subject.subjectNumber }))
    );
    const pendingSignatures = subjects.flatMap(
      (subject) => subject.edocs.filter((doc) => doc.status === "Pending signature").map((doc) => ({ ...doc, subjectNumber: subject.subjectNumber }))
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
        return void 0;
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
        ].join(" ").toLowerCase();
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
      () => previewDocument && selectedSubject ? buildDocumentPreviewSections(selectedSubject, previewDocument) : [],
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
      () => workspace.auditLog.filter(
        (entry) => entry.subjectNumber === selectedSubject?.subjectNumber && /(doc|signature|certif|packet|edoc|upload|redact)/i.test(entry.action)
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
      if (!previewDocument) return void 0;
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
      setWorkspace((prev) => typeof updater === "function" ? updater(prev) : updater);
    };
    const updateSelectedSubject = (subjectUpdater) => {
      updateWorkspace((prev) => ({
        ...prev,
        subjects: prev.subjects.map(
          (subject) => subject.id === prev.selectedSubjectId ? subjectUpdater(subject) : subject
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
        visits: subject.visits.map((visit) => visit.id === visitId ? { ...visit, [field]: value } : visit),
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
              visits: subject.visits.map(
                (visit) => visit.id === visitId ? {
                  ...visit,
                  status: "Completed",
                  edcEntered: true,
                  qcReview: true,
                  sourceVerified: true
                } : visit
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
              visits: subject.visits.map(
                (visit) => visit.id === visitId ? { ...visit, stipendStatus: "Paid" } : visit
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
              visits: subject.visits.map(
                (visit) => visit.id === visitId ? { ...visit, generalPayments: Number(visit.generalPayments || 0) + 1 } : visit
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
              studyLogs: subject.studyLogs.map(
                (log) => log.id === logId ? { ...log, status, updatedAt: nowStamp().slice(0, 16) } : log
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
              edocs: subject.edocs.map(
                (doc) => doc.id === docId ? {
                  ...doc,
                  status: "Certified",
                  certifiedCopy: true,
                  signatureStatus: "Signed"
                } : doc
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
              edocs: subject.edocs.map(
                (doc) => doc.id === docId ? { ...doc, status: "Pending signature", signatureStatus: "Awaiting PI" } : doc
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
              visits: subject.visits.map(
                (item) => item.id === visitId ? { ...item, sourceVerified: true, qcReview: true } : item
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
              edocs: subject.edocs.map(
                (doc) => doc.id === previewDocument.id ? {
                  ...doc,
                  redactionTerms: mergedTerms,
                  lastRedactedAt: nowStamp(),
                  lastRedactedBy: actorName
                } : doc
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
              edocs: subject.edocs.map(
                (doc) => doc.id === previewDocument.id ? {
                  ...doc,
                  redactionTerms: normalizeRedactionTerms((doc.redactionTerms || []).filter((item) => item.toLowerCase() !== term.toLowerCase())),
                  lastRedactedAt: nowStamp(),
                  lastRedactedBy: actorName
                } : doc
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
              edocs: subject.edocs.map(
                (doc) => doc.id === previewDocument.id ? {
                  ...doc,
                  redactionTerms: [],
                  lastRedactedAt: nowStamp(),
                  lastRedactedBy: actorName
                } : doc
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
      const content = buildDocumentPreviewSections(selectedSubject, doc).map((section) => [
        section.title.toUpperCase(),
        ...section.paragraphs.map((paragraph) => redactPlainText(paragraph, terms))
      ].join("\n")).join("\n\n");
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
            time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
      let response = "Recommended next step: verify the selected visit, confirm eDocs signature status, and clear stipend blockers before sponsor review.";
      if (lower.includes("stipend")) {
        response = "Baseline D1 is the only ready stipend in queue for the selected subject. Once you release it, attach the payment confirmation to eDocs for monitor review.";
      } else if (lower.includes("eligibility") || lower.includes("screen")) {
        response = "Eligibility is still tied to the screening log and unresolved medication review. Close those before moving the subject to randomized.";
      } else if (lower.includes("signature") || lower.includes("consent")) {
        response = "There is one pending signature packet in eDocs. Route it to PI review, then certify the copy so the site packet stays monitor-ready.";
      } else if (lower.includes("visit")) {
        response = "The next operational step is the Baseline D1 visit. Mark source verification, complete QC, then finalize stipend release.";
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
      return /* @__PURE__ */ React.createElement("div", { className: `rounded-[1.75rem] p-6 shadow-sm ${tones[tone] || tones.white}` }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.2em] opacity-70" }, label), /* @__PURE__ */ React.createElement("p", { className: "text-3xl font-black tracking-tight mt-3" }, value));
    };
    const StatusPill = ({ value }) => /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center gap-2 border px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.18em] ${pillClasses(value)}` }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full bg-current opacity-70" }), formatStatusLabel(value));
    const Panel = ({ title, subtitle, action, children }) => /* @__PURE__ */ React.createElement("section", { className: "bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black tracking-tight text-slate-900" }, title), subtitle ? /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, subtitle) : null), action), /* @__PURE__ */ React.createElement("div", { className: "p-6" }, children));
    const renderDashboard = () => /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(DashboardMetric, { label: "Active subjects", value: workspace.subjects.length, tone: "slate" }), /* @__PURE__ */ React.createElement(DashboardMetric, { label: "Visits in queue", value: metrics.visitQueue.length, tone: "white" }), /* @__PURE__ */ React.createElement(DashboardMetric, { label: "Pending payouts", value: metrics.payoutQueue.length, tone: "amber" }), /* @__PURE__ */ React.createElement(DashboardMetric, { label: "Total released", value: `$${metrics.totalPayouts}`, tone: "emerald" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-6" }, /* @__PURE__ */ React.createElement(
      Panel,
      {
        title: "Visit queue",
        subtitle: "Matches the second-half visit grid workflow: site team, QC, payout, and sponsor readiness."
      },
      /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left min-w-[720px]" }, /* @__PURE__ */ React.createElement("thead", { className: "text-[11px] uppercase tracking-[0.18em] text-slate-400" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Subject"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Visit"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Date"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Status"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Stipend"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100" }, metrics.visitQueue.map((visit) => /* @__PURE__ */ React.createElement("tr", { key: `${visit.subjectNumber}-${visit.id}`, className: "text-sm" }, /* @__PURE__ */ React.createElement("td", { className: "py-4 font-bold text-slate-900" }, visit.subjectNumber), /* @__PURE__ */ React.createElement("td", { className: "py-4" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-slate-800" }, visit.name), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500" }, visit.subjectName)), /* @__PURE__ */ React.createElement("td", { className: "py-4 text-slate-600" }, visit.visitDate, " ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "at ", visit.visitTime)), /* @__PURE__ */ React.createElement("td", { className: "py-4" }, /* @__PURE__ */ React.createElement(StatusPill, { value: visit.status })), /* @__PURE__ */ React.createElement("td", { className: "py-4" }, /* @__PURE__ */ React.createElement(StatusPill, { value: visit.stipendStatus })))))))
    ), /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement(Panel, { title: "Packet blockers", subtitle: "Logs, signatures, and payout items still blocking sponsor-ready packets." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, metrics.unresolvedLogs.slice(0, 3).map((log) => /* @__PURE__ */ React.createElement("div", { key: log.id, className: "rounded-2xl border border-slate-200 bg-slate-50 p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900" }, log.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500" }, log.subjectNumber, " \xB7 ", log.section)), /* @__PURE__ */ React.createElement(StatusPill, { value: log.status })))), !metrics.unresolvedLogs.length && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500" }, "No unresolved logs. The site packet is clean."))), /* @__PURE__ */ React.createElement(Panel, { title: "Signature queue", subtitle: "Documents waiting for PI or certified-copy completion." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, metrics.pendingSignatures.map((doc) => /* @__PURE__ */ React.createElement("div", { key: doc.id, className: "flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900" }, doc.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500" }, doc.subjectNumber)), /* @__PURE__ */ React.createElement(StatusPill, { value: doc.status }))), !metrics.pendingSignatures.length && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500" }, "No documents are waiting on signature."))))));
    const renderGeneralTab = () => /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement(Panel, { title: "Subject profile", subtitle: "Editable general tab modeled on the second-half screening and status screen." }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("label", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Subject Number"), /* @__PURE__ */ React.createElement("input", { value: selectedSubject.subjectNumber, onChange: (event) => setSubjectField("subjectNumber", event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" })), /* @__PURE__ */ React.createElement("label", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Randomization Number"), /* @__PURE__ */ React.createElement("input", { value: selectedSubject.randomizationNumber, onChange: (event) => setSubjectField("randomizationNumber", event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" })), /* @__PURE__ */ React.createElement("label", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "First Name"), /* @__PURE__ */ React.createElement("input", { value: selectedSubject.firstName, onChange: (event) => setSubjectField("firstName", event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" })), /* @__PURE__ */ React.createElement("label", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Last Name"), /* @__PURE__ */ React.createElement("input", { value: selectedSubject.lastName, onChange: (event) => setSubjectField("lastName", event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" })), /* @__PURE__ */ React.createElement("label", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Initials"), /* @__PURE__ */ React.createElement("input", { value: selectedSubject.initials, onChange: (event) => setSubjectField("initials", event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" })), /* @__PURE__ */ React.createElement("label", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Gender"), /* @__PURE__ */ React.createElement("input", { value: selectedSubject.gender, onChange: (event) => setSubjectField("gender", event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" })), /* @__PURE__ */ React.createElement("label", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "DOB"), /* @__PURE__ */ React.createElement("input", { type: "date", value: selectedSubject.dob, onChange: (event) => setSubjectField("dob", event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" })), /* @__PURE__ */ React.createElement("label", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Email"), /* @__PURE__ */ React.createElement("input", { value: selectedSubject.email, onChange: (event) => setSubjectField("email", event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-slate-400" }))), /* @__PURE__ */ React.createElement("div", { className: "rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3 mb-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Status"), /* @__PURE__ */ React.createElement("h4", { className: "text-xl font-black text-slate-900 mt-1" }, "Enrollment Progress")), /* @__PURE__ */ React.createElement(StatusPill, { value: selectedSubject.status })), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, Object.entries(selectedSubject.statusTimeline).map(([key, value]) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key,
        type: "button",
        onClick: () => setStatusState(key),
        className: `w-full rounded-2xl border px-4 py-4 text-left transition ${selectedSubject.status === key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black uppercase tracking-[0.16em] text-[11px] opacity-70" }, formatStatusLabel(key)), /* @__PURE__ */ React.createElement("p", { className: "text-sm mt-1" }, value.date ? `${value.date} ${value.time}` : "Not yet recorded")), value.complete ? /* @__PURE__ */ React.createElement(CheckCircle2, { size: 18 }) : /* @__PURE__ */ React.createElement(ChevronRight, { size: 18 }))
    )))))));
    const renderVisitsTab = () => /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement(Panel, { title: "Visit workbench", subtitle: "Scheduling, QC, remote monitoring, and stipend flow copied into a subject-first clinic view." }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 xl:grid-cols-[1.25fr_0.85fr] gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left min-w-[760px]" }, /* @__PURE__ */ React.createElement("thead", { className: "text-[11px] uppercase tracking-[0.18em] text-slate-400" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Visit"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Date"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "EDC"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "QC"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Status"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Subject Stipend"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100" }, selectedSubject.visits.map((visit) => /* @__PURE__ */ React.createElement(
      "tr",
      {
        key: visit.id,
        className: `text-sm cursor-pointer transition ${selectedVisit?.id === visit.id ? "bg-slate-50" : "hover:bg-slate-50/70"}`,
        onClick: () => setSelectedVisitId(visit.id)
      },
      /* @__PURE__ */ React.createElement("td", { className: "py-4" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900" }, visit.name), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500" }, visit.arm)),
      /* @__PURE__ */ React.createElement("td", { className: "py-4 text-slate-600" }, visit.visitDate, " \xB7 ", visit.visitTime),
      /* @__PURE__ */ React.createElement("td", { className: "py-4" }, visit.edcEntered ? /* @__PURE__ */ React.createElement(StatusPill, { value: "Completed" }) : /* @__PURE__ */ React.createElement(StatusPill, { value: "Pending" })),
      /* @__PURE__ */ React.createElement("td", { className: "py-4" }, visit.qcReview ? /* @__PURE__ */ React.createElement(StatusPill, { value: "Approved" }) : /* @__PURE__ */ React.createElement(StatusPill, { value: "Pending" })),
      /* @__PURE__ */ React.createElement("td", { className: "py-4" }, /* @__PURE__ */ React.createElement(StatusPill, { value: visit.status })),
      /* @__PURE__ */ React.createElement("td", { className: "py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: (event) => {
            event.stopPropagation();
            releaseStipend(visit.id);
          },
          disabled: !canReleaseStipend(visit),
          className: `rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${canReleaseStipend(visit) ? "bg-cyan-500 text-white hover:bg-cyan-600" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`
        },
        visit.stipendStatus === "Paid" ? "Paid" : "Pay stipend"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: (event) => {
            event.stopPropagation();
            addGeneralPayment(visit.id);
          },
          className: "rounded-xl bg-amber-400 text-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] hover:bg-amber-300 transition"
        },
        "Add general payment"
      )))
    ))))), selectedVisit ? /* @__PURE__ */ React.createElement("div", { className: "rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Current visit"), /* @__PURE__ */ React.createElement("h4", { className: "text-xl font-black text-slate-900 mt-1" }, selectedVisit.name)), /* @__PURE__ */ React.createElement(StatusPill, { value: selectedVisit.status })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => signVisitProcedure(selectedVisit.id), className: "rounded-xl bg-yellow-300 text-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] hover:bg-yellow-200 transition" }, "Sign procedure"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => downloadVisitProcedure(selectedVisit.id), className: "rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] hover:border-slate-400 transition" }, "Download procedure"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          updateWorkspace((prev) => ({ ...prev, activeRail: "subjects", activeSubjectTab: "notes" }));
          setNoteDraft(`Follow-up for ${selectedVisit.name}: `);
        },
        className: "rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] hover:border-slate-400 transition"
      },
      "Add note"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => updateWorkspace((prev) => ({ ...prev, activeRail: "audit" })),
        className: "rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] hover:border-slate-400 transition"
      },
      "Audit trail"
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => showVisitAlerts(selectedVisit.id),
        className: "w-full rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] hover:border-slate-400 transition"
      },
      "Validation alerts"
    ), /* @__PURE__ */ React.createElement("label", { className: "flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 border border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-700" }, "Source verified"), /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: selectedVisit.sourceVerified, onChange: (event) => setVisitField(selectedVisit.id, "sourceVerified", event.target.checked) })), /* @__PURE__ */ React.createElement("label", { className: "flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 border border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-700" }, "Remote monitoring enabled"), /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: selectedVisit.remoteMonitoring, onChange: (event) => setVisitField(selectedVisit.id, "remoteMonitoring", event.target.checked) })), /* @__PURE__ */ React.createElement("label", { className: "space-y-2 block" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Visit type"), /* @__PURE__ */ React.createElement("select", { value: selectedVisit.visitType, onChange: (event) => setVisitField(selectedVisit.id, "visitType", event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 bg-white font-semibold outline-none focus:border-slate-400" }, /* @__PURE__ */ React.createElement("option", null, "On site"), /* @__PURE__ */ React.createElement("option", null, "Televisit"), /* @__PURE__ */ React.createElement("option", null, "Phone follow-up"))), /* @__PURE__ */ React.createElement("label", { className: "space-y-2 block" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Visit notes"), /* @__PURE__ */ React.createElement("textarea", { value: selectedVisit.notes, onChange: (event) => setVisitField(selectedVisit.id, "notes", event.target.value), className: "w-full min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3 bg-white font-medium outline-none focus:border-slate-400" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => markVisitComplete(selectedVisit.id), className: "rounded-2xl bg-slate-900 text-white px-4 py-3 font-black hover:bg-slate-800 transition" }, "Mark complete"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => releaseStipend(selectedVisit.id),
        disabled: !canReleaseStipend(selectedVisit),
        className: `rounded-2xl px-4 py-3 font-black transition ${canReleaseStipend(selectedVisit) ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`
      },
      selectedVisit.stipendStatus === "Paid" ? "Stipend paid" : "Release stipend"
    ))) : null)));
    const renderStudyLogsTab = () => /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement(Panel, { title: "Study logs", subtitle: "Operational log list like the walkthrough: quick status control by section and owner." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, selectedSubject.studyLogs.map((log) => /* @__PURE__ */ React.createElement("div", { key: log.id, className: "rounded-[1.75rem] border border-slate-200 p-5 bg-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900" }, log.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, log.section, " \xB7 ", log.owner, " \xB7 Updated ", log.updatedAt)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-3" }, /* @__PURE__ */ React.createElement(StatusPill, { value: log.status }), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: log.status,
        onChange: (event) => updateStudyLogStatus(log.id, event.target.value),
        className: "rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-sm font-semibold outline-none focus:border-slate-400"
      },
      /* @__PURE__ */ React.createElement("option", null, "Approved"),
      /* @__PURE__ */ React.createElement("option", null, "In Review"),
      /* @__PURE__ */ React.createElement("option", null, "Needs Follow-up")
    ))))))));
    const renderConditionsTab = () => /* @__PURE__ */ React.createElement(Panel, { title: "Medical conditions", subtitle: "Condition impact statements stay visible for provider packet prep." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, selectedSubject.conditions.map((condition) => /* @__PURE__ */ React.createElement("div", { key: condition.id, className: "rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900" }, condition.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, condition.type, " \xB7 ", condition.severity)), /* @__PURE__ */ React.createElement(StatusPill, { value: condition.severity })), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-700 mt-4 leading-relaxed" }, condition.impact)))));
    const renderAdverseEventsTab = () => /* @__PURE__ */ React.createElement(Panel, { title: "Adverse events", subtitle: "Dedicated AE coverage to match the source clinic workflow instead of hiding events inside another tab." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, selectedSubject.adverseEvents.length ? selectedSubject.adverseEvents.map((eventItem) => /* @__PURE__ */ React.createElement("div", { key: eventItem.id, className: "rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900" }, eventItem.event), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-600 mt-1" }, eventItem.severity, " \xB7 Relation: ", eventItem.relation)), /* @__PURE__ */ React.createElement(StatusPill, { value: eventItem.status })))) : /* @__PURE__ */ React.createElement("div", { className: "rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500" }, "No adverse events are open for this subject.")));
    const renderMedicationsTab = () => /* @__PURE__ */ React.createElement(Panel, { title: "Concomitant medications", subtitle: "Medication reconciliation is kept separate from AE review, matching the recorded CTMS layout." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, selectedSubject.medications.map((medication) => /* @__PURE__ */ React.createElement("div", { key: medication.id, className: "rounded-[1.75rem] border border-slate-200 p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900" }, medication.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, medication.dose, " \xB7 ", medication.indication)), /* @__PURE__ */ React.createElement(StatusPill, { value: medication.status }))))));
    const renderDeviationsTab = () => /* @__PURE__ */ React.createElement(Panel, { title: "Protocol deviations", subtitle: "Deviation tracking keeps ownership and resolution attached to the subject packet." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, selectedSubject.deviations.length ? selectedSubject.deviations.map((deviation) => /* @__PURE__ */ React.createElement("div", { key: deviation.id, className: "rounded-[1.75rem] border border-slate-200 p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900" }, deviation.title), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, "Owner: ", deviation.owner)), /* @__PURE__ */ React.createElement(StatusPill, { value: deviation.resolution })), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-600 mt-4" }, "Severity: ", deviation.severity))) : /* @__PURE__ */ React.createElement("div", { className: "rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500" }, "No deviations recorded.")));
    const renderAllergiesTab = () => /* @__PURE__ */ React.createElement(Panel, { title: "Allergies", subtitle: "Pulled forward from the source app so patient safety flags stay one click away." }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" }, selectedSubject.allergies.map((allergy) => /* @__PURE__ */ React.createElement("div", { key: allergy.id, className: "rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900" }, allergy.allergen), /* @__PURE__ */ React.createElement(StatusPill, { value: allergy.severity })), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-600 mt-3" }, allergy.reaction)))));
    const renderSurgicalHistoryTab = () => /* @__PURE__ */ React.createElement(Panel, { title: "Surgical conditions", subtitle: "Surgical history stays visible as a standalone module, just like the source navigation." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, selectedSubject.surgicalHistory.length ? selectedSubject.surgicalHistory.map((item) => /* @__PURE__ */ React.createElement("div", { key: item.id, className: "rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900" }, item.procedure), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, item.date)), /* @__PURE__ */ React.createElement(StatusPill, { value: item.status })), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-600 mt-4" }, item.outcome))) : /* @__PURE__ */ React.createElement("div", { className: "rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500" }, "No surgical history recorded.")));
    const renderContactsTab = () => /* @__PURE__ */ React.createElement(Panel, { title: "Emergency contacts", subtitle: "Caretaker and contact details stay in the same subject workbench rather than in a separate portal." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, selectedSubject.contacts.map((contact) => /* @__PURE__ */ React.createElement("div", { key: contact.id, className: "rounded-[1.75rem] border border-slate-200 p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900" }, contact.name), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, contact.relation)), /* @__PURE__ */ React.createElement("div", { className: "text-sm text-slate-600 flex flex-col md:items-end" }, /* @__PURE__ */ React.createElement("span", null, contact.phone), /* @__PURE__ */ React.createElement("span", null, contact.email)))))));
    const renderNotesTab = () => /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement(Panel, { title: "Progress notes", subtitle: "Operational notes now append directly into the subject timeline." }, /* @__PURE__ */ React.createElement("form", { onSubmit: addProgressNote, className: "space-y-4 mb-6" }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: noteDraft,
        onChange: (event) => setNoteDraft(event.target.value),
        placeholder: "Add a site note, coordinator update, or packet reminder.",
        className: "w-full min-h-[120px] rounded-[1.75rem] border border-slate-200 px-4 py-4 outline-none focus:border-slate-400"
      }
    ), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "rounded-2xl bg-slate-900 text-white px-5 py-3 font-black hover:bg-slate-800 transition" }, "Add progress note")), /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, selectedSubject.progressNotes.map((note) => /* @__PURE__ */ React.createElement("div", { key: note.id, className: "rounded-[1.75rem] border border-slate-200 p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900" }, note.author), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold uppercase tracking-[0.16em] text-slate-400" }, note.createdAt)), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-600 mt-4 leading-relaxed" }, note.text))))));
    const renderEDocsTab = () => /* @__PURE__ */ React.createElement(
      Panel,
      {
        title: "eDocs / labs / misc",
        subtitle: "Certified-copy, signature, and redaction controls are wired into the clinic packet. Use Open / Redact to launch the bulk blackout workspace."
      },
      /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left min-w-[760px]" }, /* @__PURE__ */ React.createElement("thead", { className: "text-[11px] uppercase tracking-[0.18em] text-slate-400" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Document"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Category"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Signature"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Expiration"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Uploaded By"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100" }, selectedSubject.edocs.map((doc) => /* @__PURE__ */ React.createElement("tr", { key: doc.id, className: "text-sm" }, /* @__PURE__ */ React.createElement("td", { className: "py-4" }, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900" }, doc.name), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500" }, doc.status), doc.redactionTerms?.length ? /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 mt-1" }, doc.redactionTerms.length, " redaction term(s) saved") : null), /* @__PURE__ */ React.createElement("td", { className: "py-4 text-slate-600" }, doc.category), /* @__PURE__ */ React.createElement("td", { className: "py-4" }, /* @__PURE__ */ React.createElement(StatusPill, { value: doc.signatureStatus })), /* @__PURE__ */ React.createElement("td", { className: "py-4 text-slate-600" }, doc.expirationDate || "None"), /* @__PURE__ */ React.createElement("td", { className: "py-4 text-slate-600" }, doc.uploadedBy), /* @__PURE__ */ React.createElement("td", { className: "py-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => openDocumentPreview(doc.id),
          className: "rounded-xl bg-white border border-slate-200 text-slate-700 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] hover:border-slate-400 transition"
        },
        "Open / Redact"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => certifyDocument(doc.id),
          disabled: !canCertifyDocument(doc),
          className: `rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${canCertifyDocument(doc) ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`
        },
        "Certify"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => requestSignature(doc.id),
          disabled: !canRequestSignature(doc),
          className: `rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${canRequestSignature(doc) ? "bg-white border border-slate-200 text-slate-700 hover:border-slate-400" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`
        },
        "Request signature"
      ))))))))
    );
    const renderEDocsAuditTab = () => /* @__PURE__ */ React.createElement(Panel, { title: "eDocs audit trail", subtitle: "Subject-scoped document activity for certifications, signature routing, and packet changes." }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left min-w-[720px]" }, /* @__PURE__ */ React.createElement("thead", { className: "text-[11px] uppercase tracking-[0.18em] text-slate-400" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Time"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Actor"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Action"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Trace"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100" }, selectedSubjectDocAudit.length ? selectedSubjectDocAudit.map((entry) => /* @__PURE__ */ React.createElement("tr", { key: entry.id, className: "text-sm" }, /* @__PURE__ */ React.createElement("td", { className: "py-4 text-slate-500" }, entry.timestamp), /* @__PURE__ */ React.createElement("td", { className: "py-4 font-bold text-slate-900" }, entry.actor), /* @__PURE__ */ React.createElement("td", { className: "py-4 text-slate-700" }, entry.action), /* @__PURE__ */ React.createElement("td", { className: "py-4 font-mono text-[12px] text-indigo-600" }, entry.trace))) : /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "4", className: "py-8 text-sm text-slate-500" }, "No eDocs audit entries for this subject yet."))))));
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
    const renderMessages = () => /* @__PURE__ */ React.createElement(Panel, { title: "Secure site messaging", subtitle: "Team chat stays inside the clinic app instead of breaking into another tool." }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col h-[65vh]" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto space-y-4 pr-2" }, workspace.messages.map((message) => /* @__PURE__ */ React.createElement("div", { key: message.id, className: `flex ${message.mine ? "justify-end" : "justify-start"}` }, /* @__PURE__ */ React.createElement("div", { className: `max-w-[78%] rounded-[1.75rem] px-5 py-4 ${message.mine ? "bg-slate-900 text-white rounded-tr-md" : "bg-slate-100 text-slate-800 rounded-tl-md"}` }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] opacity-60 mb-2" }, message.sender, " \xB7 ", message.role), /* @__PURE__ */ React.createElement("p", { className: "text-sm leading-relaxed" }, message.text), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] font-bold opacity-60 mt-3" }, message.time))))), /* @__PURE__ */ React.createElement("form", { onSubmit: sendMessage, className: "pt-4 mt-4 border-t border-slate-100 flex gap-3" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: messageDraft,
        onChange: (event) => setMessageDraft(event.target.value),
        placeholder: "Message the study team...",
        className: "flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
      }
    ), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "rounded-2xl bg-slate-900 text-white px-5 py-3 font-black hover:bg-slate-800 transition" }, "Send"))));
    const renderAssistant = () => /* @__PURE__ */ React.createElement(Panel, { title: "Protocol assistant", subtitle: "Covers the AI helper shown in the walkthrough without leaving the clinic workspace." }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col h-[65vh]" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto space-y-4 pr-2" }, workspace.assistantMessages.map((message) => /* @__PURE__ */ React.createElement("div", { key: message.id, className: `flex ${message.sender === "user" ? "justify-end" : "justify-start"}` }, /* @__PURE__ */ React.createElement("div", { className: `max-w-[80%] rounded-[1.75rem] px-5 py-4 ${message.sender === "user" ? "bg-indigo-600 text-white rounded-tr-md" : "bg-indigo-50 text-slate-900 rounded-tl-md border border-indigo-100"}` }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] opacity-70 mb-2" }, message.sender === "user" ? actorName : "Protocol AI"), /* @__PURE__ */ React.createElement("p", { className: "text-sm leading-relaxed" }, message.text))))), /* @__PURE__ */ React.createElement("form", { onSubmit: askAssistant, className: "pt-4 mt-4 border-t border-slate-100 flex gap-3" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: assistantDraft,
        onChange: (event) => setAssistantDraft(event.target.value),
        placeholder: "Ask about visits, stipends, eligibility, or signatures...",
        className: "flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
      }
    ), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "rounded-2xl bg-indigo-600 text-white px-5 py-3 font-black hover:bg-indigo-700 transition" }, "Ask"))));
    const renderAudit = () => /* @__PURE__ */ React.createElement(Panel, { title: "Immutable audit trail", subtitle: "Every subject action feeds the same ledger: visits, payments, logs, signatures, and notes." }, /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left min-w-[760px]" }, /* @__PURE__ */ React.createElement("thead", { className: "text-[11px] uppercase tracking-[0.18em] text-slate-400" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Time"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Actor"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Subject"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Action"), /* @__PURE__ */ React.createElement("th", { className: "pb-3" }, "Trace"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100" }, workspace.auditLog.map((entry) => /* @__PURE__ */ React.createElement("tr", { key: entry.id, className: "text-sm" }, /* @__PURE__ */ React.createElement("td", { className: "py-4 text-slate-500" }, entry.timestamp), /* @__PURE__ */ React.createElement("td", { className: "py-4 font-bold text-slate-900" }, entry.actor), /* @__PURE__ */ React.createElement("td", { className: "py-4 text-slate-600" }, entry.subjectNumber), /* @__PURE__ */ React.createElement("td", { className: "py-4 text-slate-700" }, entry.action), /* @__PURE__ */ React.createElement("td", { className: "py-4 font-mono text-[12px] text-indigo-600" }, entry.trace)))))));
    if (!isAuthenticated) {
      return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-slate-950 text-white flex items-center justify-center p-6" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-md bg-white text-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-950 p-8 text-white" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 rounded-2xl bg-white/10" }, /* @__PURE__ */ React.createElement(Lock, { size: 22 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.22em] text-cyan-300" }, "TYFYS Clinic"), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-black tracking-tight mt-1" }, "Subject operations console"))), /* @__PURE__ */ React.createElement("p", { className: "text-slate-300 text-sm" }, "This route now mirrors the CTMS-style workflow from the second half of your recording.")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleLogin, className: "p-8 space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2" }, "Username"), /* @__PURE__ */ React.createElement("input", { value: loginUsername, onChange: (event) => setLoginUsername(event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400", autoComplete: "username" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-2" }, "Password"), /* @__PURE__ */ React.createElement("input", { type: "password", value: loginPassword, onChange: (event) => setLoginPassword(event.target.value), className: "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400", autoComplete: "current-password" })), loginError ? /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-rose-600" }, loginError) : null, /* @__PURE__ */ React.createElement("button", { type: "submit", className: "w-full rounded-2xl bg-slate-900 text-white py-3 font-black hover:bg-slate-800 transition" }, "Unlock clinic app"))));
    }
    return /* @__PURE__ */ React.createElement("div", { className: `min-h-screen bg-slate-100 text-slate-900 ${workspace.monitorMode ? "selection:bg-amber-200" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "lg:h-screen lg:flex" }, /* @__PURE__ */ React.createElement("aside", { className: "bg-slate-950 text-white lg:w-24 px-4 py-5 border-b lg:border-b-0 lg:border-r border-white/10" }, /* @__PURE__ */ React.createElement("div", { className: "flex lg:flex-col items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-14 h-14 rounded-[1.35rem] bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-900/30" }, /* @__PURE__ */ React.createElement(Activity, { size: 24 })), /* @__PURE__ */ React.createElement("div", { className: "lg:hidden" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.2em] text-cyan-300" }, "TYFYS Clinic"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-300" }, "Operations workbench"))), /* @__PURE__ */ React.createElement("nav", { className: "mt-8 flex lg:flex-col gap-2 overflow-x-auto" }, RAIL_ITEMS.map((item) => {
      const Icon = item.icon;
      const active = workspace.activeRail === item.id;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: item.id,
          type: "button",
          onClick: () => updateWorkspace((prev) => ({ ...prev, activeRail: item.id })),
          className: `min-w-[88px] lg:min-w-0 lg:w-full rounded-[1.35rem] px-3 py-3 flex lg:flex-col items-center gap-2 transition ${active ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:bg-white/5 hover:text-white"}`
        },
        /* @__PURE__ */ React.createElement(Icon, { size: 18 }),
        /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-black uppercase tracking-[0.16em] text-center" }, item.label)
      );
    }))), /* @__PURE__ */ React.createElement("aside", { className: "lg:w-[20rem] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "px-6 py-5 border-b border-slate-100" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Subject navigator"), /* @__PURE__ */ React.createElement("div", { className: "mt-4 relative" }, /* @__PURE__ */ React.createElement(Search, { size: 16, className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" }), /* @__PURE__ */ React.createElement(
      "input",
      {
        value: workspace.subjectSearch,
        onChange: (event) => updateWorkspace((prev) => ({ ...prev, subjectSearch: event.target.value })),
        placeholder: "Search subject, arm, or status",
        className: "w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 outline-none focus:border-slate-400"
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 space-y-3 border-b border-slate-100" }, filteredSubjects.map((subject) => {
      const active = subject.id === workspace.selectedSubjectId;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: subject.id,
          type: "button",
          onClick: () => selectSubject(subject.id),
          className: `w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:border-slate-300 bg-slate-50"}`
        },
        /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `font-black ${active ? "text-white" : "text-slate-900"}` }, subject.subjectNumber), /* @__PURE__ */ React.createElement("p", { className: `text-sm mt-1 ${active ? "text-slate-300" : "text-slate-500"}` }, subject.firstName, " ", subject.lastName)), /* @__PURE__ */ React.createElement(StatusPill, { value: subject.status }))
      );
    })), /* @__PURE__ */ React.createElement("div", { className: "p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-3" }, "Subject modules"), /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, SUBJECT_TABS.map((tab) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tab.id,
        type: "button",
        onClick: () => updateWorkspace((prev) => ({ ...prev, activeRail: "subjects", activeSubjectTab: tab.id })),
        className: `w-full rounded-2xl px-4 py-3 flex items-center justify-between text-left transition ${workspace.activeSubjectTab === tab.id && workspace.activeRail === "subjects" ? "bg-slate-900 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-700"}`
      },
      /* @__PURE__ */ React.createElement("span", { className: "font-bold" }, tab.label),
      /* @__PURE__ */ React.createElement(ChevronRight, { size: 16, className: "opacity-60" })
    )))))), /* @__PURE__ */ React.createElement("main", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("header", { className: "bg-white border-b border-slate-200 px-6 py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.22em] text-cyan-600" }, selectedSubject.studyId), /* @__PURE__ */ React.createElement("span", { className: "h-4 w-px bg-slate-200" }), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.22em] text-slate-400" }, selectedSubject.protocolVersion)), /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-black tracking-tight text-slate-900 mt-2" }, selectedSubject.firstName, " ", selectedSubject.middleInitial, " ", selectedSubject.lastName), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, "Study arm: ", selectedSubject.studyArm, " \xB7 Site: ", selectedSubject.site)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-3" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => updateWorkspace((prev) => ({ ...prev, monitorMode: !prev.monitorMode })),
        className: `rounded-2xl px-4 py-3 font-black text-sm border transition ${workspace.monitorMode ? "bg-amber-100 border-amber-200 text-amber-800" : "bg-slate-50 border-slate-200 text-slate-700"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Eye, { size: 16 }), workspace.monitorMode ? "Monitor mode on" : "Monitor mode off")
    ), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Connected account"), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-slate-900 mt-1" }, connectedAccount?.displayName || actorName)), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: handleLogout, className: "rounded-2xl bg-slate-900 text-white p-3 hover:bg-slate-800 transition", title: "Log out" }, /* @__PURE__ */ React.createElement(LogOut, { size: 18 })))), /* @__PURE__ */ React.createElement("div", { className: "p-6 pb-24" }, workspace.activeRail === "dashboard" && renderDashboard(), workspace.activeRail === "subjects" && renderSubjectWorkbench(), workspace.activeRail === "messages" && renderMessages(), workspace.activeRail === "assistant" && renderAssistant(), workspace.activeRail === "audit" && renderAudit())), /* @__PURE__ */ React.createElement("aside", { className: "xl:w-[22rem] bg-white border-t xl:border-t-0 xl:border-l border-slate-200 p-6 space-y-6" }, /* @__PURE__ */ React.createElement(Panel, { title: "Subject snapshot", subtitle: "Live summary tied to the selected workbench subject." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-[1.75rem] bg-slate-950 text-white p-5" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-cyan-300" }, "Current subject"), /* @__PURE__ */ React.createElement("p", { className: "text-xl font-black mt-2" }, selectedSubject.subjectNumber), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-300 mt-1" }, selectedSubject.firstName, " ", selectedSubject.lastName)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-slate-200 p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Status"), /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900 mt-2" }, formatStatusLabel(selectedSubject.status))), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-slate-200 p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Next visit"), /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900 mt-2" }, selectedSubject.nextVisitDate)), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-slate-200 p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Released"), /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900 mt-2" }, "$", selectedSubject.stipendReleasedTotal)), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-slate-200 p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Pending payouts"), /* @__PURE__ */ React.createElement("p", { className: "font-black text-slate-900 mt-2" }, selectedSubject.pendingPayouts))))), /* @__PURE__ */ React.createElement(Panel, { title: "Action queue", subtitle: "Fast-glance blockers for the selected subject." }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-slate-200 p-4 flex items-start gap-3" }, /* @__PURE__ */ React.createElement(BellRing, { size: 18, className: "text-amber-500 mt-0.5" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900" }, "Visit readiness"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, selectedSubject.nextVisitLabel, " is next in line."))), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-slate-200 p-4 flex items-start gap-3" }, /* @__PURE__ */ React.createElement(FileSignature, { size: 18, className: "text-slate-700 mt-0.5" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900" }, "Signature queue"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, selectedSubject.edocs.filter((doc) => doc.status === "Pending signature").length, " pending document(s)."))), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl border border-slate-200 p-4 flex items-start gap-3" }, /* @__PURE__ */ React.createElement(Wallet, { size: 18, className: "text-emerald-600 mt-0.5" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900" }, "Payouts"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, selectedSubject.visits.filter((visit) => visit.stipendStatus === "Ready").length, " stipend(s) ready to release."))))))), previewDocument ? /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-cyan-600" }, "TYFYS eDocs Preview"), /* @__PURE__ */ React.createElement("h3", { className: "mt-2 text-2xl font-black text-slate-900" }, previewDocument.name), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-slate-500" }, selectedSubject.subjectNumber, " \xB7 ", selectedSubject.firstName, " ", selectedSubject.lastName)), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setRedactionDraft("");
          setDocumentPreviewId(null);
        },
        className: "rounded-2xl border border-slate-200 p-3 text-slate-500 transition hover:border-slate-300 hover:text-slate-900",
        "aria-label": "Close document preview"
      },
      /* @__PURE__ */ React.createElement(X, { size: 18 })
    )), /* @__PURE__ */ React.createElement("div", { className: "max-h-[calc(90vh-112px)] overflow-y-auto bg-slate-50 p-5 md:p-8" }, /* @__PURE__ */ React.createElement("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid gap-4 md:grid-cols-2" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl bg-slate-50 p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Category"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-lg font-black text-slate-900" }, previewDocument.category)), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl bg-slate-50 p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Signature"), /* @__PURE__ */ React.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React.createElement(StatusPill, { value: previewDocument.signatureStatus }))), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl bg-slate-50 p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Packet status"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-lg font-black text-slate-900" }, previewDocument.status)), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl bg-slate-50 p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Expiration"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-lg font-black text-slate-900" }, previewDocument.expirationDate || "None"))), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl bg-slate-950 p-4 text-white" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-cyan-300" }, "Saved redactions"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-3xl font-black" }, previewRedactionTerms.length), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-slate-300" }, "Terms or phrases stored with this document.")), /* @__PURE__ */ React.createElement("div", { className: "rounded-2xl bg-slate-950 p-4 text-white" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-cyan-300" }, "Auto-blackout hits"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-3xl font-black" }, previewRedactionMatches), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-slate-300" }, "Case-insensitive matches across the preview."))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 grid gap-6 xl:grid-cols-[320px,minmax(0,1fr)]" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm h-fit" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Bulk redaction"), /* @__PURE__ */ React.createElement("h4", { className: "mt-2 text-xl font-black text-slate-900" }, "Auto blackout terms")), /* @__PURE__ */ React.createElement(FileText, { size: 20, className: "text-slate-400" })), /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-sm leading-relaxed text-slate-500" }, "Type one or more words, phrases, sentences, or names. Every matching occurrence in this document preview is blacked out in bulk and saved with the document."), /* @__PURE__ */ React.createElement("form", { onSubmit: applyDocumentRedactions, className: "mt-5 space-y-3" }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: redactionDraft,
        onChange: (event) => setRedactionDraft(event.target.value),
        placeholder: `Elizabeth Merrill
Merrill
annmerrill70@yahoo.com`,
        className: "w-full min-h-[150px] rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-full rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-black uppercase tracking-[0.16em] hover:bg-slate-800 transition"
      },
      "Redact all matches"
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Quick add"), /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex flex-wrap gap-2" }, [
      subjectDisplayName(selectedSubject),
      selectedSubject.firstName,
      selectedSubject.lastName,
      selectedSubject.email,
      selectedSubject.phone
    ].filter(Boolean).map((term) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: term,
        type: "button",
        onClick: () => appendTermsToDraft([term]),
        className: "rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-700 hover:border-slate-300"
      },
      term
    )))), /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => downloadRedactedDocument(previewDocument.id),
        disabled: !previewRedactionTerms.length,
        className: `flex-1 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${previewRedactionTerms.length ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`
      },
      "Download redacted copy"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: clearDocumentRedactions,
        disabled: !previewRedactionTerms.length,
        className: `rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition ${previewRedactionTerms.length ? "bg-white border border-slate-200 text-slate-700 hover:border-slate-400" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`
      },
      "Clear all"
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-5 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-4" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.16em] text-slate-400" }, "Active rules"), previewRedactionTerms.length ? /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex flex-wrap gap-2" }, previewRedactionTerms.map((term) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: term,
        type: "button",
        onClick: () => removeDocumentRedaction(term),
        className: "rounded-full bg-slate-900 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-white hover:bg-slate-800"
      },
      term,
      " \xD7"
    ))) : /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-sm text-slate-500" }, "No redaction rules saved yet."))), /* @__PURE__ */ React.createElement("div", { className: "rounded-[1.75rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, "Document body"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-slate-500" }, "Terms are matched case-insensitively across the full preview.")), /* @__PURE__ */ React.createElement("div", { className: "rounded-full bg-slate-950 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white" }, previewRedactionTerms.length, " active term(s)")), /* @__PURE__ */ React.createElement("div", { className: "mt-6 space-y-6" }, previewSections.map((section) => /* @__PURE__ */ React.createElement("section", { key: section.title, className: "rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-black uppercase tracking-[0.18em] text-slate-400" }, section.title), /* @__PURE__ */ React.createElement("div", { className: "mt-4 space-y-4" }, section.paragraphs.map((paragraph, index) => /* @__PURE__ */ React.createElement("p", { key: `${section.title}-${index}`, className: "text-sm leading-7 text-slate-700" }, renderRedactedText(paragraph, previewRedactionTerms)))))))))))) : null, /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-6 right-6 z-50 space-y-3" }, notifications.map((note) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: note.id,
        className: `rounded-2xl px-5 py-4 shadow-2xl text-sm font-black uppercase tracking-[0.16em] ${note.tone === "emerald" ? "bg-emerald-600 text-white" : note.tone === "amber" ? "bg-amber-400 text-slate-950" : "bg-slate-950 text-white"}`
      },
      note.message
    ))));
  }
  ReactDOM.createRoot(document.getElementById("clinic-root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
