import { API_CONFIG } from "./api-config";

// Force use of hardcoded production URL for stability
const API_BASE_URL = API_CONFIG.BASE_URL;


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
