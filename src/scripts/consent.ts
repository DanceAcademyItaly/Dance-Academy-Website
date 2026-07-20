const CONSENT_KEY = 'da_cookie_consent';
const CONSENT_TTL_MS = 6 * 30 * 24 * 60 * 60 * 1000; // 6 mesi

export type ConsentValue = 'accepted' | 'rejected';

interface ConsentRecord {
  value: ConsentValue;
  timestamp: number;
  id: string;
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

// Log server-side dell'evento di consenso, a fini di accountability (art. 5(2)/7(1) GDPR).
// Fire-and-forget: non deve mai bloccare o ritardare lo sblocco di YouTube per l'utente.
// L'id è generato una sola volta per QUESTO evento di consenso (non sopravvive al TTL) e non
// viene mai riusato per altri scopi (analytics, correlazione col form, ecc.) — vedi Cookie Policy.
function logConsentEvent(value: ConsentValue, id: string): void {
  const url = import.meta.env.PUBLIC_GAS_CONSENT_LOG_URL as string | undefined;
  if (!url) return;

  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      keepalive: true,
      body: JSON.stringify({ value, id, userAgent: navigator.userAgent }),
    }).catch(() => {});
  } catch {
    // best-effort: un fallimento qui non deve mai impedire il consenso locale
  }
}

function writeConsent(value: ConsentValue): void {
  const id = crypto.randomUUID();
  const record: ConsentRecord = { value, timestamp: Date.now(), id };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  window.DA_CONSENT = value;
  window.dispatchEvent(new CustomEvent('da:consent-change', { detail: { value } }));
  logConsentEvent(value, id);
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
