"use client";

import { useState, useEffect } from "react";
import { Save, AlertCircle, ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
type Branch = { id: string; name: string };
type Group = { id: string; name: string; branch_id: string };
type Coach = { id: string; full_name: string; branch_id: string };

export default function EditPlayerPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const playerId = params.id;

    const [branches, setBranches] = useState<Branch[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        branch_id: "",
        group_id: "",
        coach_id: "",
        status: "ACTIVE"
    });

    useEffect(() => {
        loadData();
    }, [playerId]);

    const loadData = async () => {
        try {
            const [pRes, bRes, gRes, cRes] = await Promise.all([
                fetchApi(`/players/${playerId}`),
                fetchApi("/branches"),
                fetchApi("/groups"),
                fetchApi("/coaches")
            ]);

            const player = pRes.data;
            setFormData({
                first_name: player.first_name,
                last_name: player.last_name || "",
                branch_id: player.branch_id,
                group_id: player.group_id,
                coach_id: player.coach_id || "",
                status: player.status
            });

            setBranches(bRes.data);
            setGroups(gRes.data);
            setCoaches(cRes.data);
        } catch (err: any) {
            setError("حدث خطأ أثناء تحميل بيانات اللاعب.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await fetchApi(`/players/${playerId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            router.push('/admin/players');
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء التحديث.");
            setSaving(false);
        }
    };

    const filteredGroups = groups.filter(g => g.branch_id === formData.branch_id);
    const filteredCoaches = coaches.filter(c => c.branch_id === formData.branch_id);

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل البيانات...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/admin/players" className="p-2 hover:bg-slate-100 rounded-full transition">
                    <ArrowRight className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">تعديل بيانات اللاعب</h1>
                    <p className="text-slate-500 text-sm mt-1">تعديل المجموعة التدريبية أو الفرع أو حالة اللاعب.</p>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">الاسم الأول <span className="text-[#E60000]">*</span></label>
                                <input required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} type="text" className="w-full h-11 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">اسم العائلة <span className="text-[#E60000]">*</span></label>
                                <input required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} type="text" className="w-full h-11 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent transition" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">الفرع <span className="text-[#E60000]">*</span></label>
                                <select required value={formData.branch_id} onChange={e => setFormData({ ...formData, branch_id: e.target.value, group_id: "", coach_id: "" })} className="w-full h-11 px-4 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] transition">
                                    <option value="" disabled>اختر الفرع...</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">المجموعة <span className="text-[#E60000]">*</span></label>
                                <select required value={formData.group_id} onChange={e => setFormData({ ...formData, group_id: e.target.value })} disabled={!formData.branch_id} className="w-full h-11 px-4 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] disabled:bg-gray-100 transition">
                                    <option value="" disabled>اختر المجموعة...</option>
                                    {filteredGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">المدرب المعين <span className="text-[#E60000]">*</span></label>
                                <select required value={formData.coach_id} onChange={e => setFormData({ ...formData, coach_id: e.target.value })} disabled={!formData.branch_id} className="w-full h-11 px-4 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] disabled:bg-gray-100 transition">
                                    <option value="" disabled>اختر المدرب...</option>
                                    {filteredCoaches.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 max-w-xs">
                            <label className="text-sm font-medium text-slate-700 mb-2 block">حالة الاشتراك</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full h-11 px-4 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E60000] transition">
                                <option value="ACTIVE">نشط</option>
                                <option value="INACTIVE">غير نشط / منقطع</option>
                                <option value="SUSPENDED">موقوف</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 rounded-b-lg flex items-center justify-end gap-4">
                        <Link href="/admin/players" className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            إلغاء
                        </Link>
                        <button type="submit" disabled={saving} className="bg-[#E60000] hover:bg-red-700 text-white px-8 py-2.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-75">
                            <Save className="w-4 h-4" />
                            <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
