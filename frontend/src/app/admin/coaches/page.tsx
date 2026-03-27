"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Branch = { id: string; name: string };
type Coach = { id: string; full_name: string; phone: string; branch_id: string; is_active: boolean; branch: Branch };

export default function CoachesPage() {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ id: "", full_name: "", phone: "", branch_id: "", is_active: true });
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [cRes, bRes] = await Promise.all([
                fetchApi("/coaches"),
                fetchApi("/branches")
            ]);
            setCoaches(cRes.data);
            setBranches(bRes.data);
            setError(null);
        } catch (err: any) {
            setError("عذراً، حدث خطأ أثناء تحميل البيانات.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (coach?: Coach) => {
        if (coach) {
            setFormData({ id: coach.id, full_name: coach.full_name, phone: coach.phone, branch_id: coach.branch_id, is_active: coach.is_active });
            setIsEditing(true);
        } else {
            setFormData({ id: "", full_name: "", phone: "", branch_id: branches[0]?.id || "", is_active: true });
            setIsEditing(false);
        }
        setIsFormOpen(true);
        setSuccess(null);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (isEditing) {
                await fetchApi(`/coaches/${formData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ full_name: formData.full_name, phone: formData.phone, branch_id: formData.branch_id, is_active: formData.is_active })
                });
                setSuccess("تم تحديث المدرب بنجاح.");
            } else {
                await fetchApi("/coaches", {
                    method: 'POST',
                    body: JSON.stringify({ full_name: formData.full_name, phone: formData.phone, branch_id: formData.branch_id })
                });
                setSuccess("تم إضافة المدرب بنجاح.");
            }
            setIsFormOpen(false);
            const cRes = await fetchApi("/coaches");
            setCoaches(cRes.data);
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">إدارة المدربين</h1>
                    <p className="text-slate-500 text-sm mt-1">سجل المدربين والأجهزة الفنية بكل فرع.</p>
                </div>

                {!isFormOpen && (
                    <button
                        onClick={() => handleOpenForm()}
                        className="bg-[#E60000] hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة مدرب جديد</span>
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}
            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {success}
                </div>
            )}

            {isFormOpen && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">{isEditing ? "تعديل بيانات مدرب" : "إضافة مدرب جديد"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم بالكامل</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#E60000] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">الهاتف</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#E60000] outline-none text-left"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">الفرع الأساسي</label>
                                <select
                                    required
                                    value={formData.branch_id}
                                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#E60000] outline-none"
                                >
                                    <option value="" disabled>اختر الفرع</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active" className="text-sm text-slate-700">المدرب نشط</label>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-[#E60000] text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                            >
                                {saving ? "جاري الحفظ..." : "حفظ بيانات المدرب"}
                            </button>
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
