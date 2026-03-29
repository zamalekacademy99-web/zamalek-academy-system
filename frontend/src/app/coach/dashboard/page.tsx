"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Users, ChevronLeft, ShieldAlert } from "lucide-react";
import { fetchApi } from "@/lib/api";

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function CoachDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const coachId = searchParams.get("coachId");

    useEffect(() => {
        const url = coachId ? `/coach/dashboard?coachId=${coachId}` : '/coach/dashboard';
        fetchApi(url)
            .then(res => setData(res.data.coach))
            .catch(err => setError(err.message || 'تعذر تحميل البيانات'))
            .finally(() => setLoading(false));
    }, [coachId]);

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل البيانات...</div>;
    if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">{error}</div>;

    const coach = data;
    const todayIdx = new Date().getDay();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">أهلاً، {coach?.full_name} 👋</h1>
                <p className="text-slate-500 text-sm mt-1">
                    {DAYS[todayIdx]} - فرع <span className="font-semibold text-[#E60000]">{coach?.branch}</span>
                </p>
            </div>

            {coachId && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                    تحذير: أنت تشاهد الآن بوابة المدرب (وضع الإدارة). أي حضور أو تقييم سيتم تسجيله باسم هذا المدرب.
                </div>
            )}

            {/* Today's Sessions */}
            <section>
                <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#E60000]" /> جلسات اليوم
                </h2>
                {coach?.todaySchedules?.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-500">
                        لا توجد جلسات مجدولة اليوم.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coach?.todaySchedules?.map((s: any) => (
                            <div key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-900">{s.group?.name}</p>
                                    <p className="text-sm text-slate-500 mt-1">{s.branch?.name} • {s.start_time} - {s.end_time}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">ملعب: {s.field_name || 'الرئيسي'}</p>
                                </div>
                                <Link
                                    href={`/coach/attendance/${s.group_id}?schedule=${s.id}${coachId ? `&coachId=${coachId}` : ""}`}
                                    className="bg-[#E60000] text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-red-700 transition"
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
                <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#E60000]" /> مجموعاتي
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {coach?.groups?.length === 0 ? (
                        <p className="text-slate-500 text-sm">لم يتم تعيينك لأي مجموعة حتى الآن.</p>
                    ) : (
                        coach?.groups?.map((g: any) => (
                            <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                                <p className="font-bold text-slate-900">{g.name}</p>
                                <p className="text-sm text-slate-500 mt-1">{g.players?.length || 0} لاعب</p>
                                <Link
                                    href={`/coach/attendance/${g.id}${coachId ? `?coachId=${coachId}` : ""}`}
                                    className="mt-4 flex items-center gap-1 text-sm font-bold text-[#E60000] hover:underline"
                                >
                                    تسجيل الحضور <ChevronLeft className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
