"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, Search, Filter, Trash2, Edit } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Player = {
    id: string;
    first_name: string;
    last_name: string;
    status: string;
    branch: { name: string };
    group: { name: string };
};

export default function PlayersDirectoryPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        try {
            setLoading(true);
            const res = await fetchApi("/players");
            setPlayers(res.data);
            setError(null);
        } catch (err: any) {
            setError("عذراً، حدث خطأ أثناء تحميل بيانات اللاعبين.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا اللاعب؟")) return;
        try {
            await fetchApi(`/players/${id}`, { method: 'DELETE' });
            setPlayers(players.filter(p => p.id !== id));
        } catch (err: any) {
            alert("حدث خطأ أثناء الحذف.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">سجل اللاعبين</h1>
                    <p className="text-slate-500 text-sm mt-1">إدارة بيانات المشتركين ومتابعة حالتهم الأكاديمية.</p>
                </div>

                <Link
                    href="/admin/players/new"
                    className="bg-[#E60000] hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>تسجيل لاعب جديد</span>
                </Link>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 flex gap-4 min-w-full overflow-x-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-slate-400 absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم..."
                            className="w-full h-10 rtl:pl-4 rtl:pr-10 ltr:pr-4 ltr:pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E60000]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">جاري تحميل اللاعبين...</div>
                    ) : players.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">لا يوجد لاعبين مسجلين.</div>
                    ) : (
                        <table className="w-full text-right text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">الاسم</th>
                                    <th className="px-6 py-4 whitespace-nowrap">المجموعة</th>
                                    <th className="px-6 py-4 whitespace-nowrap">الفرع</th>
                                    <th className="px-6 py-4 whitespace-nowrap">الحالة</th>
                                    <th className="px-6 py-4 whitespace-nowrap">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {players.map((player) => (
                                    <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3 whitespace-nowrap">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {player.first_name.charAt(0)}
                                            </div>
                                            {player.first_name} {player.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{player.group?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{player.branch?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${player.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {player.status === 'ACTIVE' ? 'نشط' : player.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-4">
                                            <Link href={`/admin/players/${player.id}/edit`} className="text-blue-600 hover:text-blue-800 transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => handleDelete(player.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
