const REMOTE_APP_STATE_ALLOWED_KEYS = [
  "version",
  "savedAt",
  "hasStarted",
  "onboardingComplete",
  "intakeStarted",
  "onboardingStep",
  "userProfile",
  "currentRating",
  "hasSpouse",
  "childCount",
  "claimType",
  "addedClaims",
  "isMember",
  "discountUnlocked",
  "paymentState",
  "dossier",
  "zohoLeadId",
  "zohoCrmModule",
  "claimFlowState"
];

function cloneJson(value) {
  if (typeof value === "undefined") return undefined;
  if (value === null) return null;
  return JSON.parse(JSON.stringify(value));
}

function sanitizeUserProfile(profile) {
  const next = profile && typeof profile === "object" ? { ...profile } : {};
  delete next.website_hp;
  delete next.securityAnswer;
  delete next.appPassword;
  delete next.confirmPassword;
  return next;
}

function sanitizePaymentState(paymentState) {
  if (!paymentState || typeof paymentState !== "object") return null;
  return {
    completed: Boolean(paymentState.completed),
    planName: String(paymentState.planName || ""),
    planCode: String(paymentState.planCode || ""),
    paidAt: String(paymentState.paidAt || ""),
    selectedServiceProgramId: String(paymentState.selectedServiceProgramId || ""),
    requiresServiceAgreement: Boolean(paymentState.requiresServiceAgreement)
  };
}

function sanitizeRemoteAppState(appState) {
  if (!appState || typeof appState !== "object") return null;

  const source = cloneJson(appState);
  const nextState = {};

  for (const key of REMOTE_APP_STATE_ALLOWED_KEYS) {
    if (typeof source[key] !== "undefined") {
      nextState[key] = source[key];
    }
  }

  if (typeof nextState.userProfile !== "undefined") {
    nextState.userProfile = sanitizeUserProfile(nextState.userProfile);
  }

  if (typeof nextState.paymentState !== "undefined") {
    nextState.paymentState = sanitizePaymentState(nextState.paymentState);
  }

  return Object.keys(nextState).length ? nextState : null;
}

module.exports = {
  REMOTE_APP_STATE_ALLOWED_KEYS,
  sanitizePaymentState,
  sanitizeRemoteAppState,
  sanitizeUserProfile
};
