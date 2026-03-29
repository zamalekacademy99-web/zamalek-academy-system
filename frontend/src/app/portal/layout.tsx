"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Bell, MessageSquareText, LogOut } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { fetchApi } from "@/lib/api";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [unreadNotifs, setUnreadNotifs] = useState(0);

    const loadNotifs = async () => {
        try {
            const res = await fetchApi('/parent/dashboard');
            setUnreadNotifs(res.data.unread_notifications || 0);
        } catch (e) { }
    };

    useEffect(() => {
        loadNotifs();
        // Refresh every 2 minutes
        const timer = setInterval(loadNotifs, 120000);
        return () => clearInterval(timer);
    }, []);

    const navItems = [
        { name: "الرئيسية", href: "/portal", icon: Home },
        { name: "الأبناء", href: "/portal/children", icon: Users },
        { name: "الطلبات", href: "/portal/actions", icon: MessageSquareText },
        { name: "الإشعارات", href: "/portal/notifications", icon: Bell },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    return (
        <AuthGuard allowedRoles={['PARENT']}>
            <div className="flex flex-col min-h-screen bg-slate-50 rtl:dir-rtl pb-20 md:pb-0">
                {/* Mobile Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
                    <h1 className="text-xl font-black text-[#E60000]">
                        ZAMALEK<span className="text-slate-900 ml-1">ACADEMY</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                            title="تسجيل الخروج"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 ring-2 ring-white shadow-sm">
                            أ
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 w-full max-w-md mx-auto md:max-w-3xl p-4 md:p-6 overflow-x-hidden">
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 pb-safe z-50 md:relative md:border-t-0 md:bg-transparent md:h-0 md:hidden">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const isNotif = item.href === '/portal/notifications';

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative ${isActive ? "text-[#E60000]" : "text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                <div className="relative">
                                    <Icon className={`w-6 h-6 ${isActive ? "fill-red-50 text-[#E60000]" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                                    {isNotif && unreadNotifs > 0 && (
                                        <div className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white"></span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </AuthGuard>
    );
}
