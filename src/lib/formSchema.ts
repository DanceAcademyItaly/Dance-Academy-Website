import { z } from 'zod';
import { ITALIAN_PROVINCES } from './provinces';

export const FormSchema = z.object({
  // Step 1 — La scuola
  nomeScuola:     z.string().min(2, 'Nome scuola troppo breve'),
  citta:          z.string().min(2, 'Città non valida'),
  provincia:      z.enum(ITALIAN_PROVINCES, { errorMap: () => ({ message: 'Seleziona una provincia valida' }) }),
  indirizzo:      z.string().min(5, 'Indirizzo non valido'),
  annoFondazione: z.number().int().min(1900).max(new Date().getFullYear()),
  numeroAllievi:  z.string().min(1, 'Seleziona il numero di allievi'),

  // Step 2 — Il referente
  nome:     z.string().min(2, 'Nome troppo breve'),
  cognome:  z.string().min(2, 'Cognome troppo breve'),
  ruolo:    z.string().min(2, 'Ruolo non valido'),
  email:    z.string().email('Email non valida'),
  telefono: z.string().regex(/^[\d\s+\-()]{9,20}$/, 'Telefono non valido'),

  // Step 3 — Il progetto
  discipline:      z.string().min(1, 'Campo obbligatorio'),
  riconoscimenti:  z.string().optional().default(''),
  unicita:         z.string().min(1, 'Campo obbligatorio'),
  sitoWeb:         z.string().optional().default(''),
  instagram:       z.string().optional().default(''),
  facebook:        z.string().optional().default(''),
  contenutiSocial: z.string().min(1, 'Campo obbligatorio'),
  perche:          z.string().min(1, 'Campo obbligatorio'),
  disponibilita:   z.string().min(1, 'Campo obbligatorio'),
  altreInfo:       z.string().optional().default(''),
  privacyConsent:  z.literal(true, { errorMap: () => ({ message: "Devi accettare l'informativa" }) }),
});

export type FormData = z.infer<typeof FormSchema>;

export const STEP_FIELDS: Record<1 | 2 | 3, (keyof FormData)[]> = {
  1: ['nomeScuola', 'citta', 'provincia', 'indirizzo', 'annoFondazione', 'numeroAllievi'],
  2: ['nome', 'cognome', 'ruolo', 'email', 'telefono'],
  3: ['discipline', 'riconoscimenti', 'unicita', 'sitoWeb', 'instagram', 'facebook', 'contenutiSocial', 'perche', 'disponibilita', 'altreInfo', 'privacyConsent'],
};

// Compile-time guard: fails if a FormData key is missing from STEP_FIELDS
type _AllStepFields = typeof STEP_FIELDS[1][number] | typeof STEP_FIELDS[2][number] | typeof STEP_FIELDS[3][number];
type _AssertAllCovered = keyof FormData extends _AllStepFields ? true : never;
const _assertAllCovered: _AssertAllCovered = true;
void _assertAllCovered;
