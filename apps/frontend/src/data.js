export const copy = {
  hero: {
    eyebrow: 'Welcome back!',
    title: 'Your VA disability roadmap, organized.',
    body:
      'Thank You For Your Service (TYFYS) helps you collect records, prepare for private medical evaluations, and build a fully developed claim evidence packet—step by step, at your pace, with a specialist available whenever you want a human check-in.',
    compliance:
      'TYFYS is a private, Service-Disabled Veteran-Owned business. We are not the Department of Veterans Affairs (VA) or a Veterans Service Organization, and we do not file claims or appeals on your behalf. We help you organize medical evidence and documentation so you can file confidently through official VA channels or with an accredited representative of your choice.',
    actions: [
      {
        label: 'Resume claim TY-8842',
        description: 'Pick up where you left off in your current TYFYS evidence project.',
        primary: true
      },
      {
        label: 'Talk to a Specialist',
        description: 'Schedule time with a TYFYS team member if you want help or a second set of eyes.'
      },
      {
        label: 'Open claim prep assistant',
        description: 'Walk through the questions you’ll see on VA Form 21-526EZ and get organized before you file.'
      }
    ],
    pills: ['Built with veterans', 'Secure document pipelines', 'VA-friendly formats', 'No-skip checklists']
  },
  keepMoving: {
    title: 'Keep your claim moving',
    body:
      'See every TYFYS project you’re working on in one place. Each card shows where you are in the TYFYS evidence-building process—not your official VA status—and what’s next on your checklist.',
    microcopy:
      'These stages track your TYFYS steps—intake, records, provider appointments, and packet review. For official claim status, always rely on the VA.',
    projects: [
      {
        id: 'TY-8842',
        title: 'Evidence packet for knee & back increase',
        stage: 'Evidence & delivery',
        summary: 'Records uploaded. Provider appointments scheduled for next week.',
        nextStep: 'Upload imaging and add lay statements for daily impact.'
      },
      {
        id: 'TY-7719',
        title: 'New claim: migraines and sleep issues',
        stage: 'Contract & questionnaires',
        summary: 'Service history confirmed. Mini-DBQs partially complete.',
        nextStep: 'Finish questionnaires so we can prep provider packets.'
      },
      {
        id: 'TY-6610',
        title: 'Secondary claims: radiculopathy & hip',
        stage: 'Welcome & triage',
        summary: 'Intent to File date captured. Intake is ready to start.',
        nextStep: 'Complete your intake so we can map conditions and evidence.'
      }
    ]
  },
  tracker: {
    title: 'Real-time TYFYS progress tracker',
    body:
      'Follow your progress from “I just logged in” to “my evidence packet is ready to file.” Every stage has clear tasks, checklists, and uploads so nothing falls through the cracks.',
    stages: [
      {
        name: 'Welcome & triage',
        tag: 'Stage 1',
        description:
          'Confirm your service history, current rating, Intent to File status, and goals for this claim. If anything is unclear, you can switch to a live call or chat with a TYFYS specialist at any time.'
      },
      {
        name: 'Contract & medical questionnaires',
        tag: 'Stage 2',
        description:
          'Complete your TYFYS service agreement and Release of Information, then fill out short “mini-DBQ” style questionnaires that mirror what your providers will need for their medical opinions and forms. Everything is signed and stored in your secure portal.'
      },
      {
        name: 'Evidence & delivery',
        tag: 'Stage 3',
        description:
          'Upload your DD-214, service treatment records, private medical records, and lay statements. TYFYS then coordinates your private provider appointments (telehealth or in-person where available) and assembles a single evidence packet you can use to file a Fully Developed Claim with the VA.'
      }
    ],
    ctas: {
      addEvidence: 'Add evidence now',
      viewAppointments: 'View appointment options'
    },
    note: 'This tracker shows your TYFYS milestones only and does not show official VA processing status or decisions.'
  },
  claimAssistant: {
    title: 'Claim prep assistant (VA Form 21-526EZ)',
    body:
      'Practice the questions from VA Form 21-526EZ, organize your answers, and see which documents match each part of your claim. When you’re ready, you’ll use this information to complete and submit the official form directly with the VA or with an accredited representative.',
    disclaimer:
      'TYFYS does not submit forms to the VA, does not provide legal advice, and is not a substitute for an accredited representative or attorney.'
  },
  tools: {
    title: 'Tools built into your TYFYS home base',
    items: [
      {
        title: 'Combined rating calculator',
        body:
          'Estimate your potential combined rating using the same “VA math” method, so you’re not surprised when percentages don’t add up the way you expect. This is an educational estimate only—the VA makes all final rating decisions.'
      },
      {
        title: 'Dependents & payment estimator (2025)',
        body:
          'See how adding a spouse and dependents could change your monthly tax-free VA compensation based on the most recent published rates. Use this as a planning tool only; your actual payments are determined by the VA.'
      },
      {
        title: 'Packet prep',
        body:
          'Turn “get my records together” into simple missions. We break your tasks into clear steps like “upload DD-214,” “add buddy statements,” and “attach imaging for knee and back,” with progress you can see.'
      },
      {
        title: 'Evidence by condition',
        body:
          'Interactive checklists for major condition categories—musculoskeletal, mental health, respiratory, neurological, cardiovascular, and more—so you can see what types of evidence typically support stronger claims and rating increases.'
      },
      {
        title: 'Occupation & era navigator',
        body:
          'Choose your MOS, rate, and era of service to see common primary and secondary conditions, exposures, and recommended evaluations connected to your job. This is based on patterns seen across occupations, not a diagnosis.'
      },
      {
        title: 'DBQ minis',
        body:
          'Short, plain-English prompts that map to VA Disability Benefits Questionnaires (DBQs), so your private doctor or VSO can quickly understand what needs to be documented—without you having to speak in “VA form” language.'
      },
      {
        title: 'SF-180 helper',
        body:
          'Answer a few questions and generate a ready-to-send SF-180 request to obtain your service treatment and personnel records from the right archive. You review and submit the request yourself through official government channels.'
      },
      {
        title: 'Upload civilian records',
        body:
          'Use your secure document vault to store imaging, specialist notes, nexus opinions, and other civilian records in one place so your TYFYS team and your providers are working from the same file.'
      },
      {
        title: 'Objection-aware tips',
        body:
          'Bite-sized education modules that answer common questions about timing, cost, rating myths, and concerns about working while rated—delivered at the stage where they’re most helpful.'
      }
    ]
  },
  resources: {
    title: 'Resources that follow the TYFYS blueprint',
    items: [
      {
        title: 'DD-214 & Intent to File guide',
        body:
          'Step-by-step retrieval instructions, official links, and timelines for getting your DD-214 and submitting an Intent to File (ITF) so you protect the earliest possible effective date for your benefits.'
      },
      {
        title: 'TYFYS vs. common claim options',
        body:
          'See how TYFYS’s flat-fee, evidence-first approach compares with free Veterans Service Organizations, contingency-fee claim services, and law firms—so you can decide what kind of support, if any, you want to use alongside the free options available to you.'
      },
      {
        title: 'VA forms',
        body:
          'Quick links to the VA forms you’re most likely to use while you work through your tracker: 21-526EZ, 21-0781, 21-686c, 21-8940, and SF-180. All links go directly to official VA websites.'
      },
      {
        title: 'Evidence packet checklist',
        body: 'A high-level view of what “complete” usually looks like:',
        list: [
          'DD-214 and ITF in place',
          'Service treatment and personnel records',
          'Private medical records and imaging',
          'Condition-specific DBQs and medical opinions',
          'Lay statements and impact statements',
          'Occupation/era-based exposure evidence where relevant'
        ]
      }
    ]
  },
  forms: {
    title: 'VA forms, ready to download',
    items: [
      {
        title: '21-526EZ',
        body: 'Application for Disability Compensation (VA Form 21-526EZ). Link goes directly to the official VA form.'
      },
      {
        title: '21-0781',
        body: 'Statement in Support of Claim for Service Connection for PTSD (VA Form 21-0781).'
      },
      {
        title: '21-686c',
        body: 'Declaration of Status of Dependents (VA Form 21-686c).'
      },
      {
        title: '21-8940',
        body:
          'Veteran’s Application for Increased Compensation Based on Unemployability (VA Form 21-8940). TYFYS does not assist with TDIU claims, but we include this form so you have everything in one place if you choose to pursue it separately.'
      },
      {
        title: 'SF-180',
        body:
          'Request Pertaining to Military Records (SF-180), used to request copies of your service records from official archives.'
      }
    ]
  },
  updates: {
    title: 'Updates from your TYFYS team',
    body:
      'Release notes, how-to videos, and plain-English explanations of changes that could affect how you build your evidence packet. We focus on education, not legal advice, so you can decide your next steps with the VA or an accredited representative you trust.'
  },
  complianceBlock: {
    title: 'Important information',
    bullets: [
      'Thank You For Your Service (TYFYS) is a private, Service-Disabled Veteran-Owned business. We are not the U.S. Department of Veterans Affairs (VA), any other government agency, or a Veterans Service Organization (VSO).',
      'You can always file a VA disability claim for free directly with the VA or with the help of an accredited VSO or representative.',
      'TYFYS does not provide legal, tax, or financial advice and does not represent you before the VA or any court.',
      'Our tools are for education and organization only. Using TYFYS does not guarantee any specific rating, effective date, or outcome on your VA claim.'
    ]
  }
};
