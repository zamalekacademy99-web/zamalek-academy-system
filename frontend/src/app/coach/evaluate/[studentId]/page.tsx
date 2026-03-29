"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCoachId } from "@/hooks/useCoachId";
import { Star, ShieldAlert, Loader2, Check } from "lucide-react";
import { fetchApi } from "@/lib/api";

const CRITERIA = [
    { key: "commitment_score", label: "الالتزام والانضباط" },
    { key: "discipline_score", label: "الدقة والتطبيق" },
    { key: "technical_score", label: "المهارات التقنية" },
    { key: "fitness_score", label: "اللياقة البدنية" },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1.5 justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(i)}
                    className={`transition-all active:scale-95 ${(hover || value) >= i ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}
                >
                    <Star className="w-8 h-8 fill-current" />
                </button>
            ))}
        </div>
    );
}

function EvaluateContent() {
    const params = useParams();
    const router = useRouter();
    const coachId = useCoachId();
    const studentId = params?.studentId as string;

    const [player, setPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [scores, setScores] = useState({
        commitment_score: 5,
        discipline_score: 5,
        technical_score: 5,
        fitness_score: 5,
    });
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (!studentId) return;
        fetchApi(`/coach/players/${studentId}`)
            .then(res => setPlayer(res.data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [studentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await fetchApi('/coach/evaluate', {
                method: 'POST',
                body: JSON.stringify({
                    player_id: studentId,
                    coach_id: coachId,
                    date: new Date().toISOString().split('T')[0],
                    ...scores,
                    notes
                })
            });
            setSuccess(true);
            setTimeout(() => router.push(`/coach/dashboard${coachId ? `?coachId=${coachId}` : ""}`), 2000);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الإرسال');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#E60000]" />
            <p className="text-slate-500 font-bold">جاري تحميل بيانات اللاعب...</p>
        </div>
    );

    if (!player) return (
        <div className="p-12 text-center text-red-600 font-bold bg-red-50 rounded-2xl border-2 border-red-100">
            ⚠️ تعذر العثور على اللاعب.
        </div>
    );

    const avgScore = Math.round(Object.values(scores).reduce((a: any, b: any) => a + b, 0) / 4);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Player Header Card */}
            <div className="bg-gradient-to-br from-[#E60000] to-red-800 text-white rounded-3xl p-8 flex items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black shadow-inner">
                    {player.first_name?.[0]}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-black tracking-tight">{player.first_name} {player.last_name}</h1>
                    <p className="text-red-100 text-sm mt-1 font-bold opacity-80">{player.group?.name} • {player.branch?.name}</p>
                </div>
                <div className="text-center bg-white/10 rounded-2xl p-4 min-w-[80px]">
                    <div className="text-4xl font-black">{avgScore}</div>
                    <div className="text-[10px] text-red-100 font-black uppercase tracking-wider">متوسط</div>
                </div>
            </div>

            {coachId && (
                <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 px-5 py-4 rounded-2xl flex items-center gap-4 text-sm font-black shadow-md">
                    <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    تحذير: أنت تقوم بالتقييم نيابة عن المدرب (وضع الإدارة).
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-700 p-5 rounded-2xl border-2 border-red-100 font-bold animate-shake">
                    ⚠️ {error}
                </div>
            )}

            {success && (
                <div className="bg-green-600 text-white p-5 rounded-2xl shadow-lg shadow-green-600/20 font-black animate-bounce-in flex items-center justify-center gap-2">
                    ✅ تم إرسال التقييم بنجاح! جاري العودة...
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {CRITERIA.map(c => (
                    <div key={c.key} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <label className="font-black text-slate-800 text-base">{c.label}</label>
                            <span className="text-xl font-black text-[#E60000] bg-[#E60000]/5 px-3 py-1 rounded-lg">{(scores as any)[c.key]}/10</span>
                        </div>
                        <StarRating
                            value={(scores as any)[c.key]}
                            onChange={(v) => setScores(prev => ({ ...prev, [c.key]: v }))}
                        />
                    </div>
                ))}

                <div className="p-6">
                    <label className="block font-black text-slate-800 text-base mb-3">ملاحظات المدرب (اختياري)</label>
                    <textarea
                        rows={4}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="اكتب ملاحظاتك عن أداء اللاعب اليوم ليركبها ولي الأمر..."
                        className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#E60000] focus:bg-white focus:border-[#E60000] outline-none transition-all resize-none"
                    />
                </div>

                <div className="p-6 bg-slate-50 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#E60000] text-white px-12 py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition shadow-xl hover:shadow-red-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? 'جاري الإرسال...' : 'حفظ وإرسال التقييم 🔥'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function EvaluatePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        }>
            <EvaluateContent />
        </Suspense>
    );
}
