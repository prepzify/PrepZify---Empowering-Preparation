/**
 * Returns the full URL for a given API path.
 *
 * - In development, the Vite dev-server proxy handles `/api/*` → `localhost:3000`,
 *   so we use relative paths (empty base).
 * - In production (Vercel), the Vite proxy is unavailable, so we prepend
 *   the backend URL set in VITE_API_URL.
 *
 * Usage:
 *   fetch(apiUrl('/api/gemini/generate'), { method: 'POST', ... })
 */
const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') // strip trailing slash
  : '';

export function apiUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}
