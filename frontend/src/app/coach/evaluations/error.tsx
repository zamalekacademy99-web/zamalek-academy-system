"use client";
import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function EvaluationsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Evaluations Route Error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6 bg-red-50/50 border-2 border-dashed border-red-200 rounded-3xl">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900">حدث خطأ أثناء عرض التقييمات</h2>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    {error.message || "عذراً، واجهنا مشكلة تقنية في تحميل هذه الصفحة."}
                </p>
            </div>
            <button
                onClick={() => reset()}
                className="flex items-center gap-2 bg-[#E60000] text-white px-6 py-3 rounded-xl font-black hover:bg-red-700 transition shadow-lg shadow-red-500/20 active:scale-95"
            >
                <RefreshCcw className="w-4 h-4" />
                إعادة المحاولة
            </button>
        </div>
    );
}
