const ACCOUNT_KEY = 'tyfys.accountState';
const ONBOARDING_KEY = 'tyfys.onboardingState';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const hasWindow = typeof window !== 'undefined';

export const loadAccountState = () => {
  if (!hasWindow) return null;
  return safeParse(window.localStorage.getItem(ACCOUNT_KEY), null);
};

export const saveAccountState = (state) => {
  if (!hasWindow) return;
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(state));
};

export const clearAccountState = () => {
  if (!hasWindow) return;
  window.localStorage.removeItem(ACCOUNT_KEY);
};

export const loadOnboardingState = () => {
  if (!hasWindow) return null;
  return safeParse(window.localStorage.getItem(ONBOARDING_KEY), null);
};

export const saveOnboardingState = (state) => {
  if (!hasWindow) return;
  window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
};

export const clearOnboardingState = () => {
  if (!hasWindow) return;
  window.localStorage.removeItem(ONBOARDING_KEY);
};

export const resetStoredAccount = () => {
  clearAccountState();
  clearOnboardingState();
};
