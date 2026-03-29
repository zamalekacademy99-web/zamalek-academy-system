"use client";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Home, ClipboardList, Star, LogOut, ShieldAlert, Bell } from "lucide-react";
import { fetchApi } from "@/lib/api";

// Inner component that uses hooks requiring Suspense
function CoachLayoutInner({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Resolve coachId: URL param first, then localStorage fallback
    const coachIdFromUrl = searchParams.get("coachId") || searchParams.get("adminViewCoachId");
    const [coachId, setCoachId] = useState<string | null>(coachIdFromUrl);

    useEffect(() => {
        if (coachIdFromUrl) {
            // Persist to all storage keys when it arrives via URL
            localStorage.setItem("impersonateCoachId", coachIdFromUrl);
            localStorage.setItem("adminViewCoachId", coachIdFromUrl);
            localStorage.setItem("coachId", coachIdFromUrl);
            setCoachId(coachIdFromUrl);
        } else {
            // Fallback to any stored key (left by login or impersonation)
            const stored =
                localStorage.getItem("impersonateCoachId") ||
                localStorage.getItem("adminViewCoachId") ||
                localStorage.getItem("coachId");
            setCoachId(stored);
        }
    }, [coachIdFromUrl]);

    const [unreadCount, setUnreadCount] = useState(0);
    const [permissions, setPermissions] = useState<any>({});

    const loadCoachContext = async () => {
        try {
            const res = await fetchApi('/coaches/profile');
            if (res.data) {
                setPermissions(res.data.permissions || {});
            }
            // Fetch unread notifications from the generic endpoint
            const notifRes = await fetchApi('/notifications');
            const unread = (notifRes.data || []).filter((n: any) => !n.is_read).length;
            setUnreadCount(unread);
        } catch (e) { }
    };

    useEffect(() => {
        loadCoachContext();
        const timer = setInterval(loadCoachContext, 60000); // Poll every minute
        return () => clearInterval(timer);
    }, []);

    const navItems = [
        { name: "لوحتي", href: "/coach/dashboard", icon: Home },
        { name: "تسجيل الحضور", href: "/coach/attendance", icon: ClipboardList },
        { name: "تقييم اللاعبين", href: "/coach/evaluations", icon: Star },
        ...(permissions.can_manage_payments ? [{ name: "المدفوعات", href: "/coach/payments", icon: ClipboardList }] : []),
        { name: "الإشعارات", href: "/coach/notifications", icon: Bell },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("coachId");
        localStorage.removeItem("impersonateCoachId");
        localStorage.removeItem("adminViewCoachId");
        router.push("/");
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-e border-gray-200 flex flex-col shadow-sm h-screen sticky top-0">
                <div className="h-20 flex items-center justify-center border-b border-gray-100">
                    <div className="text-center">
                        <h1 className="text-xl font-black text-[#E60000]">ZAMALEK</h1>
                        <p className="text-xs font-semibold text-slate-500 tracking-widest">COACH PORTAL</p>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = (item as any).icon;
                        const active = pathname === item.href || pathname.startsWith(item.href + "/") || pathname.startsWith(item.href + "?");
                        const href = coachId ? `${item.href}?coachId=${coachId}` : item.href;
                        const isNotif = item.href === '/coach/notifications';

                        return (
                            <Link
                                key={item.name}
                                href={href}
                                className={`flex items-center justify-between px-4 py-3 rounded-md transition-colors font-medium text-sm ${active ? "bg-red-50 text-[#E60000]" : "text-slate-600 hover:bg-slate-50 hover:text-[#E60000]"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <span>{item.name}</span>
                                </div>
                                {isNotif && unreadCount > 0 && (
                                    <div className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-3 px-4 py-3 text-slate-500 rounded-md hover:bg-red-50 hover:text-red-700 transition text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
                    <h2 className="text-lg font-bold text-slate-800 flex-1">بوابة المدرب</h2>
                    {coachId && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            وضع الإدارة
                        </div>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function CoachLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-[#E60000] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CoachLayoutInner>{children}</CoachLayoutInner>
        </Suspense>
    );
}
