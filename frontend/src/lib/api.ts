/**
 * API Utility for Zamalek Academy Frontend
 * Standardized fetch instance pointing to the Backend.
 */

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Auto-correct common Vercel deployment mistake where user forgets to append /api/v1
if (API_BASE_URL.startsWith('http') && !API_BASE_URL.includes('/api/v1')) {
    API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api/v1';
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    // Ensure no double slashes between base and endpoint
    const cleanBase = API_BASE_URL.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${cleanBase}${cleanEndpoint}`;

    // In a real app, you would retrieve the JWT token from cookies/localStorage here
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    console.log(`[API Request] -> ${url}`);
    console.log(`[API Request] Token exists: ${!!token}`);
    console.log(`[API Request] Auth Header sent: ${headers.get('Authorization') || 'None'}`);

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Handle specific errors like 401 Unauthorized
        if (response.status === 401) {
            console.error("Unauthorized access, redirecting to login...");
            // window.location.href = "/login";
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
}
