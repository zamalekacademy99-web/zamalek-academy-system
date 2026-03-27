"use client";
import Link from "next/link";
export default function PortalChildrenPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-slate-900">حسابات الأبناء</h1>
            <p className="text-slate-500 text-sm">اختر حساب لمتابعة تفاصيله.</p>
            <div className="space-y-3 mt-4">
                {/* Mock Children Selection */}
                <Link href="/portal/child/1" className="block bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-red-300">
                    <p className="font-bold text-slate-900">أحمد محمود - ZA-1001</p>
                </Link>
                <Link href="/portal/child/2" className="block bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-red-300">
                    <p className="font-bold text-slate-900">ياسين محمود - ZA-1002</p>
                </Link>
            </div>
        </div>
    );
}
