export const TOOL_CAPABILITY_DEFINITIONS = {
  intake_portal: {
    title: "Records intake",
    status: "sync_pending",
    detail: "Uploads save in the app first and can sync to your TYFYS file when live delivery is available.",
    actionLabel: "Open Records Vault",
    actionView: "dossier"
  },
  dossier: {
    title: "Records Vault",
    status: "local_only",
    detail: "Records always stay saved on this device. TYFYS file delivery depends on your live account and upload sync.",
    actionLabel: "Go to Records Intake",
    actionView: "intake_portal"
  },
  doctor_portal: {
    title: "Care Team preview",
    status: "local_only",
    detail: "This board is a local coordination preview. Provider schedules and EHR integrations are not live synced here yet.",
    actionLabel: "Open local messages",
    actionView: "secure_comms"
  },
  secure_comms: {
    title: "Messages preview",
    status: "local_only",
    detail: "Messages in this view stay on this device for now. They do not deliver to TYFYS staff or providers yet.",
    actionLabel: "Open Care Team preview",
    actionView: "doctor_portal"
  },
  calculator: {
    title: "Calculator mode",
    status: "local_only",
    detail: "The calculator uses the conditions and household details saved in this app. It does not pull live VA claim data."
  },
  pact_explorer: {
    title: "Reference guide",
    status: "local_only",
    detail: "This guide is built into the app and links out to official VA sources. It does not sync your claim file automatically."
  },
  nexus_generator: {
    title: "Drafting mode",
    status: "local_only",
    detail: "Medical-opinion drafts stay in this app until you copy or export them. A licensed clinician still has to independently review and sign the final opinion."
  },
  strategy: {
    title: "Access and service setup",
    status: "sync_pending",
    detail: "Plan choices are saved in the app, and live activation depends on checkout or TYFYS follow-up."
  }
};

export function createToolCapability(viewId, overrides = {}) {
  const base = TOOL_CAPABILITY_DEFINITIONS[viewId] || {};
  return {
    viewId,
    title: overrides.title || base.title || "",
    status: overrides.status || base.status || "local_only",
    detail: overrides.detail || base.detail || "",
    actionLabel: overrides.actionLabel || base.actionLabel || "",
    actionView: overrides.actionView || base.actionView || ""
  };
}

export const DOCTOR_PORTAL_TEAM = [
  {
    id: "team-ops",
    kind: "ops",
    name: "TYFYS Support Team",
    title: "Care coordination desk",
    specialty: "Records review, scheduling follow-up, next-step planning",
    focus: ["Records follow-up", "Scheduling notes", "Status updates"],
    bio: "Keeps your records, questionnaires, and next-step reminders organized in this local planning workspace.",
    availability: "Monday to Friday, 9:00 AM to 6:00 PM ET",
    nextVisit: "Pending TYFYS follow-up",
    location: "TYFYS operations desk + remote coordinators",
    sync: "Tracks follow-up tasks and planning notes inside the app",
    threadId: "thread-ops",
    tag: "TYFYS Team"
  },
  {
    id: "hallett",
    kind: "provider",
    name: "General medical planning profile",
    title: "Provider planning profile",
    specialty: "Family medicine, DBQ prep, records review",
    focus: ["Musculoskeletal", "General medicine", "Readiness review"],
    bio: "Use this profile to track the type of records and prep notes a general medical reviewer may need once TYFYS confirms the real appointment path.",
    availability: "Tuesday and Thursday telehealth blocks",
    nextVisit: "Pending schedule",
    location: "Telehealth + Florida partner clinics",
    sync: "Planning notes only until a real provider path is confirmed",
    threadId: "thread-hallett",
    tag: "Provider planning"
  },
  {
    id: "warren",
    kind: "provider",
    name: "Behavioral health planning profile",
    title: "Behavioral health planning profile",
    specialty: "Psychiatry, PTSD, anxiety, sleep disruption",
    focus: ["Mental health DBQs", "PTSD narratives", "Medication review"],
    bio: "Use this profile to stage mental-health records and question lists before TYFYS confirms a behavioral health consult.",
    availability: "Monday and Wednesday late-afternoon sessions",
    nextVisit: "Pending schedule",
    location: "50-state telehealth availability",
    sync: "Planning notes only until a live provider is confirmed",
    threadId: "thread-behavioral",
    tag: "Provider planning"
  }
];

export const DOCTOR_PORTAL_VISITS = [
  {
    id: "visit-prep",
    time: "Pending TYFYS confirmation",
    title: "Records review planning note",
    owner: "TYFYS Support Team",
    mode: "Local coordination preview",
    summary: "Use this placeholder to track the first records-review milestone and the notes you want TYFYS to follow up on next."
  },
  {
    id: "visit-ortho",
    time: "Schedule after records review",
    title: "General medical prep slot",
    owner: "General medical planning profile",
    mode: "Provider planning",
    summary: "Use this placeholder to collect MRI reports, medication lists, and the facts you would want ready before a musculoskeletal review."
  },
  {
    id: "visit-psych",
    time: "Schedule after intake cleanup",
    title: "Behavioral health prep slot",
    owner: "Behavioral health planning profile",
    mode: "Provider planning",
    summary: "Use this placeholder to track PTSD and anxiety symptom history before TYFYS confirms a behavioral health appointment."
  }
];

export const DOCTOR_PORTAL_INTEGRATIONS = [
  {
    id: "athena",
    name: "athenahealth",
    category: "Doctor scheduling and records",
    audience: "Private clinics",
    sync: "Track follow-up requests",
    status: "Local template",
    description: "Use this local template when your civilian doctor may already use athenahealth and TYFYS needs to follow up manually."
  },
  {
    id: "simplepractice",
    name: "SimplePractice",
    category: "Counseling and telehealth",
    audience: "Therapists and psychiatry practices",
    sync: "Track follow-up requests",
    status: "Local template",
    description: "Use this local template when your mental health provider may use SimplePractice and TYFYS needs to confirm the real workflow."
  },
  {
    id: "drchrono",
    name: "DrChrono",
    category: "Doctor records",
    audience: "Independent practices",
    sync: "Track follow-up requests",
    status: "Local template",
    description: "Use this local template when a private clinic may manage appointments and chart notes in DrChrono."
  },
  {
    id: "ecw",
    name: "eClinicalWorks",
    category: "Clinic records",
    audience: "Larger clinics",
    sync: "Track follow-up requests",
    status: "Local template",
    description: "Use this local template for larger clinics that may need manual TYFYS coordination across locations."
  },
  {
    id: "nextgen",
    name: "NextGen Office",
    category: "Primary care and specialty records",
    audience: "Private doctors",
    sync: "Track follow-up requests",
    status: "Local template",
    description: "Use this local template when a private doctor may handle consult scheduling and follow-up through NextGen Office."
  },
  {
    id: "therapynotes",
    name: "TherapyNotes",
    category: "Mental health records",
    audience: "Psychologists and psychiatrists",
    sync: "Track follow-up requests",
    status: "Local template",
    description: "Use this local template when a behavioral health provider may use TherapyNotes for appointments and paperwork."
  },
  {
    id: "jane",
    name: "Jane",
    category: "Scheduling and reminders",
    audience: "Rehab and wellness clinics",
    sync: "Track follow-up requests",
    status: "Local template",
    description: "Use this local template if a rehab or specialty clinic may schedule through Jane."
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "Referral intake",
    audience: "Front-desk and referral teams",
    sync: "Track follow-up requests",
    status: "Local template",
    description: "Use this local template when a clinic may handle new-patient intake through a shared referral team."
  }
];

export const INITIAL_SECURE_THREADS = [
  {
    id: "thread-ops",
    title: "TYFYS Support Team",
    participants: "Scheduling, records, and next steps",
    status: "Local planning thread",
    responseTime: "Saves instantly on this device",
    unread: 0,
    lastTimestamp: "Preview ready",
    lastMessage: "Use this local thread to capture the next TYFYS follow-up you want to track.",
    autoReplySender: "TYFYS Support Team",
    messages: [
      {
        id: "thread-ops-1",
        sender: "TYFYS Support Team",
        time: "Preview",
        text: "Use this local thread to capture follow-up notes, records questions, or coordination requests you want TYFYS to handle next.",
        isCurrentUser: false
      }
    ]
  },
  {
    id: "thread-hallett",
    title: "General medical planning profile",
    participants: "Provider planning profile",
    status: "Local planning thread",
    responseTime: "Saves instantly on this device",
    unread: 0,
    lastTimestamp: "Preview ready",
    lastMessage: "Use this local thread to draft the questions and prep notes you want ready for a future review.",
    autoReplySender: "General medical planning profile",
    messages: [
      {
        id: "thread-hallett-1",
        sender: "General medical planning profile",
        time: "Preview",
        text: "Use this local thread to draft the questions and prep notes you want ready before TYFYS confirms a real provider path.",
        isCurrentUser: false
      }
    ]
  },
  {
    id: "thread-behavioral",
    title: "Behavioral health planning profile",
    participants: "Behavioral health planning profile",
    status: "Local planning thread",
    responseTime: "Saves instantly on this device",
    unread: 0,
    lastTimestamp: "Preview ready",
    lastMessage: "Use this local thread to collect the PTSD and anxiety details you do not want to forget later.",
    autoReplySender: "Behavioral health planning profile",
    messages: [
      {
        id: "thread-behavioral-1",
        sender: "TYFYS Support Team",
        time: "Preview",
        text: "Use this shared local thread to collect behavioral-health questions, records, and symptom notes before TYFYS confirms the real consult path.",
        isCurrentUser: false
      }
    ]
  }
];

export const SECURE_THREAD_AUTO_REPLIES = {
  "thread-ops":
    "This local TYFYS planning note was saved on your device. Use it to track the next follow-up you want to request.",
  "thread-hallett":
    "This local provider-planning note was saved on your device so you can keep the future prep checklist together.",
  "thread-behavioral":
    "This local behavioral-health planning note was saved on your device so the future consult details stay in one place."
};
