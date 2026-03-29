"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCoachId } from "@/hooks/useCoachId";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import { fetchApi } from "@/lib/api";
import EvaluationForm from "@/components/coach/EvaluationForm";

function EvaluateContent() {
    const params = useParams();
    const router = useRouter();
    const coachId = useCoachId();
    // Matches folder name [id]
    const id = (params?.id as string) || (params?.playerId as string);

    const [player, setPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        console.log('[EvaluatePage] params:', params, '=> id:', id, 'coachId:', coachId);
        if (!id) {
            setError('لم يتم تحديد معرّف اللاعب.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        // Fetch player data recursively until coachId is ready if needed, 
        // but here we just pass id. The backend skips role check for admins.
        fetchApi(`/coach/players/${id}?coachId=${coachId || ""}`)
            .then(res => {
                if (res.success) setPlayer(res.data);
                else setError(res.message || 'لم يتم العثور على اللاعب');
            })
            .catch(err => setError(err.message || 'تعذر تحميل بيانات اللاعب'))
            .finally(() => setLoading(false));
    }, [id, coachId]);

    const handleFormSubmit = async (data: any) => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetchApi('/coach/evaluate', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if (res.success) {
                setSuccess(true);
                router.refresh();
                setTimeout(() => router.push(`/coach/evaluations${coachId ? `?coachId=${coachId}` : ""}`), 2000);
            } else {
                throw new Error(res.message || 'فشل الحفظ');
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الإرسال');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#E60000]" />
            <p className="text-slate-500 font-bold">Loading...</p>
        </div>
    );

    if (error || !player) return (
        <div className="p-12 text-center bg-red-50 rounded-2xl border-2 border-red-100 space-y-3">
            <p className="text-2xl">⚠️</p>
            <p className="text-red-700 font-bold text-lg">تعذر تحميل بيانات اللاعب</p>
            <p className="text-red-500 text-sm">{error || "تأكد من صحة المعرّف أو أعد المحاولة"}</p>
            <button
                onClick={() => router.back()}
                className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold"
            >
                <ArrowLeft className="w-4 h-4" /> رجوع
            </button>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
            {/* Player Header */}
            <div className="bg-gradient-to-br from-[#E60000] to-red-800 text-white rounded-3xl p-8 flex items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black shadow-inner">
                    {player.first_name?.[0]}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-black tracking-tight">{player.first_name} {player.last_name}</h1>
                    <p className="text-red-100 text-sm mt-1 font-bold opacity-80">
                        {player.group?.name} • {player.branch?.name}
                    </p>
                </div>
            </div>

            {coachId && (
                <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 px-5 py-4 rounded-2xl flex items-center gap-4 text-sm font-black shadow-md">
                    <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    تحذير: أنت تقوم بالتقييم نيابة عن المدرب (وضع الإدارة).
                </div>
            )}

            {success && (
                <div className="bg-green-600 text-white p-5 rounded-2xl shadow-lg font-black flex items-center justify-center gap-2">
                    ✅ تم إرسال التقييم بنجاح! جاري العودة...
                </div>
            )}

            <EvaluationForm
                playerId={id}
                coachId={coachId || ""}
                onSubmit={handleFormSubmit}
                saving={saving}
            />

            {/* Previous Evaluations */}
            {player.evaluations?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <h3 className="font-black text-slate-800 mb-4">التقييمات السابقة</h3>
                    <div className="space-y-3">
                        {player.evaluations.slice(0, 5).map((ev: any) => (
                            <div key={ev.id} className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-500 font-semibold">
                                        {new Date(ev.date).toLocaleDateString('ar-EG')} • {ev.coach?.full_name}
                                    </span>
                                    <span className="text-sm font-black text-[#E60000]">
                                        متوسط: {Math.round((ev.commitment_score + ev.discipline_score + ev.technical_score + ev.fitness_score) / 4)}/10
                                    </span>
                                </div>
                                {ev.notes && <p className="text-xs text-slate-600">{ev.notes}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EvaluatePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20">
                <div className="text-slate-500 font-bold">Loading...</div>
            </div>
        }>
            <EvaluateContent />
        </Suspense>
    );
}
