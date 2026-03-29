"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
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
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(i)}
                    className={`transition-colors ${(hover || value) >= i ? 'text-yellow-400' : 'text-slate-200'}`}
                >
                    <Star className="w-6 h-6 fill-current" />
                </button>
            ))}
        </div>
    );
}

export default function EvaluatePage() {
    const params = useParams();
    const router = useRouter();
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
                    date: new Date().toISOString().split('T')[0],
                    ...scores,
                    notes
                })
            });
            setSuccess(true);
            setTimeout(() => router.push('/coach/dashboard'), 2000);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الإرسال');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل بيانات اللاعب...</div>;
    if (!player) return <div className="p-8 text-center text-red-500">لم يتم العثور على اللاعب.</div>;

    const avgScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 4);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Player Header Card */}
            <div className="bg-gradient-to-br from-[#E60000] to-red-700 text-white rounded-2xl p-6 flex items-center gap-4 shadow-lg">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-black">
                    {player.first_name[0]}
                </div>
                <div>
                    <h1 className="text-2xl font-black">{player.first_name} {player.last_name}</h1>
                    <p className="text-red-100 text-sm mt-0.5">{player.group?.name} • {player.branch?.name}</p>
                </div>
                <div className="ms-auto text-center">
                    <div className="text-4xl font-black">{avgScore}</div>
                    <div className="text-xs text-red-200 font-semibold">/10 متوسط</div>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 font-bold">✅ تم إرسال التقييم بنجاح!</div>}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                {/* Score Criteria */}
                {CRITERIA.map(c => (
                    <div key={c.key} className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <label className="font-semibold text-slate-800 text-sm">{c.label}</label>
                            <span className="text-lg font-black text-[#E60000]">{(scores as any)[c.key]}/10</span>
                        </div>
                        <StarRating
                            value={(scores as any)[c.key]}
                            onChange={(v) => setScores(prev => ({ ...prev, [c.key]: v }))}
                        />
                    </div>
                ))}

                {/* Notes */}
                <div className="p-5">
                    <label className="block font-semibold text-slate-800 text-sm mb-2">ملاحظات المدرب (اختياري)</label>
                    <textarea
                        rows={4}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="اكتب ملاحظاتك عن أداء اللاعب اليوم..."
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#E60000] outline-none resize-none"
                    />
                </div>

                <div className="p-5 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#E60000] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-60"
                    >
                        {saving ? 'جاري الإرسال...' : 'إرسال التقييم'}
                    </button>
                </div>
            </form>
        </div>
    );
}
