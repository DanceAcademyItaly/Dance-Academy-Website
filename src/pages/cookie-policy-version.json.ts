import type { APIRoute } from 'astro';
import { cookiePolicyVersion } from '../lib/cookiePolicyVersion';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(cookiePolicyVersion), {
    headers: { 'Content-Type': 'application/json' },
  });
};
