import { FormSchema, STEP_FIELDS } from '../lib/formSchema';

const form = document.getElementById('candidatiForm') as HTMLFormElement | null;
if (!form) throw new Error('Form not found');

const feedback = document.getElementById('formFeedback') as HTMLElement;
const steps = form.querySelectorAll<HTMLElement>('.form-step');
let currentStep: 1 | 2 | 3 = 1;

function getStepEl(n: number): HTMLElement | null {
  return form!.querySelector<HTMLElement>(`.form-step[data-step="${n}"]`);
}

function showStep(n: 1 | 2 | 3) {
  steps.forEach(s => { s.style.display = 'none'; });
  const el = getStepEl(n);
  if (el) {
    el.style.display = 'block';
    const first = el.querySelector<HTMLElement>('input, select, textarea');
    first?.focus();
  }
  updateStepIndicator(n);
  currentStep = n;
}

function updateStepIndicator(n: number) {
  const indicators = document.querySelectorAll<HTMLElement>('.step-dot');
  indicators.forEach((dot, i) => {
    dot.classList.toggle('active', i + 1 === n);
    dot.classList.toggle('done', i + 1 < n);
  });
}

function getFieldValue(name: string): string | number {
  const el = form!.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  if (!el) return '';
  const raw = el.value.trim();
  if (name === 'annoFondazione') return raw ? parseInt(raw, 10) : 0;
  return raw;
}

function markInvalid(name: string, msg: string) {
  const el = form!.elements.namedItem(name) as HTMLElement | null;
  el?.classList.add('invalid');
  el?.setAttribute('aria-invalid', 'true');
  el?.setAttribute('title', msg);
}

function clearInvalid(name: string) {
  const el = form!.elements.namedItem(name) as HTMLElement | null;
  el?.classList.remove('invalid');
  el?.removeAttribute('aria-invalid');
  el?.removeAttribute('title');
}

function validateStep(step: 1 | 2 | 3): boolean {
  const fields = STEP_FIELDS[step];
  const partial: Record<string, unknown> = {};
  fields.forEach(f => { partial[f] = getFieldValue(f); });

  const stepSchema = FormSchema.pick(
    Object.fromEntries(fields.map(f => [f, true])) as Record<keyof typeof STEP_FIELDS[typeof step][number], true>
  );

  const result = stepSchema.safeParse(partial);

  fields.forEach(f => clearInvalid(f));

  if (!result.success) {
    result.error.issues.forEach(issue => {
      const name = issue.path[0] as string;
      markInvalid(name, issue.message);
    });
    const firstInvalid = form!.querySelector<HTMLElement>('.invalid');
    firstInvalid?.focus();
    return false;
  }
  return true;
}

function showFeedback(type: 'success' | 'error', msg: string) {
  feedback.className = `form-feedback ${type}`;
  feedback.textContent = msg;
  feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function submitForm() {
  const allData: Record<string, unknown> = {};
  for (const step of [1, 2, 3] as const) {
    STEP_FIELDS[step].forEach(f => { allData[f] = getFieldValue(f); });
  }

  const result = FormSchema.safeParse(allData);
  if (!result.success) {
    showFeedback('error', 'Controlla i dati inseriti e riprova.');
    return;
  }

  const submitBtn = form!.querySelector<HTMLButtonElement>('.submit-button');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Invio in corso…'; }

  const gasUrl = import.meta.env.PUBLIC_GAS_URL as string ?? '';

  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(result.data),
    });
    showFeedback('success', 'Candidatura inviata! Ti contatteremo presto.');
    form!.reset();
    showStep(1);
  } catch {
    showFeedback('error', 'Errore di rete. Riprova tra qualche istante.');
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Invia candidatura'; }
  }
}

// Navigation
form.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-direction]');
  if (!btn) return;
  const dir = btn.dataset.direction;

  if (dir === 'next') {
    if (!validateStep(currentStep)) return;
    if (currentStep < 3) showStep((currentStep + 1) as 1 | 2 | 3);
  } else if (dir === 'prev') {
    if (currentStep > 1) showStep((currentStep - 1) as 1 | 2 | 3);
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep(3)) return;
  await submitForm();
});

// Clear invalid on input
form.addEventListener('input', (e) => {
  const el = e.target as HTMLElement;
  if (el.classList.contains('invalid')) {
    el.classList.remove('invalid');
    el.removeAttribute('aria-invalid');
    el.removeAttribute('title');
  }
});

// Init: hide steps 2 and 3
showStep(1);
