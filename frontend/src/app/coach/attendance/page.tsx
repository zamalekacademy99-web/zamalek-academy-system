"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ChevronRight, CalendarDays } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function CoachAttendancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchApi('/coach/dashboard')
            .then(res => setData(res.data.coach))
            .catch(err => setError(err.message || 'تعذر تحميل البيانات'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
            <p className="font-bold text-lg mb-1">⚠️ خطأ في التحميل</p>
            <p className="text-sm">{error}</p>
        </div>
    );

    const groups = data?.groups || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">تسجيل الحضور</h1>
                <p className="text-slate-500 text-sm mt-1">اختر مجموعة لبدء تسجيل حضور اليوم</p>
            </div>

            {groups.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">لم يتم تعيينك لأي مجموعة حتى الآن.</p>
                    <p className="text-slate-400 text-sm mt-1">تواصل مع الإدارة لتعيينك لمجموعة.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {groups.map((group: any) => {
                        const todaySchedule = group.schedules?.find(
                            (s: any) => s.day_of_week === new Date().getDay()
                        );
                        return (
                            <div key={group.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#E60000] to-red-600 px-5 py-4">
                                    <h2 className="text-lg font-black text-white">{group.name}</h2>
                                    <p className="text-red-100 text-sm mt-0.5">
                                        {group.players?.length || 0} لاعب نشط
                                    </p>
                                </div>

                                {/* Body */}
                                <div className="p-5 space-y-4">
                                    {todaySchedule ? (
                                        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2">
                                            <CalendarDays className="w-4 h-4 flex-shrink-0" />
                                            <span className="font-semibold">جلسة اليوم: </span>
                                            <span>{todaySchedule.start_time} - {todaySchedule.end_time}</span>
                                            {todaySchedule.field_name && <span>• {todaySchedule.field_name}</span>}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-slate-50 text-slate-500 text-sm rounded-lg px-3 py-2">
                                            <CalendarDays className="w-4 h-4" />
                                            <span>لا توجد جلسة مجدولة اليوم</span>
                                        </div>
                                    )}

                                    <Link
                                        href={`/coach/attendance/${group.id}${todaySchedule ? `?schedule=${todaySchedule.id}` : ''}`}
                                        className="flex items-center justify-between w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-3 font-bold text-sm transition"
                                    >
                                        <span>فتح ورقة الحضور</span>
                                        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
