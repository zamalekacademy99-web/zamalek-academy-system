"use client";
import { useState } from "react";
import { Star } from "lucide-react";

const CRITERIA = [
    { key: "commitment_score", label: "الالتزام والانضباط" },
    { key: "discipline_score", label: "الدقة والتطبيق" },
    { key: "technical_score", label: "المهارات التقنية" },
    { key: "fitness_score", label: "اللياقة البدنية" },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1.5 justify-center flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(i)}
                    className={`transition-all active:scale-95 ${(hover || value) >= i ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}
                >
                    <Star className="w-7 h-7 fill-current" />
                </button>
            ))}
        </div>
    );
}

interface EvaluationFormProps {
    playerId: string;
    coachId: string;
    onSubmit: (data: any) => Promise<void>;
    saving: boolean;
    initialData?: any;
}

export default function EvaluationForm({ playerId, coachId, onSubmit, saving, initialData }: EvaluationFormProps) {
    const [scores, setScores] = useState({
        commitment_score: initialData?.commitment_score || 5,
        discipline_score: initialData?.discipline_score || 5,
        technical_score: initialData?.technical_score || 5,
        fitness_score: initialData?.fitness_score || 5,
    });
    const [notes, setNotes] = useState(initialData?.notes || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            player_id: playerId,
            coach_id: coachId,
            ...scores,
            notes,
            date: new Date().toISOString().split('T')[0]
        });
    };

    const avgScore = Math.round(Object.values(scores).reduce((a: any, b: any) => a + b, 0) / 4);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                <div className="p-4 bg-slate-50 flex justify-between items-center px-6">
                    <span className="font-bold text-slate-500 text-sm">متوسط التقييم الحالي</span>
                    <span className="text-2xl font-black text-[#E60000]">{avgScore}/10</span>
                </div>

                {CRITERIA.map(c => (
                    <div key={c.key} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <label className="font-black text-slate-800 text-base">{c.label}</label>
                            <span className="text-xl font-black text-[#E60000] bg-[#E60000]/5 px-3 py-1 rounded-lg">
                                {(scores as any)[c.key]}/10
                            </span>
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
                        placeholder="اكتب ملاحظاتك عن أداء اللاعب اليوم..."
                        className="w-full border-2 border-slate-100 bg-slate-50 rounded-2xl p-4 text-sm font-semibold focus:ring-2 focus:ring-[#E60000] focus:bg-white focus:border-[#E60000] outline-none transition-all resize-none"
                    />
                </div>

                <div className="p-6 bg-slate-50 flex justify-end">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-[#E60000] text-white px-12 py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition shadow-xl hover:shadow-red-500/20 active:scale-95 disabled:opacity-50 w-full md:w-auto"
                    >
                        {saving ? 'جاري الإرسال...' : 'حفظ وإرسال التقييم 🔥'}
                    </button>
                </div>
            </div>
        </div>
    );
}
