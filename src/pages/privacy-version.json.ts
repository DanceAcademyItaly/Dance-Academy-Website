import type { APIRoute } from 'astro';
import { privacyVersion } from '../lib/privacyVersion';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(privacyVersion), {
    headers: { 'Content-Type': 'application/json' },
  });
};
