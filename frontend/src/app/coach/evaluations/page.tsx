"use client";
import { useState, useEffect, Suspense } from "react";
import { fetchApi } from "@/lib/api";
import { Loader2, User, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import { useCoachId } from "@/hooks/useCoachId";

function EvaluationsListContent() {
    const [loading, setLoading] = useState(true);
    const [coachData, setCoachData] = useState<any>(null);
    const [error, setError] = useState("");
    const coachId = useCoachId();

    useEffect(() => {
        const loadDashboard = async () => {
            // Even if coachId is null initially, useAuth/useCoachId will eventually resolve it
            // or the backend will fall back to the authenticated user's coach profile.
            try {
                const url = coachId ? `/coach/dashboard?coachId=${coachId}` : "/coach/dashboard";
                const res = await fetchApi(url);
                if (res.success) {
                    setCoachData(res.data.coach);
                } else {
                    setError(res.message || "فشل تحميل البيانات");
                }
            } catch (err: any) {
                setError(err.message || "حدث خطأ أثناء تحميل البيانات");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [coachId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#E60000]" />
                <p className="text-slate-500 font-medium">جاري تحميل قائمة اللاعبين...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-2xl text-center max-w-lg mx-auto mt-10">
                <p className="font-bold text-lg mb-2">خطأ في التحميل</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8" dir="rtl">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-black text-slate-900">تقييم اللاعبين</h1>
                <p className="text-slate-500">اختر لاعباً لتقييم أدائه الفني والبدني.</p>
            </div>

            {coachData?.groups.map((group: any) => (
                <div key={group.id} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <div className="w-2 h-6 bg-[#E60000] rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-800">{group.name}</h2>
                        <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {group.players?.length || 0} لاعب
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.players?.map((player: any) => (
                            <Link
                                key={player.id}
                                href={`/coach/evaluations/${player.id}${coachId ? `?coachId=${coachId}` : ""}`}
                                className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-[#E60000] hover:shadow-md transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-[#E60000] transition-colors">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-[#E60000] transition-colors">
                                            {player.first_name} {player.last_name}
                                        </h3>
                                        <p className="text-xs text-slate-500">انقر لبدء التقييم</p>
                                    </div>
                                </div>
                                <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-red-50 transition-colors">
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#E60000] transform rotate-180" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}

            {(!coachData?.groups || coachData.groups.length === 0) && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <Star className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">لا توجد مجموعات مسندة إليك حالياً.</p>
                </div>
            )}
        </div>
    );
}

export default function EvaluationsListPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        }>
            <EvaluationsListContent />
        </Suspense>
    );
}
