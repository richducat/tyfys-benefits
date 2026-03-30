const React = window.React;
const ReactDOM = window.ReactDOM;
const { useState, useEffect, useRef } = React;

const PAYMENT_STATE_KEY = "tyfys.paymentState";
const LEAD_PREFILL_KEY = "tyfys.leadPrefill";
const CHECKOUT_PENDING_KEY = "tyfys.checkoutPending";
const HAS_STARTED_KEY = "tyfys.hasStarted";
const ZOHO_LEAD_ID_KEY = "tyfys.zohoLeadId";
const DOSSIER_STORAGE_KEY = "tyfys.dossier";
const APP_STATE_STORAGE_KEY = "tyfys.appState.v1";
const APP_AUTH_STORAGE_KEY = "tyfys.appAuth.v1";
const APP_SESSION_TOKEN_KEY = "tyfys.appSessionToken.v1";
const APP_STATE_VERSION = 1;
const MOBILE_APP_API_BASE = "https://app.tyfys.net";
const STATIC_APP_HOSTS = new Set(["tyfys.net", "www.tyfys.net"]);
const LIVE_APP_API_HOSTS = new Set(["app.tyfys.net", "www.app.tyfys.net"]);
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
const COMBINED_RATINGS_SOURCE_URL = "https://www.ecfr.gov/current/title-38/chapter-I/part-4/section-4.25";
const MENTAL_HEALTH_RATINGS_SOURCE_URL = "https://www.ecfr.gov/current/title-38/chapter-I/part-4/section-4.130";
const NEURO_RATINGS_SOURCE_URL = "https://www.ecfr.gov/current/title-38/chapter-I/part-4/section-4.124a";
const MUSCULOSKELETAL_RATINGS_SOURCE_URL = "https://www.ecfr.gov/current/title-38/chapter-I/part-4/section-4.71a";
const RESPIRATORY_RATINGS_SOURCE_URL = "https://www.ecfr.gov/current/title-38/chapter-I/part-4/section-4.97";
const HEARING_RATINGS_SOURCE_URL = "https://www.ecfr.gov/current/title-38/chapter-I/part-4/section-4.85";
const EAR_RATINGS_SOURCE_URL = "https://www.ecfr.gov/current/title-38/chapter-I/part-4/section-4.87";
const DIGESTIVE_RATINGS_SOURCE_URL = "https://www.ecfr.gov/current/title-38/chapter-I/part-4/section-4.114";
const PYRAMIDING_SOURCE_URL = "https://www.ecfr.gov/current/title-38/chapter-I/part-4/section-4.14";
const RESPIRATORY_SINGLE_RATING_SOURCE_URL = "https://www.ecfr.gov/current/title-38/chapter-I/part-4/section-4.96";
const RATING_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const SCAN_STAGES = ["Preparing document", "Extracting text", "Reading text", "Saving to Records Vault"];
const OCR_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
const PDF_JS_SCRIPT_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDF_JS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const GOOGLE_IDENTITY_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const ZAPIER_CHATBOT_SCRIPT_URL =
  "https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js";
const ZAPIER_CHATBOT_ELEMENT_TAG = "zapier-interfaces-chatbot-embed";
const ZAPIER_INTAKE_CHATBOT_ID = "cm5qukhqm000dd1ruzsy2m3id";
const MAX_STORED_OCR_CHARS = 12000;
const MAX_PDF_OCR_PAGES = 5;
const externalScriptPromises = {};

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

const clearHasStarted = () => {
  try {
    window.sessionStorage.removeItem(HAS_STARTED_KEY);
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
    else window.localStorage.removeItem(ZOHO_LEAD_ID_KEY);
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const mergeZohoProfile = (currentProfile, zohoProfile) => {
  const current = currentProfile || {};
  const incoming = zohoProfile || {};
  const normalizeList = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return null;
  };

  return {
    ...current,
    firstName: incoming.firstName || current.firstName || "",
    lastName: incoming.lastName || current.lastName || "",
    email: incoming.email || current.email || "",
    phone: incoming.phone || current.phone || "",
    zip: incoming.zip || current.zip || "",
    branch: incoming.branch || current.branch || "",
    era: incoming.era || current.era || "",
    rating: Number.isFinite(Number(incoming.rating)) ? Number(incoming.rating) : current.rating || 0,
    pain_categories: normalizeList(incoming.pain_categories || incoming.painCategories) || current.pain_categories || [],
    pain_points: normalizeList(incoming.pain_points || incoming.painPoints) || current.pain_points || [],
    privateOrg:
      typeof incoming.privateOrg === "boolean" ? incoming.privateOrg : Boolean(current.privateOrg),
    terms: typeof incoming.terms === "boolean" ? incoming.terms : Boolean(current.terms),
    attorney: typeof incoming.attorney === "boolean" ? incoming.attorney : current.attorney,
    appeal: typeof incoming.appeal === "boolean" ? incoming.appeal : current.appeal,
    discharge: typeof incoming.discharge === "boolean" ? incoming.discharge : current.discharge,
    claims_pending:
      typeof incoming.claimsPending === "boolean"
        ? incoming.claimsPending
        : typeof incoming.claims_pending === "boolean"
          ? incoming.claims_pending
          : current.claims_pending
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
    branch: leadPrefill.branch || "",
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

const loadStoredJson = (key, fallback = null) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
};

const saveStoredJson = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const removeStoredJson = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const sanitizeUserProfile = (profile) => {
  const next = profile && typeof profile === "object" ? { ...profile } : {};
  delete next.website_hp;
  delete next.securityAnswer;
  delete next.appPassword;
  delete next.confirmPassword;
  return next;
};

const createBaseUserProfile = (prefill = {}, overrides = {}) =>
  sanitizeUserProfile({
    pain_categories: [],
    pain_points: [],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    zip: "",
    privateOrg: false,
    terms: false,
    ...prefill,
    ...overrides
  });

const loadPersistedAppState = () => {
  const stored = loadStoredJson(APP_STATE_STORAGE_KEY, null);
  if (!stored || stored.version !== APP_STATE_VERSION) return null;
  return stored;
};

const savePersistedAppState = (state) => {
  saveStoredJson(APP_STATE_STORAGE_KEY, {
    version: APP_STATE_VERSION,
    savedAt: new Date().toISOString(),
    ...state
  });
};

const loadAuthAccount = () => loadStoredJson(APP_AUTH_STORAGE_KEY, null);

const saveAuthAccount = (account) => {
  saveStoredJson(APP_AUTH_STORAGE_KEY, account);
};

const loadAppSessionToken = () => {
  try {
    return window.localStorage.getItem(APP_SESSION_TOKEN_KEY) || "";
  } catch (error) {
    return "";
  }
};

const saveAppSessionToken = (token) => {
  try {
    const normalized = String(token || "").trim();
    if (normalized) window.localStorage.setItem(APP_SESSION_TOKEN_KEY, normalized);
    else window.localStorage.removeItem(APP_SESSION_TOKEN_KEY);
  } catch (error) {
    // No-op when storage is unavailable.
  }
};

const getRuntimeConfig = () => {
  const config = window.__TYFYS_APP_CONFIG__;
  return config && typeof config === "object" ? config : {};
};

const SOP_PHASES = [
  { id: 1, title: 'Account Setup', label: 'Setup', desc: 'Securely upload DD-214 and activate membership.' },
  { id: 2, title: 'Admin Prep', label: 'Prep', desc: 'Our team is reviewing your files to prepare your strategy.' },
  { id: 3, title: 'Strategy & Intake', label: 'Strategy', desc: '1-on-1 strategy session to lock in your claims.' },
  { id: 4, title: 'Exams & Medical', label: 'Medical', desc: 'Attending C&P exams and finalizing the nexus letters.' }
];

const deriveSopPhase = (paymentState, dossier, nextDoctorVisit) => {
  const dossierItems = Array.isArray(dossier) ? dossier : [];
  const hasDd214 = dossierItems.some(item => getDossierLookupText(item).includes("dd214") || getDossierLookupText(item).includes("dd-214"));
  const hasPaid = paymentState?.completed || paymentState?.planName;

  if (!hasPaid || !hasDd214) return 1; // Phase 1: Setup
  if (nextDoctorVisit) return 4; // Phase 4: Medical

  return 2; // Default to Prep if paid and DD214 uploaded
};

function SopSwimlaneTracker({ currentPhase, onPhaseClick, Icons }) {
  const activeStageInfo = SOP_PHASES.find((p) => p.id === currentPhase) || SOP_PHASES[0];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
      <div className="flex justify-between relative overflow-hidden mb-6 mt-2">
        <div className="absolute top-1/2 left-0 h-1 bg-slate-100 w-full -z-10 mt-[-2px]" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 mt-[-2px] transition-all duration-1000"
          style={{ width: `${((currentPhase - 1) / (SOP_PHASES.length - 1)) * 100}%` }}
        />
        {SOP_PHASES.map((stage) => {
          const isPast = stage.id < currentPhase;
          const isCurrent = stage.id === currentPhase;
          return (
            <div key={stage.id} onClick={() => onPhaseClick && onPhaseClick(stage.id)} className="flex flex-col items-center gap-2 cursor-pointer z-10 group w-1/4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all ${
                  isCurrent
                    ? 'bg-blue-600 border-blue-100 shadow-md scale-110 text-white'
                    : isPast
                    ? 'bg-blue-500 border-white text-white'
                    : 'bg-white border-slate-100 text-slate-300 group-hover:border-blue-200'
                }`}
              >
                {isPast ? <Icons.Check className="w-5 h-5" /> : <span className="font-bold text-sm">{stage.id}</span>}
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center ${isCurrent ? 'text-blue-700' : isPast ? 'text-slate-700' : 'text-slate-400'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
        <div className="bg-blue-100 text-blue-700 p-2 rounded-lg shrink-0">
          <Icons.Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">{activeStageInfo.title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{activeStageInfo.desc}</p>
        </div>
      </div>
    </div>
  );
}
const getCapacitorBridge = () => {
  const bridge = window.Capacitor;
  return bridge && typeof bridge === "object" ? bridge : null;
};

const getCapacitorPlugin = (pluginName) => {
  const plugins = getCapacitorBridge()?.Plugins;
  return pluginName && plugins && typeof plugins === "object" ? plugins[pluginName] || null : null;
};

const isNativeAppRuntime = () => {
  const bridge = getCapacitorBridge();
  if (!bridge) return false;
  if (typeof bridge.isNativePlatform === "function") return Boolean(bridge.isNativePlatform());
  const platform = typeof bridge.getPlatform === "function" ? bridge.getPlatform() : "";
  return platform === "ios" || platform === "android";
};

const normalizeApiBase = (value) => String(value || "").trim().replace(/\/+$/, "");

const hostHasSameOriginApi = () => {
  const hostname = String(window.location.hostname || "").toLowerCase();
  if (!hostname) return false;
  if (LIVE_APP_API_HOSTS.has(hostname)) return true;
  if (hostname.endsWith(".vercel.app") || hostname.endsWith(".vercel-dns.com")) return true;
  return false;
};

const resolveApiBase = () => {
  const explicitBase = normalizeApiBase(getRuntimeConfig().apiBase);
  if (explicitBase) return explicitBase;
  if (hostHasSameOriginApi()) return "";

  const hostname = String(window.location.hostname || "").toLowerCase();
  if (isNativeAppRuntime()) return MOBILE_APP_API_BASE;
  if (STATIC_APP_HOSTS.has(hostname) || hostname.endsWith(".github.io")) return MOBILE_APP_API_BASE;
  return "";
};

const resolveApiUrl = (path) => {
  const normalizedPath = String(path || "").startsWith("/") ? String(path || "") : `/${String(path || "")}`;
  const apiBase = resolveApiBase();
  return apiBase ? `${apiBase}${normalizedPath}` : normalizedPath;
};

const createApiRequestInit = ({ method = "GET", body, headers = {}, credentials } = {}) => {
  const nextHeaders = { ...headers };
  const sessionToken = loadAppSessionToken();
  if (sessionToken && !nextHeaders.Authorization && !nextHeaders.authorization) {
    nextHeaders.Authorization = `Bearer ${sessionToken}`;
  }

  return {
    method,
    body,
    credentials: credentials ?? (resolveApiBase() ? "omit" : "include"),
    headers: Object.keys(nextHeaders).length ? nextHeaders : undefined
  };
};

const openExternalUrl = async (url) => {
  const href = String(url || "").trim();
  if (!href) return false;

  const browser = getCapacitorPlugin("Browser");
  if (browser?.open) {
    await browser.open({ url: href, presentationStyle: "fullscreen" });
    return true;
  }

  window.open(href, "_blank", "noopener,noreferrer");
  return false;
};

const shareTextPayload = async ({ title, text, dialogTitle }) => {
  const sharePlugin = getCapacitorPlugin("Share");
  if (sharePlugin?.share) {
    await sharePlugin.share({ title, text, dialogTitle });
    return true;
  }

  if (navigator.share) {
    await navigator.share({ title, text });
    return true;
  }

  return false;
};

const createLocalId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const loadExternalScript = (src, globalName) => {
  if (globalName && window[globalName]) return Promise.resolve(window[globalName]);
  if (externalScriptPromises[src]) return externalScriptPromises[src];

  externalScriptPromises[src] = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[data-tyfys-src="${src}"]`);
    if (existingScript) {
      if (!globalName || window[globalName]) {
        resolve(globalName ? window[globalName] : true);
        return;
      }
      existingScript.addEventListener("load", () => resolve(window[globalName]), { once: true });
      existingScript.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.tyfysSrc = src;
    script.onload = () => resolve(globalName ? window[globalName] : true);
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

  return externalScriptPromises[src];
};

const loadCustomElementScript = (src, elementTagName) => {
  if (window.customElements?.get(elementTagName)) return Promise.resolve(true);
  if (externalScriptPromises[src]) return externalScriptPromises[src];

  externalScriptPromises[src] = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[data-tyfys-src="${src}"]`);
    if (existingScript) {
      if (window.customElements?.get(elementTagName)) {
        resolve(true);
        return;
      }
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    script.async = true;
    script.dataset.tyfysSrc = src;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

  return externalScriptPromises[src];
};

const getTesseract = async () => {
  await loadExternalScript(OCR_SCRIPT_URL, "Tesseract");
  if (!window.Tesseract?.createWorker) {
    throw new Error("OCR engine did not load correctly.");
  }
  return window.Tesseract;
};

const getPdfJs = async () => {
  await loadExternalScript(PDF_JS_SCRIPT_URL, "pdfjsLib");
  if (!window.pdfjsLib?.getDocument) {
    throw new Error("PDF reader did not load correctly.");
  }
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER_URL;
  return window.pdfjsLib;
};

const isPdfFile = (file) =>
  Boolean(file) && (String(file.type || "").toLowerCase() === "application/pdf" || /\.pdf$/i.test(file.name || ""));

const isImageFile = (file) =>
  Boolean(file) &&
  (String(file.type || "").toLowerCase().startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(file.name || ""));

const readFileAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsArrayBuffer(file);
  });

const normalizeExtractedText = (text) =>
  String(text || "")
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const buildStoredOcrText = (text) => {
  const normalized = normalizeExtractedText(text);
  if (!normalized) {
    return {
      preview: "No readable text was detected in this file.",
      truncated: false
    };
  }
  if (normalized.length <= MAX_STORED_OCR_CHARS) {
    return {
      preview: normalized,
      truncated: false
    };
  }
  return {
    preview: `${normalized.slice(0, MAX_STORED_OCR_CHARS)}\n\n[Preview truncated to fit browser-local storage.]`,
    truncated: true
  };
};

const createOcrWorker = async () => {
  const Tesseract = await getTesseract();
  return Tesseract.createWorker("eng");
};

const renderPdfPageToCanvas = async (page) => {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const canvasContext = canvas.getContext("2d", { alpha: false });
  if (!canvasContext) {
    throw new Error("Canvas rendering is not available in this browser.");
  }
  await page.render({ canvasContext, viewport }).promise;
  return canvas;
};

const extractPdfTextLayer = async (pdfDocument, onStage, onProgress) => {
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    onStage?.(`Extracting text from page ${pageNumber} of ${pdfDocument.numPages}`);
    onProgress?.(0.15 + (pageNumber / Math.max(1, pdfDocument.numPages)) * 0.35);
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = normalizeExtractedText(textContent.items.map((item) => item?.str || "").join(" "));
    if (pageText) {
      pages.push(pdfDocument.numPages > 1 ? `[Page ${pageNumber}]\n${pageText}` : pageText);
    }
  }
  return normalizeExtractedText(pages.join("\n\n"));
};

const runImageOcr = async (imageSource, onStage, onProgress) => {
  onStage?.(SCAN_STAGES[2]);
  onProgress?.(0.55);
  const worker = await createOcrWorker();
  try {
    const result = await worker.recognize(imageSource);
    onProgress?.(0.9);
    return {
      text: normalizeExtractedText(result?.data?.text),
      confidence: Math.round(result?.data?.confidence || 0),
      method: "Browser OCR",
      pageCount: 1
    };
  } finally {
    await worker.terminate();
  }
};

const runPdfOcr = async (pdfDocument, onStage, onProgress) => {
  const pagesToScan = Math.min(pdfDocument.numPages, MAX_PDF_OCR_PAGES);
  const worker = await createOcrWorker();
  const texts = [];
  const confidences = [];

  try {
    for (let pageNumber = 1; pageNumber <= pagesToScan; pageNumber += 1) {
      onStage?.(`Running OCR on page ${pageNumber} of ${pagesToScan}`);
      onProgress?.(0.55 + (pageNumber - 1) / Math.max(1, pagesToScan) * 0.25);
      const page = await pdfDocument.getPage(pageNumber);
      const canvas = await renderPdfPageToCanvas(page);
      const result = await worker.recognize(canvas);
      const pageText = normalizeExtractedText(result?.data?.text);
      if (pageText) {
        texts.push(pagesToScan > 1 ? `[Page ${pageNumber}]\n${pageText}` : pageText);
      }
      if (Number.isFinite(result?.data?.confidence)) {
        confidences.push(result.data.confidence);
      }
      onProgress?.(0.55 + pageNumber / Math.max(1, pagesToScan) * 0.25);
    }

    let combinedText = normalizeExtractedText(texts.join("\n\n"));
    if (pdfDocument.numPages > pagesToScan) {
      combinedText = `${combinedText}\n\n[Only the first ${pagesToScan} pages were OCR processed in-browser.]`.trim();
    }

    return {
      text: combinedText,
      confidence: confidences.length
        ? Math.round(confidences.reduce((sum, value) => sum + value, 0) / confidences.length)
        : 0,
      method: "PDF OCR",
      pageCount: pagesToScan
    };
  } finally {
    await worker.terminate();
  }
};

const scanDocumentFile = async (file, onStage, onProgress) => {
  if (isImageFile(file)) {
    onStage?.(SCAN_STAGES[0]);
    onProgress?.(0.15);
    return runImageOcr(file, onStage, onProgress);
  }

  if (isPdfFile(file)) {
    onStage?.(SCAN_STAGES[0]);
    onProgress?.(0.1);
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDocument = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const extractedText = await extractPdfTextLayer(pdfDocument, onStage, onProgress);

    if (extractedText) {
      onProgress?.(0.9);
      return {
        text: extractedText,
        confidence: 99,
        method: "Embedded PDF text",
        pageCount: pdfDocument.numPages
      };
    }

    return runPdfOcr(pdfDocument, onStage, onProgress);
  }

  throw new Error("Upload a PDF or image file to run a scan.");
};

const hasLiveAppApi = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("api") === "live") return true;
  if (params.get("api") === "off") return false;
  try {
    const localOverride = window.localStorage.getItem("tyfys.liveApi");
    if (localOverride === "1") return true;
    if (localOverride === "0") return false;
  } catch (error) {
    // No-op when storage is unavailable.
  }
  if (resolveApiBase()) return true;

  const hostname = String(window.location.hostname || "").toLowerCase();
  if (!hostname) return false;
  if (hostname === "localhost" || hostname === "127.0.0.1") return isNativeAppRuntime();
  return hostHasSameOriginApi();
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
  Upload: (p) => (
    <IconWrapper {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
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
const INTAKE_RECORD_REQUIREMENTS = [
  {
    id: "dd214",
    label: "DD-214 or separation paperwork",
    helper: "Upload this first so TYFYS can confirm your service dates and discharge details.",
    defaultTitle: "DD-214 or separation paperwork",
    type: "Service Record",
    source: "Service treatment record",
    keywords: ["dd214", "dd-214", "separation", "discharge"]
  },
  {
    id: "service_treatment",
    label: "Service treatment records",
    helper: "Military medical visits, profiles, sick call notes, and in-service diagnoses.",
    defaultTitle: "Service treatment records",
    type: "Service Record",
    source: "Service treatment record",
    keywords: ["service treatment", "military medical", "sick call", "line of duty", "str"]
  },
  {
    id: "personnel",
    label: "Personnel or deployment records",
    helper: "Orders, deployments, duty assignments, awards, or records that show where and when key events happened during your service.",
    defaultTitle: "Personnel or deployment records",
    type: "Service Record",
    source: "Manual note",
    keywords: ["personnel", "deployment", "orders", "assignment", "award", "service record"]
  },
  {
    id: "va_records",
    label: "VA records, rating decisions, or C-file pages",
    helper: "Blue Button exports, past rating decisions, and any VA claim documents you already have.",
    defaultTitle: "VA records or C-file pages",
    type: "Other",
    source: "VA Blue Button",
    keywords: ["blue button", "va records", "va record", "c-file", "c file", "rating decision"]
  },
  {
    id: "private_records",
    label: "Private medical records tied to claimed conditions",
    helper: "Civilian treatment notes, imaging, specialist letters, and other non-VA records tied to your claimed conditions.",
    defaultTitle: "Private medical records",
    type: "Private Medical Record",
    source: "Private doctor",
    keywords: ["private medical", "civilian", "specialist", "imaging", "mri", "dbq", "nexus"]
  }
];
const DOCTOR_PORTAL_TEAM = [
  {
    id: "team-ops",
    name: "TYFYS Support Team",
    title: "Scheduling and records support",
    specialty: "Appointment help, records review, follow-up reminders",
    focus: ["Appointments", "Records delivery", "Status updates"],
    bio: "Keeps your records, questionnaires, and appointments moving so you always know the next step.",
    availability: "Monday to Friday, 9:00 AM to 6:00 PM ET",
    nextVisit: "March 9, 2026 · 2:00 PM ET",
    location: "TYFYS operations desk + remote coordinators",
    sync: "Keeps your appointments, records, and next steps on track",
    threadId: "thread-ops",
    tag: "TYFYS Team"
  },
  {
    id: "hallett",
    name: "Dr. Amanda Miller",
    title: "Review physician",
    specialty: "Family medicine, DBQ prep, records review",
    focus: ["Musculoskeletal", "General medicine", "Readiness review"],
    bio: "Reviews your uploaded records, spots missing items, and prepares you for telehealth or in-person exams.",
    availability: "Tuesday and Thursday telehealth blocks",
    nextVisit: "March 10, 2026 · 10:30 AM ET",
    location: "Telehealth + Florida partner clinics",
    sync: "Reviews records and helps prepare for exams or DBQs",
    threadId: "thread-hallett",
    tag: "Assigned Doctor"
  },
  {
    id: "warren",
    name: "Dr. Elise Warren",
    title: "Behavioral health physician",
    specialty: "Psychiatry, PTSD, anxiety, sleep disruption",
    focus: ["Mental health DBQs", "PTSD narratives", "Medication review"],
    bio: "Helps organize mental health history in plain language before a behavioral health evaluation.",
    availability: "Monday and Wednesday late-afternoon sessions",
    nextVisit: "March 11, 2026 · 4:15 PM ET",
    location: "50-state telehealth availability",
    sync: "Helps organize mental health records and upcoming visits",
    threadId: "thread-behavioral",
    tag: "Assigned Doctor"
  }
];
const DOCTOR_PORTAL_VISITS = [
  {
    id: "visit-prep",
    time: "March 9, 2026 · 2:00 PM ET",
    title: "TYFYS records review",
    owner: "TYFYS Support Team",
    mode: "TYFYS team review",
    summary: "Your uploaded records, questionnaires, and claim notes are reviewed so the right provider gets the right file."
  },
  {
    id: "visit-ortho",
    time: "March 10, 2026 · 10:30 AM ET",
    title: "Telehealth prep visit",
    owner: "Dr. Amanda Miller",
    mode: "Video consult",
    summary: "Review your MRI, medication list, flare-ups, and the facts needed before a DBQ or medical opinion."
  },
  {
    id: "visit-psych",
    time: "March 11, 2026 · 4:15 PM ET",
    title: "Behavioral health consult",
    owner: "Dr. Elise Warren",
    mode: "Video consult",
    summary: "Finalize PTSD and anxiety symptom history before the behavioral health questionnaire is completed."
  }
];
const DOCTOR_PORTAL_INTEGRATIONS = [
  {
    id: "athena",
    name: "athenahealth",
    category: "Doctor scheduling and records",
    audience: "Private clinics",
    sync: "Share appointments and record requests",
    status: "Ready",
    description: "Helpful when your civilian doctor already uses athenahealth for appointments and chart notes."
  },
  {
    id: "simplepractice",
    name: "SimplePractice",
    category: "Counseling and telehealth",
    audience: "Therapists and psychiatry practices",
    sync: "Share appointments and forms",
    status: "Ready",
    description: "Useful when your mental health provider uses SimplePractice for visits and questionnaires."
  },
  {
    id: "drchrono",
    name: "DrChrono",
    category: "Doctor records",
    audience: "Independent practices",
    sync: "Share openings and visit updates",
    status: "Pilot",
    description: "Helpful when a private clinic manages appointments and chart notes in DrChrono."
  },
  {
    id: "ecw",
    name: "eClinicalWorks",
    category: "Clinic records",
    audience: "Larger clinics",
    sync: "Share referrals and follow-up tasks",
    status: "Ready",
    description: "Good for larger clinics that need TYFYS to coordinate records and follow-up across locations."
  },
  {
    id: "nextgen",
    name: "NextGen Office",
    category: "Primary care and specialty records",
    audience: "Private doctors",
    sync: "Share consult openings and follow-up notes",
    status: "Ready",
    description: "Useful when a private doctor handles consult scheduling and follow-up through NextGen Office."
  },
  {
    id: "therapynotes",
    name: "TherapyNotes",
    category: "Mental health records",
    audience: "Psychologists and psychiatrists",
    sync: "Share visit timing and prep notes",
    status: "Pilot",
    description: "Helpful when your behavioral health provider uses TherapyNotes for appointments and paperwork."
  },
  {
    id: "jane",
    name: "Jane",
    category: "Scheduling and reminders",
    audience: "Rehab and wellness clinics",
    sync: "Share bookings and reminders",
    status: "Pilot",
    description: "Helpful if your rehab or specialty clinic schedules through Jane."
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "Referral intake",
    audience: "Front-desk and referral teams",
    sync: "Share referral status and next steps",
    status: "Ready",
    description: "Useful when a clinic handles new-patient intake through a shared referral team."
  }
];
const INITIAL_SECURE_THREADS = [
  {
    id: "thread-ops",
    title: "TYFYS Support Team",
    participants: "Scheduling, records, and next steps",
    status: "TYFYS team",
    responseTime: "Replies within 1 business hour",
    unread: 2,
    lastTimestamp: "9:42 AM",
    lastMessage: "We shared your records with Dr. Miller and confirmed the prep visit.",
    autoReplySender: "TYFYS Support Team",
    messages: [
      {
        id: "thread-ops-1",
        sender: "TYFYS Support Team",
        time: "8:55 AM",
        text: "Your uploaded records are ready for scheduling. We are sending them to the physician team now.",
        isCurrentUser: false
      },
      {
        id: "thread-ops-2",
        sender: "You",
        time: "9:11 AM",
        text: "Please keep my consults in late-morning or afternoon windows if possible.",
        isCurrentUser: true
      },
      {
        id: "thread-ops-3",
        sender: "TYFYS Care Ops",
        time: "9:42 AM",
        text: "We shared your records with Dr. Miller and confirmed the prep visit.",
        isCurrentUser: false
      }
    ]
  },
  {
    id: "thread-hallett",
    title: "Dr. Amanda Miller",
    participants: "Assigned provider",
    status: "Provider direct",
    responseTime: "Replies the same business day",
    unread: 0,
    lastTimestamp: "Yesterday",
    lastMessage: "Please have your MRI report and medication list nearby for our visit.",
    autoReplySender: "Dr. Amanda Miller",
    messages: [
      {
        id: "thread-hallett-1",
        sender: "Dr. Amanda Miller",
        time: "Yesterday",
        text: "I reviewed your records. Please have your MRI report and medication list nearby for our visit.",
        isCurrentUser: false
      }
    ]
  },
  {
    id: "thread-behavioral",
    title: "Dr. Elise Warren and TYFYS",
    participants: "Behavioral health shared channel",
    status: "Shared care channel",
    responseTime: "Replies within 4 business hours",
    unread: 1,
    lastTimestamp: "8:15 AM",
    lastMessage: "Your anxiety and PTSD symptom tracker is attached for tomorrow's consult.",
    autoReplySender: "Dr. Elise Warren",
    messages: [
      {
        id: "thread-behavioral-1",
        sender: "TYFYS Support Team",
        time: "Yesterday",
        text: "We opened this shared thread so you can message TYFYS and your behavioral health doctor in one place.",
        isCurrentUser: false
      },
      {
        id: "thread-behavioral-2",
        sender: "Dr. Elise Warren",
        time: "8:15 AM",
        text: "Your anxiety and PTSD symptom tracker is attached for tomorrow's consult.",
        isCurrentUser: false
      }
    ]
  }
];
const SECURE_THREAD_AUTO_REPLIES = {
  "thread-ops":
    "TYFYS received your note. We will update your file and confirm once the appointment details are set.",
  "thread-hallett":
    "Thank you. I added that note to your prep checklist so we can cover it during the consult.",
  "thread-behavioral":
    "Understood. I will review that update before your behavioral health visit and keep TYFYS copied in."
};
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

const ratingLevel = (value, summary) => ({ value, summary });

const CONDITION_RATING_RULES = {
  PTSD: {
    mode: "simple",
    diagnosticCode: "9411",
    ruleTitle: "General Rating Formula for Mental Disorders",
    sourceUrl: MENTAL_HEALTH_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.130",
    exclusivityGroup: "mental_health",
    exclusivityMessage:
      "PTSD, depression, and anxiety usually collapse into one VA mental-health evaluation when the symptoms overlap. Do not stack them here.",
    notes: [
      "Choose the level that best matches the veteran's overall occupational and social impairment, not a single symptom.",
      "Anti-pyramiding also applies. See 38 CFR 4.14 for the rule against compensating the same manifestations twice."
    ],
    options: [
      ratingLevel(0, "Diagnosed, but symptoms are not severe enough to interfere with work/social function or require continuous medication."),
      ratingLevel(10, "Mild or transient symptoms, or symptoms controlled by continuous medication."),
      ratingLevel(30, "Occasional decrease in work efficiency, but generally functioning satisfactorily."),
      ratingLevel(50, "Reduced reliability and productivity."),
      ratingLevel(70, "Deficiencies in most areas such as work, school, family relations, judgment, thinking, or mood."),
      ratingLevel(100, "Total occupational and social impairment.")
    ]
  },
  "Major Depressive Disorder": {
    mode: "simple",
    diagnosticCode: "9434",
    ruleTitle: "General Rating Formula for Mental Disorders",
    sourceUrl: MENTAL_HEALTH_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.130",
    exclusivityGroup: "mental_health",
    exclusivityMessage:
      "PTSD, depression, and anxiety usually collapse into one VA mental-health evaluation when the symptoms overlap. Do not stack them here.",
    notes: [
      "VA uses the same mental-health schedule as PTSD and anxiety disorders.",
      "Pick the single evaluation that best fits the overall impairment picture."
    ],
    options: [
      ratingLevel(0, "Diagnosed, but symptoms are not severe enough to interfere with work/social function or require continuous medication."),
      ratingLevel(10, "Mild or transient symptoms, or symptoms controlled by continuous medication."),
      ratingLevel(30, "Occasional decrease in work efficiency, but generally functioning satisfactorily."),
      ratingLevel(50, "Reduced reliability and productivity."),
      ratingLevel(70, "Deficiencies in most areas such as work, school, family relations, judgment, thinking, or mood."),
      ratingLevel(100, "Total occupational and social impairment.")
    ]
  },
  "Anxiety Condition": {
    mode: "simple",
    diagnosticCode: "9400",
    ruleTitle: "General Rating Formula for Mental Disorders",
    sourceUrl: MENTAL_HEALTH_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.130",
    exclusivityGroup: "mental_health",
    exclusivityMessage:
      "PTSD, depression, and anxiety usually collapse into one VA mental-health evaluation when the symptoms overlap. Do not stack them here.",
    notes: [
      "VA uses the same mental-health schedule as PTSD and depression.",
      "Choose one mental-health rating based on the total impairment picture."
    ],
    options: [
      ratingLevel(0, "Diagnosed, but symptoms are not severe enough to interfere with work/social function or require continuous medication."),
      ratingLevel(10, "Mild or transient symptoms, or symptoms controlled by continuous medication."),
      ratingLevel(30, "Occasional decrease in work efficiency, but generally functioning satisfactorily."),
      ratingLevel(50, "Reduced reliability and productivity."),
      ratingLevel(70, "Deficiencies in most areas such as work, school, family relations, judgment, thinking, or mood."),
      ratingLevel(100, "Total occupational and social impairment.")
    ]
  },
  Migraines: {
    mode: "simple",
    diagnosticCode: "8100",
    ruleTitle: "Migraine headaches",
    sourceUrl: NEURO_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.124a",
    notes: [
      "VA focuses on characteristic prostrating attacks and how often they happen.",
      "The 50 percent level is the schedular maximum under DC 8100."
    ],
    options: [
      ratingLevel(0, "Less frequent attacks."),
      ratingLevel(10, "Characteristic prostrating attacks averaging one in 2 months over the last several months."),
      ratingLevel(30, "Characteristic prostrating attacks averaging once a month over the last several months."),
      ratingLevel(50, "Very frequent completely prostrating and prolonged attacks productive of severe economic inadaptability.")
    ]
  },
  "Peripheral Neuropathy": {
    mode: "profiles",
    ruleTitle: "Peripheral nerve ratings depend on the affected nerve and severity",
    sourceUrl: NEURO_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.124a",
    notes: [
      "Do not guess this rating. Choose the actual nerve family being evaluated and then the matching severity level.",
      "Different nerves have different maxima, so the form stays locked until the nerve basis is selected."
    ],
    profiles: [
      {
        id: "sciatic_8520",
        label: "Sciatic nerve (DC 8520)",
        diagnosticCode: "8520",
        sourceUrl: NEURO_RATINGS_SOURCE_URL,
        notes: ["Common lower-extremity pathway for neuropathy or radiculopathy affecting the sciatic distribution."],
        options: [
          ratingLevel(10, "Mild incomplete paralysis."),
          ratingLevel(20, "Moderate incomplete paralysis."),
          ratingLevel(40, "Moderately severe incomplete paralysis."),
          ratingLevel(60, "Severe incomplete paralysis with marked muscular atrophy."),
          ratingLevel(80, "Complete paralysis; foot dangles and drops, with no active movement below the knee.")
        ]
      },
      {
        id: "common_peroneal_8521",
        label: "Common peroneal nerve (DC 8521)",
        diagnosticCode: "8521",
        sourceUrl: NEURO_RATINGS_SOURCE_URL,
        notes: ["Use when the rating is tied to the external popliteal/common peroneal nerve rather than the sciatic trunk."],
        options: [
          ratingLevel(10, "Mild incomplete paralysis."),
          ratingLevel(20, "Moderate incomplete paralysis."),
          ratingLevel(30, "Severe incomplete paralysis."),
          ratingLevel(40, "Complete paralysis with foot drop and characteristic loss of dorsiflexion/eversion.")
        ]
      },
      {
        id: "femoral_8526",
        label: "Femoral nerve (DC 8526)",
        diagnosticCode: "8526",
        sourceUrl: NEURO_RATINGS_SOURCE_URL,
        notes: ["Use when the rating is tied to the anterior crural/femoral nerve."],
        options: [
          ratingLevel(10, "Mild incomplete paralysis."),
          ratingLevel(20, "Moderate incomplete paralysis."),
          ratingLevel(30, "Severe incomplete paralysis."),
          ratingLevel(40, "Complete paralysis of quadriceps extensor muscles.")
        ]
      }
    ]
  },
  "TBI Residuals": {
    mode: "simple",
    diagnosticCode: "8045",
    ruleTitle: "Residuals of traumatic brain injury",
    sourceUrl: NEURO_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.124a",
    notes: [
      "DC 8045 uses a facet table. The final rating follows the highest facet level, unless one facet is total.",
      "Distinct residuals can sometimes be rated separately, but only if the same symptoms are not counted twice."
    ],
    options: [
      ratingLevel(0, "Highest TBI facet level is 0."),
      ratingLevel(10, "Highest TBI facet level is 1."),
      ratingLevel(40, "Highest TBI facet level is 2."),
      ratingLevel(70, "Highest TBI facet level is 3."),
      ratingLevel(100, "One or more facets are rated total.")
    ]
  },
  "Lumbosacral (Back) Strain": {
    mode: "simple",
    diagnosticCode: "5237",
    ruleTitle: "Thoracolumbar spine strain",
    sourceUrl: MUSCULOSKELETAL_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.71a",
    notes: ["This follows the General Rating Formula for Diseases and Injuries of the Spine for the thoracolumbar segment."],
    options: [
      ratingLevel(10, "Forward flexion greater than 60 degrees but not greater than 85, combined thoracolumbar range greater than 120 but not greater than 235, or localized tenderness/spasm not causing abnormal gait or contour."),
      ratingLevel(20, "Forward flexion greater than 30 degrees but not greater than 60, combined thoracolumbar range not greater than 120, or muscle spasm/guarding causing abnormal gait or contour."),
      ratingLevel(40, "Forward flexion 30 degrees or less, or favorable ankylosis of the entire thoracolumbar spine."),
      ratingLevel(50, "Unfavorable ankylosis of the entire thoracolumbar spine."),
      ratingLevel(100, "Unfavorable ankylosis of the entire spine.")
    ]
  },
  "Cervical (Neck) Strain": {
    mode: "simple",
    diagnosticCode: "5237",
    ruleTitle: "Cervical spine strain",
    sourceUrl: MUSCULOSKELETAL_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.71a",
    notes: ["This follows the General Rating Formula for Diseases and Injuries of the Spine for the cervical segment."],
    options: [
      ratingLevel(10, "Forward flexion greater than 30 degrees but not greater than 40, combined cervical range greater than 170 but not greater than 335, or localized tenderness/spasm not causing abnormal gait or contour."),
      ratingLevel(20, "Forward flexion greater than 15 degrees but not greater than 30, combined cervical range not greater than 170, or muscle spasm/guarding causing abnormal gait or contour."),
      ratingLevel(30, "Forward flexion 15 degrees or less, or favorable ankylosis of the entire cervical spine."),
      ratingLevel(40, "Unfavorable ankylosis of the entire cervical spine."),
      ratingLevel(100, "Unfavorable ankylosis of the entire spine.")
    ]
  },
  "Knee Strain/Pain": {
    mode: "profiles",
    ruleTitle: "Knee ratings turn on the actual rating basis",
    sourceUrl: MUSCULOSKELETAL_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.71a",
    notes: [
      "Knee ratings can be separate for flexion, extension, and instability when the facts support distinct manifestations.",
      "Choose the exact basis you are rating instead of guessing from a generic knee label."
    ],
    profiles: [
      {
        id: "flexion_5260",
        label: "Limitation of flexion (DC 5260)",
        diagnosticCode: "5260",
        sourceUrl: MUSCULOSKELETAL_RATINGS_SOURCE_URL,
        notes: ["Use when the rating is driven by reduced flexion."],
        options: [
          ratingLevel(0, "Flexion limited to 60 degrees."),
          ratingLevel(10, "Flexion limited to 45 degrees."),
          ratingLevel(20, "Flexion limited to 30 degrees."),
          ratingLevel(30, "Flexion limited to 15 degrees.")
        ]
      },
      {
        id: "extension_5261",
        label: "Limitation of extension (DC 5261)",
        diagnosticCode: "5261",
        sourceUrl: MUSCULOSKELETAL_RATINGS_SOURCE_URL,
        notes: ["Use when the rating is driven by reduced extension."],
        options: [
          ratingLevel(0, "Extension limited to 5 degrees."),
          ratingLevel(10, "Extension limited to 10 degrees."),
          ratingLevel(20, "Extension limited to 15 degrees."),
          ratingLevel(30, "Extension limited to 20 degrees."),
          ratingLevel(40, "Extension limited to 30 degrees."),
          ratingLevel(50, "Extension limited to 45 degrees.")
        ]
      },
      {
        id: "instability_5257",
        label: "Recurrent subluxation or instability (DC 5257)",
        diagnosticCode: "5257",
        sourceUrl: MUSCULOSKELETAL_RATINGS_SOURCE_URL,
        notes: ["Current DC 5257 looks at the actual instability pattern and prescribed bracing or assistive devices."],
        options: [
          ratingLevel(10, "Sprain/incomplete ligament tear or patellar instability meeting the 10 percent criteria."),
          ratingLevel(20, "Persistent instability or patellar instability meeting the 20 percent criteria."),
          ratingLevel(30, "Persistent instability or patellar instability meeting the 30 percent criteria.")
        ]
      }
    ]
  },
  "Plantar Fasciitis": {
    mode: "simple",
    diagnosticCode: "5269",
    ruleTitle: "Plantar fasciitis",
    sourceUrl: MUSCULOSKELETAL_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.71a",
    notes: ["DC 5269 caps at 30 percent unless there is actual loss of use of the foot."],
    options: [
      ratingLevel(10, "Otherwise, unilateral or bilateral."),
      ratingLevel(20, "No relief from both non-surgical and surgical treatment, unilateral."),
      ratingLevel(30, "No relief from both non-surgical and surgical treatment, bilateral."),
      ratingLevel(40, "Actual loss of use of the foot.")
    ]
  },
  "Sleep Apnea": {
    mode: "simple",
    diagnosticCode: "6847",
    ruleTitle: "Sleep apnea syndromes",
    sourceUrl: RESPIRATORY_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.97",
    exclusivityGroup: "special_respiratory",
    exclusivityMessage:
      "Do not stack asthma and sleep apnea in this calculator. 38 CFR 4.96(a) says certain respiratory DCs must be rated as a single predominant respiratory disability.",
    notes: [
      "Use the actual treatment/evidence level under DC 6847.",
      "If asthma is already in the stack, use one predominant respiratory rating instead of two separate ones."
    ],
    options: [
      ratingLevel(0, "Asymptomatic, but with documented sleep disorder breathing."),
      ratingLevel(30, "Persistent day-time hypersomnolence."),
      ratingLevel(50, "Requires use of a breathing assistance device such as CPAP."),
      ratingLevel(100, "Chronic respiratory failure with carbon dioxide retention or cor pulmonale, or requires tracheostomy.")
    ]
  },
  Asthma: {
    mode: "simple",
    diagnosticCode: "6602",
    ruleTitle: "Bronchial asthma",
    sourceUrl: RESPIRATORY_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.97",
    exclusivityGroup: "special_respiratory",
    exclusivityMessage:
      "Do not stack asthma and sleep apnea in this calculator. 38 CFR 4.96(a) says certain respiratory DCs must be rated as a single predominant respiratory disability.",
    notes: [
      "Use the actual PFT or treatment facts from DC 6602.",
      "If sleep apnea is already in the stack, use one predominant respiratory rating instead of two separate ones."
    ],
    options: [
      ratingLevel(10, "FEV-1 of 71 to 80 percent predicted, FEV-1/FVC of 71 to 80 percent, or intermittent inhalational/oral bronchodilator therapy."),
      ratingLevel(30, "FEV-1 of 56 to 70 percent predicted, FEV-1/FVC of 56 to 70 percent, or daily inhalational/oral bronchodilator therapy or inhalational anti-inflammatory medication."),
      ratingLevel(60, "FEV-1 of 40 to 55 percent predicted, FEV-1/FVC of 40 to 55 percent, or at least monthly physician visits for exacerbations, or intermittent systemic corticosteroids at least 3 times per year."),
      ratingLevel(100, "FEV-1 less than 40 percent predicted, FEV-1/FVC less than 40 percent, more than one attack per week with respiratory failure, or daily high-dose systemic corticosteroids or immuno-suppressive medications.")
    ]
  },
  "Sinusitis/Rhinitis": {
    mode: "profiles",
    ruleTitle: "Pick the actual ENT diagnosis being rated",
    sourceUrl: RESPIRATORY_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.97",
    notes: [
      "Sinusitis and rhinitis do not use the same criteria. Choose the actual diagnosis being evaluated.",
      "The calculator only unlocks ratings after the diagnosis path is selected."
    ],
    profiles: [
      {
        id: "sinusitis_6514",
        label: "Chronic sinusitis (General Rating Formula, DC 6510-6514)",
        diagnosticCode: "6514",
        sourceUrl: RESPIRATORY_RATINGS_SOURCE_URL,
        notes: ["Use when the claim is actually sinusitis."],
        options: [
          ratingLevel(0, "Detected by X-ray only."),
          ratingLevel(10, "1 or 2 incapacitating episodes per year requiring prolonged antibiotics, or 3 to 6 non-incapacitating episodes with headaches, pain, and purulent discharge or crusting."),
          ratingLevel(30, "3 or more incapacitating episodes per year requiring prolonged antibiotics, or more than 6 non-incapacitating episodes with headaches, pain, and purulent discharge or crusting."),
          ratingLevel(50, "Following radical surgery with chronic osteomyelitis, or near-constant sinusitis after repeated surgeries.")
        ]
      },
      {
        id: "rhinitis_6522",
        label: "Allergic or vasomotor rhinitis (DC 6522)",
        diagnosticCode: "6522",
        sourceUrl: RESPIRATORY_RATINGS_SOURCE_URL,
        notes: ["Use when the claim is actually allergic or vasomotor rhinitis."],
        options: [
          ratingLevel(0, "Service-connected rhinitis below compensable obstruction/polyps findings."),
          ratingLevel(10, "Without polyps, but with greater than 50 percent obstruction of nasal passage on both sides or complete obstruction on one side."),
          ratingLevel(30, "With polyps.")
        ]
      }
    ]
  },
  Tinnitus: {
    mode: "simple",
    diagnosticCode: "6260",
    ruleTitle: "Tinnitus",
    sourceUrl: EAR_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.87",
    notes: [
      "The schedular maximum is 10 percent whether tinnitus is perceived in one ear, both ears, or in the head.",
      "This tool locks tinnitus to the single allowed schedular level."
    ],
    options: [ratingLevel(10, "Recurrent tinnitus. This is the schedular maximum under DC 6260.")]
  },
  "Hearing Loss": {
    mode: "measurement_required",
    diagnosticCode: "6100",
    ruleTitle: "Hearing loss requires the official audiometric tables",
    sourceUrl: HEARING_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.85",
    lockedMessage:
      "Hearing loss is not a pick-a-percentage condition. It requires Maryland CNC speech discrimination plus puretone threshold averages run through Tables VI, VIa, and VII in 38 CFR 4.85.",
    notes: [
      "This calculator will not guess a hearing-loss percentage without the audiogram table result.",
      "Use the official hearing tables before adding a hearing-loss rating."
    ]
  },
  GERD: {
    mode: "simple",
    diagnosticCode: "7206",
    ruleTitle: "Gastroesophageal reflux disease",
    sourceUrl: DIGESTIVE_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.114",
    notes: [
      "Current VA digestive ratings use DC 7206 for GERD.",
      "The schedular maximum under DC 7206 is 80 percent."
    ],
    options: [
      ratingLevel(10, "Documented history without daily symptoms or with recurrent symptoms once or twice yearly."),
      ratingLevel(30, "Recurrent esophageal symptoms at least once weekly but less than daily."),
      ratingLevel(50, "Recurrent esophageal symptoms occurring daily."),
      ratingLevel(80, "Documented daily treatment with near-continuous and refractory symptoms plus qualifying severe complications under DC 7206.")
    ]
  },
  IBS: {
    mode: "simple",
    diagnosticCode: "7319",
    ruleTitle: "Irritable bowel syndrome / irritable colon syndrome",
    sourceUrl: DIGESTIVE_RATINGS_SOURCE_URL,
    sourceLabel: "38 CFR 4.114",
    notes: ["Current VA digestive ratings use the revised IBS criteria in DC 7319."],
    options: [
      ratingLevel(0, "Diagnosed, but no compensable episodes in the last 12 months."),
      ratingLevel(10, "Occasional episodes of abdominal distress."),
      ratingLevel(20, "Frequent abdominal distress."),
      ratingLevel(30, "Diarrhea, diarrhea alternating with constipation, bloating, and frequent abdominal distress or other severe symptoms.")
    ]
  }
};

const collectRuleRatings = (rule) => {
  if (!rule) return [];
  if (rule.mode === "simple") return rule.options.map((option) => option.value);
  if (rule.mode === "profiles") return rule.profiles.flatMap((profile) => profile.options.map((option) => option.value));
  return [];
};

const FACT_BASED_CLAIM_RATING_OPTIONS = [...new Set(Object.values(CONDITION_RATING_RULES).flatMap(collectRuleRatings))]
  .filter((value) => Number(value) > 0)
  .sort((a, b) => a - b);

const getConditionRule = (conditionName) => CONDITION_RATING_RULES[conditionName] || null;

const getConditionRatingContext = (conditionName, profileId = "") => {
  const rule = getConditionRule(conditionName);
  if (!rule) return null;
  if (rule.mode === "simple") return rule;
  if (rule.mode !== "profiles") return null;
  return rule.profiles.find((profile) => profile.id === profileId) || null;
};

const getConditionRatingOptions = (conditionName, profileId = "") =>
  getConditionRatingContext(conditionName, profileId)?.options || [];

const getDefaultConditionRating = (conditionName, profileId = "") => {
  const options = getConditionRatingOptions(conditionName, profileId);
  const firstCompensable = options.find((option) => option.value > 0);
  return firstCompensable?.value ?? options[0]?.value ?? "";
};

const isClaimRatingSelected = (rating) => Number.isFinite(Number(rating));

const formatClaimRating = (rating) => (isClaimRatingSelected(rating) ? `${Number(rating)}%` : "Facts needed");

const buildSuggestedClaim = (conditionName) => {
  const conditionData = findConditionData(conditionName);
  const rule = getConditionRule(conditionName);
  return {
    name: conditionName,
    rating: null,
    dbq: conditionData?.dbq || "",
    specialist: conditionData?.specialist || "",
    type: "new",
    diagnosticCode: rule?.diagnosticCode || "",
    ratingRuleTitle: rule?.ruleTitle || "VA rating review",
    ratingProfileId: "",
    ratingProfileLabel: rule?.mode === "profiles" ? "Select a rating basis in the VA Rating Calculator" : "",
    sourceUrl: rule?.sourceUrl || "",
    sourceLabel: rule?.sourceLabel || "",
    ratingSummary: rule?.lockedMessage || "Select the actual rating basis before using this condition in the VA Rating Calculator.",
    pendingFacts: true
  };
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

const getConditionRuleNotes = (conditionName, profileId = "") => {
  const rule = getConditionRule(conditionName);
  if (!rule) return [];
  const profileNotes = rule.mode === "profiles" ? rule.profiles.find((profile) => profile.id === profileId)?.notes || [] : [];
  return [...new Set([...(rule.notes || []), ...profileNotes])];
};

const getClaimIdentityKey = (claim) => `${claim.name}::${claim.ratingProfileId || ""}`;

const getClaimConflict = (claims, conditionName, profileId = "") => {
  const rule = getConditionRule(conditionName);
  if (!rule) return null;

  const exactDuplicate = claims.find((claim) => getClaimIdentityKey(claim) === `${conditionName}::${profileId}`);
  if (exactDuplicate && isClaimRatingSelected(exactDuplicate.rating)) {
    return {
      type: "duplicate",
      message: `${conditionName}${exactDuplicate.ratingProfileLabel ? ` (${exactDuplicate.ratingProfileLabel})` : ""} is already in the stack.`
    };
  }

  if (rule.exclusivityGroup) {
    const conflictingClaim = claims.find((claim) => {
      const claimRule = getConditionRule(claim.name);
      return claimRule?.exclusivityGroup === rule.exclusivityGroup && claim.name !== conditionName;
    });
    if (conflictingClaim) {
      return {
        type: "exclusive",
        message: rule.exclusivityMessage || `${conditionName} conflicts with ${conflictingClaim.name}.`
      };
    }
  }

  return null;
};

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

const formatMessageTime = (value = new Date()) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(value instanceof Date ? value : new Date(value));

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
  const ratingUniverse = FACT_BASED_CLAIM_RATING_OPTIONS;
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
  for (let i = 0; i < ratingUniverse.length; i += 1) {
    const one = ratingUniverse[i];
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

  doubleStep = findBestPair(ratingUniverse.filter((rating) => rating < 100));
  if (!doubleStep) {
    doubleStep = findBestPair(ratingUniverse);
  }

  return {
    currentCombined,
    neededRawPoints: Math.max(0, 95 - detail.rawCombined),
    singleStep,
    doubleStep
  };
};

const createDossierEntry = (payload, scanResult) => {
  const storedText = buildStoredOcrText(scanResult?.text);
  const confidence = Math.max(0, Math.min(99, Math.round(scanResult?.confidence || 0)));
  const scanMethodLabel =
    scanResult?.method === "Embedded PDF text"
      ? "Existing text already inside the PDF"
      : scanResult?.method === "PDF OCR"
        ? "Text read from the PDF pages"
        : "Text read from your photo or upload";
  const detailLines = [
    `How TYFYS read it: ${scanMethodLabel}`,
    `Pages reviewed: ${scanResult?.pageCount || 1}`
  ];
  if (payload.notes) {
    detailLines.push(`Notes for TYFYS: ${payload.notes.trim()}`);
  }

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
    ocrText: `${detailLines.join("\n")}\n\n${storedText.preview}`.trim(),
    capturedAt: new Date().toISOString(),
    status: confidence >= 95 ? "Looks good" : confidence >= 70 ? "Review this scan" : "Check scan quality",
    crmSync: null
  };
};

const getDossierLookupText = (item) =>
  [
    item?.title,
    item?.type,
    item?.source,
    item?.notes,
    item?.fileName,
    item?.ocrText
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const dossierMatchesIntakeRequirement = (item, requirement) => {
  const searchText = getDossierLookupText(item);
  if (!searchText) return false;

  if (requirement.id === "service_treatment" && item?.source === "Service treatment record") return true;
  if (requirement.id === "va_records" && item?.source === "VA Blue Button") return true;
  if (
    requirement.id === "private_records" &&
    ["Private Medical Record", "Imaging", "DBQ", "Nexus Letter"].includes(item?.type)
  ) {
    return true;
  }

  return requirement.keywords.some((keyword) => searchText.includes(keyword));
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
    title: "Before We Begin",
    questions: [
      {
        id: "vso_aware",
        label: "Do you understand TYFYS is a private company and not the VA or a VSO?",
        guideText:
          "Before we start, please confirm you understand TYFYS is a private Veteran-led company. We help you organize records, evidence, and next steps, but we are not the VA.",
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
    title: "A Few Quick Eligibility Questions",
    questions: [
      { id: "attorney", label: "Are you currently working with an accredited attorney?", type: "boolean" },
      { id: "appeal", label: "Do you have an active appeal with a BVA Judge?", type: "boolean" },
      {
        id: "discharge",
        label: "Was your discharge Honorable or General Under Honorable?",
        type: "boolean"
      }
    ],
    guideText: "These questions help us make sure TYFYS is the right fit and point you to the safest next step."
  },
  {
    id: "service",
    title: "Your Service History",
    questions: [
      {
        id: "branch",
        label: "Which Branch did you serve in?",
        type: "select",
        options: ["Army", "Navy", "Marines", "Air Force", "Coast Guard", "Space Force"]
      },
      { id: "era", label: "Service Era", type: "select", options: ["Post-9/11", "Gulf War", "Peacetime", "Vietnam", "Korea"] }
    ],
    guideText: "Your branch and service era help us surface the records, exposures, and presumptive paths most likely to matter."
  },
  {
    id: "status",
    title: "Your Current VA Status",
    questions: [
      { id: "rating", label: "What is your current VA Rating?", type: "slider" },
      { id: "claims_pending", label: "Do you have any claims currently pending?", type: "boolean" }
    ],
    guideText: "Your current rating helps us show the right calculator guidance and compensation estimate."
  },
  {
    id: "pain_category",
    title: "Conditions To Review",
    questions: [
      {
        id: "pain_categories",
        label: "Select ALL body systems affecting you:",
        type: "multi_select",
        options: Object.keys(DISABILITY_DATA)
      }
    ],
    guideText: "Choose the body systems you want help organizing so we can build the right evidence checklist."
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
    guideText: "Now choose the specific conditions you want this account to track."
  },
  // --- CONTACT & PROFILE SECTION ---
  {
    id: "contact_name",
    title: "Your Name",
    type: "contact_form_part1",
    guideText: "Tell us whose account we are setting up so your progress stays attached to the right Veteran."
  },
  {
    id: "contact_info",
    title: "How To Reach You",
    type: "contact_form_part2",
    guideText: "We will use this email and phone number for account access, updates, and next-step reminders."
  },
  {
    id: "final_details",
    title: "Finish Setting Up Your Account",
    type: "contact_form_part3",
    guideText: "Add your ZIP code and create the password you will use to come back to your TYFYS account."
  },
  {
    id: "analyzing",
    type: "loading",
    duration: 2000,
    text: "Preparing your TYFYS account..."
  }
];

// --- SUB-COMPONENTS ---

function LoadingStep({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        <Icons.Activity className="absolute inset-0 m-auto text-blue-500 w-8 h-8" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 animate-pulse">{text}</h2>
      <p className="text-slate-400 text-base sm:text-lg font-medium">Saving your information and setting up your next steps...</p>
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

function ContactStep({ onNext, initialData, part, submitError, isSubmitting, onClearSubmitError, onReturnToLogin }) {
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
    if (submitError && typeof onClearSubmitError === "function") {
      onClearSubmitError();
    }
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
        // Removed silent fail to prevent blocking real users using browser autofill
      }
    }

    // SECURITY: Time-based Validation
    // If form is submitted faster than 2 seconds, it's likely a bot.
    const timeElapsed = Date.now() - startTime;
    if (timeElapsed < 2000) {
      console.log("Spam detected: Submission too fast");
      // Removed silent fail to prevent blocking real users who autofill very fast
    }

    if (part === 1) {
      if (!localData.firstName) newErrors.firstName = "Please enter your first name";
      if (!localData.lastName) newErrors.lastName = "Please enter your last name";
    }
    if (part === 2) {
      // SECURITY: Strict Regex for Email
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!localData.email || !emailRegex.test(localData.email)) newErrors.email = "Please enter a valid email";
      if (!localData.phone || localData.phone.length < 10) newErrors.phone = "Please enter a valid phone number";
    }
    if (part === 3) {
      if (!localData.zip || localData.zip.length < 5) newErrors.zip = "Please enter a valid ZIP code";
      if (!localData.appPassword || localData.appPassword.length < 8) {
        newErrors.appPassword = "Create a password with at least 8 characters";
      }
      if (localData.confirmPassword !== localData.appPassword) {
        newErrors.confirmPassword = "Passwords must match";
      }
      if (!localData.privateOrg) newErrors.privateOrg = "Please confirm TYFYS is a private company";
      if (!localData.terms) newErrors.terms = "Please accept the Terms & Conditions";

      // SECURITY: Math Challenge Verification
      if (parseInt(localData.securityAnswer, 10) !== securityQuestion.ans) {
        newErrors.securityAnswer = "Please answer the security question correctly";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (submitError && typeof onClearSubmitError === "function") {
      onClearSubmitError();
    }
    if (validate()) {
      onNext(localData);
    }
  };

  const hasExistingAccountError = /already exists|existing tyfys login/i.test(String(submitError || ""));

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const isEmailValid = localData.email && emailRegex.test(localData.email);
  const isPhoneValid = localData.phone && localData.phone.length >= 10;
  const isZipValid = localData.zip && localData.zip.length >= 5;
  const isPasswordValid = localData.appPassword && localData.appPassword.length >= 8;
  const isConfirmValid = isPasswordValid && localData.confirmPassword === localData.appPassword;

  const getInputStyle = (error, isValid) =>
    `w-full p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-300 ease-out focus:ring-4 outline-none text-base sm:text-lg font-medium bg-white/70 backdrop-blur-sm ${
      error
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
        : isValid
        ? "border-green-400 focus:border-green-500 focus:ring-green-500/20"
        : "border-slate-200/70 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
    }`;

  const renderCheckmark = (isValid) => {
    if (!isValid) return null;
    return (
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none animate-fadeIn">
        <Icons.CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    );
  };

  return (
    <div className="animate-fadeIn w-full space-y-5 sm:space-y-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative animate-fadeIn" style={{ animationDelay: '0ms' }}>
              <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
              <div className="relative">
                <input
                  name="firstName"
                  value={localData.firstName || ""}
                  onChange={handleChange}
                  autoComplete="given-name"
                  className={getInputStyle(errors.firstName, !!localData.firstName)}
                  placeholder="John"
                />
                {renderCheckmark(!!localData.firstName && !errors.firstName)}
              </div>
              {errors.firstName && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.firstName}</p>}
            </div>
            <div className="relative animate-fadeIn" style={{ animationDelay: '100ms' }}>
              <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
              <div className="relative">
                <input
                  name="lastName"
                  value={localData.lastName || ""}
                  onChange={handleChange}
                  autoComplete="family-name"
                  className={getInputStyle(errors.lastName, !!localData.lastName)}
                  placeholder="Doe"
                />
                {renderCheckmark(!!localData.lastName && !errors.lastName)}
              </div>
              {errors.lastName && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.lastName}</p>}
            </div>
        </div>
      )}

      {part === 2 && (
        <>
          <div className="relative animate-fadeIn" style={{ animationDelay: '0ms' }}>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                name="email"
                type="email"
                value={localData.email || ""}
                onChange={handleChange}
                autoComplete="email"
                className={getInputStyle(errors.email, isEmailValid)}
                placeholder="john@example.com"
              />
              {renderCheckmark(isEmailValid && !errors.email)}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {["@gmail.com", "@yahoo.com", "@aol.com", ".mil"].map((domain) => (
                <button
                  key={domain}
                  onClick={() => handleEmailQuickFill(domain)}
                  className="px-4 py-1.5 rounded-full bg-blue-50/70 text-blue-700 font-semibold text-xs hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-blue-400/50 border border-blue-200/50"
                  type="button"
                >
                  {domain}
                </button>
              ))}
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.email}</p>}
          </div>

          <div className="relative animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <input
                name="phone"
                type="tel"
                value={localData.phone || ""}
                onChange={handleChange}
                autoComplete="tel"
                className={getInputStyle(errors.phone, isPhoneValid)}
                placeholder="(555) 123-4567"
              />
              {renderCheckmark(isPhoneValid && !errors.phone)}
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.phone}</p>}
          </div>
        </>
      )}

      {part === 3 && (
        <>
          <div className="relative animate-fadeIn" style={{ animationDelay: '0ms' }}>
            <label className="block text-sm font-bold text-slate-700 mb-1">Zip Code</label>
            <div className="relative">
              <input
                name="zip"
                value={localData.zip || ""}
                onChange={handleChange}
                maxLength={5}
                autoComplete="postal-code"
                className={getInputStyle(errors.zip, isZipValid)}
                placeholder="12345"
              />
              {renderCheckmark(isZipValid && !errors.zip)}
            </div>
            {errors.zip && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.zip}</p>}
          </div>

          <div className="bg-white/80 p-5 rounded-xl border border-slate-200/80 space-y-5 shadow-sm backdrop-blur-md relative animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <div>
              <p className="text-base font-bold text-slate-800">Create your TYFYS login</p>
              <p className="text-sm text-slate-500 mt-1">
                This password lets you come back to your account on this device without starting over.
              </p>
            </div>
            <div className="relative">
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  name="appPassword"
                  type="password"
                  value={localData.appPassword || ""}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={getInputStyle(errors.appPassword, isPasswordValid)}
                  placeholder="At least 8 characters"
                />
                {renderCheckmark(isPasswordValid && !errors.appPassword)}
              </div>
              {errors.appPassword && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.appPassword}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type="password"
                  value={localData.confirmPassword || ""}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={getInputStyle(errors.confirmPassword, isConfirmValid)}
                  placeholder="Re-enter your password"
                />
                {renderCheckmark(isConfirmValid && !errors.confirmPassword)}
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* SECURITY: Math Challenge */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Icons.LockSmall className="w-4 h-4 text-blue-600" />
              Quick Security Check: What is {securityQuestion.n1} + {securityQuestion.n2}?
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
                I understand TYFYS is a <strong>private company</strong>, not the VA or a VSO.
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
          disabled={Boolean(isSubmitting)}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-black text-lg sm:text-xl py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 border-b-4 border-yellow-600 active:border-b-0 active:mt-1"
        >
          {isSubmitting ? "Creating Your Account..." : part === 3 ? "Create My Account" : "Continue"}{" "}
          {!isSubmitting && <Icons.ChevronRight className="w-6 h-6 stroke-[3px]" />}
        </button>

        {(part === 2 || part === 3) && (
          <button
            type="button"
            onClick={onReturnToLogin}
            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors underline decoration-slate-300 hover:decoration-blue-400 mt-1 pb-2"
          >
            Already have an account? Sign in
          </button>
        )}

        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-bold text-red-800">We could not finish setting up your TYFYS account.</p>
            <p className="mt-1">{submitError}</p>
            {hasExistingAccountError && (
              <button
                type="button"
                onClick={onReturnToLogin}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
              >
                Go to Sign-In <Icons.ChevronRight className="w-4 h-4 stroke-[3px]" />
              </button>
            )}
          </div>
        )}

        {/* SECURITY: Badges */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
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

function AccessLanding({
  hasSavedAccount,
  hasKnownAccount,
  accountEmail,
  displayName,
  onboardingComplete,
  loginMessage,
  isSubmitting,
  resetToken,
  resetStatus,
  resetVerification,
  isResetSubmitting,
  googleAuth,
  onLogin,
  onGoogleLogin,
  onRequestPasswordReset,
  onVerifyPasswordResetAccount,
  onCompletePasswordReset,
  onClearPasswordReset,
  onCreateAccount
}) {
  const [email, setEmail] = useState(accountEmail || "");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(() => (resetToken ? "complete" : "login"));
  const [resetEmail, setResetEmail] = useState(accountEmail || "");
  const [resetZip, setResetZip] = useState("");
  const [resetLastName, setResetLastName] = useState("");
  const [resetPhoneLast4, setResetPhoneLast4] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [googleRenderError, setGoogleRenderError] = useState("");
  const googleButtonRef = useRef(null);
  const googleLoginRef = useRef(onGoogleLogin);

  useEffect(() => {
    setEmail(accountEmail || "");
    setResetEmail(accountEmail || "");
  }, [accountEmail]);

  useEffect(() => {
    googleLoginRef.current = onGoogleLogin;
  }, [onGoogleLogin]);

  useEffect(() => {
    if (resetToken) {
      setMode("complete");
      return;
    }
    setMode((currentMode) => (currentMode === "complete" ? "login" : currentMode));
  }, [resetToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onLogin({ email, password });
    setPassword("");
  };

  const handleRequestReset = async (event) => {
    event.preventDefault();
    await onRequestPasswordReset({ email: resetEmail || email || accountEmail || "" });
  };

  const handleVerifyResetAccount = async (event) => {
    event.preventDefault();
    await onVerifyPasswordResetAccount({
      email: resetEmail || email || accountEmail || "",
      zip: resetZip,
      lastName: resetLastName,
      phoneLast4: resetPhoneLast4,
    });
  };

  const handleCompleteReset = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) return;
    await onCompletePasswordReset({ token: resetToken, password: newPassword });
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const heroTitle = hasSavedAccount
    ? onboardingComplete
      ? "Welcome back to your TYFYS account"
      : "Finish setting up your TYFYS account"
    : "Log in or start your TYFYS account";
  const heroBody = hasSavedAccount
    ? onboardingComplete
      ? "Sign in on this device to reopen your saved profile, uploaded records, and next steps."
      : "Your setup progress is saved on this device. Sign in to continue where you left off."
    : "If you already have a TYFYS login, sign in first. If you are new here, use the new-account button below and we will walk you through setup step by step.";
  const savedItems = hasSavedAccount
    ? onboardingComplete
      ? ["Your saved profile and contact details", "Your rating calculator progress and notes", "Your uploaded records and saved drafts"]
      : ["Your saved contact details", "Your current setup step and answers so far", "The login you will use to come back later"]
    : ["Your secure TYFYS login for this device", "Your setup answers and contact details", "Your saved progress when you come back"];
  const panelLabel =
    mode === "request"
      ? "Password Help"
      : mode === "complete"
        ? "Reset Password"
        : hasKnownAccount
          ? "Returning User"
          : "App Sign-In";
  const panelTitle =
    mode === "request"
      ? "Reset your password"
      : mode === "complete"
        ? resetVerification?.checking
          ? "Checking your reset link"
          : resetVerification?.valid
            ? "Choose a new password"
            : "Request a new reset link"
        : "Log in to continue";
  const panelBody =
    mode === "request"
      ? "Use the email reset link if you can still reach the inbox on file. If not, verify the ZIP code, last name, and phone ending saved in your TYFYS profile."
      : mode === "complete"
        ? resetVerification?.checking
          ? "We are making sure your secure reset link is still valid."
          : resetVerification?.valid
            ? "Choose a new password for your TYFYS account. Once it is saved, we will sign you back in automatically."
            : resetVerification?.error || "This reset link is no longer valid. Request a fresh reset email below."
        : hasKnownAccount
          ? onboardingComplete
            ? "We found saved TYFYS progress on this device. Sign in to reopen it."
            : "We found an existing TYFYS account for this email. Sign in first so you do not create a duplicate."
          : "If you already have a TYFYS login, enter it here first. If you are new here, use the button below.";
  const resetStatusTone =
    resetStatus?.type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : resetStatus?.type === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-600";
  const resetPasswordsMatch = newPassword === confirmNewPassword;
  const showNewAccountCard = mode === "login";
  const googleEnabled = Boolean(googleAuth?.enabled && googleAuth?.clientId);

  useEffect(() => {
    if (mode !== "login" || !googleEnabled || !googleButtonRef.current) {
      setGoogleRenderError("");
      return undefined;
    }

    let canceled = false;
    const buttonContainer = googleButtonRef.current;

    loadExternalScript(GOOGLE_IDENTITY_SCRIPT_URL, "google")
      .then((google) => {
        if (canceled || !buttonContainer || !google?.accounts?.id?.initialize) return;

        google.accounts.id.initialize({
          client_id: googleAuth.clientId,
          ux_mode: "popup",
          context: hasKnownAccount ? "signin" : "signup",
          callback: (response) => {
            const credential = String(response?.credential || "").trim();
            if (!credential) {
              setGoogleRenderError("Google did not finish sign-in. Please try again.");
              return;
            }
            setGoogleRenderError("");
            googleLoginRef.current?.({ credential });
          }
        });

        buttonContainer.innerHTML = "";
        google.accounts.id.renderButton(buttonContainer, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: hasKnownAccount ? "signin_with" : "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: Math.max(240, Math.min(360, Math.floor(buttonContainer.offsetWidth || 320)))
        });
      })
      .catch((error) => {
        if (canceled) return;
        setGoogleRenderError(String(error?.message || error || "").slice(0, 180));
      });

    return () => {
      canceled = true;
    };
  }, [googleAuth?.clientId, googleEnabled, hasKnownAccount, mode]);

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950 text-white">
      <div className="relative min-h-[100dvh]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.16),_transparent_34%)]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl items-center px-5 py-8 sm:px-8 lg:px-10">
          <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur sm:p-8 lg:p-10">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-slate-950 shadow-xl">
                  <Icons.ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">TYFYS Veteran Access</p>
                  <p className="text-sm text-slate-400">Private claim support account</p>
                </div>
              </div>

              <div className="mt-8 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-100">
                  <Icons.LockSmall className="h-4 w-4" />
                  Secure login and saved progress
                </div>
                <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
                  {heroTitle}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{heroBody}</p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <Icons.User className="h-6 w-6 text-yellow-300" />
                  <p className="mt-3 text-sm font-black text-white">Save your profile</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Keep your contact info and claim details on this device so you do not have to re-enter them.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <Icons.FileText className="h-6 w-6 text-blue-300" />
                  <p className="mt-3 text-sm font-black text-white">Resume your account</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Return to your records, rating work, and next steps where you left off.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <Icons.CheckCircle className="h-6 w-6 text-emerald-300" />
                  <p className="mt-3 text-sm font-black text-white">Come back without starting over</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Use one secure login on this device to reopen TYFYS and pick back up later.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Saved on this device</p>
                <div className="mt-4 space-y-3">
                  {savedItems.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                        <Icons.CheckCircle className="h-4 w-4" />
                      </div>
                      <p className="text-sm leading-6 text-slate-200">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-white/40 bg-white text-slate-900 shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-6 sm:px-8 sm:py-8">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">{panelLabel}</p>
                <h2 className="mt-3 text-3xl font-black text-slate-900">{panelTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{panelBody}</p>
              </div>

              <div className="px-6 py-6 sm:px-8 sm:py-8">
                {mode === "login" && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {googleEnabled && (
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
                          Use Google to sign in faster. If this email already has a TYFYS account, we will reopen it instead of creating a duplicate.
                        </div>
                        <div className={isSubmitting ? "pointer-events-none opacity-60" : ""}>
                          <div
                            ref={googleButtonRef}
                            className="flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-2"
                          ></div>
                        </div>
                        {googleRenderError && (
                          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {googleRenderError}
                          </div>
                        )}
                        <div className="relative">
                          <div className="border-t border-slate-200"></div>
                          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                            Or use your TYFYS email
                          </span>
                        </div>
                      </div>
                    )}

                    {(hasSavedAccount || (hasKnownAccount && accountEmail)) && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                          {hasSavedAccount ? "Saved account" : "Account email"}
                        </p>
                        <p className="mt-2 text-base font-bold text-slate-900">
                          {displayName || (hasKnownAccount ? "Existing TYFYS account" : "Your TYFYS account")}
                        </p>
                        <p className="text-sm text-slate-500">{accountEmail || "Email saved on this device"}</p>
                      </div>
                    )}

                    <div>
                      <label className="mb-1 block text-sm font-bold text-slate-700">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="username"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-500"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between gap-4">
                        <label className="block text-sm font-bold text-slate-700">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setResetEmail(email || accountEmail || "");
                            setMode("request");
                          }}
                          className="text-sm font-bold text-blue-700 hover:text-blue-800"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-500"
                        placeholder="Enter your TYFYS password"
                      />
                    </div>
                    {loginMessage && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        {loginMessage}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-base font-black text-white shadow-lg transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? "Signing In..." : "Log In and Continue"}
                      {!isSubmitting && <Icons.ChevronRight className="h-5 w-5" />}
                    </button>
                    <p className="text-xs leading-5 text-slate-500">
                      TYFYS keeps this device signed in for up to 30 days so you can return to your saved account faster.
                    </p>
                  </form>
                )}

                {mode === "request" && (
                  <div className="space-y-6">
                    <form onSubmit={handleRequestReset} className="space-y-5">
                      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-900">
                        Use the same email you used to create your TYFYS account. If email delivery is available, we will send a secure reset link there.
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-bold text-slate-700">Account email</label>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(event) => setResetEmail(event.target.value)}
                          autoComplete="email"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-500"
                          placeholder="you@example.com"
                        />
                      </div>
                      {resetStatus?.message && (
                        <div className={`rounded-2xl border px-4 py-3 text-sm ${resetStatusTone}`}>
                          {resetStatus.message}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={isResetSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-base font-black text-white shadow-lg transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isResetSubmitting ? "Sending Reset Link..." : "Email Me a Reset Link"}
                        {!isResetSubmitting && <Icons.Mail className="h-5 w-5" />}
                      </button>
                    </form>

                    <div className="relative">
                      <div className="border-t border-slate-200"></div>
                      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                        Or
                      </span>
                    </div>

                    <form onSubmit={handleVerifyResetAccount} className="space-y-5">
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                        Cannot reach your email right now? Verify the details TYFYS already has on file and you can choose a new password immediately.
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-bold text-slate-700">Account email</label>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(event) => setResetEmail(event.target.value)}
                          autoComplete="email"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-500"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-bold text-slate-700">ZIP code on file</label>
                          <input
                            type="text"
                            value={resetZip}
                            onChange={(event) => setResetZip(event.target.value)}
                            autoComplete="postal-code"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-500"
                            placeholder="12345"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-bold text-slate-700">Phone ending</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={resetPhoneLast4}
                            onChange={(event) => setResetPhoneLast4(event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-500"
                            placeholder="Last 4 digits"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-bold text-slate-700">Last name on file</label>
                        <input
                          type="text"
                          value={resetLastName}
                          onChange={(event) => setResetLastName(event.target.value)}
                          autoComplete="family-name"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-500"
                          placeholder="Your last name"
                        />
                      </div>
                      {resetStatus?.message && (
                        <div className={`rounded-2xl border px-4 py-3 text-sm ${resetStatusTone}`}>
                          {resetStatus.message}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={isResetSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-base font-black text-white shadow-lg transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isResetSubmitting ? "Verifying Account..." : "Verify My Account Details"}
                        {!isResetSubmitting && <Icons.ShieldCheck className="h-5 w-5" />}
                      </button>
                    </form>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                      TYFYS only opens the password screen when the account details match what is already saved for that member.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClearPasswordReset();
                        setMode("login");
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 transition-colors hover:border-slate-400"
                    >
                      <Icons.ChevronLeft className="h-5 w-5" />
                      Back to Sign-In
                    </button>
                  </div>
                )}

                {mode === "complete" && (
                  <div className="space-y-5">
                    {resetVerification?.checking && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                        Verifying your secure reset link now.
                      </div>
                    )}

                    {!resetVerification?.checking && !resetVerification?.valid && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
                          {resetVerification?.error || "This password reset link is invalid or expired."}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onClearPasswordReset();
                            setResetEmail(accountEmail || "");
                            setMode("request");
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-base font-black text-white shadow-lg transition-colors hover:bg-blue-500"
                        >
                          Request a Fresh Reset Link
                          <Icons.Mail className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClearPasswordReset();
                            setMode("login");
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 transition-colors hover:border-slate-400"
                        >
                          <Icons.ChevronLeft className="h-5 w-5" />
                          Back to Sign-In
                        </button>
                      </div>
                    )}

                    {!resetVerification?.checking && resetVerification?.valid && (
                      <form onSubmit={handleCompleteReset} className="space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Account email</p>
                          <p className="mt-2 text-base font-bold text-slate-900">{resetVerification.email || accountEmail || "TYFYS account"}</p>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-bold text-slate-700">New password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-500"
                            placeholder="Create a new password"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-bold text-slate-700">Confirm new password</label>
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(event) => setConfirmNewPassword(event.target.value)}
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-blue-500"
                            placeholder="Re-enter your new password"
                          />
                        </div>
                        {newPassword && confirmNewPassword && !resetPasswordsMatch && (
                          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            These passwords do not match yet.
                          </div>
                        )}
                        {resetStatus?.message && (
                          <div className={`rounded-2xl border px-4 py-3 text-sm ${resetStatusTone}`}>
                            {resetStatus.message}
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={isResetSubmitting || newPassword.length < 8 || confirmNewPassword.length < 8 || !resetPasswordsMatch}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-base font-black text-white shadow-lg transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isResetSubmitting ? "Saving New Password..." : "Save New Password and Sign In"}
                          {!isResetSubmitting && <Icons.ChevronRight className="h-5 w-5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClearPasswordReset();
                            setMode("login");
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 transition-colors hover:border-slate-400"
                        >
                          <Icons.ChevronLeft className="h-5 w-5" />
                          Back to Sign-In
                        </button>
                      </form>
                    )}
                  </div>
                )}

                <div className={`mt-6 border-t border-slate-200 pt-6 ${showNewAccountCard ? "" : "hidden"}`}>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">New to TYFYS?</p>
                    <p className="mt-2 text-lg font-black text-slate-900">Need to create your account?</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Start here to save your contact details, create your login, and come back later without redoing setup.
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">1</div>
                        <p className="text-sm leading-6 text-slate-600">Enter your name, email, phone number, and ZIP code.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">2</div>
                        <p className="text-sm leading-6 text-slate-600">Create the password you will use to come back to TYFYS.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">3</div>
                        <p className="text-sm leading-6 text-slate-600">Return later and log in without starting over.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onCreateAccount}
                      className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 text-lg font-black text-white shadow-xl transition-transform hover:-translate-y-0.5"
                    >
                      Click here if you're setting up a new account
                      <Icons.ChevronRight className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-4 text-sm leading-6 text-slate-700">
                    <span className="font-black text-slate-900">Notice:</span> TYFYS is a private company and not the VA. Your information is stored on this device so you can return and continue your account.
                  </div>
                </div>
              </div>
            </section>
          </div>
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
          <h3 className="text-2xl font-black text-slate-900">Independent Doctor Support</h3>
          <p className="text-slate-500 font-medium">Get help lining up the medical opinion or DBQ support your claim may need.</p>
        </div>

        <div className="space-y-4">
          {/* A La Carte Option */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-slate-600">One-Time Review</span>
              <span className="font-black text-xl text-slate-800">$1,800</span>
            </div>
            <p className="text-xs text-slate-400">Single medical opinion only.</p>
          </div>

          {/* Premium Member Option */}
          <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
              MEMBER PRICE
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-blue-900 flex items-center gap-2">
                <Icons.ShieldCheck className="w-4 h-4" /> Membership Price
              </span>
              <div className="text-right">
                <span className="block text-xs text-slate-400 line-through">$1,800</span>
                <span className="font-black text-2xl text-blue-700">$1,350</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 font-bold mb-2">Save $450 instantly (25% OFF)</p>
            {!isMember && (
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
                Join Membership & Save
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
                <Icons.Star className="w-4 h-4 text-yellow-400" /> Full Support Package
              </span>
              <div className="text-right">
                <span className="font-black text-xl text-yellow-400">INCLUDED</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-tight mb-3">
              Medical opinion letters are <strong>INCLUDED</strong> in our Standard and Multi-Claim packages.
            </p>
            <button className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
              View Support Options <Icons.ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
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
  const persistedAppStateRef = useRef(loadPersistedAppState());
  const persistedAuthAccountRef = useRef(loadAuthAccount());
  const nativeAppRuntime = isNativeAppRuntime();
  const persistedAppState = persistedAppStateRef.current;
  const persistedAuthAccount = persistedAuthAccountRef.current;
  const hasLeadPrefill = Boolean(
    leadPrefill && (leadPrefill.firstName || leadPrefill.lastName || leadPrefill.email || leadPrefill.phone)
  );
  const prefilledContactStep = ONBOARDING_STEPS.findIndex((step) => step.id === "contact_name");
  const prefilledProfile = mapLeadPrefillToProfile(leadPrefill);
  const leadPrefillEmail = normalizeEmail(prefilledProfile.email || leadPrefill?.email || "");
  const initialResetToken = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return String(params.get("resetToken") || "").trim();
    } catch (error) {
      return "";
    }
  })();
  const initialAutostart = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const value = String(params.get("autostart") || "").trim().toLowerCase();
      return value === "1" || value === "true" || value === "yes";
    } catch (error) {
      return false;
    }
  })();
  const storedUserProfile = sanitizeUserProfile(persistedAppState?.userProfile || {});
  const initialOnboardingStep =
    Number.isFinite(persistedAppState?.onboardingStep) && persistedAppState.onboardingStep >= 0 && persistedAppState.onboardingStep < ONBOARDING_STEPS.length
      ? persistedAppState.onboardingStep
      : hasLeadPrefill && prefilledContactStep >= 0
        ? prefilledContactStep
        : 0;
  const storedCurrentRating = Number(persistedAppState?.currentRating);
  const initialCurrentRating = Number.isFinite(storedCurrentRating)
    ? storedCurrentRating
    : Number(storedUserProfile.rating || prefilledProfile.rating || 0);
  const initialUserProfile = createBaseUserProfile(prefilledProfile, storedUserProfile);

  // STATE
  const [hasStarted, setHasStarted] = useState(() =>
    Boolean(initialAutostart || persistedAppState?.hasStarted || loadHasStarted())
  );
  const [onboardingComplete, setOnboardingComplete] = useState(() => Boolean(persistedAppState?.onboardingComplete));
  const [onboardingStep, setOnboardingStep] = useState(initialOnboardingStep);
  const [intakeStarted, setIntakeStarted] = useState(() => Boolean(persistedAppState?.intakeStarted));
  const [userProfile, setUserProfile] = useState(initialUserProfile);
  const [activeView, setActiveView] = useState(persistedAppState?.activeView || "welcome_guide");
  const [paymentState, setPaymentState] = useState(() => loadPaymentState());
  const [zohoLeadId, setZohoLeadId] = useState(() => loadZohoLeadId());
  const [zohoCrmModule, setZohoCrmModule] = useState(() => persistedAppState?.zohoCrmModule || "");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isMember, setIsMember] = useState(() => Boolean(persistedAppState?.isMember));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState(initialCurrentRating);
  const [hasSpouse, setHasSpouse] = useState(() => Boolean(persistedAppState?.hasSpouse));
  const [childCount, setChildCount] = useState(() => Number(persistedAppState?.childCount || 0));
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [selectedRatingProfileId, setSelectedRatingProfileId] = useState("");
  const [newRatingInput, setNewRatingInput] = useState("");
  const [claimType, setClaimType] = useState(persistedAppState?.claimType || "increase");
  const [addedClaims, setAddedClaims] = useState(() =>
    Array.isArray(persistedAppState?.addedClaims) ? persistedAppState.addedClaims : []
  );
  const [editingClaimIndex, setEditingClaimIndex] = useState(null);
  const [calculatorNotice, setCalculatorNotice] = useState(null);
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
  const [discountUnlocked, setDiscountUnlocked] = useState(() => Boolean(persistedAppState?.discountUnlocked));
  const [isBotOpen, setIsBotOpen] = useState(false); // Bot starts closed
  const [messages, setMessages] = useState([]);
  const [doctorPortalIntegrations, setDoctorPortalIntegrations] = useState(() =>
    Array.isArray(persistedAppState?.doctorPortalIntegrations) && persistedAppState.doctorPortalIntegrations.length
      ? persistedAppState.doctorPortalIntegrations
      : DOCTOR_PORTAL_INTEGRATIONS
  );
  const [secureThreads, setSecureThreads] = useState(() =>
    Array.isArray(persistedAppState?.secureThreads) && persistedAppState.secureThreads.length
      ? persistedAppState.secureThreads
      : INITIAL_SECURE_THREADS
  );
  const [selectedSecureThreadId, setSelectedSecureThreadId] = useState(
    persistedAppState?.selectedSecureThreadId || INITIAL_SECURE_THREADS[0].id
  );
  const [secureMessageInput, setSecureMessageInput] = useState("");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [authAccount, setAuthAccount] = useState(() => persistedAuthAccount);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthBootstrapping, setIsAuthBootstrapping] = useState(true);
  const [authStatusMessage, setAuthStatusMessage] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [googleAuthConfig, setGoogleAuthConfig] = useState({
    loading: true,
    enabled: false,
    clientId: "",
    error: ""
  });
  const [passwordResetToken, setPasswordResetToken] = useState(initialResetToken);
  const [passwordResetStatus, setPasswordResetStatus] = useState({ type: "", message: "" });
  const [isPasswordResetSubmitting, setIsPasswordResetSubmitting] = useState(false);
  const [passwordResetVerification, setPasswordResetVerification] = useState(() => ({
    checking: Boolean(initialResetToken),
    valid: false,
    email: "",
    error: "",
    expiresAt: "",
  }));
  const [hasLeadPrefillAccount, setHasLeadPrefillAccount] = useState(false);
  const [isLeadPrefillAccountLookupPending, setIsLeadPrefillAccountLookupPending] = useState(
    () => Boolean(hasLeadPrefill && leadPrefillEmail && !persistedAuthAccount)
  );
  // Updated Bot Intro
  const [aiBotMessages, setAiBotMessages] = useState([
    {
      sender: "bot",
      text: "Hello, I'm Angela. I can help you figure out where to start, which records to upload, and which TYFYS tool to use next."
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
  const [scanStageLabel, setScanStageLabel] = useState("Idle");
  const [scanError, setScanError] = useState("");
  const [recordSyncNotice, setRecordSyncNotice] = useState(null);
  const [scannerFile, setScannerFile] = useState(null);
  const [isZapierEmbedReady, setIsZapierEmbedReady] = useState(() =>
    Boolean(window.customElements?.get(ZAPIER_CHATBOT_ELEMENT_TAG))
  );
  const [zapierEmbedError, setZapierEmbedError] = useState("");
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
  const selectedConditionRule = getConditionRule(selectedCondition);
  const selectedRatingContext = getConditionRatingContext(selectedCondition, selectedRatingProfileId);
  const selectedRatingOptions = getConditionRatingOptions(selectedCondition, selectedRatingProfileId);
  const selectedConditionNotes = getConditionRuleNotes(selectedCondition, selectedRatingProfileId);
  const selectedConditionBlockedMessage =
    selectedConditionRule?.mode === "measurement_required" ? selectedConditionRule.lockedMessage : "";
  const selectedConditionNeedsProfile = selectedConditionRule?.mode === "profiles" && !selectedRatingProfileId;
  const hasSelectedRatingOption =
    newRatingInput !== "" && selectedRatingOptions.some((option) => option.value === Number(newRatingInput));
  const intakeChecklist = INTAKE_RECORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    matchedItem: dossier.find((item) => dossierMatchesIntakeRequirement(item, requirement)) || null
  }));
  const intakeCompletedCount = intakeChecklist.filter((item) => item.matchedItem).length;
  const syncedDossierCount = dossier.filter((item) => item?.crmSync?.status === "synced").length;

  const startSystem = () => {
    setHasStarted(true);
    saveHasStarted();
  };
  const returnToAccessLanding = () => {
    setHasStarted(false);
    clearHasStarted();
    window.location.reload();
  };
  const checkoutLeadId = zohoLeadId || "";

  const chatEndRef = useRef(null);
  const secureChatEndRef = useRef(null);
  const botMemory = useRef({ hasPitchedNexus: false, hasWelcomed: false, viewGuidesSent: new Set() });
  const scanPayloadRef = useRef(null);
  const scannerFileInputRef = useRef(null);
  const onboardingScrollRef = useRef(null);
  const isApplyingRemoteStateRef = useRef(false);
  const hasExistingAccountStatus = /already exists|existing tyfys login/i.test(String(authStatusMessage || ""));
  const hasKnownAccount =
    Boolean(authAccount) || onboardingComplete || hasExistingAccountStatus || hasLeadPrefillAccount;
  const isAccessBootstrapping = isAuthBootstrapping || isLeadPrefillAccountLookupPending;
  const showAccessLanding =
    Boolean(passwordResetToken) || (!isAccessBootstrapping && !isAuthenticated && (!hasStarted || onboardingComplete || hasKnownAccount));
  const currentOnboardingStep = ONBOARDING_STEPS[onboardingStep];
  const isContactOnboardingStep = currentOnboardingStep?.type?.startsWith("contact_form");
  const isLoadingOnboardingStep = currentOnboardingStep?.type === "loading";
  const shouldShowOnboardingFooter = !isContactOnboardingStep && !isLoadingOnboardingStep;

  const normalizePaymentState = (value) => ({
    completed: Boolean(value?.completed),
    planName: value?.planName || "",
    paidAt: value?.paidAt || ""
  });

  const createDefaultAppStateSnapshot = (overrides = {}) => {
    const fallbackUserProfile = createBaseUserProfile(prefilledProfile, overrides.userProfile);
    const fallbackRating = Number(overrides.currentRating ?? fallbackUserProfile.rating ?? prefilledProfile.rating ?? 0);
    const fallbackLeadId = String(overrides.zohoLeadId ?? "").trim();

    return {
      hasStarted: Boolean(overrides.hasStarted),
      onboardingComplete: Boolean(overrides.onboardingComplete),
      intakeStarted: Boolean(overrides.intakeStarted),
      onboardingStep:
        Number.isFinite(overrides.onboardingStep) &&
        overrides.onboardingStep >= 0 &&
        overrides.onboardingStep < ONBOARDING_STEPS.length
          ? overrides.onboardingStep
          : hasLeadPrefill && prefilledContactStep >= 0
            ? prefilledContactStep
            : 0,
      userProfile: fallbackUserProfile,
      activeView: overrides.activeView || "welcome_guide",
      currentRating: Number.isFinite(fallbackRating) ? fallbackRating : 0,
      hasSpouse: Boolean(overrides.hasSpouse),
      childCount: Number(overrides.childCount ?? 0) || 0,
      claimType: overrides.claimType || "increase",
      addedClaims: Array.isArray(overrides.addedClaims) ? overrides.addedClaims : [],
      isMember: Boolean(overrides.isMember),
      discountUnlocked: Boolean(overrides.discountUnlocked),
      doctorPortalIntegrations:
        Array.isArray(overrides.doctorPortalIntegrations) && overrides.doctorPortalIntegrations.length
          ? overrides.doctorPortalIntegrations
          : DOCTOR_PORTAL_INTEGRATIONS,
      secureThreads:
        Array.isArray(overrides.secureThreads) && overrides.secureThreads.length
          ? overrides.secureThreads
          : INITIAL_SECURE_THREADS,
      selectedSecureThreadId:
        overrides.selectedSecureThreadId ||
        (Array.isArray(overrides.secureThreads) && overrides.secureThreads[0]?.id) ||
        INITIAL_SECURE_THREADS[0].id,
      paymentState: normalizePaymentState(overrides.paymentState ?? DEFAULT_PAYMENT_STATE),
      dossier: Array.isArray(overrides.dossier) ? overrides.dossier : [],
      zohoLeadId: fallbackLeadId,
      zohoCrmModule: overrides.zohoCrmModule || ""
    };
  };

  const buildAppStateSnapshot = (overrides = {}) => {
    const nextUserProfile = sanitizeUserProfile(overrides.userProfile ?? userProfile);
    return {
      hasStarted: Boolean(overrides.hasStarted ?? hasStarted),
      onboardingComplete: Boolean(overrides.onboardingComplete ?? onboardingComplete),
      intakeStarted: Boolean(overrides.intakeStarted ?? intakeStarted),
      onboardingStep: Number.isFinite(overrides.onboardingStep) ? overrides.onboardingStep : onboardingStep,
      userProfile: nextUserProfile,
      activeView: overrides.activeView ?? activeView,
      currentRating: Number.isFinite(Number(overrides.currentRating))
        ? Number(overrides.currentRating)
        : currentRating,
      hasSpouse: Boolean(overrides.hasSpouse ?? hasSpouse),
      childCount: Number(overrides.childCount ?? childCount ?? 0),
      claimType: overrides.claimType ?? claimType,
      addedClaims: Array.isArray(overrides.addedClaims) ? overrides.addedClaims : addedClaims,
      isMember: Boolean(overrides.isMember ?? isMember),
      discountUnlocked: Boolean(overrides.discountUnlocked ?? discountUnlocked),
      doctorPortalIntegrations: Array.isArray(overrides.doctorPortalIntegrations)
        ? overrides.doctorPortalIntegrations
        : doctorPortalIntegrations,
      secureThreads: Array.isArray(overrides.secureThreads) ? overrides.secureThreads : secureThreads,
      selectedSecureThreadId:
        overrides.selectedSecureThreadId || selectedSecureThreadId || INITIAL_SECURE_THREADS[0].id,
      paymentState: normalizePaymentState(overrides.paymentState ?? paymentState),
      dossier: Array.isArray(overrides.dossier) ? overrides.dossier : dossier,
      zohoLeadId: overrides.zohoLeadId ?? zohoLeadId,
      zohoCrmModule: overrides.zohoCrmModule ?? zohoCrmModule,
    };
  };

  const createPersistedSnapshot = (overrides = {}) => ({
    version: APP_STATE_VERSION,
    savedAt: new Date().toISOString(),
    ...buildAppStateSnapshot(overrides)
  });

  const saveAuthHint = (account) => {
    if (!account) return null;
    const nextAccount = {
      userId: account.userId || authAccount?.userId || "",
      email: normalizeEmail(account.email || authAccount?.email || ""),
      displayName: account.displayName || authAccount?.displayName || "",
      leadId: account.leadId || authAccount?.leadId || "",
      createdAt: account.createdAt || authAccount?.createdAt || "",
      updatedAt: account.updatedAt || new Date().toISOString(),
      lastLoginAt: account.lastLoginAt || authAccount?.lastLoginAt || ""
    };
    setAuthAccount(nextAccount);
    saveAuthAccount(nextAccount);
    return nextAccount;
  };

  const requestAppJson = async (url, { method = "GET", body } = {}) => {
    const response = await fetch(
      resolveApiUrl(url),
      createApiRequestInit({
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      })
    );
    const payload = await response.json().catch(() => ({}));
    if (payload?.sessionToken) {
      saveAppSessionToken(payload.sessionToken);
    } else if (payload?.authenticated === false || String(url || "").includes("/api/auth-logout")) {
      saveAppSessionToken("");
    }
    if (!response.ok || payload?.ok === false) {
      throw new Error(payload?.error || `Request failed (${response.status})`);
    }
    return payload;
  };

  const applyPersistedSnapshot = (snapshot, fallbackAccount = null) => {
    const fallbackNameParts = String(fallbackAccount?.displayName || "").trim().split(/\s+/).filter(Boolean);
    const nextSnapshot = createDefaultAppStateSnapshot({
      userProfile: {
        firstName: fallbackNameParts[0] || "",
        lastName: fallbackNameParts.slice(1).join(" "),
        email: fallbackAccount?.email || "",
      },
      zohoLeadId: fallbackAccount?.leadId || "",
      ...(snapshot && typeof snapshot === "object" ? snapshot : {})
    });
    isApplyingRemoteStateRef.current = true;

    setHasStarted(Boolean(nextSnapshot.hasStarted));
    setOnboardingComplete(Boolean(nextSnapshot.onboardingComplete));
    setIntakeStarted(Boolean(nextSnapshot.intakeStarted));
    if (
      Number.isFinite(nextSnapshot.onboardingStep) &&
      nextSnapshot.onboardingStep >= 0 &&
      nextSnapshot.onboardingStep < ONBOARDING_STEPS.length
    ) {
      setOnboardingStep(nextSnapshot.onboardingStep);
    }
    setUserProfile(createBaseUserProfile(prefilledProfile, nextSnapshot.userProfile));
    setActiveView(nextSnapshot.activeView);
    setCurrentRating(Number.isFinite(Number(nextSnapshot.currentRating)) ? Number(nextSnapshot.currentRating) : 0);
    setHasSpouse(Boolean(nextSnapshot.hasSpouse));
    setChildCount(Number(nextSnapshot.childCount ?? 0) || 0);
    setClaimType(nextSnapshot.claimType);
    setAddedClaims(Array.isArray(nextSnapshot.addedClaims) ? nextSnapshot.addedClaims : []);
    setIsMember(Boolean(nextSnapshot.isMember));
    setDiscountUnlocked(Boolean(nextSnapshot.discountUnlocked));
    setDoctorPortalIntegrations(
      Array.isArray(nextSnapshot.doctorPortalIntegrations) && nextSnapshot.doctorPortalIntegrations.length
        ? nextSnapshot.doctorPortalIntegrations
        : DOCTOR_PORTAL_INTEGRATIONS
    );
    setSecureThreads(
      Array.isArray(nextSnapshot.secureThreads) && nextSnapshot.secureThreads.length
        ? nextSnapshot.secureThreads
        : INITIAL_SECURE_THREADS
    );
    setSelectedSecureThreadId(nextSnapshot.selectedSecureThreadId || INITIAL_SECURE_THREADS[0].id);
    setDossier(Array.isArray(nextSnapshot.dossier) ? nextSnapshot.dossier : []);
    setPaymentState(normalizePaymentState(nextSnapshot.paymentState));
    setZohoLeadId(nextSnapshot.zohoLeadId);
    setZohoCrmModule(nextSnapshot.zohoCrmModule || "");
    saveZohoLeadId(nextSnapshot.zohoLeadId);

    window.setTimeout(() => {
      isApplyingRemoteStateRef.current = false;
    }, 0);
  };

  const updateStoredAccountEmail = (email) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !authAccount) return;

    const updatedAccount = {
      ...authAccount,
      email: normalizedEmail,
      updatedAt: new Date().toISOString()
    };
    saveAuthHint(updatedAccount);
  };

  const clearPasswordResetQuery = () => {
    setPasswordResetToken("");
    setPasswordResetStatus({ type: "", message: "" });
    setPasswordResetVerification({
      checking: false,
      valid: false,
      email: "",
      error: "",
      expiresAt: "",
    });

    try {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("resetToken");
      window.history.replaceState({}, "", nextUrl.toString());
    } catch (error) {
      // No-op if the current location cannot be rewritten.
    }
  };

  const handlePasswordResetRequest = async ({ email }) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      setPasswordResetStatus({
        type: "error",
        message: "Enter the email tied to your TYFYS account so we can send a reset link."
      });
      return;
    }

    setIsPasswordResetSubmitting(true);
    setPasswordResetStatus({ type: "", message: "" });

    try {
      const payload = await requestAppJson("/api/auth-password-reset-request", {
        method: "POST",
        body: { email: normalizedEmail }
      });
      setPasswordResetStatus({
        type: "success",
        message: payload.message || "If that email is in TYFYS, we sent a password reset link."
      });
      if (payload?.debugResetUrl) {
        console.info("Local password reset link:", payload.debugResetUrl);
      }
    } catch (error) {
      setPasswordResetStatus({
        type: "error",
        message: String(error?.message || error || "").slice(0, 240)
      });
    } finally {
      setIsPasswordResetSubmitting(false);
    }
  };

  const handlePasswordResetAccountVerification = async ({ email, zip, lastName, phoneLast4 }) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      setPasswordResetStatus({
        type: "error",
        message: "Enter the email tied to your TYFYS account first."
      });
      return;
    }

    setIsPasswordResetSubmitting(true);
    setPasswordResetStatus({ type: "", message: "" });

    try {
      const payload = await requestAppJson("/api/auth-password-reset-challenge", {
        method: "POST",
        body: {
          email: normalizedEmail,
          zip,
          lastName,
          phoneLast4
        }
      });
      setPasswordResetToken(payload.resetToken || "");
      setPasswordResetVerification({
        checking: false,
        valid: Boolean(payload.resetToken),
        email: payload.email || normalizedEmail,
        error: "",
        expiresAt: payload.expiresAt || ""
      });
      setPasswordResetStatus({
        type: "success",
        message: payload.message || "Account verified. Choose your new password now."
      });
    } catch (error) {
      setPasswordResetStatus({
        type: "error",
        message: String(error?.message || error || "").slice(0, 240)
      });
    } finally {
      setIsPasswordResetSubmitting(false);
    }
  };

  const handlePasswordResetComplete = async ({ token, password }) => {
    if (!token) {
      setPasswordResetStatus({
        type: "error",
        message: "This password reset link is missing or invalid."
      });
      return;
    }
    if (!password || password.length < 8) {
      setPasswordResetStatus({
        type: "error",
        message: "Create a password with at least 8 characters."
      });
      return;
    }

    setIsPasswordResetSubmitting(true);
    setPasswordResetStatus({ type: "", message: "" });

    try {
      const payload = await requestAppJson("/api/auth-password-reset-complete", {
        method: "POST",
        body: { token, password }
      });
      saveAuthHint(payload.account);
      saveAppSessionToken(payload.sessionToken || loadAppSessionToken());
      setIsAuthenticated(true);
      setAuthStatusMessage("");
      clearPasswordResetQuery();
      applyPersistedSnapshot(payload.appState, payload.account);
    } catch (error) {
      setPasswordResetStatus({
        type: "error",
        message: String(error?.message || error || "").slice(0, 240)
      });
    } finally {
      setIsPasswordResetSubmitting(false);
    }
  };

  const lookupExistingAccount = async (email) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return { exists: false };

    return requestAppJson("/api/auth-lookup", {
      method: "POST",
      body: { email: normalizedEmail }
    });
  };

  const createClientLogin = async ({ email, password, userProfile: nextUserProfile, appState }) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) return;
    setIsAuthSubmitting(true);

    try {
      const payload = await requestAppJson("/api/auth-signup", {
        method: "POST",
        body: {
          email: normalizedEmail,
          password,
          displayName: `${nextUserProfile?.firstName || ""} ${nextUserProfile?.lastName || ""}`.trim(),
          leadId: zohoLeadId,
          userProfile: nextUserProfile,
          appState: appState || createPersistedSnapshot({ userProfile: nextUserProfile })
        }
      });
      saveAuthHint(payload.account);
      saveAppSessionToken(payload.sessionToken || loadAppSessionToken());
      setIsAuthenticated(true);
      setAuthStatusMessage("");
      applyPersistedSnapshot(payload.appState, payload.account);
      return payload;
    } catch (error) {
      const errorMessage = String(error?.message || error || "");
      if (/already exists|existing tyfys login/i.test(errorMessage)) {
        try {
          const loginPayload = await requestAppJson("/api/auth-login", {
            method: "POST",
            body: { email: normalizedEmail, password }
          });
          saveAuthHint(loginPayload.account);
          saveAppSessionToken(loginPayload.sessionToken || loadAppSessionToken());
          setIsAuthenticated(true);
          setAuthStatusMessage("");
          applyPersistedSnapshot(loginPayload.appState, loginPayload.account);
          return loginPayload;
        } catch (loginError) {
          // If login fails (wrong password), default back to the account exists message
        }
      }
      setAuthStatusMessage(errorMessage.slice(0, 240));
      throw error;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleClientLogin = async ({ email, password }) => {
    setIsAuthSubmitting(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail || !password) {
        setAuthStatusMessage("Enter the email and password you created during onboarding.");
        return;
      }
      const payload = await requestAppJson("/api/auth-login", {
        method: "POST",
        body: { email: normalizedEmail, password }
      });
      saveAuthHint(payload.account);
      saveAppSessionToken(payload.sessionToken || loadAppSessionToken());
      setIsAuthenticated(true);
      setAuthStatusMessage("");
      applyPersistedSnapshot(payload.appState, payload.account);
    } catch (error) {
      setAuthStatusMessage(String(error?.message || error || "").slice(0, 240));
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleGoogleLogin = async ({ credential }) => {
    const googleCredential = String(credential || "").trim();
    if (!googleCredential) {
      setAuthStatusMessage("Google sign-in did not return a valid login token. Please try again.");
      return;
    }

    setIsAuthSubmitting(true);
    setAuthStatusMessage("");

    try {
      const snapshot = createPersistedSnapshot({
        hasStarted: true,
        userProfile: sanitizeUserProfile({
          ...userProfile,
          email: userProfile.email || authAccount?.email || leadPrefillEmail || ""
        })
      });
      const payload = await requestAppJson("/api/auth-google", {
        method: "POST",
        body: {
          credential: googleCredential,
          leadId: zohoLeadId,
          displayName: `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim(),
          userProfile: snapshot.userProfile,
          appState: snapshot
        }
      });
      saveAuthHint(payload.account);
      saveAppSessionToken(payload.sessionToken || loadAppSessionToken());
      setIsAuthenticated(true);
      setHasStarted(true);
      saveHasStarted();
      setAuthStatusMessage("");
      clearPasswordResetQuery();
      applyPersistedSnapshot(payload.appState, payload.account);
    } catch (error) {
      setAuthStatusMessage(String(error?.message || error || "").slice(0, 240));
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleClientLogout = async () => {
    try {
      await requestAppJson("/api/auth-logout", { method: "POST" });
    } catch (error) {
      console.warn("Logout request failed:", error);
    }
    saveAppSessionToken("");
    setIsAuthenticated(false);
    setIsSidebarOpen(false);
    setAuthStatusMessage("You signed out. Log back in on this device to continue where you left off.");
  };

  useEffect(() => {
    let canceled = false;

    requestAppJson("/api/auth-google-config")
      .then((payload) => {
        if (canceled) return;
        setGoogleAuthConfig({
          loading: false,
          enabled: Boolean(payload?.enabled && payload?.clientId),
          clientId: payload?.clientId || "",
          error: ""
        });
      })
      .catch((error) => {
        if (canceled) return;
        setGoogleAuthConfig({
          loading: false,
          enabled: false,
          clientId: "",
          error: String(error?.message || error || "").slice(0, 240)
        });
      });

    return () => {
      canceled = true;
    };
  }, []);

  const hasAutoSavedRef = useRef(false);
  useEffect(() => {
    if (!initialAutostart || hasAutoSavedRef.current) return;
    hasAutoSavedRef.current = true;
    if (!loadHasStarted()) saveHasStarted();
  }, [initialAutostart]);

  useEffect(() => {
    if (!nativeAppRuntime) return undefined;

    const statusBar = getCapacitorPlugin("StatusBar");
    const keyboard = getCapacitorPlugin("Keyboard");

    Promise.resolve().then(async () => {
      try {
        await statusBar?.setStyle?.({ style: "DARK" });
      } catch (error) {
        // No-op when the native bridge does not expose this method.
      }
      try {
        await statusBar?.setBackgroundColor?.({ color: "#f8fafc" });
      } catch (error) {
        // No-op when unsupported on the platform.
      }
      try {
        await statusBar?.show?.();
      } catch (error) {
        // No-op when unsupported on the platform.
      }
      try {
        await keyboard?.setResizeMode?.({ mode: "body" });
      } catch (error) {
        // No-op when unsupported on the platform.
      }
    });

    return undefined;
  }, [nativeAppRuntime]);

  useEffect(() => {
    if (!nativeAppRuntime) return undefined;
    const appPlugin = getCapacitorPlugin("App");
    if (!appPlugin?.addListener) return undefined;

    let listenerHandle = null;
    let disposed = false;

    Promise.resolve(appPlugin.addListener("backButton", () => {
      if (showProfileEdit) {
        setShowProfileEdit(false);
        return;
      }
      if (showSpecialistModal) {
        setShowSpecialistModal(false);
        return;
      }
      if (isBotOpen) {
        setIsBotOpen(false);
        return;
      }
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        return;
      }
      if (activeView !== "welcome_guide") {
        setActiveView("welcome_guide");
        return;
      }
      appPlugin.minimizeApp?.();
    })).then((handle) => {
      if (disposed) {
        handle?.remove?.();
        return;
      }
      listenerHandle = handle;
    });

    return () => {
      disposed = true;
      listenerHandle?.remove?.();
    };
  }, [activeView, isBotOpen, isSidebarOpen, nativeAppRuntime, showProfileEdit, showSpecialistModal]);

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [activeView]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  useEffect(() => {
    secureChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [secureThreads, selectedSecureThreadId]);
  useEffect(() => {
    const rule = getConditionRule(selectedCondition);
    if (!rule) {
      setSelectedRatingProfileId("");
      setNewRatingInput("");
      return;
    }
    if (rule.mode === "simple") {
      setSelectedRatingProfileId("");
      setNewRatingInput((prev) =>
        prev !== "" && rule.options.some((option) => option.value === Number(prev))
          ? prev
          : getDefaultConditionRating(selectedCondition)
      );
      return;
    }
    if (rule.mode === "measurement_required") {
      setSelectedRatingProfileId("");
      setNewRatingInput("");
      return;
    }
    setNewRatingInput("");
  }, [selectedCondition]);
  useEffect(() => {
    if (!selectedConditionRule || selectedConditionRule.mode !== "profiles") return;
    if (!selectedRatingProfileId) {
      setNewRatingInput("");
      return;
    }
    const defaultRating = getDefaultConditionRating(selectedCondition, selectedRatingProfileId);
    setNewRatingInput((prev) =>
      prev !== "" && selectedRatingOptions.some((option) => option.value === Number(prev)) ? prev : defaultRating
    );
  }, [selectedCondition, selectedConditionRule, selectedRatingOptions, selectedRatingProfileId]);
  useEffect(() => {
    savePaymentState(paymentState);
  }, [paymentState]);
  useEffect(() => {
    saveDossier(dossier);
  }, [dossier]);
  useEffect(() => {
    if (activeView === "intake_portal" && !intakeStarted) {
      setIntakeStarted(true);
    }
  }, [activeView, intakeStarted]);
  useEffect(() => {
    if (!onboardingComplete || intakeStarted || dossier.length > 0) return;
    setActiveView("intake_portal");
    setIntakeStarted(true);
  }, [dossier.length, intakeStarted, onboardingComplete]);
  useEffect(() => {
    if (activeView !== "intake_portal" || isZapierEmbedReady) return;
    let canceled = false;

    loadCustomElementScript(ZAPIER_CHATBOT_SCRIPT_URL, ZAPIER_CHATBOT_ELEMENT_TAG)
      .then(() => {
        if (canceled) return;
        setIsZapierEmbedReady(true);
        setZapierEmbedError("");
      })
      .catch((error) => {
        if (canceled) return;
        setZapierEmbedError(String(error?.message || error || "").slice(0, 240));
      });

    return () => {
      canceled = true;
    };
  }, [activeView, isZapierEmbedReady]);
  useEffect(() => {
    if (!hasStarted && (isAuthenticated || onboardingComplete)) {
      setHasStarted(true);
      saveHasStarted();
    }
  }, [hasStarted, isAuthenticated, onboardingComplete]);
  useEffect(() => {
    savePersistedAppState(buildAppStateSnapshot());
  }, [
    activeView,
    addedClaims,
    childCount,
    claimType,
    currentRating,
    dossier,
    discountUnlocked,
    doctorPortalIntegrations,
    hasSpouse,
    hasStarted,
    intakeStarted,
    isMember,
    onboardingComplete,
    onboardingStep,
    paymentState,
    secureThreads,
    selectedSecureThreadId,
    userProfile,
    zohoCrmModule,
    zohoLeadId
  ]);
  useEffect(() => {
    let canceled = false;

    const bootstrapAuth = async () => {
      try {
        const payload = await requestAppJson("/api/auth-session");
        if (canceled) return;
        if (payload.authenticated) {
          saveAuthHint(payload.account);
          setIsAuthenticated(true);
          setAuthStatusMessage("");
          applyPersistedSnapshot(payload.appState, payload.account);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.warn("Auth bootstrap skipped:", error);
        if (!canceled) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!canceled) {
          setIsAuthBootstrapping(false);
        }
      }
    };

    bootstrapAuth();
    return () => {
      canceled = true;
    };
  }, []);
  useEffect(() => {
    if (!passwordResetToken) {
      setPasswordResetVerification({
        checking: false,
        valid: false,
        email: "",
        error: "",
        expiresAt: "",
      });
      return undefined;
    }

    let canceled = false;
    setPasswordResetVerification({
      checking: true,
      valid: false,
      email: "",
      error: "",
      expiresAt: "",
    });

    requestAppJson("/api/auth-password-reset-verify", {
      method: "POST",
      body: { token: passwordResetToken }
    })
      .then((payload) => {
        if (canceled) return;
        setPasswordResetVerification({
          checking: false,
          valid: true,
          email: payload.email || "",
          error: "",
          expiresAt: payload.expiresAt || "",
        });
      })
      .catch((error) => {
        if (canceled) return;
        setPasswordResetVerification({
          checking: false,
          valid: false,
          email: "",
          error: String(error?.message || error || "").slice(0, 240),
          expiresAt: "",
        });
      });

    return () => {
      canceled = true;
    };
  }, [passwordResetToken]);
  useEffect(() => {
    if (isAuthBootstrapping) return undefined;

    if (!hasLeadPrefill || !leadPrefillEmail || onboardingComplete || isAuthenticated) {
      setHasLeadPrefillAccount(false);
      setIsLeadPrefillAccountLookupPending(false);
      return undefined;
    }

    if (authAccount?.email && normalizeEmail(authAccount.email) === leadPrefillEmail) {
      setHasLeadPrefillAccount(true);
      setIsLeadPrefillAccountLookupPending(false);
      setHasStarted(false);
      clearHasStarted();
      return undefined;
    }

    let canceled = false;
    setIsLeadPrefillAccountLookupPending(true);

    lookupExistingAccount(leadPrefillEmail)
      .then((payload) => {
        if (canceled) return;
        const exists = Boolean(payload?.exists);
        setHasLeadPrefillAccount(exists);

        if (exists) {
          setAuthStatusMessage(
            "We found an existing TYFYS login for this email. Sign in to continue instead of creating a duplicate profile."
          );
          setHasStarted(false);
          clearHasStarted();
          return;
        }

        if (!hasStarted) {
          setHasStarted(true);
          saveHasStarted();
        }
      })
      .catch((error) => {
        if (canceled) return;
        console.warn("Lead account lookup skipped:", error);
        setHasLeadPrefillAccount(false);
        if (!hasStarted) {
          setHasStarted(true);
          saveHasStarted();
        }
      })
      .finally(() => {
        if (!canceled) {
          setIsLeadPrefillAccountLookupPending(false);
        }
      });

    return () => {
      canceled = true;
    };
  }, [
    authAccount?.email,
    hasLeadPrefill,
    hasStarted,
    isAuthenticated,
    isAuthBootstrapping,
    leadPrefillEmail,
    onboardingComplete
  ]);
  useEffect(() => {
    if (!isAuthenticated || isAuthBootstrapping || isApplyingRemoteStateRef.current) return;

    const timeoutId = window.setTimeout(async () => {
      try {
        const snapshot = createPersistedSnapshot();
        const payload = await requestAppJson("/api/auth-state", {
          method: "POST",
          body: {
            appState: snapshot,
            displayName: `${snapshot.userProfile?.firstName || ""} ${snapshot.userProfile?.lastName || ""}`.trim(),
            email: snapshot.userProfile?.email || authAccount?.email || "",
            leadId: snapshot.zohoLeadId || authAccount?.leadId || ""
          }
        });
        if (payload.account) {
          saveAuthHint(payload.account);
        }
      } catch (error) {
        console.warn("Remote auth state sync skipped:", error);
        if (/authentication required/i.test(String(error?.message || ""))) {
          setIsAuthenticated(false);
        }
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeView,
    addedClaims,
    authAccount?.email,
    authAccount?.leadId,
    childCount,
    claimType,
    currentRating,
    dossier,
    discountUnlocked,
    doctorPortalIntegrations,
    hasSpouse,
    hasStarted,
    intakeStarted,
    isAuthBootstrapping,
    isAuthenticated,
    isMember,
    onboardingComplete,
    onboardingStep,
    paymentState,
    secureThreads,
    selectedSecureThreadId,
    userProfile,
    zohoCrmModule,
    zohoLeadId
  ]);
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
      const response = await fetch(
        resolveApiUrl("/api/zoho-signup"),
        createApiRequestInit({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: zohoLeadId || undefined,
            leadSource: nativeAppRuntime ? "TYFYS Mobile App" : "TYFYS App",
            profile
          })
        })
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Zoho signup sync failed");
      }

      if (payload?.leadId) {
        setZohoLeadId(payload.leadId);
        saveZohoLeadId(payload.leadId);
      }
      if (payload?.crmModule) {
        setZohoCrmModule(payload.crmModule);
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
      const response = await fetch(
        resolveApiUrl(`/api/zoho-profile?${query.toString()}`),
        createApiRequestInit()
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok || !payload?.found || !payload?.profile) return null;

      if (payload?.leadId) {
        setZohoLeadId(payload.leadId);
        saveZohoLeadId(payload.leadId);
      }
      if (payload?.crmModule) {
        setZohoCrmModule(payload.crmModule);
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
  const startGuidedTour = () => {
    setIsBotOpen(true);
    addMessage(
      "bot",
      "Let's start on Claim Home. Use the pencil icon to confirm your branch, service era, and current rating so the rest of the app matches your situation."
    );
    setTimeout(() => {
      addMessage(
        "bot",
        "Next, open the VA Rating Calculator to add the conditions you want to review. After that, go to Records Intake to upload your DD-214, service records, and VA decisions."
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

  const handleContactSubmit = async (contactData) => {
    const { appPassword, confirmPassword, ...profileData } = contactData || {};
    const mergedProfile = sanitizeUserProfile({ ...userProfile, ...profileData });
    setUserProfile(mergedProfile);

    if (ONBOARDING_STEPS[onboardingStep]?.type === "contact_form_part3" && mergedProfile.email && appPassword) {
      setIsAuthSubmitting(true);
      try {
        await createClientLogin({
          email: mergedProfile.email,
          password: appPassword,
          userProfile: mergedProfile,
          appState: createPersistedSnapshot({ userProfile: mergedProfile })
        });
      } catch (error) {
        if (/already exists/i.test(String(error?.message || ""))) {
          setAuthStatusMessage(
            "We found an existing TYFYS login for this email. Sign in to continue instead of creating a duplicate account."
          );
          returnToAccessLanding();
        } else {
          setAuthStatusMessage(
            error?.message || "An error occurred while creating your account. Please try again."
          );
        }
        setIsAuthSubmitting(false);
        return;
      }
      setIsAuthSubmitting(false);
    }

    void syncZohoSignup(mergedProfile);
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
          if (condition) newClaims.push(buildSuggestedClaim(condition.name));
        });
      });
      setAddedClaims((prev) => {
        const merged = [...prev];
        newClaims.forEach((claim) => {
          if (!merged.some((existing) => getClaimIdentityKey(existing) === getClaimIdentityKey(claim))) {
            merged.push(claim);
          }
        });
        return merged;
      });
    }
    if (!botMemory.current.hasWelcomed) {
      // Updated welcome message
      setTimeout(
        () =>
          addMessage(
            "bot",
            `Your account is ready, ${userProfile.firstName || userProfile.branch || "Veteran"}. Start in Records Intake to upload your key records, then use Claim Home to track the rest of your next steps.`
          ),
        500
      );
      botMemory.current.hasWelcomed = true;
    }
  };

  const handleProfileSave = (newData) => {
    const mergedProfile = sanitizeUserProfile({ ...userProfile, ...newData });
    setUserProfile(mergedProfile);
    if (mergedProfile.email) {
      updateStoredAccountEmail(mergedProfile.email);
    }
    void syncZohoSignup(mergedProfile);
    setShowProfileEdit(false);
    setIsBotOpen(true);
    addMessage("bot", "Your profile is updated. If anything changes later, you can edit it again from Claim Home.");
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
      `Payment confirmed for ${planName}. I opened Records Intake so you can keep moving on your file right away.`
    );
  };

  const startSecureCheckout = async ({ planName, planCode, unlockPremium = false }) => {
    if (!planCode) {
      setShowSpecialistModal(true);
      setIsBotOpen(true);
      addMessage(
        "bot",
        `This ${planName} checkout is handled by a TYFYS specialist. Use "Book Discovery Call" and we will finish enrollment with you directly.`
      );
      return;
    }

    if (!hasLiveAppApi()) {
      setShowSpecialistModal(true);
      setIsBotOpen(true);
      addMessage(
        "bot",
        "Online checkout is not enabled on this site version yet. Use \"Book Discovery Call\" and we will finish enrollment with you directly."
      );
      return;
    }

    if (nativeAppRuntime) {
      setShowSpecialistModal(true);
      setIsBotOpen(true);
      addMessage(
        "bot",
        "Plan activation is handled by the TYFYS team in the mobile app. Use \"Book Discovery Call\" and we will finish enrollment with you directly."
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
      const response = await fetch(
        resolveApiUrl("/api/checkout"),
        createApiRequestInit({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: checkoutLeadId,
            plan: planCode,
            profile: userProfile,
            displayName: `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim(),
            email: authAccount?.email || userProfile.email || ""
          })
        })
      );

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Unable to start checkout");
      }

      if (payload?.leadId) {
        setZohoLeadId(payload.leadId);
        saveZohoLeadId(payload.leadId);
        saveCheckoutPending({
          planName,
          planCode,
          unlockPremium,
          leadId: payload.leadId,
          requestedAt: new Date().toISOString()
        });
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
      if (text.includes("nexus"))
        addMessage(
          "bot",
          "A nexus letter is a medical opinion that explains why a condition is connected to your service. If you already have records in your account, the Medical Opinion Draft tool can help you organize the facts a doctor would need."
        );
      else if (text.includes("cost") || text.includes("price"))
        addMessage(
          "bot",
          "TYFYS membership is $250 per month. Full-service packages start at $3,500 for up to three claims and $5,500 for larger multi-claim support. We can also talk through payment plans."
        );
      else
        addMessage(
          "bot",
          "I can help you decide where to go next. Try Records Intake to upload files, VA Rating Calculator to model percentages, or Evidence Checklist to see which documents matter for a condition."
        );
      setIsTyping(false);
    }, 1000);
  };

  const handleAiBotSend = (e) => {
    e.preventDefault();
    if (!aiBotInput.trim()) return;
    if (!isMember && dailyQuestionCount >= 3) {
      setAiBotMessages((prev) => [
        ...prev,
        { sender: "user", text: aiBotInput },
        {
          sender: "bot",
          text: "You have used today's free questions. Open Support Options if you want unlimited guided help from Angela."
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
      let response =
        "I can help you organize the next step. Good records and clear facts usually make the rest of the claim process easier to follow.";
      if (query.toLowerCase().includes("ptsd"))
        response =
          "For a PTSD claim, VA usually looks for three things: a current diagnosis, a specific in-service stressor, and a medical link between the two. Records Intake, your statement, and the Medical Opinion Draft can help you organize those pieces.";
      else if (query.toLowerCase().includes("back"))
        response =
          "For back claims, VA usually focuses on range of motion, flare-ups, and how the condition affects work and daily life. Upload imaging and treatment notes first, then use the VA Rating Calculator to model the likely range.";
      else if (query.toLowerCase().includes("tinnitus"))
        response =
          "Tinnitus is usually capped at 10%, but it can still matter because it may connect to other issues like sleep problems, headaches, or hearing loss. Use Evidence Checklist to see which records usually help.";
      setAiBotMessages((prev) => [...prev, { sender: "bot", text: response }]);
    }, 1000);
  };

  const addClaim = () => {
    if (!selectedCategory || !selectedCondition) return;
    if (selectedConditionRule?.mode === "measurement_required") {
      setCalculatorNotice({ type: "warning", text: selectedConditionRule.lockedMessage });
      return;
    }
    if (selectedConditionNeedsProfile) {
      setCalculatorNotice({ type: "warning", text: "Select the exact VA rating basis before adding this condition." });
      return;
    }
    if (!hasSelectedRatingOption) {
      setCalculatorNotice({ type: "warning", text: "Pick a supported rating from the official VA schedule first." });
      return;
    }

    const selectedRatingValue = Number(newRatingInput);
    const selectedRatingOption = selectedRatingOptions.find((option) => option.value === selectedRatingValue);
    if (!selectedRatingContext || !selectedRatingOption) {
      setCalculatorNotice({ type: "warning", text: "Pick a supported rating from the official VA schedule first." });
      return;
    }

    const claimsForConflict =
      editingClaimIndex === null ? addedClaims : addedClaims.filter((_, idx) => idx !== editingClaimIndex);
    const claimConflict = getClaimConflict(claimsForConflict, selectedCondition, selectedRatingProfileId);
    if (claimConflict) {
      setCalculatorNotice({ type: "warning", text: claimConflict.message });
      return;
    }

    const conditionData = DISABILITY_DATA[selectedCategory].find((c) => c.name === selectedCondition);
    const nextClaim = {
      name: selectedCondition,
      rating: selectedRatingValue,
      dbq: conditionData.dbq,
      specialist: conditionData.specialist,
      type: claimType,
      diagnosticCode: selectedRatingContext.diagnosticCode || selectedConditionRule?.diagnosticCode || "",
      ratingRuleTitle: selectedConditionRule?.ruleTitle || "",
      ratingProfileId: selectedConditionRule?.mode === "profiles" ? selectedRatingProfileId : "",
      ratingProfileLabel: selectedConditionRule?.mode === "profiles" ? selectedRatingContext.label : "",
      sourceUrl: selectedRatingContext.sourceUrl || selectedConditionRule?.sourceUrl || "",
      sourceLabel: selectedConditionRule?.sourceLabel || "",
      ratingSummary: selectedRatingOption.summary,
      pendingFacts: false
    };

    setAddedClaims((prevClaims) => {
      if (editingClaimIndex !== null) {
        const updated = [...prevClaims];
        updated[editingClaimIndex] = nextClaim;
        return updated;
      }

      const pendingIndex = prevClaims.findIndex(
        (claim) =>
          getClaimIdentityKey(claim) === getClaimIdentityKey(nextClaim) && !isClaimRatingSelected(claim.rating)
      );

      if (pendingIndex >= 0) {
        const updated = [...prevClaims];
        updated[pendingIndex] = nextClaim;
        return updated;
      }

      return [...prevClaims, nextClaim];
    });
    setCalculatorNotice({
      type: "success",
      text: `${selectedCondition} ${editingClaimIndex !== null ? "updated" : "added"} using ${selectedRatingContext.diagnosticCode ? `DC ${selectedRatingContext.diagnosticCode}` : "the selected VA schedule"}.`
    });
    setSelectedCondition("");
    setSelectedRatingProfileId("");
    setEditingClaimIndex(null);
  };
  const removeClaim = (idx) => {
    const newClaims = [...addedClaims];
    newClaims.splice(idx, 1);
    setAddedClaims(newClaims);
    setEditingClaimIndex(null);
  };

  const applyIntakeRequirementPreset = (requirement) => {
    if (!requirement) return;
    setScannerForm((prev) => ({
      ...prev,
      title: requirement.defaultTitle,
      type: requirement.type,
      source: requirement.source
    }));
    window.setTimeout(() => {
      scannerFileInputRef.current?.click();
    }, 0);
  };

  const syncDossierUploadToZoho = async (item, file) => {
    if (!file) {
      return { skipped: true, reason: "Attach a document before sending it to your TYFYS file." };
    }

    if (!hasLiveAppApi()) {
      return { skipped: true, reason: "File delivery is available on the live TYFYS app." };
    }

    const lookupEmail = userProfile.email || authAccount?.email || "";
    const lookupPhone = userProfile.phone || "";
    if (!zohoLeadId && !lookupEmail && !lookupPhone) {
      return { skipped: true, reason: "Finish saving the account before sending records to your TYFYS file." };
    }

    const formData = new FormData();
    formData.set("file", file, file.name);
    formData.set("leadId", zohoLeadId || "");
    formData.set("crmModule", zohoCrmModule || "");
    formData.set("email", lookupEmail);
    formData.set("phone", lookupPhone);
    formData.set("title", item.title || "");
    formData.set("type", item.type || "");
    formData.set("condition", item.condition || "");
    formData.set("notes", item.notes || "");

    const response = await fetch(
      resolveApiUrl("/api/zoho-upload-record"),
      createApiRequestInit({
        method: "POST",
        body: formData
      })
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || "Unable to send this record to your TYFYS file.");
    }

    if (payload?.recordId) {
      setZohoLeadId(payload.recordId);
      saveZohoLeadId(payload.recordId);
    }
    if (payload?.crmModule) {
      setZohoCrmModule(payload.crmModule);
    }

    return payload;
  };

  const handleScannerChange = (field, value) => {
    setScannerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleScannerFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isImageFile(file) && !isPdfFile(file)) {
      setScanError("Upload a PDF or image file to run a real scan.");
      setScannerFile(null);
      setScannerForm((prev) => ({ ...prev, fileName: "", fileSize: 0 }));
      event.target.value = "";
      return;
    }
    setScanError("");
    setScannerFile(file);
    setScannerForm((prev) => {
      const previousAutoTitle = prev.fileName ? prev.fileName.replace(/\.[^/.]+$/, "") : "";
      const nextAutoTitle = file.name.replace(/\.[^/.]+$/, "");
      const shouldReplaceTitle = !prev.title || prev.title === previousAutoTitle;
      return {
        ...prev,
        title: shouldReplaceTitle ? nextAutoTitle : prev.title,
        fileName: file.name,
        fileSize: file.size
      };
    });
  };

  const handleStartScan = async () => {
    if (isScanning) return;
    if (!scannerFile) {
      setScanError("Attach an image or PDF before starting the scan.");
      return;
    }

    scanPayloadRef.current = {
      ...scannerForm,
      title: scannerForm.title.trim() || scannerForm.fileName || `${scannerForm.type} capture`,
      condition: scannerForm.condition || addedClaims[0]?.name || "",
      fileName: scannerFile.name,
      fileSize: scannerFile.size
    };

    setLastScanResult(null);
    setScanError("");
    setRecordSyncNotice(null);
    setIsScanning(true);
    setScanProgress(0);
    setScanStageLabel(SCAN_STAGES[0]);

    try {
      const scanResult = await scanDocumentFile(
        scannerFile,
        (stage) => setScanStageLabel(stage || SCAN_STAGES[2]),
        (progress) => setScanProgress(Math.max(0, Math.min(1, progress)))
      );

      setScanStageLabel(SCAN_STAGES[3]);
      setScanProgress(0.97);
      const savedItem = createDossierEntry(scanPayloadRef.current || {}, scanResult);
      setDossier((prevItems) => [savedItem, ...prevItems]);
      setLastScanResult(savedItem);

      try {
        setScanStageLabel("Sending to your TYFYS file");
        const syncPayload = await syncDossierUploadToZoho(savedItem, scannerFile);

        if (syncPayload?.skipped) {
          setRecordSyncNotice({ type: "warning", text: syncPayload.reason });
          setScanStageLabel("Saved locally");
        } else {
          const syncedItem = {
            ...savedItem,
            crmSync: {
              status: "synced",
              syncedAt: new Date().toISOString(),
              crmModule: syncPayload.crmModule || zohoCrmModule || "Contacts",
              recordId: syncPayload.recordId || zohoLeadId || "",
              attachmentId: syncPayload.attachmentId || "",
              fileName: syncPayload.fileName || savedItem.fileName
            }
          };
          setDossier((prevItems) => prevItems.map((item) => (item.id === savedItem.id ? syncedItem : item)));
          setLastScanResult(syncedItem);
          setRecordSyncNotice({
            type: "success",
            text: `${syncedItem.title} was added to your TYFYS file.`
          });
          setScanStageLabel("Upload complete");
        }
      } catch (syncError) {
        const failedItem = {
          ...savedItem,
          crmSync: {
            status: "failed",
            syncedAt: new Date().toISOString(),
            error: String(syncError?.message || syncError || "").slice(0, 240)
          }
        };
        setDossier((prevItems) => prevItems.map((item) => (item.id === savedItem.id ? failedItem : item)));
        setLastScanResult(failedItem);
        setRecordSyncNotice({
          type: "error",
          text: failedItem.crmSync.error || "The file was saved on this device, but we could not send it to your TYFYS file yet."
        });
        setScanStageLabel("Saved on this device");
      }

      setScanProgress(1);
    } catch (error) {
      console.error("Document scan failed:", error);
      setScanProgress(0);
      setScanStageLabel("Scan failed");
      setScanError(error?.message || "Unable to scan the selected file.");
    } finally {
      setIsScanning(false);
    }
  };

  const removeDossierItem = (id) => {
    setDossier((prev) => prev.filter((item) => item.id !== id));
  };

  const exportDossier = () => {
    const exportText = JSON.stringify(dossier, null, 2);
    if (nativeAppRuntime) {
      void shareTextPayload({
        title: "TYFYS Records Vault Export",
        text: exportText,
        dialogTitle: "Share Records Vault Export"
      }).catch((error) => {
        console.warn("Native dossier share failed:", error);
      });
      return;
    }

    const blob = new Blob([exportText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `tyfys-dossier-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openSecureThread = (threadId) => {
    if (!threadId) return;
    setSelectedSecureThreadId(threadId);
    setActiveView("secure_comms");
  };

  const handleDoctorPortalIntegrationRequest = (integrationId) => {
    setDoctorPortalIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? {
              ...integration,
              requestedAt: integration.requestedAt ? "" : new Date().toISOString()
            }
          : integration
      )
    );
  };

  const handleSecureMessageSend = (event) => {
    event.preventDefault();
    const text = secureMessageInput.trim();
    const threadId = selectedSecureThreadId;
    if (!text || !threadId) return;

    const sentAt = formatMessageTime();
    const outgoingMessage = {
      id: createLocalId("secure-msg"),
      sender: "You",
      time: sentAt,
      text,
      isCurrentUser: true
    };

    setSecureThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              messages: [...thread.messages, outgoingMessage],
              lastMessage: text,
              lastTimestamp: sentAt,
              unread: 0
            }
          : thread
      )
    );
    setSecureMessageInput("");

    const autoReply = SECURE_THREAD_AUTO_REPLIES[threadId];
    if (!autoReply) return;

    window.setTimeout(() => {
      const replyAt = formatMessageTime();
      setSecureThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                messages: [
                  ...thread.messages,
                  {
                    id: createLocalId("secure-reply"),
                    sender: thread.autoReplySender,
                    time: replyAt,
                    text: autoReply,
                    isCurrentUser: false
                  }
                ],
                lastMessage: autoReply,
                lastTimestamp: replyAt,
                unread: 0
              }
            : thread
        )
      );
    }, 900);
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
  const selectedSecureThread = secureThreads.find((thread) => thread.id === selectedSecureThreadId) || secureThreads[0] || null;
  const secureUnreadCount = secureThreads.reduce((total, thread) => total + Number(thread.unread || 0), 0);
  const nextDoctorVisit = DOCTOR_PORTAL_VISITS[0] || null;
  const assignedDoctorCount = DOCTOR_PORTAL_TEAM.filter((member) => member.tag === "Assigned Doctor").length;
  const requestedIntegrationCount = doctorPortalIntegrations.filter((integration) => integration.requestedAt).length;
  const matchingNexusDocs = dossier.filter(
    (item) =>
      !nexusForm.condition ||
      item.condition === nexusForm.condition ||
      item.type === "Service Record" ||
      item.type === "Lay Statement"
  );
  const activeScanStage = isScanning ? scanStageLabel : "Idle";
  const headerMeta =
    {
      welcome_guide: {
        eyebrow: "Start here",
        title: "Claim Home",
        subtitle: "Review your profile, records, ratings, and next steps in one place."
      },
      doctor_portal: {
        eyebrow: "Care team",
        title: "Care Team",
        subtitle: "See your TYFYS contacts, provider appointments, and who owns each next step."
      },
      secure_comms: {
        eyebrow: "Messages",
        title: "Messages",
        subtitle: "Send questions and updates to TYFYS and your assigned providers in one secure inbox."
      },
      dossier: {
        eyebrow: "Records",
        title: "Records Vault",
        subtitle: "Upload records, read scanned text, and keep your claim evidence organized on this device."
      },
      calculator: {
        eyebrow: "VA ratings",
        title: "VA Rating Calculator",
        subtitle: "Model combined ratings, rounding, and compensation impact."
      },
      pact_explorer: {
        eyebrow: "PACT Act",
        title: "PACT Act Guide",
        subtitle: "Check exposure-based presumptive conditions using official VA sources."
      },
      nexus_generator: {
        eyebrow: "Medical opinion",
        title: "Medical Opinion Draft",
        subtitle: "Organize the facts a doctor would need for a nexus or medical opinion letter."
      },
      doc_wizard: {
        eyebrow: "Evidence checklist",
        title: "Evidence Checklist",
        subtitle: "See the forms, records, and supporting documents tied to a condition."
      },
      strategy: {
        eyebrow: "Support options",
        title: "Support Options",
        subtitle: "Compare TYFYS membership and full-service claim support."
      },
      intake_portal: {
        eyebrow: "Records intake",
        title: "Military Records Intake",
        subtitle: "Upload your service and VA records so TYFYS can review the right file first."
      },
      ai_claims: {
        eyebrow: "Guided support",
        title: "Claim Guide",
        subtitle: "Ask Angela where to start, what records matter, and what tool to use next."
      }
    }[activeView] || {
      eyebrow: "TYFYS App",
      title: "Claim Home",
      subtitle: "Keep your records, ratings, and support team aligned."
    };

  // Auto-advance logic for loading screen
  useEffect(() => {
    if (!onboardingComplete && ONBOARDING_STEPS[onboardingStep] && ONBOARDING_STEPS[onboardingStep].type === "loading") {
      const timer = setTimeout(() => completeOnboarding(), 2000);
      return () => clearTimeout(timer);
    }
  }, [onboardingComplete, onboardingStep, completeOnboarding]);

  useEffect(() => {
    document.body.classList.toggle("onboarding-active", !onboardingComplete || showAccessLanding);
    return () => {
      document.body.classList.remove("onboarding-active");
    };
  }, [onboardingComplete, showAccessLanding]);

  useEffect(() => {
    if (onboardingComplete) return;

    const scrollContainer = onboardingScrollRef.current;
    if (!scrollContainer) return;

    const frameId = window.requestAnimationFrame(() => {
      scrollContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [onboardingComplete, onboardingStep]);

  useEffect(() => {
    if (!selectedSecureThreadId) return;
    setSecureThreads((prev) => {
      const activeThread = prev.find((thread) => thread.id === selectedSecureThreadId);
      if (!activeThread || !activeThread.unread) return prev;
      return prev.map((thread) => (thread.id === selectedSecureThreadId ? { ...thread, unread: 0 } : thread));
    });
  }, [selectedSecureThreadId]);

  // --- RENDERING ---
  if (isAccessBootstrapping) {
    return (
      <div className="fixed inset-0 z-[90] bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl">
            <Icons.ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="mt-5 text-2xl font-black">Loading your TYFYS account</h1>
          <p className="mt-3 text-sm text-slate-300">Checking your saved sign-in and restoring your progress.</p>
        </div>
      </div>
    );
  }

  if (showAccessLanding) {
    return (
      <AccessLanding
        hasSavedAccount={Boolean(authAccount) || onboardingComplete}
        hasKnownAccount={hasKnownAccount}
        accountEmail={authAccount?.email || userProfile.email || leadPrefillEmail || ""}
        displayName={
          authAccount?.displayName ||
          `${userProfile.firstName || prefilledProfile.firstName || ""} ${userProfile.lastName || prefilledProfile.lastName || ""}`.trim()
        }
        onboardingComplete={onboardingComplete}
        loginMessage={authStatusMessage}
        isSubmitting={isAuthSubmitting}
        resetToken={passwordResetToken}
        resetStatus={passwordResetStatus}
        resetVerification={passwordResetVerification}
        isResetSubmitting={isPasswordResetSubmitting}
        googleAuth={googleAuthConfig}
        onLogin={handleClientLogin}
        onGoogleLogin={handleGoogleLogin}
        onRequestPasswordReset={handlePasswordResetRequest}
        onVerifyPasswordResetAccount={handlePasswordResetAccountVerification}
        onCompletePasswordReset={handlePasswordResetComplete}
        onClearPasswordReset={clearPasswordResetQuery}
        onCreateAccount={() => {
          setAuthStatusMessage("");
          clearPasswordResetQuery();
          startSystem();
        }}
      />
    );
  }

  return (
    <div className="flex min-h-[100dvh] md:h-screen bg-slate-50 font-sans overflow-x-hidden md:overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* NEW ONBOARDING MODAL */}
      {!onboardingComplete && (
        <div className="fixed inset-0 z-[60] bg-slate-900/95 flex flex-col items-stretch sm:items-center justify-end md:justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-none sm:rounded-3xl shadow-2xl overflow-hidden relative border-0 sm:border border-slate-200 min-h-[100dvh] sm:min-h-0 max-h-[100dvh] sm:max-h-[calc(100dvh-1rem)] flex flex-col my-0 sm:my-2">
            {/* Header */}
            <div className="p-4 sm:p-6 bg-slate-900 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded flex items-center justify-center text-slate-900 font-black text-lg shadow-md">
                    TY
                  </div>
                  <div>
                    <span className="font-bold text-white text-lg sm:text-xl block leading-none">Thank You</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">For Your Service</span>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-md">
                  Step {onboardingStep + 1}/{ONBOARDING_STEPS.length}
                </div>
              </div>

              {/* Guide Bubble */}
              {ONBOARDING_STEPS[onboardingStep].guideText && (
                <div className="flex gap-3 sm:gap-4 mt-2 animate-slide-up">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center flex-shrink-0 relative">
                    <Icons.User size={20} className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div className="chat-bubble p-3.5 sm:p-4 rounded-tr-xl rounded-b-xl text-sm sm:text-base text-slate-700 shadow-sm flex-1 leading-relaxed border border-slate-200 bg-white">
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
              ref={onboardingScrollRef}
              className={`p-4 sm:p-6 md:p-10 bg-slate-50 min-h-0 flex-1 overflow-y-auto ${isLoadingOnboardingStep ? "flex flex-col justify-center" : "flex flex-col justify-start"} pb-24 sm:pb-28 md:pb-10`}
              style={{
                paddingBottom: isContactOnboardingStep
                  ? "max(6rem, env(safe-area-inset-bottom) + 4.5rem)"
                  : "max(1rem, env(safe-area-inset-bottom) + 0.75rem)",
                WebkitOverflowScrolling: "touch"
              }}
            >
              {isLoadingOnboardingStep ? (
                <LoadingStep text={currentOnboardingStep.text} />
              ) : isContactOnboardingStep ? (
                <ContactStep
                  onNext={handleContactSubmit}
                  initialData={userProfile}
                  part={parseInt(currentOnboardingStep.type.split("part")[1], 10)}
                  submitError={authStatusMessage}
                  isSubmitting={isAuthSubmitting}
                  onClearSubmitError={() => setAuthStatusMessage("")}
                  onReturnToLogin={returnToAccessLanding}
                />
              ) : (
                <div className="animate-fadeIn w-full">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-5 sm:mb-6 leading-tight">
                    {currentOnboardingStep.title}
                  </h1>

                  <div className="space-y-4">
                    {currentOnboardingStep.questions.map((q) => {
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
                      const useCompactOptionGrid = q.id === "branch" || q.id === "era";

                      return (
                        <div key={q.id}>
                          <p className="text-base sm:text-lg font-bold text-slate-700 mb-3">{q.label}</p>

                          {q.type === "boolean" && (
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                              <button
                                type="button"
                                onClick={() => handleOnboardingAnswer(q.id, true)}
                                className={`flex-1 min-h-14 py-4 rounded-xl border-2 text-base sm:text-lg font-bold transition-all ${userProfile[q.id] === true ? "border-blue-600 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-500 hover:border-blue-400"}`}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOnboardingAnswer(q.id, false)}
                                className={`flex-1 min-h-14 py-4 rounded-xl border-2 text-base sm:text-lg font-bold transition-all ${userProfile[q.id] === false ? "border-blue-600 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-500 hover:border-blue-400"}`}
                              >
                                No
                              </button>
                            </div>
                          )}

                          {q.type === "slider" && (
                            <div className="w-full py-6 sm:py-8 bg-white rounded-2xl border border-slate-200 mb-4 px-4 sm:px-6 text-center shadow-sm">
                              <span className="text-5xl sm:text-6xl font-black text-blue-900">{currentRating}%</span>
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
                            <div
                              className={
                                useCompactOptionGrid
                                  ? "grid grid-cols-2 gap-3 max-h-none overflow-visible custom-scrollbar"
                                  : "grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-none sm:max-h-64 overflow-visible sm:overflow-y-auto sm:pr-2 custom-scrollbar"
                              }
                            >
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
                                      className={`w-full relative p-4 min-h-14 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${isSelected ? "border-blue-600 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-400"}`}
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

                </div>
              )}
            </div>

            {shouldShowOnboardingFooter && (
              <div
                className="border-t border-slate-200 bg-white p-4 sm:px-6"
                style={{
                  paddingTop: "1rem",
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom) + 0.5rem)",
                  boxShadow: "0 -12px 24px rgba(15, 23, 42, 0.06)"
                }}
              >
                <button
                  onClick={nextOnboardingStep}
                  disabled={currentOnboardingStep.id === "contact_details"}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-black text-lg sm:text-xl py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 border-b-4 border-yellow-600 active:border-b-0 active:mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {onboardingStep === ONBOARDING_STEPS.length - 1 ? "Complete Setup" : "Next Step"} <Icons.ChevronRight className="w-6 h-6 stroke-[3px]" />
                </button>
              </div>
            )}
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
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Veteran Claim Workspace</p>
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
            <Icons.Map className="w-5 h-5" /> Claim Home
          </button>
          <button
            onClick={() => setActiveView("doctor_portal")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "doctor_portal" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Stethoscope className="w-5 h-5" /> Care Team
          </button>
          <button
            onClick={() => setActiveView("secure_comms")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "secure_comms" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.MessageSquare className="w-5 h-5" /> Messages
            {secureUnreadCount > 0 && (
              <span
                className={`ml-auto min-w-[1.5rem] px-2 py-0.5 rounded-full text-[10px] font-bold text-center ${activeView === "secure_comms" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}
              >
                {secureUnreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView("intake_portal")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "intake_portal" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.FileText className="w-5 h-5" /> Records Intake
          </button>

          <p className="px-4 py-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tools</p>
          <button
            onClick={() => setActiveView("dossier")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "dossier" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Database className="w-5 h-5" /> Records Vault
          </button>
          <button
            onClick={() => setActiveView("calculator")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "calculator" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Calculator className="w-5 h-5" /> VA Rating Calculator
          </button>
          <button
            onClick={() => setActiveView("pact_explorer")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "pact_explorer" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Zap className="w-5 h-5" /> PACT Act Guide
          </button>
          <button
            onClick={() => setActiveView("nexus_generator")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "nexus_generator" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Quote className="w-5 h-5" /> Medical Opinion Draft
          </button>
          <button
            onClick={() => setActiveView("doc_wizard")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "doc_wizard" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.FileUp className="w-5 h-5" /> Evidence Checklist
          </button>
          <button
            onClick={() => setActiveView("strategy")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "strategy" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.TrendingUp className="w-5 h-5" /> Support Options
          </button>

          <p className="px-4 py-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Guided Support</p>
          <button
            onClick={() => setActiveView("ai_claims")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeView === "ai_claims" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <Icons.Bot className="w-5 h-5" /> Claim Guide {isMember ? "" : <Icons.Lock className="w-3 h-3 ml-auto opacity-50" />}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-not-allowed opacity-60">
            <Icons.User className="w-5 h-5" /> Independent Doctor Support <Icons.Lock className="w-3 h-3 ml-auto" />
          </button>
        </nav>
        <div className="p-4 bg-slate-800 m-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2 h-2 rounded-full ${isMember ? "bg-blue-400" : "bg-green-400 animate-pulse"}`}></div>
            <span className="text-xs font-bold text-white uppercase">{isMember ? "Guided" : "Self-Guided"}</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">ID: {userProfile.branch?.substring(0, 3).toUpperCase() || "VET"}-8821</p>
          {!isMember && (
            <button onClick={() => setActiveView("strategy")} className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xs font-bold rounded-lg transition-colors">
              Explore Support Options
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="min-h-[5rem] bg-white border-b border-slate-200 flex justify-between items-center px-6 py-4 z-10 shrink-0 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500">
              <Icons.Menu className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">{headerMeta.eyebrow}</p>
              <h2 className="text-lg font-bold text-slate-800 truncate">{headerMeta.title}</h2>
              <p className="hidden lg:block text-sm text-slate-500 truncate">{headerMeta.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2">
              {activeView !== "doctor_portal" && (
                <button
                  onClick={() => setActiveView("doctor_portal")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-300 text-slate-700 text-sm font-bold hover:border-blue-400 hover:text-blue-700 transition-colors"
                >
                  <Icons.Stethoscope className="w-4 h-4" /> Care Team
                </button>
              )}
              {activeView !== "secure_comms" && (
                <button
                  onClick={() => setActiveView("secure_comms")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-300 text-slate-700 text-sm font-bold hover:border-blue-400 hover:text-blue-700 transition-colors"
                >
                  <Icons.MessageSquare className="w-4 h-4" /> Messages
                  {secureUnreadCount > 0 && (
                    <span className="min-w-[1.35rem] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold text-center">
                      {secureUnreadCount}
                    </span>
                  )}
                </button>
              )}
            </div>
            {isAuthenticated && authAccount?.email ? (
              <button
                onClick={handleClientLogout}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
              >
                <Icons.Lock className="w-4 h-4" />
                <span className="hidden lg:inline">{authAccount.email}</span>
                <span>Log Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setHasStarted(false);
                  clearHasStarted();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-blue-400 hover:text-blue-700 shadow-sm bg-white"
              >
                <Icons.User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
            {!isBotOpen && (
              <button
                onClick={() => setIsBotOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md transition-all"
              >
                <Icons.MessageSquare className="w-4 h-4" /> Ask Angela
              </button>
            )}
          </div>
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
                  <Icons.MessageSquare className="w-6 h-6" /> Show Me Where To Start
                </button>

                {/* SOP SWIMLANE TRACKER */}
                <SopSwimlaneTracker 
                  currentPhase={deriveSopPhase(paymentState, dossier, nextDoctorVisit)} 
                  Icons={Icons} 
                  onPhaseClick={null} 
                />

                {deriveSopPhase(paymentState, dossier, nextDoctorVisit) === 1 ? (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 shadow-sm flex items-start gap-4">
                    <div className="bg-red-100 text-red-600 p-3 rounded-full shrink-0">
                      <Icons.AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-red-900 mb-2">Requires DD-214 Upload</h3>
                      <p className="text-red-700 font-medium mb-4">
                        Your account is in Phase 1 (Account Setup). We cannot begin building your medical strategy until your DD-214 is securely uploaded to your Records Vault.
                      </p>
                      <button
                        onClick={() => setActiveView("dossier")}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-colors flex items-center gap-2"
                      >
                        <Icons.Upload className="w-5 h-5" /> Open Records Vault
                      </button>
                    </div>
                  </div>
                ) : (
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
                      <p className="font-bold text-slate-900">Records Vault</p>
                      <p className="text-sm text-slate-500 mt-1">Upload records, read scanned text, and keep your evidence organized on this device.</p>
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
                      <p className="font-bold text-slate-900">VA Rating Calculator</p>
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
                      <p className="font-bold text-slate-900">PACT Act Guide</p>
                      <p className="text-sm text-slate-500 mt-1">Check presumptive conditions by era and exposure track with official VA sources.</p>
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
                          {matchingNexusDocs.length} records
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">Medical Opinion Draft</p>
                      <p className="text-sm text-slate-500 mt-1">Organize the facts a doctor would need to write a medical opinion.</p>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-[1.05fr,0.95fr] gap-6">
                  <button
                    onClick={() => setActiveView("doctor_portal")}
                    className="bg-white text-left rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 mb-2">Care team</p>
                        <h3 className="text-2xl font-black text-slate-900">Care Team</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                          See your TYFYS contacts, provider appointments, and who is handling each part of your file.
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <Icons.Stethoscope className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">TYFYS contacts</p>
                        <p className="text-3xl font-black text-slate-900 mt-2">{assignedDoctorCount}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Next appointment</p>
                        <p className="text-sm font-bold text-slate-900 mt-2">{nextDoctorVisit ? nextDoctorVisit.time : "Not scheduled"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending follow-ups</p>
                        <p className="text-3xl font-black text-slate-900 mt-2">{requestedIntegrationCount}</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveView("secure_comms")}
                    className="bg-white text-left rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 mb-2">Shared inbox</p>
                        <h3 className="text-2xl font-black text-slate-900">Messages</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                          Keep TYFYS and your assigned providers in one secure inbox with clear next steps and reply windows.
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <Icons.MessageSquare className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {secureThreads.slice(0, 3).map((thread) => (
                        <div key={thread.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{thread.title}</p>
                            <p className="text-sm text-slate-500 truncate">{thread.lastMessage}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{thread.lastTimestamp}</p>
                            <p className="text-[11px] font-bold text-blue-700">{thread.unread ? `${thread.unread} new` : "Up to date"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Claims Tracker */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Icons.FileText className="w-5 h-5 text-orange-500" /> Tracked Conditions
                      </h3>
                      <button
                        onClick={() => setActiveView("calculator")}
                        className="text-sm text-blue-600 font-bold hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        Add condition
                      </button>
                    </div>

                    {addedClaims.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <Icons.FileUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No conditions added yet.</p>
                        <p className="text-sm text-slate-400 mb-4">Add conditions to see rating guidance and supporting records.</p>
                        <button
                          onClick={() => setActiveView("calculator")}
                          className="bg-white border border-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                          Start here
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
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span
                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                                      isClaimRatingSelected(claim.rating)
                                        ? "bg-slate-50 text-slate-700 border-slate-200"
                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                    }`}
                                  >
                                    {formatClaimRating(claim.rating)}
                                  </span>
                                  {claim.diagnosticCode && (
                                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full border bg-white text-slate-600 border-slate-200">
                                      DC {claim.diagnosticCode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pl-14 sm:pl-0">
                              <span
                                className={`px-3 py-1 text-xs font-bold rounded-full border ${
                                  isClaimRatingSelected(claim.rating)
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-orange-50 text-orange-600 border-orange-100"
                                }`}
                              >
                                {isClaimRatingSelected(claim.rating) ? "Rating selected" : "Rating details needed"}
                              </span>
                              <button
                                onClick={() => {
                                  setActiveView("calculator");
                                  setEditingClaimIndex(idx);
                                  setSelectedCategory(
                                    Object.keys(DISABILITY_DATA).find((category) =>
                                      DISABILITY_DATA[category].some((condition) => condition.name === claim.name)
                                    ) || ""
                                  );
                                  setSelectedCondition(claim.name);
                                  setSelectedRatingProfileId(claim.ratingProfileId || "");
                                  setNewRatingInput(isClaimRatingSelected(claim.rating) ? String(claim.rating) : "");
                                  setCalculatorNotice(null);
                                }}
                                className="text-xs bg-slate-100 text-slate-500 px-3 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
                              >
                                <Icons.Edit className="w-3 h-3" /> Edit
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
                            <Icons.ShieldCheck className={`w-5 h-5 ${isMember ? "text-green-400" : "text-slate-400"}`} /> Support
                            Level
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${isMember ? "bg-green-500/20 text-green-400" : "bg-slate-100 text-slate-500"}`}
                          >
                            {isMember ? "Guided" : "Self-Guided"}
                          </span>
                        </div>
                        <p className={`text-sm mb-6 ${isMember ? "text-slate-400" : "text-slate-500"}`}>
                          {isMember
                            ? "You have guided access to Angela, monthly consult support, and service discounts."
                            : "Upgrade for guided Angela access, monthly consult support, and service discounts."}
                        </p>
                        {!isMember && (
                          <button
                            onClick={() => setActiveView("strategy")}
                            className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors text-sm"
                          >
                            Explore Guided Support ($250/mo)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action List */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-slate-400">Next Steps</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveView("intake_portal")}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                              <Icons.FileText className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-emerald-700">
                              {dossier.length ? "Continue Records Intake" : "Start Records Intake"}
                            </span>
                          </div>
                          <Icons.ChevronRight className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => setActiveView("dossier")}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <Icons.Database className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Open Records Vault</span>
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
                          <p className="text-xs text-slate-600">Private medical records and doctor opinion letters. This can strengthen the file before a C&P exam is even scheduled.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === "doctor_portal" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 mb-2">Care team overview</p>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Care Team</h2>
                      <p className="text-slate-600 max-w-4xl">
                        See who is helping with your file, when your next appointment is scheduled, and what the next step is.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-[18rem]">
                      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">TYFYS contacts</p>
                        <p className="text-3xl font-black text-blue-900 mt-2">{assignedDoctorCount}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Next appointment</p>
                        <p className="text-sm font-bold text-emerald-900 mt-2">{nextDoctorVisit ? nextDoctorVisit.time : "Not scheduled"}</p>
                      </div>
                      <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Pending follow-ups</p>
                        <p className="text-3xl font-black text-violet-900 mt-2">{requestedIntegrationCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.15fr,0.85fr] gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 px-6 py-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-2">Your contacts</p>
                        <h3 className="text-2xl font-black">Your TYFYS and provider contacts</h3>
                      </div>
                      <button
                        onClick={() => setActiveView("secure_comms")}
                        className="self-start md:self-auto px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-sm font-bold hover:bg-white/20 transition-colors"
                      >
                        Open messages
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {DOCTOR_PORTAL_TEAM.map((member) => (
                        <div key={member.id} className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                    member.tag === "Assigned Doctor" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}
                                >
                                  {member.tag}
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{member.title}</span>
                              </div>
                              <h4 className="text-xl font-bold text-slate-900">{member.name}</h4>
                              <p className="text-sm text-slate-500 mt-1">{member.specialty}</p>
                              <p className="text-sm text-slate-600 mt-4 max-w-3xl">{member.bio}</p>
                              <div className="flex flex-wrap gap-2 mt-4">
                                {member.focus.map((focus) => (
                                  <span key={focus} className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold uppercase tracking-tight text-slate-700">
                                    {focus}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="w-full lg:w-72 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                  <Icons.Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Availability</p>
                                    <p className="font-bold text-slate-900">{member.availability}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <Icons.Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Next appointment</p>
                                    <p className="font-bold text-slate-900">{member.nextVisit}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <Icons.Database className="w-4 h-4 text-slate-400 mt-0.5" />
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">How they help</p>
                                    <p className="font-bold text-slate-900">{member.sync}</p>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => openSecureThread(member.threadId)}
                                className="w-full mt-4 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                              >
                                Message {member.tag === "Assigned Doctor" ? "this provider" : "TYFYS"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Upcoming appointments</h3>
                        <p className="text-sm text-slate-500">Review what is coming up and what each appointment is for.</p>
                      </div>
                      <button
                        onClick={() => setActiveView("secure_comms")}
                        className="text-sm font-bold text-blue-700 hover:text-blue-800"
                      >
                        Message care team
                      </button>
                    </div>
                    <div className="space-y-4">
                      {DOCTOR_PORTAL_VISITS.map((visit) => (
                        <div key={visit.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">{visit.mode}</p>
                              <p className="font-bold text-slate-900 mt-1">{visit.title}</p>
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                              {visit.time}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{visit.summary}</p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-sm font-bold text-slate-700">{visit.owner}</span>
                            <button
                              onClick={() => {
                                const matchingMember = DOCTOR_PORTAL_TEAM.find((member) => member.name === visit.owner || member.title.includes(visit.owner));
                                openSecureThread(matchingMember?.threadId || "thread-ops");
                              }}
                              className="text-sm font-bold text-blue-700 hover:text-blue-800"
                            >
                              Open conversation
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-600 mb-2">Provider coordination</p>
                      <h3 className="text-2xl font-black text-slate-900">If your doctor already has a patient system</h3>
                      <p className="text-slate-500 mt-2 max-w-3xl">
                        If your doctor uses one of these systems, TYFYS can usually coordinate appointments and record requests with less back-and-forth. If you are not sure, pick the closest match and we can confirm it for you.
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-500">{requestedIntegrationCount} follow-up request{requestedIntegrationCount === 1 ? "" : "s"} sent</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {doctorPortalIntegrations.map((integration) => (
                      <div key={integration.id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/70">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <p className="font-bold text-slate-900">{integration.name}</p>
                            <p className="text-sm text-slate-500 mt-1">{integration.category}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              integration.status === "Ready"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}
                          >
                            {integration.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 min-h-[4.5rem]">{integration.description}</p>
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-400">Best for</span>
                            <span className="font-bold text-slate-800 text-right">{integration.audience}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-400">What TYFYS can help with</span>
                            <span className="font-bold text-slate-800 text-right">{integration.sync}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDoctorPortalIntegrationRequest(integration.id)}
                          className={`w-full mt-5 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                            integration.requestedAt
                              ? "bg-slate-900 text-white hover:bg-black"
                              : "border border-slate-300 text-slate-700 hover:border-blue-400 hover:text-blue-700"
                          }`}
                        >
                          {integration.requestedAt ? "TYFYS follow-up requested" : "Ask TYFYS to coordinate"}
                        </button>
                        {integration.requestedAt && (
                          <p className="text-xs text-slate-500 mt-2">Requested {formatDateTime(integration.requestedAt)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === "secure_comms" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 mb-2">One inbox for TYFYS and providers</p>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Messages</h2>
                      <p className="text-slate-600 max-w-4xl">
                        Message TYFYS and your assigned providers from one secure inbox. Each conversation keeps the history, next steps, and reply window in one place.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-[18rem]">
                      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Active threads</p>
                        <p className="text-3xl font-black text-blue-900 mt-2">{secureThreads.length}</p>
                      </div>
                      <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Unread</p>
                        <p className="text-3xl font-black text-amber-900 mt-2">{secureUnreadCount}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Typical response</p>
                        <p className="text-sm font-bold text-emerald-900 mt-2">{selectedSecureThread?.responseTime || "Same day"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[42rem]">
                  <aside className="xl:w-[22rem] border-b xl:border-b-0 xl:border-r border-slate-200 bg-slate-50/80">
                    <div className="px-5 py-5 border-b border-slate-200">
                      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-2">Messages</p>
                      <h3 className="text-xl font-bold text-slate-900">Care conversations</h3>
                    </div>
                    <div className="p-3 space-y-2">
                      {secureThreads.map((thread) => (
                        <button
                          key={thread.id}
                          onClick={() => setSelectedSecureThreadId(thread.id)}
                          className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${
                            selectedSecureThread?.id === thread.id
                              ? "bg-white border-blue-300 shadow-sm"
                              : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{thread.title}</p>
                              <p className="text-sm text-slate-500 truncate mt-1">{thread.participants}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{thread.lastTimestamp}</p>
                              {thread.unread > 0 && (
                                <span className="inline-flex mt-2 min-w-[1.5rem] justify-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                                  {thread.unread}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mt-3 truncate">{thread.lastMessage}</p>
                          <div className="flex items-center justify-between gap-3 mt-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{thread.status}</span>
                            <span className="text-[11px] font-bold text-slate-500">{thread.responseTime}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className="flex-1 flex flex-col min-h-[30rem]">
                    {selectedSecureThread ? (
                      <>
                        <div className="px-6 py-5 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold uppercase tracking-wider">
                                {selectedSecureThread.status}
                              </span>
                              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">{selectedSecureThread.responseTime}</span>
                            </div>
                            <h3 className="text-2xl font-black">{selectedSecureThread.title}</h3>
                            <p className="text-sm text-slate-300 mt-1">{selectedSecureThread.participants}</p>
                          </div>
                          <button
                            onClick={() => setActiveView("doctor_portal")}
                            className="self-start md:self-auto px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-sm font-bold hover:bg-white/20 transition-colors"
                          >
                            Open Care Team
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/70">
                          {selectedSecureThread.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex flex-col ${message.isCurrentUser ? "items-end" : "items-start"} animate-fadeIn`}
                            >
                              <div
                                className={`max-w-[80%] px-6 py-4 rounded-[1.75rem] border shadow-sm ${
                                  message.isCurrentUser
                                    ? "bg-blue-600 text-white border-blue-500 rounded-tr-none"
                                    : "bg-white text-slate-800 border-slate-200 rounded-tl-none"
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{message.text}</p>
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                                {message.sender} • {message.time}
                              </span>
                            </div>
                          ))}
                          <div ref={secureChatEndRef}></div>
                        </div>

                        <form onSubmit={handleSecureMessageSend} className="p-4 md:p-6 bg-white border-t border-slate-100 flex gap-4">
                          <input
                            type="text"
                            value={secureMessageInput}
                            onChange={(event) => setSecureMessageInput(event.target.value)}
                            placeholder={`Message ${selectedSecureThread.title}...`}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          />
                          <button
                            type="submit"
                            className="px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <Icons.Send className="w-4 h-4" /> Send
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-10">
                        <div className="text-center">
                          <Icons.MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="font-bold text-slate-700">Choose a conversation to read your messages.</p>
                        </div>
                      </div>
                    )}
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
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 mb-2">Saved on this device</p>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Records Vault</h2>
                      <p className="text-slate-600 max-w-3xl">
                        Upload records, scan readable text from PDFs or images, and keep the documents your claim depends on in one place. Files stay saved on this device, while the vault keeps notes and text previews attached to each record.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 min-w-[16rem]">
                      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Files saved</p>
                        <p className="text-3xl font-black text-blue-900">{dossierCounts.total}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Last scan</p>
                        <p className="text-sm font-bold text-emerald-900">
                          {lastScanResult ? `${lastScanResult.confidence}% text confidence` : "Ready"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.05fr,0.95fr] gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Scan a record</h3>
                        <p className="text-sm text-slate-500">Upload a document, read the text TYFYS finds, and save it to your Records Vault.</p>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {isScanning ? activeScanStage : "Ready"}
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
                            {isScanning ? `Scanning ${scanPayloadRef.current?.title || "document"}...` : "Drop a file to scan"}
                          </p>
                          <p className="text-sm text-slate-400 mt-2">
                            {isScanning
                              ? "TYFYS is reading the selected file and saving the extracted text to your Records Vault."
                              : "Attach a PDF or photo, choose the condition, then save the record."}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`absolute left-8 right-8 h-0.5 bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)] transition-all ${isScanning ? "" : "opacity-30"}`}
                        style={{ top: `${14 + scanProgress * 68}%` }}
                      ></div>
                      <div className="absolute left-8 right-8 bottom-5 flex items-center justify-between text-xs font-mono text-slate-300">
                        <span>{activeScanStage}</span>
                        <span>{isScanning ? "Scanning now" : "Ready"}</span>
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
                          <option value="">General claim record</option>
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
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Attach document</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        capture="environment"
                        onChange={handleScannerFile}
                        className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                      />
                      <p className="text-xs text-slate-400 mt-2">
                        {scannerForm.fileName
                          ? `${scannerForm.fileName} · ${formatFileSize(scannerForm.fileSize)}`
                          : "Use your camera or upload a PDF or photo. TYFYS saves the text it finds so you can review it later."}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes for TYFYS</label>
                      <textarea
                        value={scannerForm.notes}
                        onChange={(e) => handleScannerChange("notes", e.target.value)}
                        rows="4"
                        placeholder="Example: mentions flare-ups, limited movement, and missed work shifts."
                        className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleStartScan}
                        disabled={isScanning || !scannerFile}
                        className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60"
                      >
                        {isScanning ? "Saving..." : "Save to Records Vault"}
                      </button>
                      <button
                        onClick={exportDossier}
                        disabled={!dossier.length}
                        className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:border-slate-400 disabled:opacity-60"
                      >
                        Export Records Vault
                      </button>
                    </div>

                    {scanError && <p className="text-sm font-medium text-red-600">{scanError}</p>}

                    {lastScanResult && (
                      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Latest saved record</p>
                            <p className="font-bold text-slate-900">{lastScanResult.title}</p>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-cyan-700 border border-cyan-200">
                            {lastScanResult.confidence}% text confidence
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
                        <h3 className="text-xl font-bold text-slate-900">Saved records</h3>
                        <p className="text-sm text-slate-500">Records saved from this browser session onward.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Types tracked</p>
                        <p className="text-sm font-bold text-slate-900">{Object.keys(dossierCounts).filter((key) => key !== "total").length}</p>
                      </div>
                    </div>

                    {!dossier.length ? (
                      <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/70 p-10 text-center">
                        <Icons.Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="font-bold text-slate-700">Your Records Vault is empty.</p>
                        <p className="text-sm text-slate-500 mt-2">Start your first scan to save a record here.</p>
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
                                  {item.crmSync?.status === "synced" && (
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                                      Sent to TYFYS file
                                    </span>
                                  )}
                                  {item.crmSync?.status === "failed" && (
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-1 rounded-full">
                                      TYFYS file pending
                                    </span>
                                  )}
                                </div>
                                <p className="font-bold text-slate-900 text-lg">{item.title}</p>
                                <p className="text-sm text-slate-500">
                                  {item.condition || "General claim record"} · {item.source} · {formatDateTime(item.capturedAt)}
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
                                  {item.fileName ? `${item.fileName} · ${formatFileSize(item.fileSize)}` : "Notes only"}
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Text confidence</p>
                                <p className="font-medium text-slate-700 mt-1">{item.confidence}%</p>
                              </div>
                            </div>
                            {item.crmSync && (
                              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TYFYS file status</p>
                                <p className="mt-1 font-medium text-slate-700">
                                  {item.crmSync.status === "synced"
                                    ? "Added to your TYFYS file."
                                    : "Saved on this device. TYFYS still needs to add it to your file."}
                                </p>
                              </div>
                            )}
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
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-green-600 mb-2">Official VA combined-rating rules</p>
                      <h2 className="text-2xl font-black text-slate-900 mb-3">VA Rating Calculator</h2>
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
                            <li>Claims entered here use condition-specific rating rules so the dropdown only shows percentages supported by the selected VA schedule.</li>
                            <li>Some conditions stay locked until you choose the exact diagnosis or add the test result the VA uses for that rating.</li>
                          </ul>
                          <div className="mt-3 flex flex-wrap gap-3">
                            <a href={COMBINED_RATINGS_SOURCE_URL} target="_blank" rel="noreferrer" className="font-bold text-green-800 hover:text-green-900">
                              Open 38 CFR 4.25
                            </a>
                            <a href={PYRAMIDING_SOURCE_URL} target="_blank" rel="noreferrer" className="font-bold text-green-800 hover:text-green-900">
                              Open 38 CFR 4.14
                            </a>
                            <a href={RESPIRATORY_SINGLE_RATING_SOURCE_URL} target="_blank" rel="noreferrer" className="font-bold text-green-800 hover:text-green-900">
                              Open 38 CFR 4.96(a)
                            </a>
                          </div>
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
                      <a
                        href={COMBINED_RATINGS_SOURCE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-2 text-sm font-bold text-blue-700 hover:text-blue-800"
                      >
                        Open official combined ratings rule
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                          <select
                            value={selectedCategory}
                            onChange={(e) => {
                              setSelectedCategory(e.target.value);
                              setSelectedCondition("");
                              setSelectedRatingProfileId("");
                              setNewRatingInput("");
                              setCalculatorNotice(null);
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
                            onChange={(e) => {
                              setSelectedCondition(e.target.value);
                              setSelectedRatingProfileId("");
                              setCalculatorNotice(null);
                            }}
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
                          <label className="text-xs font-bold text-slate-500 uppercase">Rating to model</label>
                          <select
                            value={newRatingInput}
                            onChange={(e) => setNewRatingInput(e.target.value)}
                            disabled={!selectedCondition || selectedConditionNeedsProfile || Boolean(selectedConditionBlockedMessage)}
                            className="w-full mt-2 p-3 border rounded-xl disabled:bg-slate-100"
                          >
                            <option value="">{selectedConditionBlockedMessage ? "Facts required" : "Select..."}</option>
                            {selectedRatingOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.value}%
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {selectedConditionRule?.mode === "profiles" && (
                        <div className="mb-4">
                          <label className="text-xs font-bold text-slate-500 uppercase">Rating basis</label>
                          <select
                            value={selectedRatingProfileId}
                            onChange={(e) => {
                              setSelectedRatingProfileId(e.target.value);
                              setCalculatorNotice(null);
                            }}
                            className="w-full mt-2 p-3 border rounded-xl"
                          >
                            <option value="">Select the exact VA rating basis...</option>
                            {selectedConditionRule.profiles.map((profile) => (
                              <option key={profile.id} value={profile.id}>
                                {profile.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {calculatorNotice && (
                        <div
                          className={`mb-4 rounded-2xl border p-4 text-sm ${
                            calculatorNotice.type === "success"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border-amber-200 bg-amber-50 text-amber-900"
                          }`}
                        >
                          {calculatorNotice.text}
                        </div>
                      )}

                      {selectedConditionRule && (
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Allowed ratings for this condition</p>
                              <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedCondition}</h3>
                              <p className="text-sm text-slate-600 mt-1">
                                {selectedRatingContext?.label || selectedConditionRule.ruleTitle}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700">
                                DC {selectedRatingContext?.diagnosticCode || selectedConditionRule.diagnosticCode || "Varies"}
                              </span>
                              <a
                                href={selectedRatingContext?.sourceUrl || selectedConditionRule.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700"
                              >
                                {selectedConditionRule.sourceLabel || "Open official source"}
                              </a>
                            </div>
                          </div>

                          {selectedConditionBlockedMessage ? (
                            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                              {selectedConditionBlockedMessage}
                            </div>
                          ) : (
                            <>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {selectedRatingOptions.length ? (
                                  selectedRatingOptions.map((option) => (
                                    <span
                                      key={option.value}
                                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                        newRatingInput !== "" && Number(newRatingInput) === option.value
                                          ? "bg-slate-900 text-white border-slate-900"
                                          : "bg-white text-slate-700 border-slate-200"
                                      }`}
                                    >
                                      {option.value}%
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-slate-500">Select a rating basis to unlock the valid percentages.</span>
                                )}
                              </div>
                              {selectedRatingOptions.length > 0 && (
                                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">What this rating means</p>
                                  <p className="text-sm text-slate-700">
                                    {(newRatingInput !== "" &&
                                      selectedRatingOptions.find((option) => option.value === Number(newRatingInput))?.summary) ||
                                      "Pick one of the supported rating levels above."}
                                  </p>
                                </div>
                              )}
                            </>
                          )}

                          <div className="mt-4 space-y-2">
                            {selectedConditionNotes.map((note) => (
                              <p key={note} className="text-sm text-slate-600">
                                {note}
                              </p>
                            ))}
                            {selectedConditionRule.exclusivityMessage && (
                              <p className="text-sm font-medium text-amber-800">{selectedConditionRule.exclusivityMessage}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Claim status</label>
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
                        <div className="flex gap-3">
                          {editingClaimIndex !== null && (
                            <button
                              onClick={() => {
                                setEditingClaimIndex(null);
                                setCalculatorNotice(null);
                              }}
                              className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:border-slate-400"
                            >
                              Cancel edit
                            </button>
                          )}
                          <button
                            onClick={addClaim}
                            disabled={
                            !selectedCondition ||
                            selectedConditionNeedsProfile ||
                            Boolean(selectedConditionBlockedMessage) ||
                            !hasSelectedRatingOption
                          }
                          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50"
                        >
                            {editingClaimIndex !== null ? "Update condition" : "Add condition"}
                          </button>
                        </div>
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
                          <h3 className="text-xl font-bold text-slate-900">Conditions in your calculator</h3>
                          <p className="text-sm text-slate-500">Only conditions with a supported rating are applied from highest to lowest in the calculator.</p>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          {addedClaims.length} condition{addedClaims.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      {!addedClaims.length ? (
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-10 text-center">
                          <Icons.Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="font-bold text-slate-700">No conditions added yet.</p>
                          <p className="text-sm text-slate-500 mt-2">Start with the condition fields above to see how the combined rating changes.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {addedClaims.map((claim, idx) => (
                            <div key={`${claim.name}-${idx}`} className="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${claim.type === "new" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                                    {claim.type}
                                  </span>
                                  <span
                                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                      isClaimRatingSelected(claim.rating)
                                        ? "bg-slate-100 text-slate-600"
                                        : "bg-amber-50 text-amber-700 border border-amber-100"
                                    }`}
                                  >
                                    {formatClaimRating(claim.rating)}
                                  </span>
                                  {claim.diagnosticCode && (
                                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                                      DC {claim.diagnosticCode}
                                    </span>
                                  )}
                                </div>
                                <p className="font-bold text-slate-900">{claim.name}</p>
                                <p className="text-sm text-slate-500">{claim.dbq}</p>
                                {claim.ratingProfileLabel && <p className="text-sm text-slate-500 mt-1">{claim.ratingProfileLabel}</p>}
                                {claim.ratingSummary && <p className="text-sm text-slate-600 mt-2">{claim.ratingSummary}</p>}
                                {claim.sourceUrl && (
                                  <a href={claim.sourceUrl} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs font-bold text-blue-700 hover:text-blue-800">
                                    {claim.sourceLabel || "Open official source"}
                                  </a>
                                )}
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
                          <h3 className="text-xl font-bold text-slate-900">How the calculator works</h3>
                          <p className="text-sm text-slate-500">Every added condition reduces the remaining healthy efficiency, not the original 100%.</p>
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
                        <p className="text-sm text-slate-500">Add at least one condition with a supported percentage to see the exact rating sequence.</p>
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
                          <p className="text-sm text-slate-500">Guidance is limited to the condition-specific rating levels supported in this tool.</p>
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
                              : "No single supported condition rating in this tool reaches 100% from the scenario entered here."}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="font-bold text-slate-900 mb-1">Two-claim path</p>
                          <p className="text-slate-600">
                            {pathTo100Guide.doubleStep
                              ? `A pair like ${pathTo100Guide.doubleStep[0]}% + ${pathTo100Guide.doubleStep[1]}% would get this scenario to 100%.`
                              : "No simple two-claim combination was found from the supported rating levels in this tool."}
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
                  <h2 className="text-2xl font-black text-slate-900 mb-2">PACT Act Guide</h2>
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
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recommended starting points</h3>
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
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Medical Opinion Draft</h2>
                      <p className="text-slate-600 max-w-4xl">
                        Use this to organize the facts a doctor would need for a nexus or medical opinion letter. A licensed medical professional still has to independently review, edit, and sign the final opinion.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveView("dossier")}
                      className="self-start px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:border-slate-400"
                    >
                      Open Records Vault
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
                      <p className="text-xs font-bold uppercase tracking-wider text-violet-700 mb-2">Matching records from your vault</p>
                      {matchingNexusDocs.length ? (
                        <div className="flex flex-wrap gap-2">
                          {matchingNexusDocs.slice(0, 6).map((item) => (
                            <span key={item.id} className="text-xs font-bold px-2 py-1 rounded-full bg-white text-violet-700 border border-violet-200">
                              {item.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-violet-900">No matching records yet. Add service records, lay statements, or private medical evidence to strengthen the draft.</p>
                      )}
                    </div>

                    <button
                      onClick={generateNexusTemplate}
                      className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700"
                    >
                      Create medical opinion draft
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
                        <p className="font-bold text-slate-700">No draft created yet.</p>
                        <p className="text-sm text-slate-500 mt-2">Complete the fields on the left and create a medical opinion draft.</p>
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
                    <h2 className="text-2xl font-bold text-slate-900">Evidence Checklist</h2>
                    <p className="text-slate-500">Choose a condition to see the main VA form and supporting records that usually matter.</p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide">Free Tool</div>
                </div>

                {/* INSTRUCTIONAL GRAPHIC */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                    <p className="text-xs font-bold text-slate-700 uppercase">Choose condition</p>
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-300">
                      <Icons.ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                    <p className="text-xs font-bold text-slate-700 uppercase">Review checklist</p>
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-300">
                      <Icons.ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                    <p className="text-xs font-bold text-slate-700 uppercase">Gather records</p>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-500 uppercase mb-2">I want help with:</label>
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
                      <Icons.FileText className="w-6 h-6" /> What to gather
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
                                  "If you want help gathering or reviewing this DBQ, open Support Options and we can walk you through the next step."
                                );
                              }}
                              className="text-xs bg-slate-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors whitespace-nowrap self-center"
                            >
                              Ask TYFYS About This
                            </button>
                          </li>
                          {item.docs &&
                            item.docs.map((doc) => (
                              <li key={doc} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
                                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 font-bold text-sm">RECORD</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 block text-lg">{doc}</span>
                                    <HelpTooltip
                                      title="Supporting Records"
                                      content="Evidence like personal statements, logs, and treatment records helps show how often symptoms happen and how severe they are."
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
                                  title="Medical Opinion Letter"
                                  content="This is a letter from a doctor explaining that your condition is more likely than not connected to your service."
                                />
                              </div>
                              <span className="text-slate-500 text-sm">Often important.</span>
                            </div>
                            <button
                              onClick={() => setShowSpecialistModal(true)}
                              className="text-xs bg-orange-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap self-center shadow-md"
                            >
                              Find an Independent Doctor
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
                      <h2 className="text-2xl font-bold text-slate-900">Choose Your Level of Support</h2>
                      <p className="text-slate-500 text-lg">Select how much help you want from TYFYS.</p>
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
                        <Icons.Clock className="w-5 h-5 text-blue-600" /> Average Time to Completion
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
                        <p className="text-blue-200 mb-6 text-lg">Hands-on support, faster navigation, and ongoing guidance.</p>
                        <ul className="space-y-3 text-blue-50 font-medium">
                          <li className="flex items-center gap-3">
                            <Icons.Clock className="w-5 h-5 text-green-400" /> Save 7-10 months of waiting (Avg)
                          </li>
                          <li className="flex items-center gap-3">
                            <Icons.CheckCircle className="w-5 h-5 text-green-400" /> <strong>Unlimited</strong> Claim Guide access
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
                          {isCheckoutLoading
                            ? "Redirecting..."
                            : nativeAppRuntime
                              ? "Talk to TYFYS About Membership"
                              : "Join Premium"}
                        </button>
                        {nativeAppRuntime && (
                          <p className="mt-3 text-xs text-blue-100 max-w-xs ml-auto">
                            TYFYS activates memberships in the mobile app so your support plan stays active in both the mobile app and website.
                          </p>
                        )}
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
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
                        Start here after signup
                      </p>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">
                        Finish records intake first
                      </h2>
                      <p className="text-slate-600 max-w-3xl">
                        Use this area to gather your DD-214, service treatment records, VA decisions, and private records first. Once those are uploaded, the rest of the app will be much easier to use.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 min-w-[16rem]">
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Records matched</p>
                        <p className="text-3xl font-black text-emerald-900">
                          {intakeCompletedCount}/{intakeChecklist.length}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Sent to TYFYS file</p>
                        <p className="text-3xl font-black text-blue-900">{syncedDossierCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-200 p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Guided intake</p>
                          <h3 className="mt-2 text-2xl font-black text-slate-900">Records intake assistant</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            Stay here first so you can hand over the key records before moving into calculators and drafting tools.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">TYFYS file</p>
                          <p className="mt-1 text-sm font-bold">
                            {zohoCrmModule || "File not created yet"}
                            {zohoLeadId ? ` · ${zohoLeadId}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/95 p-4">
                      {!isZapierEmbedReady && !zapierEmbedError && (
                        <div className="flex min-h-[44rem] items-center justify-center rounded-[1.75rem] border border-white/10 bg-slate-900 text-center text-slate-300">
                          <div>
                            <Icons.Bot className="mx-auto h-10 w-10 text-emerald-300" />
                            <p className="mt-4 text-lg font-bold text-white">Loading intake guide...</p>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                              Your intake guide is opening directly inside the app.
                            </p>
                          </div>
                        </div>
                      )}

                      {zapierEmbedError && (
                        <div className="flex min-h-[44rem] items-center justify-center rounded-[1.75rem] border border-amber-500/30 bg-amber-500/10 px-6 text-center">
                          <div>
                            <Icons.AlertTriangle className="mx-auto h-10 w-10 text-amber-300" />
                            <p className="mt-4 text-lg font-bold text-white">Intake guide could not load</p>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">{zapierEmbedError}</p>
                          </div>
                        </div>
                      )}

                      {isZapierEmbedReady && !zapierEmbedError && (
                        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-2">
                          <div className="h-[44rem] rounded-[1.25rem] bg-white overflow-hidden">
                            <zapier-interfaces-chatbot-embed
                              chatbot-id={ZAPIER_INTAKE_CHATBOT_ID}
                              is-popup="false"
                              style={{ display: "block", width: "100%", height: "100%" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Required records</p>
                          <h3 className="text-xl font-black text-slate-900 mt-2">Military records checklist</h3>
                        </div>
                        <button
                          onClick={() => setActiveView("welcome_guide")}
                          className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:border-slate-400 transition-colors"
                        >
                          Return to Claim Home
                        </button>
                      </div>

                      <div className="space-y-3">
                        {intakeChecklist.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => applyIntakeRequirementPreset(item)}
                            className={`w-full rounded-2xl border p-4 text-left transition-all ${
                              item.matchedItem
                                ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
                                : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                                  item.matchedItem ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                                }`}
                              >
                                {item.matchedItem ? (
                                  <Icons.CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Icons.FileUp className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-bold text-slate-900">{item.label}</p>
                                  <span
                                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                      item.matchedItem
                                        ? "bg-white text-emerald-700 border border-emerald-200"
                                        : "bg-white text-slate-500 border border-slate-200"
                                    }`}
                                  >
                                    {item.matchedItem ? "Uploaded" : "Needed"}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{item.helper}</p>
                                {item.matchedItem ? (
                                  <p className="mt-3 text-xs font-medium text-emerald-700">
                                    On file: {item.matchedItem.title} · {formatDateTime(item.matchedItem.capturedAt)}
                                  </p>
                                ) : (
                                  <p className="mt-3 text-xs font-medium text-blue-700">
                                    Tap to prefill the uploader for this record type.
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-4 mb-5">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Upload records</p>
                          <h3 className="text-xl font-black text-slate-900 mt-2">Record uploader</h3>
                        </div>
                        <button
                          onClick={() => setActiveView("dossier")}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                        >
                          Open Records Vault <Icons.ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Document title</label>
                          <input
                            value={scannerForm.title}
                            onChange={(e) => handleScannerChange("title", e.target.value)}
                            placeholder="DD-214 or service treatment records"
                            className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                          />
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Condition</label>
                          <select
                            value={scannerForm.condition}
                            onChange={(e) => handleScannerChange("condition", e.target.value)}
                            className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                          >
                            <option value="">General claim record</option>
                            {CONDITION_OPTIONS.map((condition) => (
                              <option key={condition} value={condition}>
                                {condition}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Attach document</label>
                        <input
                          ref={scannerFileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          capture="environment"
                          onChange={handleScannerFile}
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        />
                        <p className="text-xs text-slate-400 mt-2">
                          {scannerForm.fileName
                            ? `${scannerForm.fileName} · ${formatFileSize(scannerForm.fileSize)}`
                            : "Choose a PDF or photo. TYFYS will save the text it finds to your Records Vault and add it to your TYFYS file when available."}
                        </p>
                      </div>

                      <div className="mt-4">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes for TYFYS</label>
                        <textarea
                          value={scannerForm.notes}
                          onChange={(e) => handleScannerChange("notes", e.target.value)}
                          rows="4"
                          placeholder="Anything TYFYS should know about this record."
                          className="mt-2 w-full p-3 border rounded-xl bg-slate-50"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 mt-5">
                        <button
                          onClick={handleStartScan}
                          disabled={isScanning || !scannerFile}
                          className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-60"
                        >
                          {isScanning ? "Saving..." : "Upload this record"}
                        </button>
                        <button
                          onClick={() => setActiveView("dossier")}
                          className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:border-slate-400"
                        >
                          Open Records Vault
                        </button>
                      </div>

                      {scanError && <p className="mt-4 text-sm font-medium text-red-600">{scanError}</p>}

                      {recordSyncNotice && (
                        <div
                          className={`mt-4 rounded-2xl border p-4 ${
                            recordSyncNotice.type === "success"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : recordSyncNotice.type === "warning"
                                ? "border-amber-200 bg-amber-50 text-amber-900"
                                : "border-red-200 bg-red-50 text-red-800"
                          }`}
                        >
                          <p className="text-sm font-bold">{recordSyncNotice.text}</p>
                        </div>
                      )}

                      {lastScanResult && (
                        <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Latest upload</p>
                              <p className="font-bold text-slate-900">{lastScanResult.title}</p>
                            </div>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-cyan-700 border border-cyan-200">
                              {lastScanResult.confidence}% text confidence
                            </span>
                          </div>
                          <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white border border-cyan-100 rounded-xl p-4">
                            {lastScanResult.ocrText}
                          </div>
                          {lastScanResult.crmSync?.status === "synced" && (
                            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-700">
                              Sent to your TYFYS file
                            </p>
                          )}
                          {lastScanResult.crmSync?.status === "failed" && (
                            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-red-700">
                              Saved on this device. TYFYS file update pending.
                            </p>
                          )}
                        </div>
                      )}
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
                    <h3 className="font-bold">Claim Guide</h3>
                  </div>
                  <div className="text-xs bg-white/10 px-2 py-1 rounded">
                    {isMember ? "Unlimited guidance" : `${3 - dailyQuestionCount} guided questions left`}
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
                          See support options for unlimited guidance
                        </button>
                      </div>
                    )}
                  <div className="relative">
                    <input
                      type="text"
                      value={aiBotInput}
                      onChange={(e) => setAiBotInput(e.target.value)}
                      placeholder="Ask Angela about your claim..."
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
              <p className="font-bold text-sm">Angela - TYFYS Guide</p>
              <p className="text-xs text-blue-200">Online | Ready to help</p>
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
              placeholder="Ask Angela about your claim..."
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
