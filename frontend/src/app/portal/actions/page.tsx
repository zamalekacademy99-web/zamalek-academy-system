"use client";
import { useState, useEffect } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Child = { id: string; first_name: string; last_name: string };

export default function ActionsPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [formData, setFormData] = useState({
        type: "LEAVE",
        message: "",
        child_id: ""
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        // Load children for the dropdown
        fetchApi('/parent/children').then(res => {
            if (res.data && res.data.length > 0) {
                setChildren(res.data);
                setFormData(prev => ({ ...prev, child_id: res.data[0].id }));
            }
        }).catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            await fetchApi("/notifications/parent-request", {
                method: "POST",
                body: JSON.stringify(formData)
            });
            setStatus({ type: 'success', text: "تم تقديم الطلب بنجاح. سيتم الرد عليك قريباً." });
            setFormData({ ...formData, message: "" });
        } catch (err: any) {
            setStatus({ type: 'error', text: err.message || "حدث خطأ أثناء إرسال الطلب." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">الطلبات والإجراءات</h2>
                <p className="text-sm text-slate-500 mt-1">تواصل مباشرة مع الإدارة لتقديم طلبك بسهولة.</p>
            </div>

            {status && (
                <div className={`p-4 rounded-lg flex gap-2 items-center text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {status.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    {status.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">نوع الطلب <span className="text-[#E60000]">*</span></label>
                    <select required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none">
                        <option value="LEAVE">استئذان / عذر غياب</option>
                        <option value="COMPLAINT">شكوى أو مقترح</option>
                        <option value="FINANCIAL">استفسار مالي</option>
                        <option value="OTHER">أخرى</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">اللاعب المرتبط بالطلب (اختياري)</label>
                    <select value={formData.child_id} onChange={e => setFormData({ ...formData, child_id: e.target.value })} className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none">
                        <option value="">طلب عام (لا يخص لاعب محدد)</option>
                        {children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">تفاصيل الطلب <span className="text-[#E60000]">*</span></label>
                    <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={5} placeholder="اكتب رسالتك والتفاصيل هنا بوضوح وسيقوم المختص بالرد عليك..." className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60000] outline-none resize-none"></textarea>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-[#E60000] hover:bg-red-700 text-white font-bold h-11 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    <span>{loading ? 'جاري الإرسال...' : 'إرسال الطلب'}</span>
                </button>
            </form>
        </div>
    );
}
