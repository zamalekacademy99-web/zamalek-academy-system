"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2, ExternalLink } from "lucide-react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

type Branch = { id: string; name: string };
type Coach = { id: string; full_name: string; phone: string; branch_id: string; is_active: boolean; branch: Branch; groups?: { id: string; name: string }[] };

export default function CoachesPage() {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        full_name: "",
        phone: "",
        branch_id: "",
        is_active: true,
        group_ids: [] as string[]
    });
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [groups, setGroups] = useState<{ id: string; name: string; branch_id: string }[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [cRes, bRes, gRes] = await Promise.all([
                fetchApi("/coaches"),
                fetchApi("/branches"),
                fetchApi("/groups")
            ]);
            setCoaches(cRes.data);
            setBranches(bRes.data);
            setGroups(gRes.data);
            setError(null);
        } catch (err: any) {
            setError("عذراً، حدث خطأ أثناء تحميل البيانات.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (coach?: Coach) => {
        if (coach) {
            setFormData({
                id: coach.id,
                full_name: coach.full_name,
                phone: coach.phone,
                branch_id: coach.branch_id,
                is_active: coach.is_active,
                group_ids: coach.groups ? coach.groups.map(g => g.id) : []
            });
            setIsEditing(true);
        } else {
            setFormData({
                id: "",
                full_name: "",
                phone: "",
                branch_id: branches[0]?.id || "",
                is_active: true,
                group_ids: []
            });
            setIsEditing(false);
        }
        setIsFormOpen(true);
        setSuccess(null);
        setError(null);
    };

    const handleGroupToggle = (groupId: string) => {
        setFormData(prev => ({
            ...prev,
            group_ids: prev.group_ids.includes(groupId)
                ? prev.group_ids.filter(id => id !== groupId)
                : [...prev.group_ids, groupId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                full_name: formData.full_name,
                phone: formData.phone,
                branch_id: formData.branch_id,
                is_active: formData.is_active,
                group_ids: formData.group_ids
            };

            if (isEditing) {
                await fetchApi(`/coaches/${formData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                setSuccess("تم تحديث المدرب بنجاح.");
            } else {
                await fetchApi("/coaches", {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                setSuccess("تم إضافة المدرب بنجاح.");
            }
            setIsFormOpen(false);
            loadData();
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء الحفظ.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من إيقاف هذا المدرب؟")) return;
        try {
            await fetchApi(`/coaches/${id}`, { method: 'DELETE' });
            setSuccess("تم إيقاف المدرب بنجاح.");
            const cRes = await fetchApi("/coaches");
            setCoaches(cRes.data);
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء الحذف.");
        }
    };

    const currentBranchGroups = groups.filter(g => g.branch_id === formData.branch_id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">إدارة المدربين <span className="text-[#E60000] text-sm font-bold bg-red-50 px-2 py-1 rounded ml-2">v1.7.0</span></h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">سجل المدربين والمجموعات المسئولين عنها بكل فرع.</p>
                </div>

                {!isFormOpen && (
                    <button
                        onClick={() => handleOpenForm()}
                        className="bg-[#E60000] hover:bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-black transition-all shadow-xl shadow-red-100 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة مدرب جديد</span>
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border-2 border-red-100 font-bold">{error}</div>}
            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border-2 border-green-100 flex items-center gap-3 font-bold animate-in fade-in">
                    <CheckCircle2 className="w-6 h-6" />
                    {success}
                </div>
            )}

            {isFormOpen && (
                <div className="bg-white p-8 rounded-[32px] border-2 border-slate-50 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/50 rounded-bl-full -z-0" />

                    <h2 className="text-xl font-black text-slate-800 mb-8 border-b border-slate-50 pb-4 relative z-10">
                        {isEditing ? "تعديل بيانات مدرب" : "إضافة مدرب جديد"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10 text-right" dir="rtl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-black text-slate-500 mr-2">الاسم بالكامل <span className="text-[#E60000]">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-bold text-slate-800 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-black text-slate-500 mr-2">الهاتف <span className="text-[#E60000]">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-bold text-slate-800 transition-all text-left"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-black text-slate-500 mr-2">الفرع الأساسي <span className="text-[#E60000]">*</span></label>
                                <select
                                    required
                                    value={formData.branch_id}
                                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value, group_ids: [] })}
                                    className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#E60000] focus:bg-white outline-none font-bold text-slate-800 transition-all"
                                >
                                    <option value="" disabled>اختر الفرع</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-black text-slate-800 mr-2">المجموعات المسئول عنها (المجموعات المعينة)</label>
                            {!formData.branch_id ? (
                                <div className="p-10 border-2 border-dashed border-slate-100 rounded-2xl text-center bg-slate-50">
                                    <p className="text-slate-400 font-bold">يرجى اختيار الفرع أولاً لعرض المجموعات.</p>
                                </div>
                            ) : currentBranchGroups.length === 0 ? (
                                <div className="p-10 border-2 border-dashed border-slate-100 rounded-2xl text-center bg-slate-50">
                                    <p className="text-slate-400 font-bold">لا توجد مجموعات في هذا الفرع حالياً.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                                    {currentBranchGroups.map(group => (
                                        <button
                                            key={group.id}
                                            type="button"
                                            onClick={() => handleGroupToggle(group.id)}
                                            className={`p-3 rounded-xl border-2 text-sm font-bold transition-all text-center ${formData.group_ids.includes(group.id)
                                                    ? "border-[#E60000] bg-red-50 text-[#E60000]"
                                                    : "border-slate-50 bg-white text-slate-600 hover:border-slate-200"
                                                }`}
                                        >
                                            {group.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-200 text-[#E60000] focus:ring-[#E60000]"
                                />
                                <label htmlFor="is_active" className="text-sm font-black text-slate-600 cursor-pointer">الحالة: مدرب نشط</label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-8 h-12 text-slate-400 font-black hover:text-slate-900 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-10 h-12 bg-[#E60000] hover:bg-black text-white rounded-xl font-black text-base transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-red-100"
                                >
                                    {saving ? "جاري الحفظ..." : "حفظ بيانات المدرب"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {!isFormOpen && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">جاري تحميل المدربين...</div>
                    ) : coaches.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">لا يوجد مدربين مسجلين حتى الآن. ابدأ بإضافة مدرب.</div>
                    ) : (
                        <table className="w-full text-right text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">اسم المدرب</th>
                                    <th className="px-6 py-4">الهاتف</th>
                                    <th className="px-6 py-4">الفرع</th>
                                    <th className="px-6 py-4">المجموعات المعينة</th>
                                    <th className="px-6 py-4">الحالة</th>
                                    <th className="px-6 py-4">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {coaches.map((coach) => (
                                    <tr key={coach.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{coach.full_name}</td>
                                        <td className="px-6 py-4" dir="ltr">{coach.phone}</td>
                                        <td className="px-6 py-4 text-[#E60000] font-medium">{coach.branch?.name}</td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                            {coach.groups && coach.groups.length > 0
                                                ? coach.groups.map(g => g.name).join("، ")
                                                : <span className="text-slate-400">بدون مجموعات</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${coach.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {coach.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <button
                                                onClick={() => handleOpenForm(coach)}
                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                title="تعديل"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <Link
                                                href={`/admin/coaches/${coach.id}`}
                                                className="text-slate-500 hover:text-slate-700 p-1"
                                                title="عرض الملف الشخصي"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(coach.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="إيقاف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
