"use client";
import { useState, useEffect } from "react";
import { CalendarClock, AlertTriangle, Wallet, Loader2 } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

type Child = {
    id: string;
    first_name: string;
    last_name: string;
    group: { name: string };
    branch: { name: string };
    coach: { full_name: string };
    status: string;
    payments: any[];
};

type Alert = { type: string, message: string };

export default function PortalDashboard() {
    const [children, setChildren] = useState<Child[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hardcode user name for now as we don't have user context in this simple component,
    // Alternatively, we could fetch /auth/me or pull from localStorage.
    const [userName, setUserName] = useState("ولي الأمر");

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                setUserName(parsed.name || "ولي الأمر");
            } catch (e) { }
        }

        const loadDashboard = async () => {
            try {
                const res = await fetchApi('/parent/dashboard');
                setChildren(res.data.children);
                setAlerts(res.data.alerts);
                setUnreadNotifs(res.data.unread_notifications);
            } catch (err: any) {
                setError(err.message || 'تعذر تحميل بيانات لوحة التحكم');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#E60000] mb-4" />
                <p className="text-slate-500 font-medium">جاري تحديث بيانات الأكاديمية...</p>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
    }

    const firstChild = children[0];

    return (
        <div className="space-y-6 pb-12">
            {/* Welcome Banner */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900">مرحباً، {userName}</h2>
                <p className="text-sm text-slate-500 mt-1">إليك آخر تحديثات أبنائك في الأكاديمية</p>
            </div>

            {/* Alerts */}
            {alerts.map((alert, idx) => (
                <div key={idx} className={`${alert.type === 'ABSENCE' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'} border rounded-xl p-4 flex gap-3 items-start`}>
                    <AlertTriangle className={`w-5 h-5 ${alert.type === 'ABSENCE' ? 'text-orange-500' : 'text-[#E60000]'} shrink-0 mt-0.5`} />
                    <div>
                        <h4 className={`text-sm font-bold ${alert.type === 'ABSENCE' ? 'text-orange-900' : 'text-red-900'}`}>{alert.type === 'ABSENCE' ? 'تنبيه غياب' : 'تنبيه حساب'}</h4>
                        <p className={`text-xs ${alert.type === 'ABSENCE' ? 'text-orange-700' : 'text-red-700'} mt-1`}>{alert.message}</p>
                    </div>
                </div>
            ))}

            {/* Next Session Hero Card (using first child as highlight) */}
            {firstChild ? (
                <div className="bg-gradient-to-br from-[#E60000] to-red-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">{firstChild.first_name} {firstChild.last_name}</span>
                            </div>
                            <CalendarClock className="w-6 h-6 text-white/80" />
                        </div>
                        <div>
                            <p className="text-red-100 text-sm font-medium mb-1">المجموعة التدريبية</p>
                            <h3 className="text-2xl font-black tracking-tight mb-2">{firstChild.group?.name || 'غير محدد'}</h3>
                            <p className="text-white/90 text-sm flex items-center gap-1.5 opacity-90">
                                {firstChild.branch?.name} - {firstChild.coach?.full_name}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
                    <p className="text-slate-500 font-medium text-sm">لا يوجد أبناء مسجلين بحسابك حالياً.</p>
                </div>
            )}

            {/* Kids Quick Access */}
            {children.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">الأبناء المسجلين</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {children.map(child => (
                            <Link key={child.id} href={`/portal/child/${child.id}`} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3 hover:border-red-300 transition-colors shadow-sm active:scale-95">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-full flex items-center justify-center text-lg font-bold text-slate-700 shrink-0">
                                    {child.first_name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-900 text-sm truncate">{child.first_name}</p>
                                    <p className="text-xs text-slate-500">{child.group?.name || '--'}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Financial Pulse */}
            {children.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">الملخص المالي</h3>
                    <div className="space-y-3">
                        {children.map(child => {
                            const lastPayment = child.payments && child.payments.length > 0 ? child.payments[0] : null;
                            const isPaid = !!lastPayment && child.status === 'ACTIVE';

                            return (
                                <Link key={child.id} href={`/portal/financials?child=${child.id}`} className="block bg-white border border-slate-200 rounded-xl p-4 shadow-sm active:scale-95 transition-transform">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${isPaid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                <Wallet className="w-5 h-5" />
                                            </div>
                                            <p className="font-semibold text-slate-800 text-sm">حالة اشتراك {child.first_name}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold rounded ${isPaid ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                                            {isPaid ? 'نشط' : 'متأخر'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-slate-500">آخر دفعة مسجلة</p>
                                            <p className="text-sm font-bold text-slate-900 mt-0.5">
                                                {lastPayment ? new Date(lastPayment.date).toLocaleDateString('ar-EG') : 'لا يوجد'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

        </div>
    );
}
