"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
            router.push("/login?expired=true");
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (!allowedRoles.includes(user.role)) {
                if (user.role === 'PARENT') router.push('/portal');
                else router.push('/admin/dashboard');
                return;
            }
            setIsAuthorized(true);
        } catch (e) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login?expired=true");
        }
    }, [router, allowedRoles]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#E60000] rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-500">جاري التحقق من الصلاحيات...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
