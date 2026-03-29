"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, ClipboardList, Star, LogOut } from "lucide-react";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { name: "لوحتي", href: "/coach/dashboard", icon: Home },
        { name: "تسجيل الحضور", href: "/coach/attendance", icon: ClipboardList },
        { name: "تقييم اللاعبين", href: "/coach/evaluations/", icon: Star },
    ];



    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
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
                        const Icon = item.icon;
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-medium text-sm ${active ? 'bg-red-50 text-[#E60000]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#E60000]'}`}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span>{item.name}</span>
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

            {/* Main */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
                    <h2 className="text-lg font-bold text-slate-800">بوابة المدرب</h2>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
