const fs = require("fs");
const path = require("path");
const manifest = require("./seo-manifest.cjs");

const ROOT = path.resolve(__dirname, "..");
const { DEFAULT_OG_IMAGE, OFFICIAL_SOURCES, SITE_URL, TODAY, pages } = manifest;

const pageFiles = Object.keys(pages);
const canonicalMap = Object.fromEntries(
  pageFiles.map((filename) => [
    filename,
    pages[filename].redirectTarget || pages[filename].canonicalPath,
  ]),
);

function absoluteUrl(canonicalPath) {
  return new URL(canonicalPath === "/" ? "/" : canonicalPath, `${SITE_URL}/`).toString();
}

function prettyDate(isoDate = TODAY) {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripTags(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHeadline(value) {
  return stripTags(value).replace(/^\d+\.\s*/, "").trim();
}

function extractTag(html, regex, fallback = "") {
  const match = html.match(regex);
  return match ? stripTags(match[1]) : fallback;
}

function extractTitle(html) {
  return extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
}

function extractDescription(html) {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i);
  return match ? stripTags(match[1]) : "";
}

function extractFirstH1(html) {
  return cleanHeadline(extractTag(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
}

function extractLeadParagraph(html) {
  const matches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const paragraph of matches) {
    const text = stripTags(paragraph);
    if (text.length >= 60) {
      return text;
    }
  }
  return "";
}

function clampDescription(value, maxLength = 165) {
  const text = stripTags(value);
  if (text.length <= maxLength) {
    return text;
  }

  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > 80 ? lastSpace : maxLength).trim()}...`;
}

function titleWithoutBrand(title) {
  return String(title || "")
    .replace(/\s*\|\s*TYFYS(?: Veteran Benefits Blog)?\s*$/i, "")
    .replace(/\s*\|\s*Thank You For Your Service\s*$/i, "")
    .trim();
}

function normalizeLinks(html) {
  let output = html.replace(/href=(["'])([^"']+)\1/gi, (full, quote, href) => {
    if (
      href.startsWith("#") ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("sms:") ||
      href.startsWith("javascript:")
    ) {
      return full;
    }

    const [basePart, suffix = ""] = href.split(/([?#].*)/, 2);
    const normalizedBase = basePart.replace(/^\.\//, "");

    if (!canonicalMap[normalizedBase]) {
      return full;
    }

    const nextHref = `${canonicalMap[normalizedBase]}${suffix}`;
    return `href=${quote}${nextHref}${quote}`;
  });

  const labelReplacements = [
    [/Backpay Calculator/g, "VA Rating Calculator"],
    [/Project potential monthly increases instantly\./g, "Estimate combined ratings and compensation."],
    [/Model projected monthly increases\./g, "Estimate combined ratings and compensation."],
    [/Compare: VSO vs\. Us/g, "Compare Claim Paths"],
    [/Understand how private evidence accelerates claims\./g, "Compare VSOs, lawyers, and private medical evidence."],
    [/See how private evidence accelerates claims\./g, "Compare VSOs, lawyers, and private medical evidence."],
  ];

  for (const [pattern, replacement] of labelReplacements) {
    output = output.replace(pattern, replacement);
  }

  return output;
}

function removeSeoFromHead(head) {
  return head
    .replace(/<!-- SEO START -->[\s\S]*?<!-- SEO END -->\s*/gi, "")
    .replace(/<title[^>]*>[\s\S]*?<\/title>\s*/gi, "")
    .replace(/<meta[^>]+name=["']description["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name=["']keywords["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name=["']robots["'][^>]*>\s*/gi, "")
    .replace(/<link[^>]+rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]+property=["']og:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name=["']twitter:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, "");
}

function upsertHeadSeo(html, seoBlock) {
  const match = html.match(/<head>([\s\S]*?)<\/head>/i);
  if (!match) {
    return html;
  }

  let head = removeSeoFromHead(match[1]);
  if (/<meta[^>]+name=["']viewport["'][^>]*>/i.test(head)) {
    head = head.replace(
      /(<meta[^>]+name=["']viewport["'][^>]*>\s*)/i,
      `$1${seoBlock}\n`,
    );
  } else {
    head = `${seoBlock}\n${head}`;
  }

  return html.replace(match[0], `<head>${head}</head>`);
}

function buildBreadcrumbs(filename, entry, fallbackTitle) {
  if (filename === "index.html") {
    return [];
  }

  const currentLabel = entry.linkText || titleWithoutBrand(fallbackTitle) || "TYFYS";
  if (entry.pageType === "article") {
    return [
      { label: "Home", path: "/" },
      { label: "Veteran Benefits Blog", path: "/blog" },
      { label: currentLabel, path: entry.canonicalPath },
    ];
  }

  if (entry.pageType === "guide") {
    return [
      { label: "Home", path: "/" },
      { label: "Briefing Room", path: "/education" },
      { label: currentLabel, path: entry.canonicalPath },
    ];
  }

  return [
    { label: "Home", path: "/" },
    { label: currentLabel, path: entry.canonicalPath },
  ];
}

function buildProfessionalService(description) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "TYFYS",
    url: SITE_URL,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    telephone: "321-248-2805",
    address: {
      "@type": "PostalAddress",
      streetAddress: "11845 SW Bennington Cir",
      addressLocality: "Port Saint Lucie",
      addressRegion: "FL",
      postalCode: "34987",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "United States",
    },
    description,
  };
}

function buildBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.path),
    })),
  };
}

function buildArticleSchema(entry, title, description, canonicalPath) {
  return {
    "@context": "https://schema.org",
    "@type": entry.pageType === "guide" ? "Article" : "BlogPosting",
    headline: titleWithoutBrand(title),
    description,
    mainEntityOfPage: absoluteUrl(canonicalPath),
    datePublished: entry.dateModified || TODAY,
    dateModified: entry.dateModified || TODAY,
    author: {
      "@type": "Organization",
      name: "TYFYS Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "TYFYS",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(DEFAULT_OG_IMAGE),
      },
    },
    image: absoluteUrl(DEFAULT_OG_IMAGE),
  };
}

function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does TYFYS do?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TYFYS coordinates private medical evidence, including DBQs and independent medical opinions, to support veterans disability claims.",
        },
      },
      {
        "@type": "Question",
        name: "Does TYFYS file VA claims or provide legal representation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. TYFYS does not file VA claims, provide legal advice, or provide legal representation.",
        },
      },
      {
        "@type": "Question",
        name: "How long does the process usually take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Timelines vary by records readiness, provider scheduling, and case complexity. VA decision timelines are always controlled by the VA.",
        },
      },
      {
        "@type": "Question",
        name: "What documents should I gather first?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Start with DD-214, service treatment records, current diagnosis records, medication lists, and prior VA decision letters.",
        },
      },
      {
        "@type": "Question",
        name: "Do you guarantee an approval or rating increase?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. TYFYS does not guarantee outcomes. All claim decisions are made by the VA.",
        },
      },
      {
        "@type": "Question",
        name: "Is pricing percentage-based?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. TYFYS uses a flat-fee model and does not take percentages of VA backpay.",
        },
      },
    ],
  };
}

function buildSchemaObjects(filename, entry, title, description) {
  if (entry.noindex) {
    return [];
  }

  const breadcrumbs = buildBreadcrumbs(filename, entry, title);
  const objects = [];

  if (entry.pageType === "article" || entry.pageType === "guide") {
    objects.push(buildArticleSchema(entry, title, description, entry.canonicalPath));
    if (breadcrumbs.length) {
      objects.push(buildBreadcrumbSchema(breadcrumbs));
    }
    return objects;
  }

  if (entry.pageType === "home" || entry.pageType === "commercial" || entry.pageType === "trust" || entry.pageType === "support" || entry.pageType === "hub" || entry.pageType === "calculator" || entry.pageType === "page") {
    objects.push(buildProfessionalService(description));
    if (entry.schemaType === "faq") {
      objects.push(buildFaqSchema());
    }
    if (breadcrumbs.length) {
      objects.push(buildBreadcrumbSchema(breadcrumbs));
    }
  }

  return objects;
}

function buildSeoBlock(filename, entry, fallback) {
  const canonicalPath = entry.redirectTarget || entry.canonicalPath;
  const title =
    entry.title ||
    fallback.title ||
    `${entry.linkText || fallback.h1 || "TYFYS"} | TYFYS`;
  const description =
    entry.description ||
    fallback.description ||
    fallback.lead ||
    "TYFYS coordinates private medical evidence to support stronger VA disability claims.";
  const robots = entry.noindex
    ? "noindex,follow,max-image-preview:large"
    : "index,follow,max-image-preview:large";
  const ogType =
    entry.pageType === "article" || entry.pageType === "guide" ? "article" : "website";
  const canonicalUrl = absoluteUrl(canonicalPath);
  const schemaObjects = buildSchemaObjects(filename, entry, title, description);

  const schemaBlock = schemaObjects
    .map(
      (item) =>
        `  <script type="application/ld+json">\n${JSON.stringify(item, null, 2)
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n")}\n  </script>`,
    )
    .join("\n");

  return [
    "<!-- SEO START -->",
    `  <title>${escapeHtml(title)}</title>`,
    `  <meta name="description" content="${escapeHtml(clampDescription(description))}" />`,
    `  <meta name="robots" content="${robots}" />`,
    `  <link rel="canonical" href="${canonicalUrl}" />`,
    `  <meta property="og:title" content="${escapeHtml(title)}" />`,
    `  <meta property="og:description" content="${escapeHtml(clampDescription(description))}" />`,
    `  <meta property="og:url" content="${canonicalUrl}" />`,
    `  <meta property="og:type" content="${ogType}" />`,
    `  <meta property="og:image" content="${absoluteUrl(DEFAULT_OG_IMAGE)}" />`,
    `  <meta property="og:site_name" content="TYFYS" />`,
    `  <meta name="twitter:card" content="summary_large_image" />`,
    `  <meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `  <meta name="twitter:description" content="${escapeHtml(clampDescription(description))}" />`,
    `  <meta name="twitter:image" content="${absoluteUrl(DEFAULT_OG_IMAGE)}" />`,
    schemaBlock,
    "<!-- SEO END -->",
  ]
    .filter(Boolean)
    .join("\n");
}

function inferRelatedFiles(filename, entry) {
  if (entry.related) {
    return entry.related;
  }

  const cluster = String(entry.keywordCluster || "").toLowerCase();
  if (cluster.includes("records") || cluster.includes("dd214") || cluster.includes("blue button")) {
    return [
      "guide-service-treatment-records.html",
      "guide-private-medical-records.html",
      "guide-viewing-saving-va-rating.html",
      "guide-dd214-c-file-recovery.html",
    ];
  }

  if (cluster.includes("ptsd") || cluster.includes("mental health")) {
    return [
      "mental-health-ptsd.html",
      "prepare-mental-health-evaluation.html",
      "ptsd-private-psychologist.html",
      "comparison.html",
    ];
  }

  if (cluster.includes("back") || cluster.includes("joint") || cluster.includes("knee")) {
    return [
      "back-neck-joints.html",
      "increase-va-back-pain-rating.html",
      "knee-pain-range-of-motion.html",
      "private-medical-evidence.html",
    ];
  }

  if (cluster.includes("secondary") || cluster.includes("sleep apnea") || cluster.includes("migraines") || cluster.includes("tinnitus")) {
    return [
      "secondary-conditions-to-100.html",
      "sleep-apnea-secondary.html",
      "migraines-headaches-secondary.html",
      "private-medical-evidence.html",
    ];
  }

  if (cluster.includes("appeal") || cluster.includes("denied") || cluster.includes("intent to file")) {
    return [
      "service-connection-denied-appeal.html",
      "intent-to-file-guide.html",
      "comparison.html",
      "private-medical-evidence.html",
    ];
  }

  if (cluster.includes("dbq") || cluster.includes("nexus") || cluster.includes("private medical evidence")) {
    return [
      "private-medical-evidence.html",
      "what-is-a-dbq.html",
      "nexus-letter-va-claim.html",
      "comparison.html",
    ];
  }

  return ["private-medical-evidence.html", "comparison.html", "calculator.html", "blog.html"];
}

function pickSources(entry) {
  const cluster = String(entry.keywordCluster || "").toLowerCase();
  if (cluster.includes("records") || cluster.includes("dd214") || cluster.includes("blue button")) {
    return OFFICIAL_SOURCES.records;
  }
  if (cluster.includes("appeal") || cluster.includes("denied")) {
    return OFFICIAL_SOURCES.appeals;
  }
  return OFFICIAL_SOURCES.compensation;
}

function buildEditorialMeta(filename, entry, title) {
  const breadcrumbs = buildBreadcrumbs(filename, entry, title);
  const breadcrumbHtml = breadcrumbs
    .map((item, index) => {
      const arrow = index === 0 ? "" : '<span class="text-slate-300">/</span>';
      return `${arrow}<a href="${item.path}" class="hover:text-navy-800 transition">${escapeHtml(item.label)}</a>`;
    })
    .join("");

  return [
    "<!-- SEO EDITORIAL META START -->",
    '<section class="bg-white border-b border-slate-200">',
    '  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">',
    `    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">${breadcrumbHtml}</nav>`,
    '    <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">',
    '      <span class="font-semibold text-slate-900">Reviewed by TYFYS Editorial Team</span>',
    `      <span>Updated ${escapeHtml(prettyDate(entry.dateModified || TODAY))}</span>`,
    '      <span>National VA claim strategy and evidence guidance</span>',
    "    </div>",
    "  </div>",
    "</section>",
    "<!-- SEO EDITORIAL META END -->",
  ].join("\n");
}

function upsertEditorialMeta(html, filename, entry, title) {
  const block = buildEditorialMeta(filename, entry, title);
  let output = html.replace(/<!-- SEO EDITORIAL META START -->[\s\S]*?<!-- SEO EDITORIAL META END -->\s*/gi, "");
  if (/<\/header>/i.test(output)) {
    output = output.replace(/<\/header>/i, `</header>\n${block}`);
  }
  return output;
}

function buildRelatedSection(entry) {
  const relatedFiles = inferRelatedFiles(null, entry)
    .filter((filename, index, array) => array.indexOf(filename) === index)
    .slice(0, 4);

  const relatedItems = relatedFiles
    .map((filename) => {
      const relatedEntry = pages[filename];
      if (!relatedEntry) {
        return null;
      }
      return [
        '        <li class="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">',
        `          <a href="${relatedEntry.canonicalPath}" class="font-semibold text-slate-900 hover:text-navy-800 transition">${escapeHtml(relatedEntry.linkText || titleWithoutBrand(relatedEntry.title || filename))}</a>`,
        "        </li>",
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n");

  const sourceItems = pickSources(entry)
    .map(
      (item) =>
        `        <li><a href="${item.href}" class="underline decoration-slate-300 underline-offset-4 hover:text-navy-800 transition" rel="nofollow">${escapeHtml(item.label)}</a></li>`,
    )
    .join("\n");

  return [
    "<!-- SEO RELATED START -->",
    '<section class="bg-slate-50 border-t border-slate-200">',
    '  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">',
    '    <div class="grid gap-8 lg:grid-cols-[2fr_1fr]">',
    "      <div>",
    '        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Related next steps</p>',
    '        <ul class="mt-4 grid gap-3 md:grid-cols-2">',
    relatedItems,
    "        </ul>",
    "      </div>",
    "      <div>",
    '        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Official references</p>',
    '        <ul class="mt-4 space-y-3 text-sm text-slate-700">',
    sourceItems,
    "        </ul>",
    "      </div>",
    "    </div>",
    "  </div>",
    "</section>",
    "<!-- SEO RELATED END -->",
  ].join("\n");
}

function upsertRelatedSection(html, entry) {
  const block = buildRelatedSection(entry);
  let output = html.replace(/<!-- SEO RELATED START -->[\s\S]*?<!-- SEO RELATED END -->\s*/gi, "");
  if (/<footer/i.test(output)) {
    output = output.replace(/<footer/i, `${block}\n<footer`);
  }
  return output;
}

function cleanupEditorialBody(html) {
  let output = html.replace(/\s*<p class="meta">Keywords:[\s\S]*?<\/p>\s*/i, "\n");
  output = output.replace(
    /(<div class="prose max-w-none">\s*)<h1[^>]*>[\s\S]*?<\/h1>\s*/i,
    "$1",
  );
  return output;
}

function renderRedirectPage(filename, entry, fallback) {
  const targetUrl = absoluteUrl(entry.redirectTarget);
  const headline = entry.linkText || titleWithoutBrand(fallback.title) || "This page moved";
  const description =
    entry.description ||
    `TYFYS consolidated this page into ${entry.redirectTarget}. You are being sent to the strongest current version of this content.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${buildSeoBlock(filename, entry, {
    title: `${headline} | TYFYS`,
    description,
    h1: headline,
  })}
  <meta http-equiv="refresh" content="0; url=${targetUrl}" />
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #0f172a;
      color: #e2e8f0;
      padding: 2rem;
      text-align: center;
    }
    main {
      max-width: 42rem;
    }
    a {
      color: #fbbf24;
      font-weight: 700;
    }
  </style>
  <script>
    window.location.replace(${JSON.stringify(targetUrl)});
  </script>
</head>
<body>
  <main>
    <h1>${escapeHtml(headline)}</h1>
    <p>${escapeHtml(description)}</p>
    <p>If you are not redirected automatically, <a href="${escapeHtml(entry.redirectTarget)}">continue to the primary TYFYS page</a>.</p>
  </main>
</body>
</html>
`;
}

function renderCalculatorPage(filename, entry) {
  const seoBlock = buildSeoBlock(filename, entry, {
    title: entry.title,
    description: entry.description,
    h1: "VA Rating Calculator",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${seoBlock}
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-L1PEBFCV9Q"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());
    gtag("config", "G-L1PEBFCV9Q");
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            navy: { 900: "#0f172a", 800: "#1e3a8a", 700: "#2d4a9e" },
            gold: { 500: "#f59e0b", 600: "#d97706" }
          }
        }
      }
    };
  </script>
</head>
<body class="bg-slate-100 text-slate-900 antialiased">
  <header class="bg-navy-900 text-white border-b border-slate-700">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
      <a href="/" class="flex items-center gap-3">
        <img src="logo.png" alt="TYFYS logo" class="h-10 w-10 rounded" />
        <span class="font-semibold text-lg">TYFYS</span>
      </a>
      <nav class="flex items-center gap-4 text-sm font-semibold">
        <a href="/private-medical-evidence" class="hover:underline">Private Medical Evidence</a>
        <a href="/comparison" class="hover:underline">Compare Claim Paths</a>
        <a href="/blog" class="hover:underline">Blog</a>
        <a href="/contact" class="px-4 py-2 rounded-lg bg-gold-500 text-slate-900 hover:bg-amber-400 transition">Book Call</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="bg-white border-b border-slate-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">National VA Claim Planning Tool</p>
          <h1 class="mt-4 text-4xl sm:text-5xl font-bold text-navy-900 leading-tight">VA Rating Calculator</h1>
          <p class="mt-6 text-lg text-slate-700 max-w-2xl">
            Estimate combined ratings, monthly compensation impact, and the distance between your current rating and the next milestone. Use the calculator first, then plan the evidence you still need.
          </p>
          <div class="mt-8 flex flex-wrap gap-4">
            <a href="/app-shell.html?tool=calculator" class="inline-flex items-center rounded-lg bg-navy-900 text-white px-5 py-3 font-semibold hover:bg-navy-800 transition">
              Open the Live Calculator
            </a>
            <a href="/private-medical-evidence" class="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-900 hover:border-slate-400 transition">
              Plan the Evidence Strategy
            </a>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">What the calculator helps you see</p>
          <ul class="mt-5 space-y-3 text-slate-700">
            <li class="rounded-lg border border-slate-200 bg-white px-4 py-3">Exact VA math-style combined rating estimates</li>
            <li class="rounded-lg border border-slate-200 bg-white px-4 py-3">Compensation differences between your current and target rating</li>
            <li class="rounded-lg border border-slate-200 bg-white px-4 py-3">Which evidence gaps are keeping you from the next increase</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid gap-6 md:grid-cols-3">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-navy-900">Step 1: Model your current rating</h2>
          <p class="mt-3 text-slate-700">See how the VA combines multiple conditions and rounds compensation outcomes.</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-navy-900">Step 2: Find the missing evidence</h2>
          <p class="mt-3 text-slate-700">Compare your current documentation with the evidence typically needed for the next rating milestone.</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-navy-900">Step 3: Turn the math into a plan</h2>
          <p class="mt-3 text-slate-700">Use the result to decide whether you need records, a DBQ, a nexus letter, or a different claim path.</p>
        </article>
      </div>
    </section>

    <section class="bg-white border-y border-slate-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Good companion reads</p>
          <ul class="mt-5 space-y-3 text-slate-700">
            <li><a href="/va-math-explained" class="underline decoration-slate-300 underline-offset-4 hover:text-navy-800 transition">VA Math Explained</a></li>
            <li><a href="/private-medical-evidence" class="underline decoration-slate-300 underline-offset-4 hover:text-navy-800 transition">Private Medical Evidence for VA Claims</a></li>
            <li><a href="/what-is-a-dbq" class="underline decoration-slate-300 underline-offset-4 hover:text-navy-800 transition">What Is a DBQ?</a></li>
            <li><a href="/comparison" class="underline decoration-slate-300 underline-offset-4 hover:text-navy-800 transition">Compare VSOs, lawyers, and private medical evidence</a></li>
          </ul>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Official references</p>
          <ul class="mt-5 space-y-3 text-slate-700">
            <li><a href="https://www.va.gov/disability/" class="underline decoration-slate-300 underline-offset-4 hover:text-navy-800 transition" rel="nofollow">VA disability compensation overview</a></li>
            <li><a href="https://www.va.gov/disability/how-to-file-claim/" class="underline decoration-slate-300 underline-offset-4 hover:text-navy-800 transition" rel="nofollow">How to file a VA disability claim</a></li>
          </ul>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-navy-900">Calculator FAQ</h2>
        <div class="mt-6 space-y-4">
          <details class="rounded-xl border border-slate-200 bg-slate-50 p-5" open>
            <summary class="cursor-pointer font-semibold text-slate-900">Does the calculator replace official VA decisions?</summary>
            <p class="mt-3 text-slate-700">No. The calculator is a planning tool. Only the VA assigns final disability ratings and effective dates.</p>
          </details>
          <details class="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <summary class="cursor-pointer font-semibold text-slate-900">Can this show why I am stuck below 100%?</summary>
            <p class="mt-3 text-slate-700">Yes. It helps show how close you are to the next rating threshold so you can focus on the evidence gaps with the biggest impact.</p>
          </details>
          <details class="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <summary class="cursor-pointer font-semibold text-slate-900">What should I do after I use the calculator?</summary>
            <p class="mt-3 text-slate-700">Review your results, compare them to your current medical documentation, and then decide whether you need records, a DBQ, a nexus letter, or a new claim strategy.</p>
          </details>
        </div>
      </div>
    </section>
  </main>

  <footer class="bg-slate-900 text-slate-400 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-sm">
      <p>TYFYS coordinates private medical evidence, including DBQs and independent medical opinions, to support veterans disability claims. TYFYS does not provide legal advice, representation, or file VA claims.</p>
    </div>
  </footer>

  <script src="apps/seo-sitewide.js"></script>
</body>
</html>
`;
}

function processStandardPage(filename, entry, html) {
  const normalized = normalizeLinks(html);
  const extractedDescription = extractDescription(normalized);
  const fallback = {
    title: extractTitle(normalized),
    description: extractedDescription.length >= 60 ? extractedDescription : "",
    h1: extractFirstH1(normalized),
    lead: extractLeadParagraph(normalized),
  };

  let output = normalized;
  if (entry.editorial) {
    output = cleanupEditorialBody(output);
    output = upsertEditorialMeta(output, filename, entry, fallback.title || fallback.h1);
    output = upsertRelatedSection(output, entry);
  }

  return upsertHeadSeo(output, buildSeoBlock(filename, entry, fallback));
}

function renderSitemap() {
  const urls = pageFiles
    .filter((filename) => pages[filename].indexable)
    .map((filename) => {
      const entry = pages[filename];
      return [
        "  <url>",
        `    <loc>${absoluteUrl(entry.canonicalPath)}</loc>`,
        `    <lastmod>${entry.dateModified || TODAY}</lastmod>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

for (const filename of pageFiles) {
  const entry = pages[filename];
  const filePath = path.join(ROOT, filename);
  const html = fs.readFileSync(filePath, "utf8");

  let nextHtml;
  if (filename === "calculator.html") {
    nextHtml = renderCalculatorPage(filename, entry);
  } else if (entry.redirectTarget) {
    nextHtml = renderRedirectPage(filename, entry, {
      title: extractTitle(html),
      description: extractDescription(html),
      h1: extractFirstH1(html),
    });
  } else {
    nextHtml = processStandardPage(filename, entry, html);
  }

  fs.writeFileSync(filePath, nextHtml);
}

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), renderSitemap());
