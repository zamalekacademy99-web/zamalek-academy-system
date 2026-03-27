"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Users, Home, CalendarDays, Wallet, UserCircle, Settings, ClipboardList
} from "lucide-react";

export default function Sidebar() {
    const router = useRouter();

    const navItems = [
        { name: "الرئيسية", href: "/admin/dashboard", icon: Home },
        { name: "اللاعبين", href: "/admin/players", icon: Users },
        { name: "الفروع والمجموعات", href: "/admin/branches", icon: ClipboardList },
        { name: "المدربين", href: "/admin/coaches", icon: UserCircle },
        { name: "الحضور", href: "/admin/attendance", icon: CalendarDays },
        { name: "الجداول", href: "/admin/schedules", icon: CalendarDays },
        { name: "المدفوعات", href: "/admin/payments", icon: Wallet },
        { name: "الإشعارات", href: "/admin/notifications", icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    return (
        <aside className="w-64 bg-white border-e border-gray-200 flex flex-col z-20 shadow-sm h-screen sticky top-0">
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-center border-b border-gray-100">
                <h1 className="text-2xl font-black text-[#E60000] tracking-tight">
                    ZAMALEK<span className="text-slate-900 ml-1">ACADEMY</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-slate-600 rounded-md hover:bg-slate-50 hover:text-[#E60000] transition-colors focus:bg-red-50 focus:text-[#E60000] outline-none"
                        >
                            <Icon className="w-5 h-5 rtl:ml-3 rtl:mr-0 ml-0 mr-3" />
                            <span className="font-medium text-[15px]">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Area / Logout */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-4 py-3 text-slate-600 rounded-md hover:bg-red-50 hover:text-red-700 transition"
                >
                    <span className="font-medium text-[15px]">تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
}
