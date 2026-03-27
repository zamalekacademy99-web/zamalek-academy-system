/**
 * API Utility for Zamalek Academy Frontend
 * Standardized fetch instance pointing to the Backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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
