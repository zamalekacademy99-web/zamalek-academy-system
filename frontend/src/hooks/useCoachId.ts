"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Resolves the active coachId for the Coach Portal.
 *
 * Priority order:
 *  1. URL ?coachId=...              (admin clicking "Coach Portal" button)
 *  2. URL ?adminViewCoachId=...    (legacy alias)
 *  3. localStorage 'impersonateCoachId'   (admin navigating within the portal)
 *  4. localStorage 'adminViewCoachId'     (legacy alias)
 *  5. localStorage 'coachId'             (coach's own id set during login)
 */
export function useCoachId() {
    const searchParams = useSearchParams();
    const [coachId, setCoachId] = useState<string | null>(null);

    useEffect(() => {
        // 1 & 2: URL params (highest priority — admin just clicked the button)
        const idFromUrl =
            searchParams.get("coachId") ||
            searchParams.get("adminViewCoachId");

        if (idFromUrl) {
            // Persist as the impersonation key so sidebar navigation keeps it
            localStorage.setItem("impersonateCoachId", idFromUrl);
            localStorage.setItem("adminViewCoachId", idFromUrl);
            setCoachId(idFromUrl);
            return;
        }

        // 3 & 4: LocalStorage fallback (admin navigating within portal)
        const impersonated =
            localStorage.getItem("impersonateCoachId") ||
            localStorage.getItem("adminViewCoachId");

        if (impersonated) {
            setCoachId(impersonated);
            return;
        }

        // 5: Coach's own id (set at login for COACH role)
        const ownCoachId = localStorage.getItem("coachId");
        setCoachId(ownCoachId);
    }, [searchParams]);

    return coachId;
}

/**
 * Clears all impersonation state from localStorage.
 * Call this when the admin navigates away from the coach portal.
 */
export function clearImpersonation() {
    localStorage.removeItem("impersonateCoachId");
    localStorage.removeItem("adminViewCoachId");
}
