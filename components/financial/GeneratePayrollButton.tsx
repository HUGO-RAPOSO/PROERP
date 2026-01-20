"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { generateMonthlyPayroll } from "@/lib/actions/financial";

export default function GeneratePayrollButton({ tenantId }: { tenantId: string }) {
    const [loading, setLoading] = useState(false);

    async function handleGenerate() {
        setLoading(true);
        const result = await generateMonthlyPayroll(tenantId);
        setLoading(false);

        if (result.success) {
            alert(result.message);
        } else {
            alert(result.error);
        }
    }

    return (
        <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Gerar Folha Mensal
        </button>
    );
}
