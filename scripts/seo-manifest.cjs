const TODAY = "2026-04-13";
const SITE_URL = "https://tyfys.net";

const allHtmlPages = [
  "PTSDintake.html",
  "about_us.html",
  "account-deletion.html",
  "app-coming-soon.html",
  "app-shell.html",
  "app-support.html",
  "app.html",
  "assessment-thank-you.html",
  "back-neck-joints.html",
  "blog.html",
  "blog_posts_content.html",
  "calculator.html",
  "clinic.html",
  "comparison.html",
  "contact.html",
  "cost-of-waiting-va-claim.html",
  "crm-shell.html",
  "dav.html",
  "disability-calculator.html",
  "drportal.html",
  "education.html",
  "faqs.html",
  "first-time-va-claims.html",
  "first-time-va-disability-claims.html",
  "five-year-rule-va-rating.html",
  "flat-fee-vs-backpay.html",
  "fully-developed-vs-standard-claim.html",
  "guide-dd214-c-file-recovery.html",
  "guide-private-medical-records.html",
  "guide-service-treatment-records.html",
  "guide-va-blue-button-records.html",
  "guide-viewing-saving-va-rating.html",
  "how-it-works.html",
  "increase-va-back-pain-rating.html",
  "increasevacompensation.html",
  "index.html",
  "intake-portal-content.html",
  "intake-portal.html",
  "intake.html",
  "intent-to-file-guide.html",
  "knee-pain-range-of-motion.html",
  "lupusstudy.html",
  "mental-health-ptsd.html",
  "migraines-headaches-secondary.html",
  "mission_team.html",
  "nexus-letter-va-claim.html",
  "prepare-mental-health-evaluation.html",
  "privacy.html",
  "private-medical-evidence.html",
  "process.html",
  "ptsd-private-psychologist.html",
  "secondary-conditions-to-100.html",
  "senior-veterans-va-gov-account-guide-2025.html",
  "service-connection-denied-appeal.html",
  "services.html",
  "sign-up.html",
  "sleep-apnea-secondary.html",
  "sms-terms.html",
  "somatic-symptom-disorder-claims.html",
  "suntreeportal.html",
  "test-shell.html",
  "tinnitus-gateway-claim.html",
  "va-disability-increases.html",
  "va-math-explained.html",
  "vabenefits.html",
  "vaclaim.html",
  "vadisabilityincrease.html",
  "varatingincrease.html",
  "veteran-operating-system.html",
  "vso-vs-private-medical-evidence.html",
  "vso.html",
  "what-is-a-dbq.html",
  "working-with-100-percent-va-rating.html",
];

const defaultCanonicalPath = (filename) =>
  filename === "index.html" ? "/" : `/${filename.replace(/\.html$/, "")}`;

const indexablePages = new Set([
  "about_us.html",
  "back-neck-joints.html",
  "blog.html",
  "calculator.html",
  "comparison.html",
  "contact.html",
  "cost-of-waiting-va-claim.html",
  "education.html",
  "faqs.html",
  "five-year-rule-va-rating.html",
  "flat-fee-vs-backpay.html",
  "fully-developed-vs-standard-claim.html",
  "guide-dd214-c-file-recovery.html",
  "guide-private-medical-records.html",
  "guide-service-treatment-records.html",
  "guide-va-blue-button-records.html",
  "guide-viewing-saving-va-rating.html",
  "how-it-works.html",
  "increase-va-back-pain-rating.html",
  "index.html",
  "intent-to-file-guide.html",
  "knee-pain-range-of-motion.html",
  "mental-health-ptsd.html",
  "migraines-headaches-secondary.html",
  "mission_team.html",
  "nexus-letter-va-claim.html",
  "prepare-mental-health-evaluation.html",
  "private-medical-evidence.html",
  "process.html",
  "ptsd-private-psychologist.html",
  "secondary-conditions-to-100.html",
  "senior-veterans-va-gov-account-guide-2025.html",
  "service-connection-denied-appeal.html",
  "services.html",
  "sleep-apnea-secondary.html",
  "somatic-symptom-disorder-claims.html",
  "tinnitus-gateway-claim.html",
  "va-math-explained.html",
  "vso-vs-private-medical-evidence.html",
  "what-is-a-dbq.html",
  "working-with-100-percent-va-rating.html",
]);

const articlePages = new Set([
  "cost-of-waiting-va-claim.html",
  "five-year-rule-va-rating.html",
  "flat-fee-vs-backpay.html",
  "fully-developed-vs-standard-claim.html",
  "increase-va-back-pain-rating.html",
  "intent-to-file-guide.html",
  "knee-pain-range-of-motion.html",
  "migraines-headaches-secondary.html",
  "nexus-letter-va-claim.html",
  "prepare-mental-health-evaluation.html",
  "ptsd-private-psychologist.html",
  "secondary-conditions-to-100.html",
  "senior-veterans-va-gov-account-guide-2025.html",
  "service-connection-denied-appeal.html",
  "sleep-apnea-secondary.html",
  "somatic-symptom-disorder-claims.html",
  "tinnitus-gateway-claim.html",
  "va-math-explained.html",
  "vso-vs-private-medical-evidence.html",
  "what-is-a-dbq.html",
  "working-with-100-percent-va-rating.html",
]);

const guidePages = new Set([
  "guide-dd214-c-file-recovery.html",
  "guide-private-medical-records.html",
  "guide-service-treatment-records.html",
  "guide-va-blue-button-records.html",
  "guide-viewing-saving-va-rating.html",
]);

const redirectTargets = {
  "dav.html": "/comparison",
  "disability-calculator.html": "/calculator",
  "first-time-va-claims.html": "/private-medical-evidence",
  "first-time-va-disability-claims.html": "/private-medical-evidence",
  "increasevacompensation.html": "/private-medical-evidence",
  "va-disability-increases.html": "/private-medical-evidence",
  "vabenefits.html": "/private-medical-evidence",
  "vaclaim.html": "/private-medical-evidence",
  "vadisabilityincrease.html": "/private-medical-evidence",
  "varatingincrease.html": "/private-medical-evidence",
  "vso.html": "/comparison",
};

const overrides = {
  "about_us.html": {
    title: "About TYFYS | Veteran-Owned Private Medical Evidence Team",
    description:
      "Learn about TYFYS, our veteran-owned mission, and how we coordinate private medical evidence to help veterans build stronger VA disability claims.",
    keywordCluster: "about tyfys veteran owned private medical evidence",
    linkText: "About TYFYS",
    pageType: "trust",
  },
  "back-neck-joints.html": {
    title: "VA Disability Ratings for Back, Neck, and Joint Pain | TYFYS",
    description:
      "Learn how TYFYS supports back, neck, and joint VA disability claims with range-of-motion evidence, secondary-condition strategy, and private medical documentation.",
    keywordCluster: "back neck joint va disability claims",
    linkText: "Back, Neck, and Joint Claims",
    pageType: "commercial",
  },
  "blog.html": {
    title: "Veteran Benefits Blog | VA Claim Strategy Guides | TYFYS",
    description:
      "Explore TYFYS guides on VA disability ratings, nexus letters, DBQs, appeals, and records strategy for stronger veterans disability claims.",
    keywordCluster: "veteran benefits blog va claim strategy",
    linkText: "Veteran Benefits Blog",
    pageType: "hub",
  },
  "calculator.html": {
    title: "VA Rating Calculator | Estimate VA Math and Compensation | TYFYS",
    description:
      "Use the TYFYS VA rating calculator landing page to estimate combined ratings, compensation changes, and the path from your current rating toward 100%.",
    keywordCluster: "va rating calculator va math compensation",
    linkText: "VA Rating Calculator",
    pageType: "calculator",
  },
  "comparison.html": {
    title: "VSO vs Lawyer vs Private Medical Evidence | TYFYS Comparison",
    description:
      "Compare VSOs, VA-accredited attorneys, and private medical evidence strategies so you can choose the right path for your VA disability claim.",
    keywordCluster: "vso vs lawyer vs private medical evidence",
    linkText: "VSO vs Lawyer vs Private Evidence",
    pageType: "commercial",
  },
  "contact.html": {
    title: "Contact TYFYS | Book a Discovery Call for VA Claim Evidence Help",
    description:
      "Contact TYFYS to discuss private medical evidence, DBQs, nexus letters, and next steps for building a stronger VA disability claim.",
    keywordCluster: "contact tyfys va disability evidence",
    linkText: "Contact TYFYS",
    pageType: "trust",
  },
  "cost-of-waiting-va-claim.html": {
    keywordCluster: "cost of waiting va claim increase",
    linkText: "The Cost of Waiting on a VA Claim",
  },
  "education.html": {
    title: "VA Claim Education Hub | TYFYS Briefing Room",
    description:
      "Read the TYFYS Briefing Room for practical VA claim education, myth-busting guides, and evidence strategy for veterans seeking higher disability ratings.",
    keywordCluster: "va claim education hub",
    linkText: "VA Claim Education Hub",
    pageType: "hub",
  },
  "faqs.html": {
    title: "VA Disability Claim FAQs | TYFYS",
    description:
      "Get answers about TYFYS services, private medical evidence, timelines, records, flat-fee pricing, and VA claim support boundaries.",
    keywordCluster: "va disability claim faqs private medical evidence",
    linkText: "VA Claim FAQs",
    pageType: "support",
    schemaType: "faq",
  },
  "five-year-rule-va-rating.html": {
    keywordCluster: "five year rule va disability rating",
    linkText: "The 5-Year Rule for VA Ratings",
  },
  "flat-fee-vs-backpay.html": {
    keywordCluster: "flat fee vs backpay va claims",
    linkText: "Flat Fee vs Backpay VA Claim Help",
  },
  "fully-developed-vs-standard-claim.html": {
    keywordCluster: "fully developed claim vs standard claim",
    linkText: "Fully Developed Claim vs Standard Claim",
  },
  "guide-dd214-c-file-recovery.html": {
    title: "How to Recover a DD-214 and C-File | TYFYS Guide",
    description:
      "Use the TYFYS guide to recover a DD-214 and C-file so you can organize the records needed for a stronger VA disability claim.",
    keywordCluster: "dd214 c file recovery guide",
    linkText: "DD-214 and C-File Recovery Guide",
  },
  "guide-private-medical-records.html": {
    title: "How to Get Private Medical Records for a VA Claim | TYFYS Guide",
    description:
      "Learn how to collect private medical records, reduce copy costs, and prepare evidence for VA disability claims using the TYFYS records guide.",
    keywordCluster: "private medical records va claim guide",
    linkText: "Private Medical Records Guide",
  },
  "guide-service-treatment-records.html": {
    title: "How to Get Service Treatment Records | TYFYS Guide",
    description:
      "Follow the TYFYS guide for locating service treatment records so you can build a better-documented VA disability claim.",
    keywordCluster: "service treatment records guide va claim",
    linkText: "Service Treatment Records Guide",
  },
  "guide-va-blue-button-records.html": {
    title: "VA Blue Button Records Guide | TYFYS",
    description:
      "Use the TYFYS Blue Button guide to download VA medical records, save supporting evidence, and organize documents for your claim file.",
    keywordCluster: "va blue button records guide",
    linkText: "VA Blue Button Records Guide",
  },
  "guide-viewing-saving-va-rating.html": {
    title: "How to View and Save Your VA Rating | TYFYS Guide",
    description:
      "Learn how to view and save your VA disability rating on VA.gov so you can document your current benefits and plan next claim steps.",
    keywordCluster: "view and save va rating guide",
    linkText: "View and Save Your VA Rating",
  },
  "how-it-works.html": {
    title: "How TYFYS Works | Private Medical Evidence Timeline",
    description:
      "See the TYFYS process from discovery call through evidence-package handoff so you know what to expect from private medical evidence coordination.",
    keywordCluster: "how tyfys works private medical evidence timeline",
    linkText: "How TYFYS Works",
    pageType: "support",
  },
  "increase-va-back-pain-rating.html": {
    keywordCluster: "increase back pain va rating",
    linkText: "Increase Your VA Back Pain Rating",
  },
  "index.html": {
    title: "Increase Your VA Disability Rating with Private Medical Evidence | TYFYS",
    description:
      "TYFYS coordinates private medical evidence, including DBQs and independent medical opinions, to help veterans build stronger VA disability claims.",
    keywordCluster: "private medical evidence va disability claims",
    linkText: "TYFYS Home",
    pageType: "home",
  },
  "intent-to-file-guide.html": {
    keywordCluster: "intent to file guide va claim",
    linkText: "Intent to File Guide",
  },
  "knee-pain-range-of-motion.html": {
    keywordCluster: "knee pain range of motion va rating",
    linkText: "Knee Pain and Range of Motion Ratings",
  },
  "mental-health-ptsd.html": {
    title: "VA Rating for PTSD and Mental Health Claims | TYFYS",
    description:
      "Learn the VA rating criteria for PTSD, anxiety, and depression and how TYFYS coordinates DBQs and nexus letters for stronger mental health claims.",
    keywordCluster: "ptsd mental health va rating",
    linkText: "PTSD and Mental Health Claims",
    pageType: "commercial",
  },
  "migraines-headaches-secondary.html": {
    keywordCluster: "migraines headaches secondary va claims",
    linkText: "Migraines and Headaches Secondary Claims",
  },
  "mission_team.html": {
    title: "Our Mission and Team | TYFYS",
    description:
      "Meet the TYFYS mission and team supporting veterans with private medical evidence, transparent communication, and claim-preparation guidance.",
    keywordCluster: "tyfys mission and team",
    linkText: "Our Mission and Team",
    pageType: "trust",
  },
  "nexus-letter-va-claim.html": {
    keywordCluster: "nexus letter va claim guide",
    linkText: "Nexus Letter Guide",
  },
  "prepare-mental-health-evaluation.html": {
    keywordCluster: "prepare mental health evaluation va claim",
    linkText: "Prepare for a Mental Health Evaluation",
  },
  "private-medical-evidence.html": {
    title: "Private Medical Evidence for VA Disability Claims | TYFYS",
    description:
      "Build a stronger VA disability claim with TYFYS private medical evidence coordination, including DBQs, nexus letters, record review, and claim strategy support.",
    keywordCluster: "private medical evidence va disability claims",
    linkText: "Private Medical Evidence",
    pageType: "commercial",
  },
  "process.html": {
    title: "Our Process for Private Medical Evidence | TYFYS",
    description:
      "Review the TYFYS process for discovery, evidence mapping, provider coordination, and claim-ready private medical documentation.",
    keywordCluster: "process for private medical evidence va claims",
    linkText: "Our Process",
    pageType: "commercial",
  },
  "ptsd-private-psychologist.html": {
    keywordCluster: "private psychologist ptsd va claim",
    linkText: "Why a Private Psychologist Helps PTSD Claims",
  },
  "secondary-conditions-to-100.html": {
    keywordCluster: "secondary conditions to 100 va rating",
    linkText: "Secondary Conditions to Reach 100 Percent",
  },
  "senior-veterans-va-gov-account-guide-2025.html": {
    keywordCluster: "senior veterans va gov account guide",
    linkText: "VA.gov Account Guide for Senior Veterans",
  },
  "service-connection-denied-appeal.html": {
    keywordCluster: "service connection denied appeal guide",
    linkText: "Service Connection Denied Appeal Guide",
  },
  "services.html": {
    title: "VA Disability Evidence Services | TYFYS",
    description:
      "Explore TYFYS services for private medical evidence coordination, including DBQs and independent medical opinions for VA disability claims.",
    keywordCluster: "va disability evidence services",
    linkText: "VA Disability Evidence Services",
    pageType: "commercial",
  },
  "sleep-apnea-secondary.html": {
    keywordCluster: "sleep apnea secondary va claim",
    linkText: "Sleep Apnea Secondary Claims",
  },
  "somatic-symptom-disorder-claims.html": {
    keywordCluster: "somatic symptom disorder va claims",
    linkText: "Somatic Symptom Disorder Claims",
  },
  "tinnitus-gateway-claim.html": {
    keywordCluster: "tinnitus gateway claim va",
    linkText: "Tinnitus Gateway Claims",
  },
  "va-math-explained.html": {
    keywordCluster: "va math explained",
    linkText: "VA Math Explained",
  },
  "vso-vs-private-medical-evidence.html": {
    keywordCluster: "vso vs private medical evidence",
    linkText: "VSO vs Private Medical Evidence",
  },
  "what-is-a-dbq.html": {
    keywordCluster: "what is a dbq va claim",
    linkText: "What Is a DBQ?",
  },
  "working-with-100-percent-va-rating.html": {
    keywordCluster: "working with 100 percent va rating",
    linkText: "Working with a 100 Percent VA Rating",
  },
};

const OFFICIAL_SOURCES = {
  appeals: [
    {
      href: "https://www.va.gov/decision-reviews/",
      label: "VA decision review options",
    },
    {
      href: "https://www.va.gov/disability/how-to-file-claim/",
      label: "VA claim filing guidance",
    },
  ],
  compensation: [
    {
      href: "https://www.va.gov/disability/",
      label: "VA disability compensation overview",
    },
    {
      href: "https://www.va.gov/disability/how-to-file-claim/",
      label: "How to file a VA disability claim",
    },
  ],
  records: [
    {
      href: "https://www.va.gov/records/",
      label: "VA records and documents hub",
    },
    {
      href: "https://www.va.gov/records/get-military-service-records/",
      label: "Get military service records",
    },
  ],
};

const pages = Object.fromEntries(
  allHtmlPages.map((filename) => {
    const override = overrides[filename] || {};
    const redirectTarget = redirectTargets[filename] || null;
    const canonicalPath = override.canonicalPath || defaultCanonicalPath(filename);
    const indexable = redirectTarget ? false : indexablePages.has(filename);
    const pageType =
      override.pageType ||
      (redirectTarget
        ? "redirect"
        : guidePages.has(filename)
          ? "guide"
          : articlePages.has(filename)
            ? "article"
            : indexable
              ? "page"
              : "utility");
    const schemaType =
      override.schemaType ||
      (redirectTarget
        ? "none"
        : filename === "faqs.html"
          ? "faq"
          : guidePages.has(filename)
            ? "article"
            : articlePages.has(filename)
              ? "blog"
              : indexable
                ? "service"
                : "none");

    return [
      filename,
      {
        canonicalPath,
        indexable,
        noindex: !indexable,
        pageType,
        schemaType,
        keywordCluster: override.keywordCluster || "tyfys veteran benefits",
        redirectTarget,
        title: override.title,
        description: override.description,
        linkText: override.linkText,
        dateModified:
          override.dateModified || (guidePages.has(filename) || articlePages.has(filename) ? TODAY : undefined),
        editorial: guidePages.has(filename) || articlePages.has(filename),
      },
    ];
  }),
);

module.exports = {
  TODAY,
  SITE_URL,
  DEFAULT_OG_IMAGE: "/logo.png",
  OFFICIAL_SOURCES,
  pages,
};
