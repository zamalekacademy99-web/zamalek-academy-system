"use client";
import { useState, useEffect } from "react";
import { CalendarClock, AlertTriangle, Wallet, Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

type Child = {
    id: string;
    first_name: string;
    last_name: string;
    coach: { full_name: string };
    status: string;
    payments: any[];
    group: { name: string; schedules: any[] };
};

type Alert = { type: string, message: string };

export default function PortalDashboard() {
    const [children, setChildren] = useState<Child[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeChildId, setActiveChildId] = useState<string | null>(null);

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
                if (res.data.children.length > 0) {
                    setActiveChildId(res.data.children[0].id);
                }
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

            {/* Sibling Switcher (If > 1 children) */}
            {children.length > 1 && (
                <div className="flex bg-slate-200 p-1 rounded-lg overflow-x-auto hide-scrollbar">
                    {children.map(child => (
                        <button
                            key={child.id}
                            onClick={() => setActiveChildId(child.id)}
                            className={`flex-1 min-w-[100px] text-center text-sm font-bold py-2 px-3 rounded-md transition-all ${activeChildId === child.id
                                ? 'bg-white text-[#E60000] shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300'
                                }`}
                        >
                            {child.first_name}
                        </button>
                    ))}
                </div>
            )}

            {/* Next Session Hero Card (using active child) */}
            {activeChildId ? (() => {
                const activeChild = children.find(c => c.id === activeChildId)!;
                const nextSchedule = activeChild.group?.schedules?.[0]; // Simplification for MVP: picking the first schedule. Proper logic would match day_of_week with today.
                const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

                return (
                    <div className="bg-gradient-to-br from-[#E60000] to-red-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden transition-all duration-300">
                        <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl flex-shrink-0"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm">{activeChild.first_name} {activeChild.last_name}</span>
                                </div>
                                <CalendarClock className="w-6 h-6 text-white/80" />
                            </div>
                            <div>
                                <p className="text-red-100 text-sm font-medium mb-1">المجموعة التدريبية • {activeChild.group?.name || 'غير محدد'}</p>
                                {nextSchedule ? (
                                    <>
                                        <h3 className="text-2xl font-black tracking-tight mb-2">
                                            {DAYS[nextSchedule.day_of_week]} • {nextSchedule.start_time}
                                        </h3>
                                        <p className="text-white/90 text-sm flex items-center gap-1.5 opacity-90">
                                            {nextSchedule.branch?.name} - الملعب: {nextSchedule.field_name || "الرئيسي"} - الكابتن: {nextSchedule.coach?.full_name}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-bold tracking-tight mb-2">لا توجد مواعيد تدريب مسجلة</h3>
                                        <p className="text-white/90 text-sm opacity-90">يرجى مراجعة إدارة الأكاديمية.</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })() : (
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


            {/* Player Progress — Latest Evaluations */}
            {children.some((c: any) => c.evaluations?.length > 0) && (
                <div>
                    <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                        ⭐ تقييم الأداء الأخير
                    </h3>
                    <div className="space-y-4">
                        {children.map((child: any) => {
                            const latestEval = child.evaluations?.[0];
                            if (!latestEval) return null;
                            const avg = Math.round((latestEval.commitment_score + latestEval.discipline_score + latestEval.technical_score + latestEval.fitness_score) / 4);
                            const scoreFields = [
                                { label: "الالتزام", val: latestEval.commitment_score, color: "bg-blue-500" },
                                { label: "الانضباط", val: latestEval.discipline_score, color: "bg-purple-500" },
                                { label: "التقنية", val: latestEval.technical_score, color: "bg-yellow-500" },
                                { label: "اللياقة", val: latestEval.fitness_score, color: "bg-green-500" },
                            ];
                            return (
                                <div key={child.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="font-black text-slate-900">{child.first_name}</p>
                                            <p className="text-xs text-slate-500">
                                                آخر تقييم: {new Date(latestEval.date).toLocaleDateString('ar-EG')} • المدرب: {latestEval.coach?.full_name}
                                            </p>
                                        </div>
                                        <div className="text-center bg-[#E60000]/5 rounded-xl px-4 py-2">
                                            <p className="text-2xl font-black text-[#E60000]">{avg}</p>
                                            <p className="text-[10px] text-slate-500 font-semibold">/ 10</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {scoreFields.map(sf => (
                                            <div key={sf.label}>
                                                <div className="flex justify-between text-xs text-slate-500 mb-1 font-semibold">
                                                    <span>{sf.label}</span>
                                                    <span>{sf.val}/10</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${sf.color} rounded-full transition-all`} style={{ width: `${sf.val * 10}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {latestEval.notes && (
                                        <div className="mt-3 bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
                                            💬 {latestEval.notes}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

        </div>
    );
}
