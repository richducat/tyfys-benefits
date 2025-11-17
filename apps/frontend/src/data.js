export const copy = {
  hero: {
    title: 'Your VA benefits, built the TYFYS way',
    subtitle:
      'We guide you through every gated step with clear tasks, evidence checklists, and a live tracker. We are not the VA or a VSO.',
    ctaPrimary: 'Create Demo Case',
    ctaSecondary: 'Talk to a Specialist',
  },
  badges: [
    'Zoho-safe: separate layouts & pipeline',
    'Evidence-first: no skipped steps',
    'Uses Zoho Sign + Zoho Forms (no duplicates)',
  ],
  education: [
    'How VA math works and why ITF matters',
    'What a fully developed claim requires',
    'Why evidence-by-condition beats generic claims',
  ],
  pricing: {
    summary: 'Transparent, flat pricing used in our current playbook',
    tiers: [
      { name: 'Single condition', price: '$3,500', detail: 'For one primary condition' },
      { name: 'Up to 5 conditions', price: '$5,500', detail: 'Balanced for most veterans' },
      { name: 'More than 5', price: 'Up to $8,000', detail: 'Complex cases with multiple secondaries' },
      { name: 'Deposit', price: '$500', detail: 'Due at contract signing via Zoho Sign' },
    ],
  },
  disclaimer: 'TYFYS prepares your evidence and packet. You file your claim on VA.gov. We are not the VA or a VSO.',
};

export const evidenceChecklists = {
  Back: [
    'Service treatment records noting injuries or complaints',
    'Recent imaging (MRI/X-ray)',
    'Physical therapy notes',
    'Lay statement describing functional limits',
  ],
  Knee: [
    'Service records of knee injury or overuse',
    'Orthopedic exams or imaging',
    'Range-of-motion measurements',
    'Buddy statement on duty impact',
  ],
  PTSD: [
    'Stressors and timeline',
    'Diagnosis from licensed provider',
    'Therapy notes and medication history',
    'Impact statement covering work and relationships',
  ],
  Hearing: [
    'MOS/Rate noise exposure evidence',
    'Audiogram with thresholds',
    'Tinnitus description',
    'Protective equipment history',
  ],
};

export const trackerStages = [
  { id: 'welcome', name: 'Welcome & Eligibility Triage' },
  { id: 'offer', name: 'ROI/Offer & Secure Checkout' },
  { id: 'account', name: 'Account Setup & Portal Orientation' },
  { id: 'dd214', name: 'DD-214 & ITF' },
  { id: 'records', name: 'Service & Medical Records Intake' },
  { id: 'intake', name: 'Intake Interview (Self-guided or Live)' },
  { id: 'mdbq', name: 'MDBQs via Zoho Forms' },
  { id: 'provider', name: 'Provider Scheduling' },
  { id: 'evidence', name: 'Evidence Package Build' },
  { id: 'review', name: 'Final Review & Delivery Support' },
  { id: 'submit', name: 'Submit (Veteran-led)' },
  { id: 'decision', name: 'Decision & Follow-up' },
];
