"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Loader2, Users } from "lucide-react";

export default function PortalChildrenPage() {
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadChildren = async () => {
            try {
                const res = await fetchApi('/parent/children');
                setChildren(res.data || []);
            } catch (err) {
                console.error('Failed to load children:', err);
            } finally {
                setLoading(false);
            }
        };
        loadChildren();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#E60000] mb-4" />
                <p className="text-slate-500 font-medium text-sm">جاري تحميل القائمة...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 text-[#E60000] rounded-lg">
                    <Users className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-black text-slate-900">حسابات الأبناء</h1>
            </div>

            <p className="text-slate-500 text-sm font-semibold">اختر حساب لمتابعة تفاصيله ومستوى التقدم.</p>

            <div className="space-y-3 mt-4">
                {children.length > 0 ? (
                    children.map(child => (
                        <Link
                            key={child.id}
                            href={`/portal/child/${child.id}`}
                            className="block bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#E60000] transition-all active:scale-95 group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-black text-slate-900 group-hover:text-[#E60000] transition-colors">{child.first_name} {child.last_name}</p>
                                    <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{child.group?.name || 'بدون مجموعة'} • {child.branch?.name}</p>
                                </div>
                                <div className="text-xs font-black px-3 py-1 bg-slate-100 rounded-lg text-slate-600">
                                    ZA-{child.id.substring(0, 4).toUpperCase()}
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
                        <p className="text-slate-500 font-black text-sm">لا يوجد أبناء مسجلين بحسابك.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
