const CONSENT_KEY = 'da_cookie_consent';
const CONSENT_TTL_MS = 6 * 30 * 24 * 60 * 60 * 1000; // 6 mesi

export type ConsentValue = 'accepted' | 'rejected';

interface ConsentRecord {
  value: ConsentValue;
  timestamp: number;
}

function readConsent(): ConsentValue | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const record: ConsentRecord = JSON.parse(raw);
    if (Date.now() - record.timestamp > CONSENT_TTL_MS) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return record.value;
  } catch {
    return null;
  }
}

function writeConsent(value: ConsentValue): void {
  const record: ConsentRecord = { value, timestamp: Date.now() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  window.DA_CONSENT = value;
  window.dispatchEvent(new CustomEvent('da:consent-change', { detail: { value } }));
}

export function isYouTubeAllowed(): boolean {
  return readConsent() === 'accepted';
}

export function hasConsented(): boolean {
  return readConsent() !== null;
}

export function acceptAll(): void {
  writeConsent('accepted');
}

export function rejectAll(): void {
  writeConsent('rejected');
}

const current = readConsent();
window.DA_CONSENT = current ?? undefined;

declare global {
  interface Window {
    DA_CONSENT: ConsentValue | undefined;
    DA_SHOW_BANNER: () => void;
    DA_ACCEPT_ALL: () => void;
  }
}
