"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useCoachId } from "@/hooks/useCoachId";
import { CalendarDays, Users, ChevronLeft, ShieldAlert, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function DashboardContent() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const coachId = useCoachId();

    useEffect(() => {
        const url = coachId ? `/coach/dashboard?coachId=${coachId}` : '/coach/dashboard';
        fetchApi(url)
            .then(res => setData(res.data.coach))
            .catch(err => setError(err.message || 'تعذر تحميل البيانات'))
            .finally(() => setLoading(false));
    }, [coachId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#E60000]" />
            <p className="text-slate-500 font-bold">جاري تحميل بيانات المدرب...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-2xl font-bold">
            ⚠️ {error}
        </div>
    );

    const coach = data;
    const todayIdx = new Date().getDay();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900">أهلاً، {coach?.full_name} 👋</h1>
                <p className="text-slate-500 text-sm mt-1 font-semibold">
                    {DAYS[todayIdx]} - فرع <span className="text-[#E60000]">{coach?.branch}</span>
                </p>
            </div>

            {coachId && (
                <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 px-5 py-4 rounded-2xl flex items-center gap-4 text-sm font-black shadow-lg animate-pulse">
                    <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <p>وضع الإدارة: أنت تشاهد الآن بوابة المدرب. سيتم تسجيل أي حضور أو تقييم باسم هذا المدرب.</p>
                </div>
            )}

            {/* Today's Sessions */}
            <section>
                <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-[#E60000]" /> جلسات اليوم
                </h2>
                {coach?.todaySchedules?.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl p-12 text-center">
                        <p className="text-slate-400 font-bold">لا توجد جلسات مجدولة لهذا اليوم.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {coach?.todaySchedules?.map((s: any) => (
                            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex justify-between items-center hover:border-[#E60000]/30 transition-all overflow-hidden group">
                                <div>
                                    <p className="font-black text-lg text-slate-900 group-hover:text-[#E60000] transition-colors">{s.group?.name}</p>
                                    <p className="text-sm text-slate-500 mt-1 font-bold">{s.branch?.name} • {s.start_time} - {s.end_time}</p>
                                    <p className="text-xs text-slate-400 mt-1">ملعب: {s.field_name || 'الرئيسي'}</p>
                                </div>
                                <Link
                                    href={`/coach/attendance/${s.group_id}?schedule=${s.id}${coachId ? `&coachId=${coachId}` : ""}`}
                                    className="bg-[#E60000] text-white text-sm font-black px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-red-700 transition shadow-md active:scale-95"
                                >
                                    حضور <ChevronLeft className="w-4 h-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* My Groups */}
            <section>
                <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#E60000]" /> مجموعاتي
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {coach?.groups?.length === 0 ? (
                        <p className="text-slate-400 font-bold py-4">لم يتم تعيينك لأي مجموعة حتى الآن.</p>
                    ) : (
                        coach?.groups?.map((g: any) => (
                            <div key={g.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <p className="font-black text-slate-900">{g.name}</p>
                                <p className="text-sm text-slate-500 mt-1 font-semibold">{g.players?.length || 0} لاعب</p>
                                <Link
                                    href={`/coach/attendance/${g.id}${coachId ? `?coachId=${coachId}` : ""}`}
                                    className="mt-5 flex items-center gap-1 text-sm font-black text-[#E60000] hover:translate-x-[-4px] transition-transform"
                                >
                                    تسجيل الحضور <ChevronLeft className="w-4 h-4" />
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

export default function CoachDashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
