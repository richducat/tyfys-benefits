const React = window.React;
const ReactDOM = window.ReactDOM;
const { useState, useEffect, useRef } = React;

const PAYMENT_STATE_KEY = "tyfys.paymentState";
const LEAD_PREFILL_KEY = "tyfys.leadPrefill";
const CHECKOUT_PENDING_KEY = "tyfys.checkoutPending";
const HAS_STARTED_KEY = "tyfys.hasStarted";
const ZOHO_LEAD_ID_KEY = "tyfys.zohoLeadId";
const DOSSIER_STORAGE_KEY = "tyfys.dossier";
const DEFAULT_PAYMENT_STATE = {
  completed: false,
  planName: "",
  paidAt: ""
};

const VA_COMPENSATION_SOURCE_URL = "https://www.va.gov/disability/compensation-rates/veteran-rates/";
const BURN_PIT_SOURCE_URL =
  "https://www.va.gov/disability/eligibility/hazardous-materials-exposure/specific-environmental-hazards/";
const AGENT_ORANGE_SOURCE_URL =
  "https://www.va.gov/disability/eligibility/hazardous-materials-exposure/agent-orange";
const PACT_SOURCE_URL = "https://www.publichealth.va.gov/exposures/benefits/PACT_Act.asp";
const RADIATION_SOURCE_URL = "https://www.publichealth.va.gov/exposures/radiation/diseases.asp";
const CAMP_LEJEUNE_SOURCE_URL =
  "https://www.va.gov/disability/eligibility/hazardous-materials-exposure/camp-lejeune-water-contamination";
const RATING_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const CLAIM_RATING_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const SCAN_STAGES = ["Aligning page edges", "Enhancing contrast", "Running OCR simulation", "Saving to Dossier"];

const loadPaymentState = () => {
  try {
    const raw = window.localStorage.getItem(PAYMENT_STATE_KEY);
    if (!raw) return DEFAULT_PAYMENT_STATE;
    const parsed = JSON.parse(raw);
    return {
      completed: Boolean(parsed?.completed),
      planName: parsed?.planName || "",
      paidAt: parsed?.paidAt || ""
    };
  } catch (error) {
    return DEFAULT_PAYMENT_STATE;
  }
};

const savePaymentState = (state) => {
  try {
    window.localStorage.setItem(PAYMENT_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const loadCheckoutPending = () => {
  try {
    const raw = window.localStorage.getItem(CHECKOUT_PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    return null;
  }
};

const saveCheckoutPending = (state) => {
  try {
    window.localStorage.setItem(CHECKOUT_PENDING_KEY, JSON.stringify(state));
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const clearCheckoutPending = () => {
  try {
    window.localStorage.removeItem(CHECKOUT_PENDING_KEY);
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const loadHasStarted = () => {
  try {
    return window.sessionStorage.getItem(HAS_STARTED_KEY) === "1";
  } catch (error) {
    return false;
  }
};

const saveHasStarted = () => {
  try {
    window.sessionStorage.setItem(HAS_STARTED_KEY, "1");
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const loadZohoLeadId = () => {
  try {
    return window.localStorage.getItem(ZOHO_LEAD_ID_KEY) || "";
  } catch (error) {
    return "";
  }
};

const saveZohoLeadId = (leadId) => {
  try {
    const value = String(leadId || "").trim();
    if (value) window.localStorage.setItem(ZOHO_LEAD_ID_KEY, value);
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const mergeZohoProfile = (currentProfile, zohoProfile) => {
  const current = currentProfile || {};
  const incoming = zohoProfile || {};
  return {
    ...current,
    firstName: incoming.firstName || current.firstName || "",
    lastName: incoming.lastName || current.lastName || "",
    email: incoming.email || current.email || "",
    phone: incoming.phone || current.phone || "",
    zip: incoming.zip || current.zip || ""
  };
};

const planNameFromCode = (planCode) => {
  const normalized = String(planCode || "").toLowerCase();
  if (normalized === "250_monthly" || normalized === "pro_monthly") return "Premium Membership";
  if (normalized === "35_monthly" || normalized === "lite_monthly") return "Starter Membership";
  if (normalized === "250_yearly_special" || normalized === "special_yearly") return "Premium Annual";
  return "";
};

const mapLeadCategories = (conditions) => {
  const conditionMap = {
    ptsd: "Mental Health",
    musculoskeletal: "Musculoskeletal (Ortho)",
    hearing: "Hearing",
    sleep: "Sleep & Respiratory"
  };

  const input = Array.isArray(conditions) ? conditions : [];
  return [...new Set(input.map((item) => conditionMap[item]).filter(Boolean))];
};

const loadLeadPrefill = () => {
  try {
    const raw = window.localStorage.getItem(LEAD_PREFILL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    return null;
  }
};

const clearLeadPrefill = () => {
  try {
    window.localStorage.removeItem(LEAD_PREFILL_KEY);
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const mapLeadPrefillToProfile = (leadPrefill) => {
  if (!leadPrefill || typeof leadPrefill !== "object") return {};

  return {
    firstName: leadPrefill.firstName || "",
    lastName: leadPrefill.lastName || "",
    email: leadPrefill.email || "",
    phone: leadPrefill.phone || "",
    zip: leadPrefill.zip || "",
    rating: Number(leadPrefill.rating || 0),
    pain_categories: mapLeadCategories(leadPrefill.conditions),
    privateOrg: Boolean(leadPrefill.privateOrg),
    terms: Boolean(leadPrefill.terms)
  };
};

const loadDossier = () => {
  try {
    const raw = window.localStorage.getItem(DOSSIER_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const saveDossier = (items) => {
  try {
    window.localStorage.setItem(DOSSIER_STORAGE_KEY, JSON.stringify(Array.isArray(items) ? items : []));
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const createLocalId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const hasLiveAppApi = () => {
  const hostname = String(window.location.hostname || "").toLowerCase();
  if (!hostname) return false;
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.endsWith(".vercel.app") || hostname.endsWith(".vercel-dns.com")) return true;
  if (hostname === "tyfys.net" || hostname === "www.tyfys.net" || hostname.endsWith(".github.io")) return false;
  return true;
};

// --- ICONS ---
// Fix: Added ...props to allow size/onClick/etc to pass through
const IconWrapper = ({ children, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

const Icons = {
  Send: (p) => (
    <IconWrapper {...p}>
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </IconWrapper>
  ),
  MessageSquare: (p) => (
    <IconWrapper {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </IconWrapper>
  ),
  Calculator: (p) => (
    <IconWrapper {...p}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="8" y1="6" x2="16" y2="6"></line>
      <line x1="16" y1="14" x2="16" y2="18"></line>
      <path d="M16 10h.01"></path>
      <path d="M12 10h.01"></path>
      <path d="M8 10h.01"></path>
      <path d="M12 14h.01"></path>
      <path d="M8 14h.01"></path>
      <path d="M12 18h.01"></path>
      <path d="M8 18h.01"></path>
    </IconWrapper>
  ),
  ShieldCheck: (p) => (
    <IconWrapper {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </IconWrapper>
  ),
  DollarSign: (p) => (
    <IconWrapper {...p}>
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </IconWrapper>
  ),
  User: (p) => (
    <IconWrapper {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </IconWrapper>
  ),
  FileText: (p) => (
    <IconWrapper {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </IconWrapper>
  ),
  CheckCircle: (p) => (
    <IconWrapper {...p}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </IconWrapper>
  ),
  Info: (p) => (
    <IconWrapper {...p}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </IconWrapper>
  ),
  X: (p) => (
    <IconWrapper {...p}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </IconWrapper>
  ),
  AlertTriangle: (p) => (
    <IconWrapper {...p}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </IconWrapper>
  ),
  FileUp: (p) => (
    <IconWrapper {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M12 18v-6"></path>
      <path d="m9 15 3-3 3 3"></path>
    </IconWrapper>
  ),
  ChevronRight: (p) => (
    <IconWrapper {...p}>
      <polyline points="9 18 15 12 9 6"></polyline>
    </IconWrapper>
  ),
  ChevronLeft: (p) => (
    <IconWrapper {...p}>
      <polyline points="15 18 9 12 15 6"></polyline>
    </IconWrapper>
  ),
  HelpCircle: (p) => (
    <IconWrapper {...p}>
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </IconWrapper>
  ),
  Archive: (p) => (
    <IconWrapper {...p}>
      <polyline points="21 8 21 21 3 21 3 8"></polyline>
      <rect x="1" y="3" width="22" height="5"></rect>
      <line x1="10" y1="12" x2="14" y2="12"></line>
    </IconWrapper>
  ),
  Stethoscope: (p) => (
    <IconWrapper {...p}>
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
      <circle cx="20" cy="10" r="2"></circle>
    </IconWrapper>
  ),
  Users: (p) => (
    <IconWrapper {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </IconWrapper>
  ),
  Home: (p) => (
    <IconWrapper {...p}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </IconWrapper>
  ),
  TrendingUp: (p) => (
    <IconWrapper {...p}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </IconWrapper>
  ),
  Lock: (p) => (
    <IconWrapper {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </IconWrapper>
  ),
  Calendar: (p) => (
    <IconWrapper {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </IconWrapper>
  ),
  Mail: (p) => (
    <IconWrapper {...p}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </IconWrapper>
  ),
  Database: (p) => (
    <IconWrapper {...p}>
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </IconWrapper>
  ),
  Printer: (p) => (
    <IconWrapper {...p}>
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </IconWrapper>
  ),
  Menu: (p) => (
    <IconWrapper {...p}>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </IconWrapper>
  ),
  Check: (p) => (
    <IconWrapper {...p}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </IconWrapper>
  ),
  Plus: (p) => (
    <IconWrapper {...p}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </IconWrapper>
  ),
  Trash: (p) => (
    <IconWrapper {...p}>
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </IconWrapper>
  ),
  Bot: (p) => (
    <IconWrapper {...p}>
      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
      <circle cx="12" cy="5" r="2"></circle>
      <path d="M12 7v4"></path>
      <line x1="8" y1="16" x2="8" y2="16"></line>
      <line x1="16" y1="16" x2="16" y2="16"></line>
    </IconWrapper>
  ),
  Map: (p) => (
    <IconWrapper {...p}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </IconWrapper>
  ),
  BarChart: (p) => (
    <IconWrapper {...p}>
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </IconWrapper>
  ),
  Clock: (p) => (
    <IconWrapper {...p}>
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </IconWrapper>
  ),
  Star: (p) => (
    <IconWrapper {...p}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </IconWrapper>
  ),
  Zap: (p) => (
    <IconWrapper {...p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </IconWrapper>
  ),
  Activity: (p) => (
    <IconWrapper {...p}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </IconWrapper>
  ),
  BookOpen: (p) => (
    <IconWrapper {...p}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </IconWrapper>
  ),
  ArrowRight: (p) => (
    <IconWrapper {...p}>
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </IconWrapper>
  ),
  Edit: (p) => (
    <IconWrapper {...p}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </IconWrapper>
  ),
  Quote: (p) => (
    <IconWrapper {...p}>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
    </IconWrapper>
  ),
  Play: (p) => (
    <IconWrapper {...p}>
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </IconWrapper>
  ),
  LockSmall: (p) => (
    <IconWrapper {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </IconWrapper>
  )
};

// --- DATA CONSTANTS ---
const DISABILITY_DATA = {
  "Mental Health": [
    {
      name: "PTSD",
      dbq: "PTSD DBQ (21-0960P-2)",
      docs: ["Stressors Statement (21-0781)", "Private Psychologist Nexus"],
      specialist: "Psychologist/Psychiatrist"
    },
    {
      name: "Major Depressive Disorder",
      dbq: "Mental Disorders DBQ",
      docs: ["Private Nexus Letter", "Buddy Statements"],
      specialist: "Psychologist"
    },
    {
      name: "Anxiety Condition",
      dbq: "Mental Disorders DBQ",
      docs: ["Private Nexus Letter", "Employment Impact Statement"],
      specialist: "Psychologist"
    }
  ],
  "Headaches & Neuro": [
    {
      name: "Migraines",
      dbq: "Headaches DBQ",
      docs: ["Headache Log (6 Months)", "Nexus Letter (Neurologist)"],
      specialist: "Neurologist"
    },
    {
      name: "Peripheral Neuropathy",
      dbq: "Peripheral Nerves DBQ",
      docs: ["EMG Results", "Nexus Letter"],
      specialist: "Neurologist"
    },
    {
      name: "TBI Residuals",
      dbq: "TBI DBQ",
      docs: ["Initial Incident Report", "Cognitive Assessment"],
      specialist: "Neurologist"
    }
  ],
  "Musculoskeletal (Ortho)": [
    {
      name: "Lumbosacral (Back) Strain",
      dbq: "Back DBQ",
      docs: ["MRI/X-Ray Report", "Range of Motion Test (Private)"],
      specialist: "Orthopedic/Physio"
    },
    {
      name: "Cervical (Neck) Strain",
      dbq: "Neck DBQ",
      docs: ["MRI/X-Ray Report", "Nexus Letter"],
      specialist: "Orthopedic/Physio"
    },
    {
      name: "Knee Strain/Pain",
      dbq: "Knee & Lower Leg DBQ",
      docs: ["Instability Statement", "Nexus Letter"],
      specialist: "Orthopedic"
    },
    {
      name: "Plantar Fasciitis",
      dbq: "Foot Conditions DBQ",
      docs: ["Podiatrist Assessment", "Custom Orthotics Receipt"],
      specialist: "Podiatrist"
    }
  ],
  "Sleep & Respiratory": [
    {
      name: "Sleep Apnea",
      dbq: "Sleep Apnea DBQ",
      docs: ["Sleep Study (Polysomnogram)", "CPAP Prescription", "Nexus Letter (Pulmonologist)"],
      specialist: "Pulmonologist/Sleep Specialist"
    },
    {
      name: "Asthma",
      dbq: "Respiratory Conditions DBQ",
      docs: ["PFT (Pulmonary Function Test)", "Nexus Letter"],
      specialist: "Pulmonologist"
    },
    {
      name: "Sinusitis/Rhinitis",
      dbq: "Sinusitis DBQ",
      docs: ["CT Scan", "ENT Specialist Nexus"],
      specialist: "ENT Specialist"
    }
  ],
  Hearing: [
    {
      name: "Tinnitus",
      dbq: "Hearing Loss & Tinnitus DBQ",
      docs: ["Audiogram", "MOS Noise Exposure List", "Nexus Letter"],
      specialist: "Audiologist"
    },
    {
      name: "Hearing Loss",
      dbq: "Hearing Loss & Tinnitus DBQ",
      docs: ["Audiogram", "Nexus Letter"],
      specialist: "Audiologist"
    }
  ],
  Digestive: [
    {
      name: "GERD",
      dbq: "Esophageal Conditions DBQ",
      docs: ["Endoscopy Report", "Nexus Letter (Gastro)"],
      specialist: "Gastroenterologist"
    },
    {
      name: "IBS",
      dbq: "Intestinal Conditions DBQ",
      docs: ["Symptom Log", "Nexus Letter"],
      specialist: "Gastroenterologist"
    }
  ]
};

const ALL_CONDITIONS = Object.values(DISABILITY_DATA).flat();
const CONDITION_OPTIONS = [...new Set(ALL_CONDITIONS.map((item) => item.name))];
const DOSSIER_TYPE_OPTIONS = [
  "DBQ",
  "Nexus Letter",
  "Private Medical Record",
  "Imaging",
  "Service Record",
  "Lay Statement",
  "Toxic Exposure Evidence",
  "Other"
];
const DOSSIER_SOURCE_OPTIONS = [
  "Phone capture",
  "VA Blue Button",
  "Private doctor",
  "Specialist office",
  "Service treatment record",
  "Buddy or spouse statement",
  "Manual note"
];
const NEXUS_LINK_TYPES = [
  { id: "direct", label: "Direct service connection" },
  { id: "secondary", label: "Secondary to another condition" },
  { id: "aggravation", label: "Aggravation opinion" },
  { id: "toxic", label: "PACT / toxic exposure" }
];

const PACT_TRACKS = {
  vietnam: {
    id: "vietnam",
    title: "Vietnam and herbicide exposure",
    tag: "Agent Orange",
    summary:
      "Use this track if your service included Vietnam or another herbicide location that VA now treats as presumptive.",
    serviceWindows: [
      "Republic of Vietnam, Jan. 9, 1962 to May 7, 1975",
      "Thailand on base, Jan. 9, 1962 to June 30, 1976",
      "Laos, Dec. 1, 1965 to Sept. 30, 1969",
      "Cambodia at Mimot or Krek, Apr. 16 to Apr. 30, 1969",
      "Guam or American Samoa, Jan. 9, 1962 to July 31, 1980",
      "Johnston Atoll, Jan. 1, 1972 to Sept. 30, 1977"
    ],
    notes: [
      "PACT expanded several herbicide presumptive locations beyond boots-on-ground Vietnam.",
      "Korean DMZ exposure is location-specific and usually fits better as a service-location review than an era-only match."
    ],
    conditions: [
      "AL amyloidosis",
      "Bladder cancer",
      "Chronic B-cell leukemia",
      "Chloracne or similar acneform disease",
      "Diabetes mellitus type 2",
      "Hodgkin's disease",
      "Hypertension",
      "Hypothyroidism",
      "Ischemic heart disease",
      "MGUS",
      "Multiple myeloma",
      "Non-Hodgkin's lymphoma",
      "Parkinson's disease",
      "Parkinsonism",
      "Peripheral neuropathy, early onset",
      "Porphyria cutanea tarda",
      "Prostate cancer",
      "Respiratory cancers",
      "Soft tissue sarcoma"
    ],
    sourceUrl: AGENT_ORANGE_SOURCE_URL
  },
  gulf_war: {
    id: "gulf_war",
    title: "Gulf War and Southwest Asia exposures",
    tag: "PACT + Gulf War",
    summary:
      "Use this track for Southwest Asia service after Aug. 2, 1990, including burn pits, fine particulate matter, and Gulf War illness pathways.",
    serviceWindows: [
      "On or after Aug. 2, 1990 in Bahrain, Iraq, Kuwait, Oman, Qatar, Saudi Arabia, Somalia, the UAE, or the airspace above them",
      "On or after Sept. 19, 2001 in Afghanistan, Djibouti, Egypt, Jordan, Lebanon, Syria, Uzbekistan, Yemen, or the airspace above them",
      "Includes the Gulf of Aden, Gulf of Oman, Persian Gulf, Arabian Sea, and Red Sea"
    ],
    notes: [
      "PACT added cancer and respiratory presumptives tied to burn pits and other airborne hazards.",
      "VA also keeps Gulf War presumptives for chronic fatigue syndrome, fibromyalgia, and functional GI disorders."
    ],
    conditions: [
      "Asthma",
      "Brain cancer",
      "Chronic bronchitis",
      "Chronic obstructive pulmonary disease (COPD)",
      "Chronic rhinitis",
      "Chronic sinusitis",
      "Constrictive bronchiolitis or obliterative bronchiolitis",
      "Emphysema",
      "Fibromyalgia",
      "Functional gastrointestinal disorders",
      "Gastrointestinal cancer of any type",
      "Glioblastoma",
      "Granulomatous disease",
      "Head cancer of any type",
      "Interstitial lung disease (ILD)",
      "Kidney cancer",
      "Lymphatic cancer of any type",
      "Lymphoma of any type",
      "Melanoma",
      "Multiple myeloma",
      "Myelodysplastic syndromes",
      "Myelofibrosis",
      "Neck cancer of any type",
      "Pancreatic cancer",
      "Pleuritis",
      "Pulmonary fibrosis",
      "Reproductive cancer of any type",
      "Respiratory cancer of any type",
      "Sarcoidosis",
      "Urinary bladder, ureter, and related genitourinary cancers",
      "Chronic fatigue syndrome"
    ],
    sourceUrl: BURN_PIT_SOURCE_URL
  },
  post_911: {
    id: "post_911",
    title: "Post-9/11 burn pits and airborne hazards",
    tag: "Burn pits",
    summary:
      "Best fit for Afghanistan-era and adjacent deployments where airborne hazards are the main presumptive path.",
    serviceWindows: [
      "On or after Sept. 11, 2001 in Afghanistan, Djibouti, Egypt, Jordan, Lebanon, Syria, Uzbekistan, Yemen, or their airspace",
      "Also applies to qualifying seas, including the Gulf of Aden, Gulf of Oman, Arabian Sea, Red Sea, and Persian Gulf"
    ],
    notes: [
      "This is the narrowest, most modern PACT track and is usually the right starting point for post-9/11 veterans.",
      "If deployment was earlier Southwest Asia service, compare this track with the broader Gulf War track."
    ],
    conditions: [
      "Asthma",
      "Brain cancer",
      "Chronic bronchitis",
      "Chronic obstructive pulmonary disease (COPD)",
      "Chronic rhinitis",
      "Chronic sinusitis",
      "Constrictive bronchiolitis or obliterative bronchiolitis",
      "Emphysema",
      "Gastrointestinal cancer of any type",
      "Glioblastoma",
      "Granulomatous disease",
      "Head cancer of any type",
      "Interstitial lung disease (ILD)",
      "Kidney cancer",
      "Lymphatic cancer of any type",
      "Lymphoma of any type",
      "Melanoma",
      "Multiple myeloma",
      "Myelodysplastic syndromes",
      "Myelofibrosis",
      "Neck cancer of any type",
      "Pancreatic cancer",
      "Pleuritis",
      "Pulmonary fibrosis",
      "Reproductive cancer of any type",
      "Respiratory cancer of any type",
      "Sarcoidosis",
      "Urinary bladder, ureter, and related genitourinary cancers"
    ],
    sourceUrl: BURN_PIT_SOURCE_URL
  },
  radiation: {
    id: "radiation",
    title: "Radiation response and nuclear cleanup",
    tag: "Ionizing radiation",
    summary:
      "Use this track for radiation-risk activity, cleanup duty, or nuclear response missions that VA recognizes as presumptive.",
    serviceWindows: [
      "Cleanup of Enewetak Atoll, Jan. 1, 1977 to Dec. 31, 1980",
      "Response to Palomares, Spain, Jan. 17, 1966 to Mar. 31, 1967",
      "Response to Thule, Greenland, Jan. 21, 1968 to Sept. 25, 1968",
      "Any documented radiation-risk activity recognized by VA"
    ],
    notes: [
      "This track matters most for Korea-era and peacetime veterans when PACT is not otherwise era-driven.",
      "Many radiation claims hinge on the mission, location, and official duty records more than the broad era label."
    ],
    conditions: [
      "Bile duct cancer",
      "Bone cancer",
      "Brain cancer",
      "Breast cancer",
      "Colon cancer",
      "Esophageal cancer",
      "Gall bladder cancer",
      "Leukemia (except chronic lymphocytic leukemia)",
      "Liver cancer",
      "Lung cancer",
      "Multiple myeloma",
      "Ovarian cancer",
      "Pancreatic cancer",
      "Pharynx cancer",
      "Salivary gland cancer",
      "Small intestine cancer",
      "Stomach cancer",
      "Thyroid cancer",
      "Urinary tract cancer"
    ],
    sourceUrl: RADIATION_SOURCE_URL
  },
  camp_lejeune: {
    id: "camp_lejeune",
    title: "Camp Lejeune water contamination",
    tag: "Location-based",
    summary:
      "Use this for qualifying service at Camp Lejeune or MCAS New River from Aug. 1, 1953 to Dec. 31, 1987.",
    serviceWindows: [
      "At least 30 cumulative days at Camp Lejeune or MCAS New River",
      "Service between Aug. 1, 1953 and Dec. 31, 1987"
    ],
    notes: [
      "This is not strictly PACT-specific, but it is one of the most important exposure presumptive paths for peacetime veterans.",
      "If your era does not map cleanly to PACT, this location-based review can still be decisive."
    ],
    conditions: [
      "Adult leukemia",
      "Aplastic anemia and other myelodysplastic syndromes",
      "Bladder cancer",
      "Kidney cancer",
      "Liver cancer",
      "Multiple myeloma",
      "Non-Hodgkin's lymphoma",
      "Parkinson's disease"
    ],
    sourceUrl: CAMP_LEJEUNE_SOURCE_URL
  }
};

const PACT_ERA_CONFIG = {
  Vietnam: {
    intro: "Vietnam-era service usually starts with herbicide presumptives and PACT-expanded herbicide locations.",
    recommendedTracks: ["vietnam"]
  },
  "Gulf War": {
    intro: "Gulf War service most often maps to Southwest Asia toxic exposure and Gulf War illness presumptives.",
    recommendedTracks: ["gulf_war"]
  },
  "Post-9/11": {
    intro: "Post-9/11 service usually starts with burn pits, airborne hazards, and modern deployment locations.",
    recommendedTracks: ["post_911", "gulf_war"]
  },
  Korea: {
    intro:
      "Korea-era cases are often location-specific. Radiation response paths are the clearest fit, and Korean DMZ herbicide cases need an exact duty-location check.",
    recommendedTracks: ["radiation", "vietnam"]
  },
  Peacetime: {
    intro:
      "Peacetime exposure cases are usually driven by specific locations or missions, especially Camp Lejeune and radiation cleanup duty.",
    recommendedTracks: ["camp_lejeune", "radiation"]
  }
};

const PAY_TABLE_2026 = {
  10: { base: 180.42 },
  20: { base: 356.66 },
  30: { alone: 552.47, spouse: 617.47, childOnly: 596.47, childSpouse: 666.47, additionalChild: 32.0 },
  40: { alone: 795.84, spouse: 882.84, childOnly: 853.84, childSpouse: 947.84, additionalChild: 43.0 },
  50: { alone: 1132.9, spouse: 1241.9, childOnly: 1205.9, childSpouse: 1322.9, additionalChild: 54.0 },
  60: { alone: 1435.02, spouse: 1566.02, childOnly: 1523.02, childSpouse: 1663.02, additionalChild: 65.0 },
  70: { alone: 1808.45, spouse: 1961.45, childOnly: 1910.45, childSpouse: 2074.45, additionalChild: 76.0 },
  80: { alone: 2102.15, spouse: 2277.15, childOnly: 2219.15, childSpouse: 2406.15, additionalChild: 87.0 },
  90: { alone: 2362.3, spouse: 2559.3, childOnly: 2494.3, childSpouse: 2704.3, additionalChild: 98.0 },
  100: { alone: 3938.58, spouse: 4158.17, childOnly: 4085.43, childSpouse: 4318.99, additionalChild: 109.11 }
};

const findConditionData = (conditionName) => ALL_CONDITIONS.find((item) => item.name === conditionName);

const getDefaultPactTrackForEra = (era) => {
  const config = PACT_ERA_CONFIG[era];
  return config?.recommendedTracks?.[0] || "post_911";
};

const formatDateTime = (value) => {
  if (!value) return "Not saved yet";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
};

const formatFileSize = (bytes) => {
  const numeric = Number(bytes || 0);
  if (!numeric) return "No file attached";
  if (numeric >= 1024 * 1024) return `${(numeric / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(numeric / 1024))} KB`;
};

const calculatePay = (rating, hasSpouse, children) => {
  const normalizedRating = Number(rating || 0);
  const childTotal = Math.max(0, Number(children || 0));
  const rate = PAY_TABLE_2026[normalizedRating];
  if (!rate) return 0;
  if (normalizedRating < 30) return rate.base || 0;

  let total;
  if (hasSpouse && childTotal > 0) total = rate.childSpouse;
  else if (hasSpouse) total = rate.spouse;
  else if (childTotal > 0) total = rate.childOnly;
  else total = rate.alone;

  if (childTotal > 1) total += (childTotal - 1) * rate.additionalChild;
  return total;
};

const calculateCombinedRatingDetailed = (currentRating, newDisabilities) => {
  let combined = Math.max(0, Number(currentRating || 0));
  const sortedNew = [...(newDisabilities || [])]
    .map((rating) => Number(rating || 0))
    .filter((rating) => rating > 0)
    .sort((a, b) => b - a);
  const steps = [];

  for (let i = 0; i < sortedNew.length; i += 1) {
    const next = sortedNew[i];
    const beforeCombined = combined;
    const remainingEfficiency = 100 - beforeCombined;
    const exactIncrease = (remainingEfficiency * next) / 100;
    const exactCombined = beforeCombined + exactIncrease;
    const roundedCombined = Math.round(exactCombined);

    steps.push({
      id: `${next}-${i}`,
      rating: next,
      beforeCombined,
      remainingEfficiency,
      exactIncrease,
      exactCombined,
      roundedCombined
    });

    combined = roundedCombined;
  }

  const finalCombined = Math.min(Math.round(combined / 10) * 10, 100);
  return {
    rawCombined: combined,
    finalCombined,
    steps
  };
};

const calculateCombinedRating = (currentRating, newDisabilities) =>
  calculateCombinedRatingDetailed(currentRating, newDisabilities).finalCombined;

const getPathTo100Guide = (startingRating, newDisabilities) => {
  const detail = calculateCombinedRatingDetailed(startingRating, newDisabilities);
  const currentCombined = detail.finalCombined;
  if (currentCombined >= 100) {
    return {
      currentCombined,
      neededRawPoints: 0,
      singleStep: null,
      doubleStep: null
    };
  }

  let singleStep = null;
  let doubleStep = null;
  for (let i = 0; i < CLAIM_RATING_OPTIONS.length; i += 1) {
    const one = CLAIM_RATING_OPTIONS[i];
    if (calculateCombinedRating(currentCombined, [one]) === 100) {
      singleStep = [one];
      break;
    }
  }

  const findBestPair = (ratingOptions) => {
    let bestPair = null;
    for (let i = 0; i < ratingOptions.length; i += 1) {
      for (let j = i; j < ratingOptions.length; j += 1) {
        const pair = [ratingOptions[i], ratingOptions[j]];
        if (calculateCombinedRating(currentCombined, pair) !== 100) continue;
        if (!bestPair) {
          bestPair = pair;
          continue;
        }
        const pairScore = pair[0] + pair[1];
        const bestScore = bestPair[0] + bestPair[1];
        const pairPeak = Math.max(...pair);
        const bestPeak = Math.max(...bestPair);
        if (pairScore < bestScore || (pairScore === bestScore && pairPeak < bestPeak)) {
          bestPair = pair;
        }
      }
    }
    return bestPair;
  };

  doubleStep = findBestPair(CLAIM_RATING_OPTIONS.filter((rating) => rating < 100));
  if (!doubleStep) {
    doubleStep = findBestPair(CLAIM_RATING_OPTIONS);
  }

  return {
    currentCombined,
    neededRawPoints: Math.max(0, 95 - detail.rawCombined),
    singleStep,
    doubleStep
  };
};

const buildSimulatedOcr = ({ title, type, condition, source, notes, fileName }) => {
  const matchedCondition = findConditionData(condition);
  const evidenceHints = matchedCondition?.docs?.slice(0, 3) || ["Functional loss", "Treatment history", "Lay evidence"];
  const label = title || fileName || type || "Untitled capture";
  const noteLine = notes ? `Analyst notes: ${notes}` : "Analyst notes: no manual note added during capture.";

  return [
    `Document detected: ${label}`,
    `Document type: ${type || "General evidence"}`,
    `Condition cues: ${condition || "General claim support"}`,
    `Source: ${source || "Manual note"}`,
    `Likely evidence markers: ${evidenceHints.join(", ")}`,
    noteLine
  ].join("\n");
};

const createDossierEntry = (payload) => {
  const confidence = 90 + Math.floor(Math.random() * 9);
  return {
    id: createLocalId("dossier"),
    title: payload.title || payload.fileName || `${payload.type || "Evidence"} capture`,
    condition: payload.condition || "",
    type: payload.type || "Other",
    source: payload.source || "Manual note",
    fileName: payload.fileName || "",
    fileSize: payload.fileSize || 0,
    notes: payload.notes || "",
    confidence,
    ocrText: buildSimulatedOcr(payload),
    capturedAt: new Date().toISOString(),
    status: confidence >= 95 ? "Ready for review" : "Needs quick human check"
  };
};

const buildNexusDraft = (form, dossierItems) => {
  const veteranName = form.veteranName || "[Veteran name]";
  const condition = form.condition || "[claimed condition]";
  const primaryCondition = form.primaryCondition || "[service-connected condition]";
  const exposureTrack =
    form.linkType === "toxic" && form.exposureTrack
      ? PACT_TRACKS[form.exposureTrack]?.title || form.exposureTrack
      : "[qualifying exposure history]";
  const reviewedItems = dossierItems.length
    ? dossierItems.map((item) => `- ${item.title} (${item.type}, saved ${formatDateTime(item.capturedAt)})`).join("\n")
    : "- Service treatment records\n- Post-service treatment records\n- Veteran lay statement";
  const customRecords = form.recordsReviewed
    ? `${reviewedItems}\n- ${form.recordsReviewed.split("\n").filter(Boolean).join("\n- ")}`
    : reviewedItems;

  let opinionStatement =
    `It is at least as likely as not (50% or greater probability) that ${condition} began during, was caused by, or is otherwise related to military service.`;
  if (form.linkType === "secondary") {
    opinionStatement = `It is at least as likely as not (50% or greater probability) that ${condition} is caused or aggravated by the Veteran's service-connected ${primaryCondition}.`;
  } else if (form.linkType === "aggravation") {
    opinionStatement = `It is at least as likely as not (50% or greater probability) that ${condition} was aggravated beyond its natural progression by the Veteran's service-connected ${primaryCondition}.`;
  } else if (form.linkType === "toxic") {
    opinionStatement = `It is at least as likely as not (50% or greater probability) that ${condition} is related to the Veteran's qualifying toxic exposure history, including ${exposureTrack}.`;
  }

  return [
    `RE: Nexus opinion draft for ${veteranName}`,
    "",
    "Medical records reviewed:",
    customRecords,
    "",
    "Opinion:",
    opinionStatement,
    "",
    "Clinical rationale:",
    `1. The Veteran reports the following service event or exposure history: ${form.serviceEvent || "[Describe the in-service event, deployment, repetitive duties, or exposure history]."}`,
    `2. Symptom history and continuity: ${form.symptomHistory || "[Summarize onset, worsening, flare-ups, and continuity since service]."}`,
    `3. Functional impact: ${form.functionalImpact || "[Describe occupational and daily-life limitations tied to the condition]."}`,
    `4. Medical reasoning: ${form.medicalRationale || "[Explain why the findings, timeline, imaging, treatment notes, and known medical literature support the connection]."}`,
    "",
    "Suggested signature block:",
    `${form.clinicianName || "[Clinician name]"}`,
    `${form.clinicianSpecialty || "[Credentials / specialty]"}`,
    "[Practice / address / phone]",
    "[Signature and date]"
  ].join("\n");
};

// --- ONBOARDING CONFIG ---
const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome Aboard",
    questions: [
      {
        id: "vso_aware",
        label: "Are you aware we are NOT the VA or a VSO?",
        guideText:
          "Welcome! I'm here to help you build your claim. Just to be clear, we are a private company of experts, not the government.",
        type: "boolean",
        footerInfo: (
          <div className="flex gap-4 items-center bg-blue-50 p-4 rounded-xl border border-blue-100 mt-6 shadow-sm">
            <div className="bg-white p-2 rounded-full text-blue-600">
              <Icons.Users className="w-5 h-5" />
            </div>
            <p className="text-sm text-slate-700 leading-snug">
              <strong>Did you know?</strong> We are Veteran Owned & Operated. We understand your journey.
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: "qualification",
    title: "Qualification Check",
    questions: [
      { id: "attorney", label: "Are you currently working with an accredited attorney?", type: "boolean" },
      { id: "appeal", label: "Do you have an active appeal with a BVA Judge?", type: "boolean" },
      {
        id: "discharge",
        label: "Was your discharge Honorable or General Under Honorable?",
        type: "boolean"
      }
    ],
    guideText: "We need to make sure we're the right fit for your specific legal situation."
  },
  {
    id: "service",
    title: "Service History",
    questions: [
      {
        id: "branch",
        label: "Which Branch did you serve in?",
        type: "select",
        options: ["Army", "Navy", "Marines", "Air Force", "Coast Guard", "Space Force"]
      },
      { id: "era", label: "Service Era", type: "select", options: ["Post-9/11", "Gulf War", "Peacetime", "Vietnam", "Korea"] }
    ],
    guideText: "Your branch and era help us identify specific presumptive conditions you might qualify for."
  },
  {
    id: "status",
    title: "Current Status",
    questions: [
      { id: "rating", label: "What is your current VA Rating?", type: "slider" },
      { id: "claims_pending", label: "Do you have any claims currently pending?", type: "boolean" }
    ],
    guideText: "Knowing your starting point helps us calculate your potential backpay. What is your rating today?"
  },
  {
    id: "pain_category",
    title: "Primary Issues",
    questions: [
      {
        id: "pain_categories",
        label: "Select ALL body systems affecting you:",
        type: "multi_select",
        options: Object.keys(DISABILITY_DATA)
      }
    ],
    guideText: "This is the important part. Which of these are bothering you the most? We'll help you prove they are service-connected."
  },
  {
    id: "pain_specific",
    title: "Specific Conditions",
    questions: [
      {
        id: "pain_points",
        label: "Select ALL specific diagnoses you want to discuss:",
        type: "dynamic_multi_select"
      }
    ],
    guideText: "Excellent. Now let's get specific so we can find the exact DBQs you need."
  },
  // --- CONTACT & PROFILE SECTION ---
  {
    id: "contact_name",
    title: "Who are we speaking with?",
    type: "contact_form_part1",
    guideText: "Almost there! I just need to know who I'm building this strategy for so we can save your progress."
  },
  {
    id: "contact_info",
    title: "Contact Information",
    type: "contact_form_part2",
    guideText: "We'll send your Strategy Report and access details here."
  },
  {
    id: "final_details",
    title: "Final Details",
    type: "contact_form_part3",
    guideText: "Almost there! Just need your location to match you with the right specialists."
  },
  {
    id: "analyzing",
    type: "loading",
    duration: 2000,
    text: "Building your Mission Control..."
  }
];

// --- SUB-COMPONENTS ---

function LoadingStep({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        <Icons.Activity className="absolute inset-0 m-auto text-blue-500 w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3 animate-pulse">{text}</h2>
      <p className="text-slate-400 text-lg font-medium">Checking eligibility requirements...</p>
    </div>
  );
}

function HelpTooltip({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block ml-2 group">
      <button onClick={() => setIsOpen(!isOpen)} className="text-blue-500 hover:text-blue-700 transition-colors">
        <Icons.HelpCircle className="w-5 h-5" />
      </button>
      <div className="hidden group-hover:block absolute z-50 w-64 p-4 mt-2 -left-28 bg-slate-900 text-white text-sm rounded-xl shadow-xl border border-slate-700 animate-fadeIn pointer-events-none">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-yellow-500">{title}</h4>
        </div>
        <p className="text-slate-300 leading-relaxed">{content}</p>
        <div className="absolute top-0 left-1/2 -mt-2 w-4 h-4 bg-slate-900 border-t border-l border-slate-700 transform -translate-x-1/2 rotate-45"></div>
      </div>
    </div>
  );
}

function ContactStep({ onNext, initialData, part }) {
  const [localData, setLocalData] = useState(initialData);
  const [errors, setErrors] = useState({});

  // SECURITY: Time-based tracking
  const [startTime] = useState(Date.now());
  // SECURITY: Math Challenge state
  const [securityQuestion] = useState(() => {
    const n1 = Math.floor(Math.random() * 5) + 1;
    const n2 = Math.floor(Math.random() * 5) + 1;
    return { n1, n2, ans: n1 + n2 };
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleEmailQuickFill = (domain) => {
    const currentEmail = localData.email ? localData.email.split("@")[0] : "";
    setLocalData((prev) => ({ ...prev, email: currentEmail + domain }));
  };

  const validate = () => {
    const newErrors = {};

    // SECURITY: Bot Detection (Honeypot)
    // If the hidden field 'website_hp' has a value, it's likely a bot.
    // Allow known browser autofill values to avoid blocking real users.
    if (localData.website_hp) {
      const honeypotValue = localData.website_hp.trim();
      const allowedValues = [localData.email, localData.firstName, localData.lastName, localData.phone]
        .filter(Boolean)
        .map((value) => value.trim());
      if (!allowedValues.includes(honeypotValue)) {
        console.log("Spam detected: Honeypot filled");
        return false; // Silently fail
      }
    }

    // SECURITY: Time-based Validation
    // If form is submitted faster than 2 seconds, it's likely a bot.
    const timeElapsed = Date.now() - startTime;
    if (timeElapsed < 2000) {
      console.log("Spam detected: Submission too fast");
      return false; // Silently fail
    }

    if (part === 1) {
      if (!localData.firstName) newErrors.firstName = "First Name is required";
      if (!localData.lastName) newErrors.lastName = "Last Name is required";
    }
    if (part === 2) {
      // SECURITY: Strict Regex for Email
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!localData.email || !emailRegex.test(localData.email)) newErrors.email = "Valid Email is required";
      if (!localData.phone || localData.phone.length < 10) newErrors.phone = "Valid Phone Number is required";
    }
    if (part === 3) {
      if (!localData.zip || localData.zip.length < 5) newErrors.zip = "Valid Zip Code is required";
      if (!localData.privateOrg) newErrors.privateOrg = "Acknowledgement required";
      if (!localData.terms) newErrors.terms = "Agreement required";

      // SECURITY: Math Challenge Verification
      if (parseInt(localData.securityAnswer, 10) !== securityQuestion.ans) {
        newErrors.securityAnswer = "Incorrect verification answer";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext(localData);
    }
  };

  return (
    <div className="animate-fadeIn w-full space-y-6">
      {/* SECURITY: Honeypot Field (Hidden from humans) */}
      <div style={{ opacity: 0, position: "absolute", top: 0, left: 0, height: 0, width: 0, zIndex: -1 }}>
        <input
          type="text"
          name="website_hp"
          value={localData.website_hp || ""}
          onChange={handleChange}
          tabIndex="-1"
          autoComplete="off"
        />
      </div>

      {part === 1 && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
            <input
              name="firstName"
              value={localData.firstName || ""}
              onChange={handleChange}
              autoComplete="given-name"
              className={`w-full p-4 rounded-xl border-2 ${errors.firstName ? "border-red-500" : "border-slate-200"} focus:border-blue-600 outline-none text-lg font-medium bg-slate-50`}
              placeholder="John"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
            <input
              name="lastName"
              value={localData.lastName || ""}
              onChange={handleChange}
              autoComplete="family-name"
              className={`w-full p-4 rounded-xl border-2 ${errors.lastName ? "border-red-500" : "border-slate-200"} focus:border-blue-600 outline-none text-lg font-medium bg-slate-50`}
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>
      )}

      {part === 2 && (
        <>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              value={localData.email || ""}
              onChange={handleChange}
              autoComplete="email"
              className={`w-full p-4 rounded-xl border-2 ${errors.email ? "border-red-500" : "border-slate-200"} focus:border-blue-600 outline-none text-lg font-medium bg-slate-50`}
              placeholder="john@example.com"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              <button
                onClick={() => handleEmailQuickFill("@gmail.com")}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
              >
                @gmail.com
              </button>
              <button
                onClick={() => handleEmailQuickFill("@yahoo.com")}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
              >
                @yahoo.com
              </button>
              <button
                onClick={() => handleEmailQuickFill("@aol.com")}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
              >
                @aol.com
              </button>
              <button
                onClick={() => handleEmailQuickFill(".mil")}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors"
              >
                .mil
              </button>
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              name="phone"
              type="tel"
              value={localData.phone || ""}
              onChange={handleChange}
              autoComplete="tel"
              className={`w-full p-4 rounded-xl border-2 ${errors.phone ? "border-red-500" : "border-slate-200"} focus:border-blue-600 outline-none text-lg font-medium bg-slate-50`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
        </>
      )}

      {part === 3 && (
        <>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Zip Code</label>
            <input
              name="zip"
              value={localData.zip || ""}
              onChange={handleChange}
              maxLength={5}
              autoComplete="postal-code"
              className={`w-full p-4 rounded-xl border-2 ${errors.zip ? "border-red-500" : "border-slate-200"} focus:border-blue-600 outline-none text-lg font-medium bg-slate-50`}
              placeholder="12345"
            />
            {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
          </div>

          {/* SECURITY: Math Challenge */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Icons.LockSmall className="w-4 h-4 text-blue-600" />
              Security Check: What is {securityQuestion.n1} + {securityQuestion.n2}?
            </label>
            <input
              name="securityAnswer"
              type="number"
              value={localData.securityAnswer || ""}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border-2 ${errors.securityAnswer ? "border-red-500" : "border-slate-300"} focus:border-blue-600 outline-none font-medium bg-white`}
              placeholder="?"
            />
            {errors.securityAnswer && <p className="text-red-500 text-xs mt-1">{errors.securityAnswer}</p>}
          </div>

          <div className="pt-2 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${localData.privateOrg ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`}
              >
                {localData.privateOrg && <Icons.Check size={16} className="text-white" />}
              </div>
              <input type="checkbox" name="privateOrg" className="hidden" checked={localData.privateOrg || false} onChange={handleChange} />
              <span className="text-sm text-slate-600 leading-tight">
                I understand TYFYS is a <strong>private organization</strong>, not the VA.
              </span>
            </label>
            {errors.privateOrg && <p className="text-red-500 text-xs pl-9">{errors.privateOrg}</p>}

            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${localData.terms ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`}
              >
                {localData.terms && <Icons.Check size={16} className="text-white" />}
              </div>
              <input type="checkbox" name="terms" className="hidden" checked={localData.terms || false} onChange={handleChange} />
              <span className="text-sm text-slate-600 leading-tight">I agree to the Terms & Conditions.</span>
            </label>
            {errors.terms && <p className="text-red-500 text-xs pl-9">{errors.terms}</p>}
          </div>
        </>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-black text-xl py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 border-b-4 border-yellow-600 active:border-b-0 active:mt-1"
        >
          {part === 3 ? "Create My Profile" : "Continue"} <Icons.ChevronRight className="w-6 h-6 stroke-[3px]" />
        </button>

        {/* SECURITY: Badges */}
        <div className="flex justify-center items-center gap-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Icons.LockSmall className="w-3 h-3" /> 256-bit Encryption
          </span>
          <span className="flex items-center gap-1">
            <Icons.ShieldCheck className="w-3 h-3" /> Secure Connection
          </span>
        </div>
      </div>
    </div>
  );
}

function SpecialistModal({ onClose, discountUnlocked, isMember }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn border-2 border-yellow-500">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <Icons.X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
            <Icons.Stethoscope className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Private Specialist Access</h3>
          <p className="text-slate-500 font-medium">Get the Nexus Letter you need to win your claim.</p>
        </div>

        <div className="space-y-4">
          {/* A La Carte Option */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-600">A La Carte (One-Time)</span>
              <span className="font-black text-xl text-slate-800">$1,800</span>
            </div>
            <p className="text-xs text-slate-400">Single Nexus Letter only.</p>
          </div>

          {/* Premium Member Option */}
          <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
              MEMBER PRICE
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-blue-900 flex items-center gap-2">
                <Icons.ShieldCheck className="w-4 h-4" /> Premium Member
              </span>
              <div className="text-right">
                <span className="block text-xs text-slate-400 line-through">$1,800</span>
                <span className="font-black text-2xl text-blue-700">$1,350</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 font-bold mb-2">Save $450 instantly (25% OFF)</p>
            {!isMember && (
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
                Join Premium & Save
              </button>
            )}
          </div>

          {/* Package Option */}
          <div className="bg-slate-900 p-5 rounded-xl border-2 border-yellow-500 relative overflow-hidden shadow-lg transform scale-105">
            <div className="absolute top-0 right-0 bg-yellow-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              BEST VALUE
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Icons.Star className="w-4 h-4 text-yellow-400" /> Package Deal
              </span>
              <div className="text-right">
                <span className="font-black text-xl text-yellow-400">INCLUDED</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-tight mb-3">
              Nexus Letters are <strong>INCLUDED</strong> in our Standard & Multi-Claim packages.
            </p>
            <button className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
              View Packages <Icons.ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- LANDING OVERLAY ---
function LandingOverlay({ onStart }) {
  return (
    <div className="fixed inset-0 z-[70] bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="relative z-10 max-w-xl">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-2xl animate-pulse">
            <Icons.ShieldCheck className="w-12 h-12" />
          </div>
        </div>
        <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">
          Maximize Your VA Rating. <span className="text-yellow-500 block text-3xl mt-2">Stop Leaving Money on the Table.</span>
        </h1>
        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
          Get the Expert Strategy, Private Medical Evidence, and Tools you need to win your claim in months, not years.
        </p>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-8 text-sm text-slate-400">
          <strong className="text-white">NOTICE:</strong> We are a private organization of medical and legal experts. We are not the VA.
        </div>
        <button
          type="button"
          onClick={onStart}
          onTouchEnd={onStart}
          style={{ touchAction: "manipulation" }}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-2xl py-6 px-12 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
        >
          Initialize System <Icons.ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

// --- EDIT PROFILE MODAL ---
function ProfileEditModal({ userProfile, onClose, onSave }) {
  const [data, setData] = useState(userProfile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <Icons.X className="w-6 h-6" />
        </button>
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
              <input name="firstName" value={data.firstName || ""} onChange={handleChange} className="w-full p-3 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
              <input name="lastName" value={data.lastName || ""} onChange={handleChange} className="w-full p-3 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <input name="email" value={data.email || ""} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
            <input name="phone" value={data.phone || ""} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Branch</label>
              <select name="branch" value={data.branch || ""} onChange={handleChange} className="w-full p-3 border rounded-lg">
                {["Army", "Navy", "Marines", "Air Force", "Coast Guard", "Space Force"].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Era</label>
              <select name="era" value={data.era || ""} onChange={handleChange} className="w-full p-3 border rounded-lg">
                {["Post-9/11", "Gulf War", "Peacetime", "Vietnam", "Korea"].map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button onClick={() => onSave(data)} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
function TYFYSPlatform() {
  const leadPrefill = loadLeadPrefill();
  const hasLeadPrefill = Boolean(
    leadPrefill && (leadPrefill.firstName || leadPrefill.lastName || leadPrefill.email || leadPrefill.phone)
  );
  const prefilledContactStep = ONBOARDING_STEPS.findIndex((step) => step.id === "contact_name");
  const prefilledProfile = mapLeadPrefillToProfile(leadPrefill);

  // STATE
  const [hasStarted, setHasStarted] = useState(() => loadHasStarted());
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(
    hasLeadPrefill && prefilledContactStep >= 0 ? prefilledContactStep : 0
  );
  const [userProfile, setUserProfile] = useState({
    pain_categories: [],
    pain_points: [],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    zip: "",
    privateOrg: false,
    terms: false,
    ...prefilledProfile
  });
  const [activeView, setActiveView] = useState("welcome_guide");
  const [paymentState, setPaymentState] = useState(() => loadPaymentState());
  const [zohoLeadId, setZohoLeadId] = useState(() => loadZohoLeadId());
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState(Number(prefilledProfile.rating || 0));
  const [hasSpouse, setHasSpouse] = useState(false);
  const [childCount, setChildCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [newRatingInput, setNewRatingInput] = useState(10);
  const [claimType, setClaimType] = useState("increase");
  const [addedClaims, setAddedClaims] = useState([]);
  const [calculation, setCalculation] = useState({
    beforePay: 0,
    afterPay: 0,
    rawCombined: 0,
    diffMonthly: 0,
    diff5Year: 0,
    fee: 0,
    roi: 0
  });
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [discountUnlocked, setDiscountUnlocked] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false); // Bot starts closed
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // Updated Bot Intro
  const [aiBotMessages, setAiBotMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm Angela. I know this process can be overwhelming, but I'm here to listen and help you every step of the way."
    }
  ]);
  const [aiBotInput, setAiBotInput] = useState("");
  const [dailyQuestionCount, setDailyQuestionCount] = useState(0);
  const [docWizardCondition, setDocWizardCondition] = useState("");
  const [dossier, setDossier] = useState(() => loadDossier());
  const [scannerForm, setScannerForm] = useState({
    title: "",
    condition: prefilledProfile.pain_points?.[0] || "",
    type: "Private Medical Record",
    source: "Phone capture",
    fileName: "",
    fileSize: 0,
    notes: ""
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [pactEra, setPactEra] = useState(prefilledProfile.era || "Post-9/11");
  const [pactTrackId, setPactTrackId] = useState(() => getDefaultPactTrackForEra(prefilledProfile.era || "Post-9/11"));
  const [pactSearch, setPactSearch] = useState("");
  const [nexusForm, setNexusForm] = useState({
    veteranName: `${prefilledProfile.firstName || ""} ${prefilledProfile.lastName || ""}`.trim(),
    condition: prefilledProfile.pain_points?.[0] || "",
    linkType: "direct",
    primaryCondition: "",
    exposureTrack: getDefaultPactTrackForEra(prefilledProfile.era || "Post-9/11"),
    serviceEvent: "",
    symptomHistory: "",
    functionalImpact: "",
    medicalRationale: "",
    recordsReviewed: "",
    clinicianName: "",
    clinicianSpecialty: ""
  });
  const [nexusDraft, setNexusDraft] = useState("");
  const [nexusCopied, setNexusCopied] = useState(false);

  const [expandCalcHelp, setExpandCalcHelp] = useState(false);
  const hasPaid = paymentState.completed;

  const startSystem = () => {
    setHasStarted(true);
    saveHasStarted();
  };
  const checkoutLeadId = zohoLeadId || `${userProfile.branch?.substring(0, 3).toUpperCase() || "VET"}-8821`;

  const chatEndRef = useRef(null);
  const botMemory = useRef({ hasPitchedNexus: false, hasWelcomed: false, viewGuidesSent: new Set() });
  const scanPayloadRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [activeView]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  useEffect(() => {
    savePaymentState(paymentState);
  }, [paymentState]);
  useEffect(() => {
    saveDossier(dossier);
  }, [dossier]);
  useEffect(() => {
    if (!addedClaims.length) return;
    if (!scannerForm.condition) {
      setScannerForm((prev) => ({ ...prev, condition: addedClaims[0].name }));
    }
    if (!nexusForm.condition) {
      setNexusForm((prev) => ({ ...prev, condition: addedClaims[0].name }));
    }
  }, [addedClaims, nexusForm.condition, scannerForm.condition]);
  useEffect(() => {
    if (userProfile.era) {
      setPactEra(userProfile.era);
    }
  }, [userProfile.era]);
  useEffect(() => {
    const displayName = `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim();
    if (displayName && !nexusForm.veteranName) {
      setNexusForm((prev) => ({ ...prev, veteranName: displayName }));
    }
  }, [nexusForm.veteranName, userProfile.firstName, userProfile.lastName]);
  useEffect(() => {
    const recommended = PACT_ERA_CONFIG[pactEra]?.recommendedTracks || [];
    if (!recommended.length) return;
    if (!recommended.includes(pactTrackId)) {
      setPactTrackId(recommended[0]);
    }
    setNexusForm((prev) =>
      prev.linkType === "toxic" && !prev.exposureTrack
        ? { ...prev, exposureTrack: recommended[0] }
        : prev
    );
  }, [pactEra, pactTrackId]);
  useEffect(() => {
    if (!isScanning) return undefined;

    setScanProgress(0);
    const timer = window.setInterval(() => {
      setScanProgress((prev) => {
        const next = Math.min(prev + 7, 100);
        if (next === 100) {
          window.clearInterval(timer);
          const savedItem = createDossierEntry(scanPayloadRef.current || {});
          setDossier((prevItems) => [savedItem, ...prevItems]);
          setLastScanResult(savedItem);
          setIsScanning(false);
        }
        return next;
      });
    }, 130);

    return () => window.clearInterval(timer);
  }, [isScanning]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    const leadIdFromQuery = String(params.get("leadId") || "").trim();
    if (leadIdFromQuery) {
      setZohoLeadId(leadIdFromQuery);
      saveZohoLeadId(leadIdFromQuery);
    }
    if (!checkoutStatus) return;

    const pending = loadCheckoutPending();
    const planFromQuery = params.get("plan");
    const fallbackPlanName = pending?.planName || planNameFromCode(planFromQuery) || "your selected plan";
    const fallbackUnlockPremium =
      typeof pending?.unlockPremium === "boolean"
        ? pending.unlockPremium
        : planFromQuery === "250_monthly" || planFromQuery === "pro_monthly";

    if (checkoutStatus === "success") {
      handlePaymentComplete({
        planName: fallbackPlanName,
        unlockPremium: fallbackUnlockPremium
      });
      clearCheckoutPending();
    } else if (checkoutStatus === "cancel") {
      clearCheckoutPending();
      setIsBotOpen(true);
      addMessage("bot", "Checkout was canceled. No charge was made, and your account is still on the standard plan.");
    }

    setIsCheckoutLoading(false);
    params.delete("checkout");
    params.delete("session_id");
    params.delete("leadId");
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, []);

  const syncZohoSignup = async (profileInput) => {
    const profile = profileInput || {};
    if (!profile.lastName && !profile.email && !profile.phone) return null;
    if (!hasLiveAppApi()) return null;

    try {
      const response = await fetch("/api/zoho-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: zohoLeadId || undefined,
          leadSource: "TYFYS App",
          profile
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Zoho signup sync failed");
      }

      if (payload?.leadId) {
        setZohoLeadId(payload.leadId);
        saveZohoLeadId(payload.leadId);
      }
      if (payload?.profile) {
        setUserProfile((prev) => mergeZohoProfile(prev, payload.profile));
      }
      return payload;
    } catch (error) {
      console.warn("Zoho signup sync skipped:", error);
      return null;
    }
  };

  const hydrateProfileFromZoho = async ({ leadId, email, phone }) => {
    if (!leadId && !email && !phone) return null;
    if (!hasLiveAppApi()) return null;
    try {
      const query = new URLSearchParams();
      if (leadId) query.set("leadId", leadId);
      if (email) query.set("email", email);
      if (phone) query.set("phone", phone);
      const response = await fetch(`/api/zoho-profile?${query.toString()}`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok || !payload?.found || !payload?.profile) return null;

      if (payload?.leadId) {
        setZohoLeadId(payload.leadId);
        saveZohoLeadId(payload.leadId);
      }
      setUserProfile((prev) => mergeZohoProfile(prev, payload.profile));
      return payload;
    } catch (error) {
      console.warn("Zoho profile hydrate skipped:", error);
      return null;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadIdFromQuery = String(params.get("leadId") || "").trim();
    if (leadIdFromQuery) {
      setZohoLeadId(leadIdFromQuery);
      saveZohoLeadId(leadIdFromQuery);
    }

    const lookupLeadId = leadIdFromQuery || zohoLeadId;
    const lookupEmail = prefilledProfile.email || leadPrefill?.email || "";
    const lookupPhone = prefilledProfile.phone || leadPrefill?.phone || "";
    void hydrateProfileFromZoho({ leadId: lookupLeadId, email: lookupEmail, phone: lookupPhone });
  }, []);

  const addMessage = (sender, text) => setMessages((prev) => [...prev, { sender, text }]);

  // Bot interaction for "Start Guided Tour"
  // Updated messages to be warmer and use "Angela"
  const startGuidedTour = () => {
    setIsBotOpen(true);
    addMessage(
      "bot",
      "Hi there! I'm Angela. Let's take a moment to get you comfortable. Could you check your 'Service Profile' on the dashboard? We want to make sure your Branch and Era are just right. You can adjust them with the pencil icon if needed."
    );
    setTimeout(() => {
      addMessage(
        "bot",
        "Next, take a look at the 'Active Claims Tracker'. If it's looking a bit empty, don't worry—just head over to the Calculator to add the conditions you'd like to discuss."
      );
    }, 2000);
  };

  // Onboarding Handlers
  const handleOnboardingAnswer = (qid, value) => {
    setUserProfile((prev) => {
      const newData = { ...prev };
      if (Array.isArray(newData[qid])) {
        if (newData[qid].includes(value)) newData[qid] = newData[qid].filter((item) => item !== value);
        else newData[qid] = [...newData[qid], value];
      } else {
        newData[qid] = value;
      }
      return newData;
    });
    if (qid === "rating") setCurrentRating(Number(value));
  };

  const handleContactSubmit = (contactData) => {
    const mergedProfile = { ...userProfile, ...contactData };
    setUserProfile(mergedProfile);
    void syncZohoSignup(mergedProfile);
    // Directly advance to loading step (index + 1)
    setOnboardingStep((prev) => prev + 1);
  };

  const nextOnboardingStep = () => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    setOnboardingComplete(true);
    clearLeadPrefill();
    void syncZohoSignup(userProfile);
    if (userProfile.pain_points && userProfile.pain_points.length > 0) {
      const newClaims = [];
      userProfile.pain_points.forEach((point) => {
        Object.values(DISABILITY_DATA).forEach((catList) => {
          const condition = catList.find((c) => c.name === point);
          if (condition)
            newClaims.push({
              name: condition.name,
              rating: 30,
              dbq: condition.dbq,
              specialist: condition.specialist,
              type: "new"
            });
        });
      });
      setAddedClaims(newClaims);
    }
    if (!botMemory.current.hasWelcomed) {
      // Updated welcome message
      setTimeout(() => addMessage("bot", `It is wonderful to meet you, ${userProfile.firstName || userProfile.branch || "Veteran"}. Your profile is all set. Welcome to your Mission Control.`), 500);
      botMemory.current.hasWelcomed = true;
    }
  };

  const handleProfileSave = (newData) => {
    const mergedProfile = { ...userProfile, ...newData };
    setUserProfile(mergedProfile);
    void syncZohoSignup(mergedProfile);
    setShowProfileEdit(false);
    setIsBotOpen(true);
    // Updated profile save message
    addMessage("bot", "I've carefully updated your profile details. This will help us take better care of your specific needs.");
  };

  const handlePaymentComplete = ({ planName, unlockPremium = false }) => {
    if (unlockPremium) {
      setIsMember(true);
    }
    setIsCheckoutLoading(false);
    setPaymentState({
      completed: true,
      planName,
      paidAt: new Date().toISOString()
    });
    setActiveView("intake_portal");
    setIsBotOpen(true);
    addMessage(
      "bot",
      `Payment confirmed for ${planName}. First step now is your intake portal. I opened it for you.`
    );
  };

  const startSecureCheckout = async ({ planName, planCode, unlockPremium = false }) => {
    if (!planCode) {
      setShowSpecialistModal(true);
      setIsBotOpen(true);
      addMessage(
        "bot",
        `This ${planName} checkout is handled by a specialist. Use "Book Discovery Call" and we will complete enrollment with you directly.`
      );
      return;
    }

    if (!hasLiveAppApi()) {
      setShowSpecialistModal(true);
      setIsBotOpen(true);
      addMessage(
        "bot",
        "Online checkout is not enabled on this site version yet. Use \"Book Discovery Call\" and we will complete enrollment with you directly."
      );
      return;
    }

    setIsCheckoutLoading(true);
    saveCheckoutPending({
      planName,
      planCode,
      unlockPremium,
      leadId: checkoutLeadId,
      requestedAt: new Date().toISOString()
    });

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: checkoutLeadId,
          plan: planCode
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Unable to start checkout");
      }

      window.location.href = payload.url;
    } catch (error) {
      clearCheckoutPending();
      setIsCheckoutLoading(false);
      setIsBotOpen(true);
      addMessage(
        "bot",
        "Secure checkout is temporarily unavailable. Please book a discovery call and we will complete enrollment manually."
      );
    }
  };

  // Calculator Logic
  useEffect(() => {
    const newRatings = addedClaims.map((c) => parseInt(c.rating, 10));
    const beforePay = calculatePay(parseInt(currentRating, 10), hasSpouse, parseInt(childCount, 10));
    const detail = calculateCombinedRatingDetailed(parseInt(currentRating, 10), newRatings);
    const afterRating = detail.finalCombined;
    const afterPay = calculatePay(afterRating, hasSpouse, parseInt(childCount, 10));
    const diffMonthly = Math.max(0, afterPay - beforePay);

    const baseFee = addedClaims.length > 3 ? 5500 : 3500;
    const fee = baseFee * (isMember ? 0.75 : discountUnlocked ? 0.9 : 1);

    setCalculation({
      beforePay,
      afterPay,
      afterRating,
      rawCombined: detail.rawCombined,
      diffMonthly,
      fee,
      diff5Year: diffMonthly * 12 * 5,
      breakEvenMonths: diffMonthly > 0 ? (fee / diffMonthly).toFixed(1) : "N/A"
    });
  }, [currentRating, addedClaims, hasSpouse, childCount, discountUnlocked, isMember]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    addMessage("user", input.trim());
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const text = input.trim().toLowerCase();
      // Updated Main Chat logic for empathy
      if (text.includes("nexus"))
        addMessage(
          "bot",
          "A Nexus Letter is so important—it's like the bridge connecting your condition to your service. While VSOs are great, they usually can't write these medical opinions, but our compassionate private doctors certainly can."
        );
      else if (text.includes("cost") || text.includes("price"))
        addMessage(
          "bot",
          "We want to make sure you have the best support. Our Premium access is $250/mo. For comprehensive support, our Standard package is $3,500, and the Multi-Claim package is $5,500. We can look at payment plans too."
        );
      else
        addMessage(
          "bot",
          "I hear you, and I'm here to help. You might find some relief looking at the Doc Finder for free resources, or we can explore our Strategy plans together."
        );
      setIsTyping(false);
    }, 1000);
  };

  const handleAiBotSend = (e) => {
    e.preventDefault();
    if (!aiBotInput.trim()) return;
    if (!isMember && dailyQuestionCount >= 3) {
      // Updated limit message
      setAiBotMessages((prev) => [
        ...prev,
        { sender: "user", text: aiBotInput },
        {
          sender: "bot",
          text: "I'm so sorry, but it looks like you've reached your daily question limit. I'd love to keep chatting—upgrading to Premium ($250/mo) would let us talk as much as you need."
        }
      ]);
      setAiBotInput("");
      return;
    }
    setAiBotMessages((prev) => [...prev, { sender: "user", text: aiBotInput }]);
    const query = aiBotInput;
    setAiBotInput("");
    setDailyQuestionCount((prev) => prev + 1);
    setTimeout(() => {
      // Updated AI Bot responses for empathy
      let response =
        "As your support specialist, I want to ensure you feel heard. Evidence is the key to getting you the rating you deserve.";
      if (query.toLowerCase().includes("ptsd"))
        response =
          "I understand how heavy PTSD can be. To support a claim, the VA looks for three things: a current diagnosis, a specific stressor from your service, and a medical link between them. We're here to help you tell your story.";
      else if (query.toLowerCase().includes("back"))
        response =
          "Back pain can be really difficult. For ratings, the VA mostly looks at your Range of Motion—specifically how far you can bend forward. If it hurts to move, that's important to document too.";
      else if (query.toLowerCase().includes("tinnitus"))
        response =
          "That ringing in your ears is very real. Tinnitus is usually rated at 10%, but it's also a significant starting point that can be linked to other challenges like migraines or sleep issues.";
      setAiBotMessages((prev) => [...prev, { sender: "bot", text: response }]);
    }, 1000);
  };

  const addClaim = () => {
    if (!selectedCategory || !selectedCondition) return;
    const conditionData = DISABILITY_DATA[selectedCategory].find((c) => c.name === selectedCondition);
    setAddedClaims([
      ...addedClaims,
      {
        name: selectedCondition,
        rating: parseInt(newRatingInput, 10),
        dbq: conditionData.dbq,
        specialist: conditionData.specialist,
        type: claimType
      }
    ]);
    setSelectedCondition("");
  };
  const removeClaim = (idx) => {
    const newClaims = [...addedClaims];
    newClaims.splice(idx, 1);
    setAddedClaims(newClaims);
  };

  const handleScannerChange = (field, value) => {
    setScannerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleScannerFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setScannerForm((prev) => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      fileName: file.name,
      fileSize: file.size
    }));
  };

  const handleStartScan = () => {
    scanPayloadRef.current = {
      ...scannerForm,
      title: scannerForm.title.trim() || scannerForm.fileName || `${scannerForm.type} capture`,
      condition: scannerForm.condition || addedClaims[0]?.name || ""
    };
    setLastScanResult(null);
    setIsScanning(true);
  };

  const removeDossierItem = (id) => {
    setDossier((prev) => prev.filter((item) => item.id !== id));
  };

  const exportDossier = () => {
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tyfys-dossier-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const generateNexusTemplate = () => {
    const relatedDocs = dossier.filter(
      (item) =>
        !nexusForm.condition ||
        item.condition === nexusForm.condition ||
        item.type === "Service Record" ||
        item.type === "Lay Statement"
    );
    setNexusDraft(buildNexusDraft(nexusForm, relatedDocs.slice(0, 6)));
    setNexusCopied(false);
  };

  const copyNexusDraft = async () => {
    if (!nexusDraft) return;
    try {
      await navigator.clipboard.writeText(nexusDraft);
      setNexusCopied(true);
    } catch (error) {
      console.warn("Clipboard copy unavailable", error);
    }
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

  const vaMathDetail = calculateCombinedRatingDetailed(
    parseInt(currentRating, 10),
    addedClaims.map((claim) => parseInt(claim.rating, 10))
  );
  const pathTo100Guide = getPathTo100Guide(
    parseInt(currentRating, 10),
    addedClaims.map((claim) => parseInt(claim.rating, 10))
  );
  const dossierCounts = dossier.reduce(
    (acc, item) => {
      acc.total += 1;
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    },
    { total: 0 }
  );
  const pactConfig = PACT_ERA_CONFIG[pactEra] || PACT_ERA_CONFIG["Post-9/11"];
  const pactTrackIds = pactConfig.recommendedTracks || ["post_911"];
  const activePactTrack = PACT_TRACKS[pactTrackId] || PACT_TRACKS[pactTrackIds[0]];
  const filteredPactConditions = activePactTrack.conditions.filter((item) =>
    item.toLowerCase().includes(pactSearch.trim().toLowerCase())
  );
  const matchingNexusDocs = dossier.filter(
    (item) =>
      !nexusForm.condition ||
      item.condition === nexusForm.condition ||
      item.type === "Service Record" ||
      item.type === "Lay Statement"
  );
  const activeScanStage = SCAN_STAGES[Math.min(SCAN_STAGES.length - 1, Math.floor(scanProgress / 26))];

  // Auto-advance logic for loading screen
  useEffect(() => {
    if (!onboardingComplete && ONBOARDING_STEPS[onboardingStep] && ONBOARDING_STEPS[onboardingStep].type === "loading") {
      const timer = setTimeout(() => completeOnboarding(), 2000);
      return () => clearTimeout(timer);
    }
  }, [onboardingComplete, onboardingStep, completeOnboarding]);

  useEffect(() => {
    document.body.classList.toggle("onboarding-active", !onboardingComplete);
    return () => {
      document.body.classList.remove("onboarding-active");
    };
  }, [onboardingComplete]);

  // --- RENDERING ---
  if (!hasStarted) {
    return <LandingOverlay onStart={startSystem} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* NEW ONBOARDING MODAL */}
      {!onboardingComplete && (
        <div className="fixed inset-0 z-[60] bg-slate-900/95 flex flex-col items-center justify-start md:justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-slate-200 max-h-[calc(100dvh-1rem)] flex flex-col my-1 sm:my-2">
            {/* Header */}
            <div className="p-6 bg-slate-900 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded flex items-center justify-center text-slate-900 font-black text-lg shadow-md">
                    TY
                  </div>
                  <div>
                    <span className="font-bold text-white text-xl block leading-none">Thank You</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">For Your Service</span>
                  </div>
                </div>
                <div className="text-sm text-slate-400 font-medium bg-slate-800 px-3 py-1.5 rounded-md">
                  Step {onboardingStep + 1}/{ONBOARDING_STEPS.length}
                </div>
              </div>

              {/* Guide Bubble */}
              {ONBOARDING_STEPS[onboardingStep].guideText && (
                <div className="flex gap-4 mt-2 animate-slide-up">
                  <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center flex-shrink-0 relative">
                    <Icons.User size={24} className="text-blue-600 w-6 h-6" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div className="chat-bubble p-4 rounded-tr-xl rounded-b-xl text-base text-slate-700 shadow-sm flex-1 leading-relaxed border border-slate-200 bg-white">
                    {ONBOARDING_STEPS[onboardingStep].guideText}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full bg-slate-100 h-2">
              <div
                className="bg-yellow-500 h-2 transition-all duration-500 ease-out"
                style={{ width: `${((onboardingStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              ></div>
            </div>

            <div
              className={`p-6 md:p-10 bg-slate-50 min-h-0 flex-1 overflow-y-auto ${ONBOARDING_STEPS[onboardingStep].type === "loading" ? "flex flex-col justify-center" : "flex flex-col justify-start"} pb-28 md:pb-10`}
              style={{ paddingBottom: "max(7rem, env(safe-area-inset-bottom) + 5.5rem)" }}
            >
              {ONBOARDING_STEPS[onboardingStep].type === "loading" ? (
                <LoadingStep text={ONBOARDING_STEPS[onboardingStep].text} />
              ) : ONBOARDING_STEPS[onboardingStep].type &&
                ONBOARDING_STEPS[onboardingStep].type.startsWith("contact_form") ? (
                <ContactStep
                  onNext={handleContactSubmit}
                  initialData={userProfile}
                  part={parseInt(ONBOARDING_STEPS[onboardingStep].type.split("part")[1], 10)}
                />
              ) : (
                <div className="animate-fadeIn w-full">
                  <h1 className="text-3xl font-black text-slate-900 mb-6 leading-tight">
                    {ONBOARDING_STEPS[onboardingStep].title}
                  </h1>

                  <div className="space-y-4">
                    {ONBOARDING_STEPS[onboardingStep].questions.map((q) => {
                      // Dynamic Options Logic
                      let optionsToRender = q.options;
                      if (q.type === "dynamic_multi_select") {
                        const categories = userProfile.pain_categories || [];
                        optionsToRender =
                          categories.length > 0
                            ? categories.flatMap((cat) =>
                              DISABILITY_DATA[cat]
                                ? DISABILITY_DATA[cat].map((c) => ({ label: c.name, value: c.name }))
                                : []
                            )
                            : [{ label: "Please select a category first", value: "" }];
                      } else if (q.type === "select" || q.type === "multi_select") {
                        if (typeof q.options[0] === "string") {
                          optionsToRender = q.options.map((o) => ({ label: o, value: o }));
                        }
                        if (q.id === "pain_categories") {
                          optionsToRender = q.options.map((o) => ({ label: o, value: o }));
                        }
                      }

                      return (
                        <div key={q.id}>
                          <p className="text-lg font-bold text-slate-700 mb-3">{q.label}</p>

                          {q.type === "boolean" && (
                            <div className="flex gap-4">
                              <button
                                type="button"
                                onClick={() => handleOnboardingAnswer(q.id, true)}
                                className={`flex-1 py-4 rounded-xl border-2 text-lg font-bold transition-all ${userProfile[q.id] === true ? "border-blue-600 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-500 hover:border-blue-400"}`}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOnboardingAnswer(q.id, false)}
                                className={`flex-1 py-4 rounded-xl border-2 text-lg font-bold transition-all ${userProfile[q.id] === false ? "border-blue-600 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-500 hover:border-blue-400"}`}
                              >
                                No
                              </button>
                            </div>
                          )}

                          {q.type === "slider" && (
                            <div className="w-full py-8 bg-white rounded-2xl border border-slate-200 mb-4 px-6 text-center shadow-sm">
                              <span className="text-6xl font-black text-blue-900">{currentRating}%</span>
                              <div className="relative h-12 flex items-center mt-4">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="10"
                                  value={currentRating}
                                  onChange={(e) => handleOnboardingAnswer(q.id, e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                                />
                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
                                  <div className="h-full bg-blue-600 transition-all" style={{ width: `${currentRating}%` }}></div>
                                </div>
                                <div
                                  className="absolute w-8 h-8 bg-white border-4 border-yellow-500 rounded-full shadow-lg pointer-events-none transition-all"
                                  style={{ left: `calc(${currentRating}% - 16px)` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {(q.type === "select" || q.type === "multi_select" || q.type === "dynamic_multi_select") && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                              {optionsToRender &&
                                optionsToRender.map((opt) => {
                                  const isSelected = q.type.includes("multi")
                                    ? userProfile[q.id] && userProfile[q.id].includes(opt.value)
                                    : userProfile[q.id] === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => handleOnboardingAnswer(q.id, opt.value)}
                                      className={`w-full relative p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${isSelected ? "border-blue-600 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-400"}`}
                                    >
                                      <span className={`font-bold ${isSelected ? "text-blue-900" : "text-slate-600"}`}>
                                        {opt.label}
                                      </span>
                                      {isSelected && (
                                        <div className="bg-blue-600 text-white rounded-full p-1">
                                          <Icons.CheckCircle className="w-4 h-4" />
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {ONBOARDING_STEPS[onboardingStep].footerInfo}

                  <div className="mt-8 pt-4">
                    <button
                      onClick={nextOnboardingStep}
                      disabled={ONBOARDING_STEPS[onboardingStep].id === "contact_details"}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-black text-xl py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 border-b-4 border-yellow-600 active:border-b-0 active:mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {onboardingStep === ONBOARDING_STEPS.length - 1 ? "Complete Setup" : "Next Step"} <Icons.ChevronRight className="w-6 h-6 stroke-[3px]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DISCOUNT MODAL */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn">
            <button onClick={() => setShowDiscountModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <Icons.X className="w-6 h-6" />
            </button>
            {!discountUnlocked ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.ShieldCheck className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Eligibility Check</h3>
                  <p className="text-slate-500">Answer 3 questions to unlock a 10% discount on professional services.</p>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-lg">
                      <p className="font-medium text-slate-700 mb-3 text-sm">
                        {i === 1
                          ? "Do you have a copy of your denial letter?"
                          : i === 2
                            ? "Do you have a current private diagnosis?"
                            : "Can you start the process within 48 hours?"}
                      </p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 border border-slate-300 bg-white rounded hover:border-blue-500 hover:text-blue-600 text-sm font-medium">
                          Yes
                        </button>
                        <button className="flex-1 py-2 border border-slate-300 bg-white rounded hover:border-blue-500 hover:text-blue-600 text-sm font-medium">
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setDiscountUnlocked(true);
                      addMessage("bot", "Qualification confirmed. I've applied the 10% discount code to your profile.");
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl mt-2 shadow-lg"
                  >
                    Check Eligibility
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">Discount Unlocked!</h3>
                <p className="text-slate-600 mb-8 text-lg">
                  Code <strong>VET10</strong> applied successfully.
                </p>
                <button onClick={() => setShowDiscountModal(false)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SPECIALIST MODAL */}
      {showSpecialistModal && <SpecialistModal onClose={() => setShowSpecialistModal(false)} discountUnlocked={discountUnlocked} isMember={isMember} />}

      {/* PROFILE EDIT MODAL */}
      {showProfileEdit && <ProfileEditModal userProfile={userProfile} onClose={() => setShowProfileEdit(false)} onSave={handleProfileSave} />}

      {/* SIDEBAR NAVIGATION */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-30 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-1.5 rounded-lg">
              <Icons.ShieldCheck className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">TYFYS</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Veteran OS v2.0</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
          <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main</p>
          <button
            onClick={() => setActiveView("welcome_guide")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "welcome_guide" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Map className="w-5 h-5" /> Mission Control
          </button>
          <button
            onClick={() => hasPaid && setActiveView("intake_portal")}
            disabled={!hasPaid}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "intake_portal" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"} ${!hasPaid ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <Icons.FileText className="w-5 h-5" /> Intake Portal {!hasPaid && <Icons.Lock className="w-3 h-3 ml-auto opacity-70" />}
          </button>

          <p className="px-4 py-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tools</p>
          <button
            onClick={() => setActiveView("dossier")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "dossier" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Database className="w-5 h-5" /> Dossier Scanner
          </button>
          <button
            onClick={() => setActiveView("calculator")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "calculator" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Calculator className="w-5 h-5" /> VA Math
          </button>
          <button
            onClick={() => setActiveView("pact_explorer")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "pact_explorer" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Zap className="w-5 h-5" /> PACT Act Explorer
          </button>
          <button
            onClick={() => setActiveView("nexus_generator")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "nexus_generator" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Quote className="w-5 h-5" /> Nexus Generator
          </button>
          <button
            onClick={() => setActiveView("doc_wizard")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "doc_wizard" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.FileUp className="w-5 h-5" /> Evidence Finder
          </button>
          <button
            onClick={() => setActiveView("strategy")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "strategy" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.TrendingUp className="w-5 h-5" /> Plans & Pricing
          </button>

          <p className="px-4 py-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Premium</p>
          <button
            onClick={() => setActiveView("ai_claims")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "ai_claims" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Bot className="w-5 h-5" /> TYFYS Claims Bot {isMember ? "" : <Icons.Lock className="w-3 h-3 ml-auto opacity-50" />}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-not-allowed opacity-60">
            <Icons.User className="w-5 h-5" /> Private Specialist <Icons.Lock className="w-3 h-3 ml-auto" />
          </button>
        </nav>
        <div className="p-4 bg-slate-800 m-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2 h-2 rounded-full ${isMember ? "bg-blue-400" : "bg-green-400 animate-pulse"}`}></div>
            <span className="text-xs font-bold text-white uppercase">{isMember ? "Premium" : "Sales Ready"}</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">ID: {userProfile.branch?.substring(0, 3).toUpperCase() || "VET"}-8821</p>
          {!isMember && (
            <button onClick={() => setActiveView("strategy")} className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xs font-bold rounded-lg transition-colors">
              Upgrade Now
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500">
              <Icons.Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 truncate">
              {activeView === "welcome_guide" && "Mission Control Profile"}
              {activeView === "dossier" && "Dossier Vault and Scanner"}
              {activeView === "calculator" && "VA Math Calculator"}
              {activeView === "pact_explorer" && "PACT Act Explorer"}
              {activeView === "nexus_generator" && "Nexus Template Generator"}
              {activeView === "doc_wizard" && "Document Resource Finder"}
              {activeView === "strategy" && "Strategic Roadmap"}
              {activeView === "intake_portal" && "Post-Payment Intake Portal"}
              {activeView === "ai_claims" && "TYFYS Claims Assistant"}
            </h2>
          </div>
          {!isBotOpen && (
            <button
              onClick={() => setIsBotOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all"
            >
              <Icons.MessageSquare className="w-4 h-4" /> Ask Angela
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto pb-24 md:pb-0">
            {/* MISSION CONTROL DASHBOARD */}
            {activeView === "welcome_guide" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden group">
                  {/* Edit Button */}
                  <button
                    onClick={() => setShowProfileEdit(true)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-slate-50 z-20"
                  >
                    <Icons.Edit className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                    {/* Avatar */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                        <Icons.User className="w-12 h-12 text-slate-400" />
                      </div>
                      <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                    </div>

                    {/* Info Grid */}
                    <div className="flex-1 w-full">
                      <h1 className="text-3xl font-bold text-slate-900 mb-4">
                        {userProfile.firstName
                          ? `${userProfile.firstName} ${userProfile.lastName}`
                          : userProfile.branch
                            ? `${userProfile.branch} Veteran`
                            : "Veteran Profile"}
                      </h1>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Branch</p>
                          <p className="font-bold text-slate-800">{userProfile.branch || "-"}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Era</p>
                          <p className="font-bold text-slate-800">{userProfile.era || "-"}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                          <p className="text-[10px] text-blue-400 uppercase font-bold tracking-wider mb-1">Rating</p>
                          <p className="font-black text-blue-900 text-xl">{currentRating}%</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                          <p className="text-[10px] text-green-600 uppercase font-bold tracking-wider mb-1">Discount</p>
                          <p className="font-bold text-green-800 text-sm">{discountUnlocked ? "ACTIVE" : "LOCKED"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guided Button */}
                <button
                  onClick={startGuidedTour}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mb-6"
                >
                  <Icons.MessageSquare className="w-6 h-6" /> Start Guided Tour with Angela
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveView("dossier")}
                    className="bg-white text-left rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                        <Icons.Database className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                        {dossierCounts.total} saved
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">Dossier Vault</p>
                    <p className="text-sm text-slate-500 mt-1">Scan, OCR-preview, and store evidence packets on this device.</p>
                  </button>
                  <button
                    onClick={() => setActiveView("calculator")}
                    className="bg-white text-left rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-green-300 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
                        <Icons.Calculator className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        {calculation.afterRating || currentRating}%
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">VA Math</p>
                    <p className="text-sm text-slate-500 mt-1">See combined-rating steps, exact rounding, and a path to 100%.</p>
                  </button>
                  <button
                    onClick={() => setActiveView("pact_explorer")}
                    className="bg-white text-left rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-orange-300 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center">
                        <Icons.Zap className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                        {pactEra}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">PACT Act Explorer</p>
                    <p className="text-sm text-slate-500 mt-1">Filter presumptives by era and exposure track with VA source links.</p>
                  </button>
                  <button
                    onClick={() => setActiveView("nexus_generator")}
                    className="bg-white text-left rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-violet-300 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center">
                        <Icons.Quote className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-1 rounded-full">
                        {matchingNexusDocs.length} docs
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">Nexus Generator</p>
                    <p className="text-sm text-slate-500 mt-1">Draft clinician-ready medical opinion language from your claim facts.</p>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Claims Tracker */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Icons.FileText className="w-5 h-5 text-orange-500" /> Active Claims Tracker
                      </h3>
                      <button
                        onClick={() => setActiveView("calculator")}
                        className="text-sm text-blue-600 font-bold hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        + Add New
                      </button>
                    </div>

                    {addedClaims.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <Icons.FileUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No claims being tracked.</p>
                        <p className="text-sm text-slate-400 mb-4">Add conditions to see required evidence.</p>
                        <button
                          onClick={() => setActiveView("calculator")}
                          className="bg-white border border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                          Start Tracking
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addedClaims.map((claim, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group relative"
                          >
                            <div className="flex items-start gap-4 mb-3 sm:mb-0">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${claim.type === "new" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
                              >
                                {claim.type === "new" ? "N" : "I"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-lg">{claim.name}</p>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{claim.dbq}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pl-14 sm:pl-0">
                              <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-100">
                                Action Needed
                              </span>
                              <button
                                onClick={() => {
                                  setIsBotOpen(true);
                                  addMessage(
                                    "bot",
                                    "This feature is for Premium members. A specialist would review your specific medical evidence for this claim."
                                  );
                                }}
                                className="text-xs bg-slate-100 text-slate-500 px-3 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
                              >
                                <Icons.Lock className="w-3 h-3" /> Review
                              </button>
                              {/* Quick Edit (Delete) */}
                              <button onClick={() => removeClaim(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                <Icons.Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Membership & Status */}
                  <div className="space-y-6">
                    {/* Membership Card */}
                    <div
                      className={`p-6 rounded-2xl border relative overflow-hidden ${isMember ? "bg-slate-900 text-white border-slate-800" : "bg-white border-slate-200 text-slate-800 shadow-sm"}`}
                    >
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold flex items-center gap-2">
                            <Icons.ShieldCheck className={`w-5 h-5 ${isMember ? "text-green-400" : "text-slate-400"}`} /> Access
                            Level
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${isMember ? "bg-green-500/20 text-green-400" : "bg-slate-100 text-slate-500"}`}
                          >
                            {isMember ? "Premium" : "Standard"}
                          </span>
                        </div>
                        <p className={`text-sm mb-6 ${isMember ? "text-slate-400" : "text-slate-500"}`}>
                          {isMember
                            ? "You have full access to AI Claims Assistant, Consults, and Discounts."
                            : "Upgrade to unlock TYFYS Claims Assistant, 25% Service Discounts, and Monthly Consults."}
                        </p>
                        {!isMember && (
                          <button
                            onClick={() => setActiveView("strategy")}
                            className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors text-sm"
                          >
                            Unlock Premium ($250/mo)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action List */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-slate-400">Next Steps</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => (hasPaid ? setActiveView("intake_portal") : setActiveView("strategy"))}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasPaid ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                              <Icons.FileText className="w-4 h-4" />
                            </div>
                            <span className={`text-sm font-bold ${hasPaid ? "text-emerald-700" : "text-slate-700"}`}>
                              {hasPaid ? "Complete Intake Portal" : "Pay to Unlock Intake Portal"}
                            </span>
                          </div>
                          {hasPaid ? (
                            <Icons.ChevronRight className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Icons.Lock className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                        <button
                          onClick={() => setActiveView("dossier")}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <Icons.Database className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Scan Into Dossier</span>
                          </div>
                          <Icons.ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => setActiveView("pact_explorer")}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                              <Icons.Zap className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700">Check PACT Presumptives</span>
                          </div>
                          <Icons.ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUCCESS STORIES & COMPARISON */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Icons.Star className="w-24 h-24 text-yellow-500 rotate-12" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 relative z-10">
                      <Icons.Star className="w-5 h-5 text-yellow-500 fill-current" /> Success Stories
                    </h3>
                    <div className="space-y-4 relative z-10">
                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="text-sm text-slate-700 italic mb-2">
                          "Now I'm at 70% with secondary conditions recognized. My only regret is not doing this sooner."
                        </p>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">- James T.</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="text-sm text-slate-700 italic mb-2">
                          "Rating increased to 70% with back pay that covered the fee ten times over."
                        </p>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">- Christopher L.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Icons.ShieldCheck className="w-5 h-5 text-blue-600" /> Why We Win
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-slate-500">VS</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-500">Traditional VSO</p>
                          <p className="text-xs text-slate-400">Free forms, but often requires risky C&P exams.</p>
                        </div>
                      </div>
                      <div className="w-full h-px bg-slate-100"></div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Icons.Check className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">The TYFYS Method</p>
                          <p className="text-xs text-slate-600">Private Medical Evidence & Nexus Letters. Often bypasses the C&P exam entirely.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OTHER VIEWS (Simplified for brevity, same logic applies) */}
            {activeView === "dossier" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 mb-2">Persistent on-device vault</p>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Document Vault and Interactive Scanner</h2>
                      <p className="text-slate-600 max-w-3xl">
                        Capture evidence, simulate OCR, and keep a clean Dossier of the records your claim packet depends on.
                        Files stay browser-local in this prototype, while the vault keeps persistent metadata, notes, and OCR summaries.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 min-w-[16rem]">
                      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Docs saved</p>
                        <p className="text-3xl font-black text-blue-900">{dossierCounts.total}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Last scan</p>
                        <p className="text-sm font-bold text-emerald-900">
                          {lastScanResult ? `${lastScanResult.confidence}% OCR` : "Ready"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.05fr,0.95fr] gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Interactive scanner</h3>
                        <p className="text-sm text-slate-500">Capture a document, simulate OCR, and save it into your Dossier.</p>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {isScanning ? activeScanStage : "Idle"}
                      </span>
                    </div>

                    <div className="relative h-64 rounded-3xl overflow-hidden border border-slate-800 bg-slate-950">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900"></div>
                      <div className="absolute inset-5 rounded-[1.6rem] border border-slate-700 bg-slate-900/60"></div>
                      <div className="absolute inset-10 rounded-[1.2rem] border border-dashed border-slate-600 flex items-center justify-center text-center px-8">
                        <div>
                          <div className="w-14 h-14 rounded-2xl bg-white/10 text-blue-300 mx-auto mb-4 flex items-center justify-center">
                            <Icons.FileUp className="w-7 h-7" />
                          </div>
                          <p className="text-white font-bold text-lg">
                            {isScanning ? `Scanning ${scanPayloadRef.current?.title || "document"}...` : "Drop into scanner lane"}
                          </p>
                          <p className="text-sm text-slate-400 mt-2">
                            {isScanning
                              ? "OCR simulation is extracting likely evidence markers and saving a structured vault entry."
                              : "Add a file name or document title, choose the condition, then run the scan."}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`absolute left-8 right-8 h-0.5 bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)] transition-all ${isScanning ? "" : "opacity-30"}`}
                        style={{ top: `${14 + scanProgress * 0.68}%` }}
                      ></div>
                      <div className="absolute left-8 right-8 bottom-5 flex items-center justify-between text-xs font-mono text-slate-300">
                        <span>{activeScanStage}</span>
                        <span>{isScanning ? `${scanProgress}%` : "0%"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Document title</label>
                        <input
                          value={scannerForm.title}
                          onChange={(e) => handleScannerChange("title", e.target.value)}
                          placeholder="Lumbar MRI - Jan 2026"
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Condition</label>
                        <select
                          value={scannerForm.condition}
                          onChange={(e) => handleScannerChange("condition", e.target.value)}
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        >
                          <option value="">General evidence</option>
                          {CONDITION_OPTIONS.map((condition) => (
                            <option key={condition} value={condition}>
                              {condition}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Document type</label>
                        <select
                          value={scannerForm.type}
                          onChange={(e) => handleScannerChange("type", e.target.value)}
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        >
                          {DOSSIER_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Source</label>
                        <select
                          value={scannerForm.source}
                          onChange={(e) => handleScannerChange("source", e.target.value)}
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        >
                          {DOSSIER_SOURCE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Attach file (optional)</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleScannerFile}
                        className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                      />
                      <p className="text-xs text-slate-400 mt-2">
                        {scannerForm.fileName ? `${scannerForm.fileName} · ${formatFileSize(scannerForm.fileSize)}` : "You can also save scanner notes without attaching a file."}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Capture notes</label>
                      <textarea
                        value={scannerForm.notes}
                        onChange={(e) => handleScannerChange("notes", e.target.value)}
                        rows="4"
                        placeholder="Example: mentions flare-ups, reduced range of motion, and missed work shifts."
                        className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleStartScan}
                        disabled={isScanning}
                        className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60"
                      >
                        {isScanning ? "Scanning..." : "Run interactive scan"}
                      </button>
                      <button
                        onClick={exportDossier}
                        disabled={!dossier.length}
                        className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:border-slate-400 disabled:opacity-60"
                      >
                        Export Dossier JSON
                      </button>
                    </div>

                    {lastScanResult && (
                      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Latest OCR simulation</p>
                            <p className="font-bold text-slate-900">{lastScanResult.title}</p>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-cyan-700 border border-cyan-200">
                            {lastScanResult.confidence}% confidence
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white border border-cyan-100 rounded-xl p-4">
                          {lastScanResult.ocrText}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Dossier vault</h3>
                        <p className="text-sm text-slate-500">Persistent document cards saved from this browser session onward.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Types tracked</p>
                        <p className="text-sm font-bold text-slate-900">{Object.keys(dossierCounts).filter((key) => key !== "total").length}</p>
                      </div>
                    </div>

                    {!dossier.length ? (
                      <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/70 p-10 text-center">
                        <Icons.Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="font-bold text-slate-700">Your Dossier is empty.</p>
                        <p className="text-sm text-slate-500 mt-2">Run your first scan to start building a persistent evidence stack.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[60rem] overflow-y-auto pr-1">
                        {dossier.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                                    {item.type}
                                  </span>
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                    {item.status}
                                  </span>
                                </div>
                                <p className="font-bold text-slate-900 text-lg">{item.title}</p>
                                <p className="text-sm text-slate-500">
                                  {item.condition || "General evidence"} · {item.source} · {formatDateTime(item.capturedAt)}
                                </p>
                              </div>
                              <button
                                onClick={() => removeDossierItem(item.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Icons.Trash className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">File</p>
                                <p className="font-medium text-slate-700 mt-1">
                                  {item.fileName ? `${item.fileName} · ${formatFileSize(item.fileSize)}` : "Scanner note only"}
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">OCR confidence</p>
                                <p className="font-medium text-slate-700 mt-1">{item.confidence}%</p>
                              </div>
                            </div>
                            <div className="mt-4 text-sm whitespace-pre-line leading-relaxed text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-4">
                              {item.ocrText}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeView === "calculator" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="max-w-3xl">
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-green-600 mb-2">Official-style combined rating logic</p>
                      <h2 className="text-2xl font-black text-slate-900 mb-3">VA Math Calculator</h2>
                      <p className="text-slate-600 leading-relaxed">
                        Each added condition is applied to your remaining healthy efficiency, rounded to the nearest whole
                        number after every step, then rounded to the nearest 10% at the end. This remains an estimate
                        because your currently-entered rating is already a rounded VA result.
                      </p>
                      <button
                        onClick={() => setExpandCalcHelp((prev) => !prev)}
                        className="mt-4 text-sm font-bold text-green-700 hover:text-green-800"
                      >
                        {expandCalcHelp ? "Hide the math rules" : "Show the math rules"}
                      </button>
                      {expandCalcHelp && (
                        <div className="mt-4 rounded-2xl bg-green-50 border border-green-100 p-4 text-sm text-green-900">
                          <ul className="list-disc list-inside space-y-1.5">
                            <li>Use <strong>Increase</strong> if a condition is already service connected but got worse.</li>
                            <li>Use <strong>New</strong> if the VA has never rated that condition before.</li>
                            <li>Claims entered here are educational only and do not replace a combined ratings table review.</li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 min-w-[18rem]">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Compensation estimator</p>
                      <p className="text-sm text-slate-600 mb-4">
                        TYFYS is using the current VA veteran rate table for base + spouse + children under 18.
                      </p>
                      <a
                        href={VA_COMPENSATION_SOURCE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-blue-700 hover:text-blue-800"
                      >
                        Open official VA compensation rates
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.05fr,0.95fr] gap-6">
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Current rating</label>
                          <select
                            value={currentRating}
                            onChange={(e) => setCurrentRating(parseInt(e.target.value, 10))}
                            className="w-full mt-2 p-3 bg-slate-50 border rounded-xl"
                          >
                            {RATING_OPTIONS.map((rating) => (
                              <option key={rating} value={rating}>
                                {rating}%
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Spouse</label>
                          <select
                            value={hasSpouse ? "yes" : "no"}
                            onChange={(e) => setHasSpouse(e.target.value === "yes")}
                            className="w-full mt-2 p-3 bg-slate-50 border rounded-xl"
                          >
                            <option value="no">No spouse</option>
                            <option value="yes">Has spouse</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Children under 18</label>
                          <select
                            value={childCount}
                            onChange={(e) => setChildCount(parseInt(e.target.value, 10))}
                            className="w-full mt-2 p-3 bg-slate-50 border rounded-xl"
                          >
                            {[0, 1, 2, 3, 4, 5].map((count) => (
                              <option key={count} value={count}>
                                {count}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                          <select
                            value={selectedCategory}
                            onChange={(e) => {
                              setSelectedCategory(e.target.value);
                              setSelectedCondition("");
                            }}
                            className="w-full mt-2 p-3 border rounded-xl"
                          >
                            <option value="">Select...</option>
                            {Object.keys(DISABILITY_DATA).map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Condition</label>
                          <select
                            value={selectedCondition}
                            onChange={(e) => setSelectedCondition(e.target.value)}
                            disabled={!selectedCategory}
                            className="w-full mt-2 p-3 border rounded-xl disabled:bg-slate-100"
                          >
                            <option value="">Select...</option>
                            {selectedCategory &&
                              DISABILITY_DATA[selectedCategory].map((condition) => (
                                <option key={condition.name} value={condition.name}>
                                  {condition.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Expected rating</label>
                          <select
                            value={newRatingInput}
                            onChange={(e) => setNewRatingInput(parseInt(e.target.value, 10))}
                            className="w-full mt-2 p-3 border rounded-xl"
                          >
                            {CLAIM_RATING_OPTIONS.map((rating) => (
                              <option key={rating} value={rating}>
                                {rating}%
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Claim type</label>
                          <div className="mt-2 flex rounded-xl border overflow-hidden">
                            <button
                              onClick={() => setClaimType("increase")}
                              className={`flex-1 py-3 text-xs font-bold ${claimType === "increase" ? "bg-green-100 text-green-800" : "bg-white text-slate-500"}`}
                            >
                              INCREASE
                            </button>
                            <button
                              onClick={() => setClaimType("new")}
                              className={`flex-1 py-3 text-xs font-bold ${claimType === "new" ? "bg-blue-100 text-blue-800" : "bg-white text-slate-500"}`}
                            >
                              NEW
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={addClaim}
                          disabled={!selectedCondition}
                          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
                        >
                          Add condition
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="rounded-2xl bg-slate-900 text-white p-5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current</p>
                          <p className="text-3xl font-black mt-2">{currentRating}%</p>
                        </div>
                        <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-green-700">Projected</p>
                          <p className="text-3xl font-black text-green-900 mt-2">{calculation.afterRating || currentRating}%</p>
                        </div>
                        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Raw before final round</p>
                          <p className="text-3xl font-black text-blue-900 mt-2">{Math.round(vaMathDetail.rawCombined)}%</p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Monthly increase</p>
                          <p className="text-2xl font-black text-amber-900 mt-2">+{formatMoney(calculation.diffMonthly)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Claims in the stack</h3>
                          <p className="text-sm text-slate-500">These ratings are applied from highest to lowest inside VA math.</p>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          {addedClaims.length} claim{addedClaims.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      {!addedClaims.length ? (
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
                          <Icons.Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="font-bold text-slate-700">No claims added yet.</p>
                          <p className="text-sm text-slate-500 mt-2">Start with the condition inputs above to see exact rating math.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {addedClaims.map((claim, idx) => (
                            <div key={`${claim.name}-${idx}`} className="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${claim.type === "new" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                                    {claim.type}
                                  </span>
                                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                    {claim.rating}%
                                  </span>
                                </div>
                                <p className="font-bold text-slate-900">{claim.name}</p>
                                <p className="text-sm text-slate-500">{claim.dbq}</p>
                              </div>
                              <button onClick={() => removeClaim(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                <Icons.Trash className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Step-by-step breakdown</h3>
                          <p className="text-sm text-slate-500">Every claim reduces the remaining healthy efficiency, not the original 100%.</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsBotOpen(true);
                            addMessage(
                              "bot",
                              "Here is the key rule: every new percentage is applied to what remains efficient, not to the original 100 percent. That is why VA math feels smaller with each step."
                            );
                          }}
                          className="text-xs font-bold text-blue-700 hover:text-blue-800"
                        >
                          Ask Angela
                        </button>
                      </div>
                      {!vaMathDetail.steps.length ? (
                        <p className="text-sm text-slate-500">Add at least one claim to see the exact VA math sequence.</p>
                      ) : (
                        <div className="space-y-3">
                          {vaMathDetail.steps.map((step, idx) => (
                            <div key={step.id} className="rounded-2xl border border-slate-200 p-4">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <p className="font-bold text-slate-900">Step {idx + 1}: add {step.rating}%</p>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  rounds to {step.roundedCombined}%
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">
                                Starting combined rating <strong>{step.beforeCombined}%</strong> leaves{" "}
                                <strong>{step.remainingEfficiency}%</strong> healthy efficiency. Applying {step.rating}% to that
                                remainder adds <strong>{step.exactIncrease.toFixed(1)} points</strong>, which rounds to{" "}
                                <strong>{step.roundedCombined}%</strong>.
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Path to 100%</h3>
                          <p className="text-sm text-slate-500">Guidance is based only on the ratings entered in this tool.</p>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Need 95 raw to round to 100
                        </span>
                      </div>
                      <div className="rounded-2xl bg-slate-900 text-white p-5 mb-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current ceiling</p>
                        <p className="text-3xl font-black mt-2">{pathTo100Guide.currentCombined}%</p>
                        <p className="text-sm text-slate-300 mt-2">
                          You need roughly {pathTo100Guide.neededRawPoints.toFixed(0)} more raw combined points to hit the 95%
                          threshold that rounds to 100%.
                        </p>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="font-bold text-slate-900 mb-1">Single-claim path</p>
                          <p className="text-slate-600">
                            {pathTo100Guide.singleStep
                              ? `One additional ${pathTo100Guide.singleStep[0]}% rating would push this scenario to 100%.`
                              : "No single rating from 10% to 100% reaches 100% from the scenario entered here."}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="font-bold text-slate-900 mb-1">Two-claim path</p>
                          <p className="text-slate-600">
                            {pathTo100Guide.doubleStep
                              ? `A pair like ${pathTo100Guide.doubleStep[0]}% + ${pathTo100Guide.doubleStep[1]}% would get this scenario to 100%.`
                              : "No simple two-claim combination was found with the standard 10% increments."}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                          <p className="font-bold mb-1">Important limitation</p>
                          <p>
                            If your existing VA rating already contains many individual conditions, this estimate can understate or
                            overstate the exact path because the tool starts from your rounded current percentage.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Compensation snapshot</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Monthly change</p>
                          <p className="text-3xl font-black text-slate-900 mt-2">+{formatMoney(calculation.diffMonthly)}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Five-year value</p>
                          <p className="text-3xl font-black text-slate-900 mt-2">{formatMoney(calculation.diff5Year)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === "pact_explorer" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-600 mb-2">Official VA exposure guidance</p>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">PACT Act Explorer</h2>
                  <p className="text-slate-600 max-w-4xl">{pactConfig.intro}</p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {Object.keys(PACT_ERA_CONFIG).map((era) => (
                      <button
                        key={era}
                        onClick={() => setPactEra(era)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${pactEra === era ? "bg-orange-600 text-white border-orange-600" : "bg-white text-slate-600 border-slate-300 hover:border-orange-300"}`}
                      >
                        {era}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[18rem,1fr] gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recommended tracks</h3>
                    <div className="space-y-3">
                      {pactTrackIds.map((trackId) => {
                        const track = PACT_TRACKS[trackId];
                        return (
                          <button
                            key={trackId}
                            onClick={() => setPactTrackId(trackId)}
                            className={`w-full text-left rounded-2xl border p-4 transition-all ${pactTrackId === trackId ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-orange-300"}`}
                          >
                            <p className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-1">{track.tag}</p>
                            <p className="font-bold text-slate-900">{track.title}</p>
                            <p className="text-sm text-slate-500 mt-2">{track.summary}</p>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Source bundle</p>
                      <div className="space-y-2 text-sm">
                        <a href={PACT_SOURCE_URL} target="_blank" rel="noreferrer" className="block font-bold text-blue-700 hover:text-blue-800">
                          VA PACT Act overview
                        </a>
                        <a href={activePactTrack.sourceUrl} target="_blank" rel="noreferrer" className="block font-bold text-blue-700 hover:text-blue-800">
                          Open active track source
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                              {activePactTrack.tag}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900">{activePactTrack.title}</h3>
                          <p className="text-slate-600 mt-2 max-w-3xl">{activePactTrack.summary}</p>
                        </div>
                        <a
                          href={activePactTrack.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-blue-700 hover:text-blue-800"
                        >
                          Open official VA source
                        </a>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Qualifying service windows / locations</p>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {activePactTrack.serviceWindows.map((item) => (
                              <li key={item} className="flex gap-2">
                                <span className="text-orange-500 font-black">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Claim strategy notes</p>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {activePactTrack.notes.map((item) => (
                              <li key={item} className="flex gap-2">
                                <span className="text-orange-500 font-black">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Presumptive conditions</h3>
                          <p className="text-sm text-slate-500">Search within the active exposure track.</p>
                        </div>
                        <input
                          value={pactSearch}
                          onChange={(e) => setPactSearch(e.target.value)}
                          placeholder="Search conditions..."
                          className="w-full md:w-72 p-3 border rounded-xl bg-slate-50"
                        />
                      </div>
                      {filteredPactConditions.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredPactConditions.map((condition) => (
                            <div key={condition} className="rounded-2xl border border-slate-200 p-4 bg-white">
                              <p className="font-bold text-slate-900">{condition}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                          <p className="font-bold text-slate-700">No conditions matched that search.</p>
                          <p className="text-sm text-slate-500 mt-2">Try a broader term like "cancer", "sinus", or "Parkinson".</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === "nexus_generator" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex flex-col lg:flex-row justify-between gap-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600 mb-2">Drafting support only</p>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Nexus Template Generator</h2>
                      <p className="text-slate-600 max-w-4xl">
                        Build a clinician-ready draft that connects service facts, symptom history, and the records already in your
                        Dossier. A licensed medical professional still has to independently review, edit, and sign the final opinion.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveView("dossier")}
                      className="self-start px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:border-slate-400"
                    >
                      Open Dossier
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr,1.05fr] gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Veteran name</label>
                        <input
                          value={nexusForm.veteranName}
                          onChange={(e) => setNexusForm((prev) => ({ ...prev, veteranName: e.target.value }))}
                          placeholder="Veteran name"
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Claimed condition</label>
                        <select
                          value={nexusForm.condition}
                          onChange={(e) => setNexusForm((prev) => ({ ...prev, condition: e.target.value }))}
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        >
                          <option value="">Select...</option>
                          {CONDITION_OPTIONS.map((condition) => (
                            <option key={condition} value={condition}>
                              {condition}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Link type</label>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {NEXUS_LINK_TYPES.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setNexusForm((prev) => ({ ...prev, linkType: option.id }))}
                            className={`text-left p-4 rounded-2xl border transition-all ${nexusForm.linkType === option.id ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-300"}`}
                          >
                            <p className="font-bold text-slate-900">{option.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {(nexusForm.linkType === "secondary" || nexusForm.linkType === "aggravation") && (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary service-connected condition</label>
                        <input
                          value={nexusForm.primaryCondition}
                          onChange={(e) => setNexusForm((prev) => ({ ...prev, primaryCondition: e.target.value }))}
                          placeholder="Example: PTSD, lumbar strain, tinnitus"
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        />
                      </div>
                    )}

                    {nexusForm.linkType === "toxic" && (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Exposure track</label>
                        <select
                          value={nexusForm.exposureTrack}
                          onChange={(e) => setNexusForm((prev) => ({ ...prev, exposureTrack: e.target.value }))}
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        >
                          {Object.values(PACT_TRACKS).map((track) => (
                            <option key={track.id} value={track.id}>
                              {track.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Service event or exposure history</label>
                      <textarea
                        value={nexusForm.serviceEvent}
                        onChange={(e) => setNexusForm((prev) => ({ ...prev, serviceEvent: e.target.value }))}
                        rows="4"
                        placeholder="Example: convoy operations, repeated airborne jumps, burn pit exposure, documented in-service injury..."
                        className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Symptom history and continuity</label>
                      <textarea
                        value={nexusForm.symptomHistory}
                        onChange={(e) => setNexusForm((prev) => ({ ...prev, symptomHistory: e.target.value }))}
                        rows="4"
                        placeholder="Outline onset, progression, flare-ups, and what continued after separation."
                        className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Functional impact</label>
                      <textarea
                        value={nexusForm.functionalImpact}
                        onChange={(e) => setNexusForm((prev) => ({ ...prev, functionalImpact: e.target.value }))}
                        rows="4"
                        placeholder="Explain work limits, sleep disruption, mobility loss, missed shifts, or safety issues."
                        className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Medical reasoning notes</label>
                      <textarea
                        value={nexusForm.medicalRationale}
                        onChange={(e) => setNexusForm((prev) => ({ ...prev, medicalRationale: e.target.value }))}
                        rows="4"
                        placeholder="Add imaging findings, treatment chronology, literature themes, or differential diagnosis points."
                        className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinician name</label>
                        <input
                          value={nexusForm.clinicianName}
                          onChange={(e) => setNexusForm((prev) => ({ ...prev, clinicianName: e.target.value }))}
                          placeholder="Dr. Jane Smith"
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinician specialty</label>
                        <input
                          value={nexusForm.clinicianSpecialty}
                          onChange={(e) => setNexusForm((prev) => ({ ...prev, clinicianSpecialty: e.target.value }))}
                          placeholder="Psychiatry, neurology, orthopedics..."
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Additional records reviewed</label>
                      <textarea
                        value={nexusForm.recordsReviewed}
                        onChange={(e) => setNexusForm((prev) => ({ ...prev, recordsReviewed: e.target.value }))}
                        rows="3"
                        placeholder="One record per line if you want to force-include specific documents."
                        className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                      />
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Matching dossier support</p>
                      {matchingNexusDocs.length ? (
                        <div className="flex flex-wrap gap-2">
                          {matchingNexusDocs.slice(0, 6).map((item) => (
                            <span key={item.id} className="text-xs font-bold px-2 py-1 rounded-full bg-white text-violet-700 border border-violet-200">
                              {item.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-violet-900">No matching Dossier items yet. Add service records, lay statements, or private medical evidence to strengthen the draft.</p>
                      )}
                    </div>

                    <button
                      onClick={generateNexusTemplate}
                      className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700"
                    >
                      Generate nexus draft
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Draft output</h3>
                        <p className="text-sm text-slate-500">Clinician review required before use.</p>
                      </div>
                      <button
                        onClick={copyNexusDraft}
                        disabled={!nexusDraft}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:border-slate-400 disabled:opacity-60"
                      >
                        {nexusCopied ? "Copied" : "Copy draft"}
                      </button>
                    </div>
                    {!nexusDraft ? (
                      <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
                        <Icons.Quote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="font-bold text-slate-700">No draft generated yet.</p>
                        <p className="text-sm text-slate-500 mt-2">Complete the fields on the left and generate a nexus template.</p>
                      </div>
                    ) : (
                      <pre className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-5 overflow-y-auto">
                        {nexusDraft}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeView === "doc_wizard" && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Free Document Finder</h2>
                    <p className="text-slate-500">Select a condition to see the EXACT documents required by the VA.</p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide">Always Free</div>
                </div>

                {/* INSTRUCTIONAL GRAPHIC */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                    <p className="text-xs font-bold text-slate-700 uppercase">Select Condition</p>
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-300">
                      <Icons.ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                    <p className="text-xs font-bold text-slate-700 uppercase">Get Checklist</p>
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-300">
                      <Icons.ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                    <p className="text-xs font-bold text-slate-700 uppercase">Build Claim</p>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-500 uppercase mb-2">I want to claim:</label>
                  <select
                    value={docWizardCondition}
                    onChange={(e) => setDocWizardCondition(e.target.value)}
                    className="w-full p-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                  >
                    <option value="">Select a condition...</option>
                    {Object.keys(DISABILITY_DATA).flatMap((cat) =>
                      DISABILITY_DATA[cat].map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {docWizardCondition && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 animate-fadeIn flex-1">
                    <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                      <Icons.FileText className="w-6 h-6" /> Required Evidence Checklist
                    </h3>
                    {(() => {
                      const flatData = Object.values(DISABILITY_DATA).flat();
                      const item = flatData.find((i) => i.name === docWizardCondition);
                      return item ? (
                        <ul className="space-y-4">
                          <li className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 font-bold text-sm">DBQ</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 block text-lg">{item.dbq}</span>
                                <HelpTooltip
                                  title="Disability Benefits Questionnaire"
                                  content="This is the specific form VA doctors use to rate your condition. It asks the exact medical questions needed for a rating."
                                />
                              </div>
                              <span className="text-slate-500 text-sm">Official VA Questionnaire.</span>
                            </div>
                            <button
                              onClick={() => {
                                setIsBotOpen(true);
                                addMessage(
                                  "bot",
                                  "Our specialists can complete this DBQ for you based on medical evidence. Check the Strategy tab."
                                );
                              }}
                              className="text-xs bg-slate-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors whitespace-nowrap self-center"
                            >
                              Help Me With This
                            </button>
                          </li>
                          {item.docs &&
                            item.docs.map((doc) => (
                              <li key={doc} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 font-bold text-sm">DOC</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 block text-lg">{doc}</span>
                                    <HelpTooltip
                                      title="Supporting Documentation"
                                      content="Evidence like personal statements or medical logs helps prove the severity and frequency of your condition."
                                    />
                                  </div>
                                  <span className="text-slate-500 text-sm">Supporting evidence.</span>
                                </div>
                              </li>
                            ))}
                          <li className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-orange-400 relative group">
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600 font-bold text-sm">NEXUS</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 block text-lg">Medical Opinion</span>
                                <HelpTooltip
                                  title="The Nexus Letter"
                                  content="This is the most critical document. It is a letter from a doctor stating your condition is 'more likely than not' caused by your service. Without it, claims often fail."
                                />
                              </div>
                              <span className="text-slate-500 text-sm">Crucial link.</span>
                            </div>
                            <button
                              onClick={() => setShowSpecialistModal(true)}
                              className="text-xs bg-orange-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap self-center shadow-md"
                            >
                              Get a Private Doctor
                            </button>
                          </li>
                        </ul>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            )}

            {activeView === "strategy" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Choose Your Path</h2>
                      <p className="text-slate-500 text-lg">Select the level of support you need.</p>
                    </div>
                    {!discountUnlocked && !isMember && (
                      <button
                        onClick={() => setShowDiscountModal(true)}
                        className="mt-4 md:mt-0 bg-green-100 hover:bg-green-200 text-green-800 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                      >
                        <Icons.ShieldCheck className="w-5 h-5" /> Qualify for 10% Off
                      </button>
                    )}
                  </div>

                  {/* TIMELINE COMPARISON */}
                  <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Icons.Clock className="w-5 h-5 text-blue-600" /> Average Timeline to Completion
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                          <span>Self-Filing / VSO</span>
                          <span>12-18 Months</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                          <div className="bg-red-400 h-4 rounded-full" style={{ width: "100%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm font-bold text-green-700 mb-1">
                          <span>TYFYS Specialist</span>
                          <span>5-8 Months</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4">
                          <div className="bg-green-500 h-4 rounded-full" style={{ width: "40%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-10 border-2 border-blue-500 bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-bl-xl tracking-wider">
                      RECOMMENDED
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                      <div>
                        <h3 className="text-3xl font-bold mb-4">Premium Membership</h3>
                        <p className="text-blue-200 mb-6 text-lg">The ultimate toolkit for veterans.</p>
                        <ul className="space-y-3 text-blue-50 font-medium">
                          <li className="flex items-center gap-3">
                            <Icons.Clock className="w-5 h-5 text-green-400" /> Save 7-10 months of waiting (Avg)
                          </li>
                          <li className="flex items-center gap-3">
                            <Icons.CheckCircle className="w-5 h-5 text-green-400" /> <strong>Unlimited</strong> TYFYS Claims Assistant
                          </li>
                          <li className="flex items-center gap-3">
                            <Icons.CheckCircle className="w-5 h-5 text-green-400" /> <strong>1 Free 30-min Consult</strong> / Month
                          </li>
                          <li className="flex items-center gap-3">
                            <Icons.CheckCircle className="w-5 h-5 text-green-400" /> <strong>25% OFF</strong> Professional Services
                          </li>
                        </ul>
                      </div>
                      <div className="text-center md:text-right bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20">
                        <p className="text-5xl font-extrabold mb-1">
                          $250<span className="text-xl font-normal text-blue-200">/mo</span>
                        </p>
                        <button
                          onClick={() => {
                            startSecureCheckout({
                              planName: "Premium Membership",
                              planCode: "250_monthly",
                              unlockPremium: true
                            });
                          }}
                          disabled={isCheckoutLoading}
                          className="w-full bg-white text-blue-900 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
                        >
                          {isCheckoutLoading ? "Redirecting..." : "Join Premium"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* HIGHLY STYLED STANDARD PACKAGE CARD */}
                    <div className="border border-slate-700 bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-600"></div>
                      <span className="absolute top-4 right-4 bg-slate-700/50 backdrop-blur-sm border border-slate-600 text-slate-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        ESSENTIAL
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Standard Package</h3>
                      <div className="flex items-baseline gap-3 mb-2">
                        <p className="text-4xl font-extrabold text-white tracking-tight">
                          ${isMember ? "2,625" : discountUnlocked ? "3,150" : "3,500"}
                        </p>
                        {(discountUnlocked || isMember) && <span className="text-lg text-slate-400 line-through font-medium opacity-70">$3,500</span>}
                      </div>
                      <p className="text-sm text-slate-300 font-bold mb-8 uppercase tracking-wide opacity-90">$500 Deposit + Monthly Plan</p>

                      <ul className="space-y-4 mb-8 text-slate-200 font-medium">
                        <li className="flex items-center gap-3">
                          <div className="bg-slate-700/50 p-1.5 rounded-full">
                            <Icons.CheckCircle className="w-4 h-4 text-slate-300" />
                          </div>
                          <span>
                            Includes Up to <strong>3 Claims</strong>
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="bg-slate-700/50 p-1.5 rounded-full">
                            <Icons.CheckCircle className="w-4 h-4 text-slate-300" />
                          </div>
                          <span>Private Doctor Nexus Letter</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="bg-slate-700/50 p-1.5 rounded-full">
                            <Icons.CheckCircle className="w-4 h-4 text-slate-300" />
                          </div>
                          <span>DBQ Completion</span>
                        </li>
                      </ul>
                      <button
                        onClick={() => {
                          startSecureCheckout({
                            planName: "Standard Package"
                          });
                        }}
                        disabled={isCheckoutLoading}
                        className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all shadow-lg"
                      >
                        {isCheckoutLoading ? "Redirecting..." : "Request This Plan"}
                      </button>
                    </div>

                    {/* HIGHLY STYLED MULTI-CLAIM PACKAGE CARD */}
                    <div className="border border-blue-900 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ring-1 ring-blue-500/30">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                      <div className="absolute -right-12 top-6 bg-yellow-500 text-blue-900 text-xs font-bold px-12 py-1 rotate-45 shadow-lg z-10">
                        MAX VALUE
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Multi-Claim Package</h3>
                      <div className="flex items-baseline gap-3 mb-2">
                        <p className="text-4xl font-extrabold text-white tracking-tight">
                          ${isMember ? "4,125" : discountUnlocked ? "4,950" : "5,500"}
                        </p>
                        {(discountUnlocked || isMember) && <span className="text-lg text-blue-300 line-through font-medium opacity-70">$5,500</span>}
                      </div>
                      <p className="text-sm text-blue-200 font-bold mb-8 uppercase tracking-wide opacity-90">$500 Deposit + Monthly Plan</p>

                      <ul className="space-y-4 mb-8 text-blue-50 font-medium">
                        <li className="flex items-center gap-3">
                          <div className="bg-blue-800/50 p-1.5 rounded-full">
                            <Icons.Star className="w-4 h-4 text-yellow-400" />
                          </div>
                          <span className="text-white">
                            Includes Up to <strong>7 Claims</strong>
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="bg-blue-800/50 p-1.5 rounded-full">
                            <Icons.CheckCircle className="w-4 h-4 text-blue-300" />
                          </div>
                          <span>Full Body Medical Review</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="bg-blue-800/50 p-1.5 rounded-full">
                            <Icons.CheckCircle className="w-4 h-4 text-blue-300" />
                          </div>
                          <span>Multiple Nexus Letters</span>
                        </li>
                      </ul>
                      <button
                        onClick={() => {
                          startSecureCheckout({
                            planName: "Multi-Claim Package"
                          });
                        }}
                        disabled={isCheckoutLoading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/50"
                      >
                        {isCheckoutLoading ? "Redirecting..." : "Request This Plan"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === "intake_portal" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">First Activity After Payment</p>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">Complete Your Intake Portal</h2>
                  <p className="text-slate-600 max-w-3xl">
                    {hasPaid
                      ? `Payment confirmed for ${paymentState.planName || "your plan"}. Start here so our team can review your profile and prepare your claim workflow.`
                      : "Complete a plan payment first to unlock this intake step."}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-5">
                    <a
                      href="intake-portal.html"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                    >
                      Open Intake in New Tab <Icons.ArrowRight className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setActiveView("welcome_guide")}
                      className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:border-slate-400 transition-colors"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <iframe
                    title="TYFYS Intake Portal"
                    src="intake-portal.html"
                    className="w-full h-[76vh] min-h-[640px] border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* AI Claims Bot */}
            {activeView === "ai_claims" && (
              <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Icons.Bot className="w-5 h-5 text-green-400" />
                    <h3 className="font-bold">TYFYS Claims Bot</h3>
                  </div>
                  <div className="text-xs bg-white/10 px-2 py-1 rounded">
                    {isMember ? "Unlimited Access" : `${3 - dailyQuestionCount} Free Questions Left`}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {aiBotMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm leading-relaxed ${msg.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"}`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAiBotSend} className="p-4 bg-white border-t border-slate-200 relative">
                  {!isMember &&
                    dailyQuestionCount >= 3 && (
                      <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center text-center p-4">
                        <Icons.Lock className="w-6 h-6 text-slate-400 mb-2" />
                        <p className="text-sm font-bold text-slate-800 mb-1">Daily Limit Reached</p>
                        <button onClick={() => setActiveView("strategy")} className="text-xs text-blue-600 underline">
                          Upgrade to Premium for Unlimited
                        </button>
                      </div>
                    )}
                  <div className="relative">
                    <input
                      type="text"
                      value={aiBotInput}
                      onChange={(e) => setAiBotInput(e.target.value)}
                      placeholder="Ask Angela anything..."
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!aiBotInput.trim()}
                      className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icons.Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* BOT SIDEBAR */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 flex flex-col z-50 ${isBotOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Icons.User className="w-6 h-6 text-blue-900" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-900 rounded-full"></span>
            </div>
            <div>
              <p className="font-bold text-sm">Angela - Guide</p>
              <p className="text-xs text-blue-200">Online | Here for You</p>
            </div>
          </div>
          <button onClick={() => setIsBotOpen(false)} className="text-blue-200 hover:text-white transition-colors">
            <Icons.X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm leading-relaxed ${msg.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"}`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Angela anything..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icons.Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<TYFYSPlatform />);
