/**
 * API Utility for Zamalek Academy Frontend
 * Reads NEXT_PUBLIC_API_URL from environment — set this in Vercel to your Railway URL.
 *
 * Expected format:  https://your-app.railway.app/api/v1
 * Fallback (local): http://localhost:8000/api/v1
 */

// Remove any trailing slash from the base URL
const rawBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/+$/, '');

// If someone set the var to just the host (e.g. https://xyz.railway.app), append /api/v1
const API_BASE_URL = rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    // Normalize endpoint — ensure exactly one leading slash, strip accidental /api/v1 prefix
    const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${normalized}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    console.log(`[API] ${options.method || 'GET'} ${url}`);
    console.log(`[API] Base used: ${API_BASE_URL}`);
    console.log(`[API] Auth token: ${token ? '✅ present' : '❌ missing'}`);

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
            const errorData = await response.json();
            // Backend returns { status, message } or { success, message }
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            errorMessage = `HTTP ${response.status} — ${response.statusText}`;
        }

        console.error(`[API] ❌ Error on ${url}: ${errorMessage}`);
        throw new Error(errorMessage);
    }

    return response.json();
}
