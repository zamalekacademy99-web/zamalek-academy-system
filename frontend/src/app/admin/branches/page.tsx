"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Branch = { id: string; name: string; location: string; is_active: boolean };

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ id: "", name: "", location: "", is_active: true });
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            setLoading(true);
            const res = await fetchApi("/branches");
            setBranches(res.data);
            setError(null);
        } catch (err: any) {
            setError("عذراً، حدث خطأ أثناء تحميل الفروع.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (branch?: Branch) => {
        if (branch) {
            setFormData({
                id: branch.id,
                name: branch.name,
                location: branch.location || "",
                is_active: branch.is_active
            });
            setIsEditing(true);
        } else {
            setFormData({ id: "", name: "", location: "", is_active: true });
            setIsEditing(false);
        }
        setIsFormOpen(true);
        setSuccess(null);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Frontend validation
        if (!formData.name.trim()) {
            setError("يرجى إدخال اسم الفرع، هذا الحقل مطلوب.");
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (isEditing) {
                await fetchApi(`/branches/${formData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ name: formData.name, location: formData.location || "", is_active: formData.is_active })
                });
                setSuccess("تم تحديث الفرع بنجاح.");
            } else {
                await fetchApi("/branches", {
                    method: 'POST',
                    body: JSON.stringify({ name: formData.name, location: formData.location || "" }) // Fallback to empty string
                });
                setSuccess("تم إضافة الفرع بنجاح.");
            }
            setIsFormOpen(false);
            loadBranches();
        } catch (err: any) {
            // Display backend exact error
            setError(err.message || "حدث خطأ أثناء الحفظ. تأكد من عمل الخادم المركزي.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من إيقاف هذا الفرع؟")) return;
        try {
            await fetchApi(`/branches/${id}`, { method: 'DELETE' });
            setSuccess("تم إيقاف الفرع بنجاح.");
            loadBranches();
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء الحذف.");
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">إدارة الفروع</h1>
                    <p className="text-slate-500 text-sm mt-1">عرض وإدارة فروع الأكاديمية والمقرات التدريبية.</p>
                </div>

                {!isFormOpen && (
                    <button
                        onClick={() => handleOpenForm()}
                        className="bg-[#E60000] hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة فرع جديد</span>
                    </button>
                )}
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold">{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold">{success}</span>
                </div>
            )}

            {/* Form Area */}
            {isFormOpen && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">{isEditing ? "تعديل فرع" : "إضافة فرع جديد"}</h2>

                    <div className="mb-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-md border border-slate-100">
                        الحقول التي تحتوي على (<span className="text-[#E60000]">*</span>) هي حقول إجبارية.
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">
                                    اسم الفرع <span className="text-[#E60000] text-lg leading-none">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="مثال: فرع طنطا (الاستاد)"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-[#E60000] focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-xs text-slate-400">الاسم الذي سيظهر في جميع أجزاء النظام.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">
                                    الموقع / العنوان <span className="text-slate-400 font-normal text-xs">(اختياري)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="مثال: شارع النادي، بجوار بوابة 1"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-[#E60000] focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-xs text-slate-400">إذا لم يتوفر عنوان الآن، يمكنك تركه فارغاً.</p>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-md border border-slate-100">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 accent-[#E60000]"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer">تصنيف هذا الفرع كفرع نشط حالياً</label>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-bold transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-2.5 bg-[#E60000] text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-bold transition-colors"
                            >
                                {saving ? "جاري الحفظ..." : "حفظ بيانات الفرع"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Area */}
            {!isFormOpen && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500 font-medium">جاري تحميل الفروع...</div>
                    ) : branches.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">لا توجد فروع مسجلة</h3>
                            <p className="text-sm text-slate-500 max-w-sm">لم يتم إضافة أي مقرات أو فروع للنظام حتى الآن. يجب إضافة فرع واحد على الأقل لكي تعمل باقي أجزاء النظام.</p>
                            <button
                                onClick={() => handleOpenForm()}
                                className="mt-4 bg-white border border-[#E60000] text-[#E60000] hover:bg-red-50 px-6 py-2 rounded-md text-sm font-bold transition-colors"
                            >
                                إضافة الفرع الأول
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-right text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">اسم الفرع</th>
                                    <th className="px-6 py-4">العنوان المرفق</th>
                                    <th className="px-6 py-4">حالة العمل</th>
                                    <th className="px-6 py-4">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {branches.map((branch) => (
                                    <tr key={branch.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{branch.name}</td>
                                        <td className="px-6 py-4">{branch.location || <span className="text-slate-400 italic">بدون عنوان</span>}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${branch.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {branch.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <button
                                                onClick={() => handleOpenForm(branch)}
                                                className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                                title="تعديل"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(branch.id)}
                                                className="text-red-600 hover:text-red-800 p-2 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                                title="إيقاف الفرع"
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
