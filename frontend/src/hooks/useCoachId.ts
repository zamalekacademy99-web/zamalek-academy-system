"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Custom hook to extract coachId for admin impersonation.
 * It checks in order:
 * 1. URL search params (?coachId=...)
 * 2. URL search params (?adminViewCoachId=...) - as requested by user
 * 3. LocalStorage (fallback)
 */
export function useCoachId() {
    const searchParams = useSearchParams();
    const [coachId, setCoachId] = useState<string | null>(null);

    useEffect(() => {
        const idFromUrl = searchParams.get("coachId") || searchParams.get("adminViewCoachId");

        if (idFromUrl) {
            setCoachId(idFromUrl);
            localStorage.setItem("adminViewCoachId", idFromUrl);
        } else {
            const idFromStorage = localStorage.getItem("adminViewCoachId");
            setCoachId(idFromStorage);
        }
    }, [searchParams]);

    return coachId;
}
