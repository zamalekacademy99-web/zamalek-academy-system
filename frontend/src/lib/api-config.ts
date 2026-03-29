/**
 * Emergency API Configuration
 * Hardcoded to ensure frontend connects to the production backend
 * even if Vercel environment variables are failing.
 */
export const API_CONFIG = {
    // HARDCODED PRODUCTION BACKEND URL
    BASE_URL: "https://zamalek-academy-system-production.up.railway.app/api/v1"
};
