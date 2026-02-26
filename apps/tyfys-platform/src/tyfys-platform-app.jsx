const React = window.React;
const ReactDOM = window.ReactDOM;
const { useState, useEffect, useRef } = React;

const shouldSkipLanding = document.body.dataset.page === "sign-up";

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

const PAY_TABLE_2024 = {
  10: { base: 171.23, spouse: 0, child: 0 },
  20: { base: 338.49, spouse: 0, child: 0 },
  30: { base: 524.31, spouse: 63.0, child: 31.0 },
  40: { base: 755.28, spouse: 84.0, child: 42.0 },
  50: { base: 1075.16, spouse: 105.0, child: 52.0 },
  60: { base: 1361.88, spouse: 126.0, child: 63.0 },
  70: { base: 1716.28, spouse: 151.0, child: 75.0 },
  80: { base: 1995.01, spouse: 172.0, child: 86.0 },
  90: { base: 2241.91, spouse: 193.0, child: 96.0 },
  100: { base: 3737.85, spouse: 216.54, child: 103.55 }
};

// --- MATH UTILITIES ---
const calculatePay = (rating, hasSpouse, children) => {
  const baseRates = {
    10: 171,
    20: 338,
    30: 524,
    40: 755,
    50: 1075,
    60: 1361,
    70: 1716,
    80: 1995,
    90: 2241,
    100: 3737
  };
  let total = baseRates[rating] || 0;
  if (rating >= 30) {
    if (hasSpouse) total += rating === 100 ? 216 : 63 + ((rating - 30) / 10) * 20;
    if (children > 0) total += children * (rating === 100 ? 103 : 31 + ((rating - 30) / 10) * 10);
  }
  return total;
};

const calculateCombinedRating = (currentRating, newDisabilities) => {
  let combined = currentRating;
  const sortedNew = [...newDisabilities].sort((a, b) => b - a);
  for (let i = 0; i < sortedNew.length; i += 1) {
    const next = sortedNew[i];
    const remainingEfficiency = 100 - combined;
    const increase = (remainingEfficiency * next) / 100;
    combined += increase;
    combined = Math.round(combined);
  }
  const remainder = combined % 10;
  return Math.min(remainder >= 5 ? combined + (10 - remainder) : combined - remainder, 100);
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
          onClick={onStart}
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
  // STATE
  const [hasStarted, setHasStarted] = useState(shouldSkipLanding); // Landing state
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [userProfile, setUserProfile] = useState({
    pain_categories: [],
    pain_points: [],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    zip: "",
    privateOrg: false,
    terms: false
  });
  const [activeView, setActiveView] = useState("welcome_guide");
  const [isMember, setIsMember] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
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

  const [expandCalcHelp, setExpandCalcHelp] = useState(false);

  const chatEndRef = useRef(null);
  const botMemory = useRef({ hasPitchedNexus: false, hasWelcomed: false, viewGuidesSent: new Set() });

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [activeView]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
    let newData = { ...userProfile };
    if (Array.isArray(newData[qid])) {
      if (newData[qid].includes(value)) newData[qid] = newData[qid].filter((item) => item !== value);
      else newData[qid] = [...newData[qid], value];
    } else {
      newData[qid] = value;
    }
    setUserProfile(newData);
    if (qid === "rating") setCurrentRating(Number(value));
  };

  const handleContactSubmit = (contactData) => {
    setUserProfile((prev) => ({ ...prev, ...contactData }));
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
    setUserProfile((prev) => ({ ...prev, ...newData }));
    setShowProfileEdit(false);
    setIsBotOpen(true);
    // Updated profile save message
    addMessage("bot", "I've carefully updated your profile details. This will help us take better care of your specific needs.");
  };

  // Calculator Logic
  useEffect(() => {
    const newRatings = addedClaims.map((c) => parseInt(c.rating, 10));
    const beforePay = calculatePay(parseInt(currentRating, 10), hasSpouse, parseInt(childCount, 10));
    const afterRating = calculateCombinedRating(parseInt(currentRating, 10), newRatings);
    const afterPay = calculatePay(afterRating, hasSpouse, parseInt(childCount, 10));
    const diffMonthly = Math.max(0, afterPay - beforePay);

    const baseFee = addedClaims.length > 3 ? 5500 : 3500;
    const fee = baseFee * (isMember ? 0.75 : discountUnlocked ? 0.9 : 1);

    setCalculation({
      beforePay,
      afterPay,
      afterRating,
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
        rating: newRatingInput,
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

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

  // Auto-advance logic for loading screen
  useEffect(() => {
    if (!onboardingComplete && ONBOARDING_STEPS[onboardingStep] && ONBOARDING_STEPS[onboardingStep].type === "loading") {
      const timer = setTimeout(() => completeOnboarding(), 2000);
      return () => clearTimeout(timer);
    }
  }, [onboardingComplete, onboardingStep, completeOnboarding]);

  // --- RENDERING ---
  if (!hasStarted) {
    return <LandingOverlay onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* NEW ONBOARDING MODAL */}
      {!onboardingComplete && (
        <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-slate-200">
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

            <div className="p-8 md:p-10 bg-slate-50 min-h-[400px] flex flex-col justify-center">
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
                                onClick={() => handleOnboardingAnswer(q.id, true)}
                                className={`flex-1 py-4 rounded-xl border-2 text-lg font-bold transition-all ${userProfile[q.id] === true ? "border-blue-600 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-500 hover:border-blue-400"}`}
                              >
                                Yes
                              </button>
                              <button
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

          <p className="px-4 py-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tools</p>
          <button
            onClick={() => setActiveView("calculator")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "calculator" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Calculator className="w-5 h-5" /> Strategy Calculator
          </button>
          <button
            onClick={() => setActiveView("doc_wizard")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "doc_wizard" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.FileUp className="w-5 h-5" /> Free Doc Finder
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
              {activeView === "calculator" && "Disability Strategy Calculator"}
              {activeView === "doc_wizard" && "Document Resource Finder"}
              {activeView === "strategy" && "Strategic Roadmap"}
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
                          onClick={() => setActiveView("doc_wizard")}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <Icons.FileUp className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Find Evidence Docs</span>
                          </div>
                          <Icons.ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => setActiveView("strategy")}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                              <Icons.TrendingUp className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-green-700">Calculate ROI</span>
                          </div>
                          <Icons.ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-green-400" />
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
            {activeView === "calculator" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  {/* --- INSTRUCTIONAL HEADER --- */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 h-fit">
                          <Icons.Info className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-blue-900 mb-1">How to Use the Calculator</h3>
                          <p className="text-sm text-blue-700 leading-relaxed mb-2">
                            Build your potential rating by adding conditions below. The VA uses "Fuzzy Math," so 50% + 50% does not equal 100%. This tool handles that math for you.
                          </p>
                          <ul className="list-disc list-inside text-xs text-blue-600 space-y-1">
                            <li>
                              Use <strong>Increase</strong> if you are already rated for a condition but it has gotten worse.
                            </li>
                            <li>
                              Use <strong>New</strong> for conditions the VA has never rated.
                            </li>
                          </ul>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsBotOpen(true);
                          addMessage(
                            "bot",
                            "Need help with the math? The 'Combined Rating' formula is tricky. Essentially, each new disability is rated against your REMAINING healthy efficiency."
                          );
                        }}
                        className="text-xs text-blue-600 underline font-bold whitespace-nowrap"
                      >
                        Ask Expert
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between mb-4">
                    <h2 className="font-bold text-lg">Strategy Calculator</h2>
                  </div>

                  {/* INPUTS ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Current Rating</label>
                      <select
                        value={currentRating}
                        onChange={(e) => setCurrentRating(parseInt(e.target.value, 10))}
                        className="w-full p-3 bg-slate-50 border rounded-xl"
                      >
                        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((r) => (
                          <option key={r} value={r}>
                            {r}%
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedCondition("");
                        }}
                        className="w-full p-3 border rounded-xl"
                      >
                        <option value="">Select...</option>
                        {Object.keys(DISABILITY_DATA).map((c) => (
                          <option key={c} value={c}>
                            {c}
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
                        className="w-full p-3 border rounded-xl disabled:bg-slate-100"
                      >
                        <option value="">Select...</option>
                        {selectedCategory &&
                          DISABILITY_DATA[selectedCategory].map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* ACTION ROW */}
                  <div className="flex gap-4 items-end mb-6">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Expected Rating</label>
                      <select value={newRatingInput} onChange={(e) => setNewRatingInput(e.target.value)} className="w-full p-3 border rounded-xl">
                        {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((r) => (
                          <option key={r} value={r}>
                            {r}%
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                      <div className="flex rounded-xl border overflow-hidden">
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
                      Add Condition
                    </button>
                  </div>

                  {/* RESULTS */}
                  <div className="bg-slate-900 text-white p-6 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-bold">Monthly Increase</p>
                      <p className="text-3xl font-extrabold text-green-400">+{formatMoney(calculation.diffMonthly)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs uppercase font-bold">5 Year Value</p>
                      <p className="text-3xl font-extrabold">{formatMoney(calculation.diff5Year)}</p>
                    </div>
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
                            setIsMember(true);
                            addMessage("bot", "Welcome to Premium! I've unlocked all tools.");
                          }}
                          className="w-full bg-white text-blue-900 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
                        >
                          Join Premium
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
                          setIsBotOpen(true);
                          addMessage("bot", "Great choice. I'll get the paperwork started for the Standard Package.");
                        }}
                        className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all shadow-lg"
                      >
                        Select Plan
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
                          setIsBotOpen(true);
                          addMessage("bot", "Smart move. The Multi-Claim package maximizes your ROI. Let's proceed.");
                        }}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/50"
                      >
                        Select Plan
                      </button>
                    </div>
                  </div>
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
