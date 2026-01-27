import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Download } from "lucide-react";
import RevenueReport from "@/components/reports/RevenueReport";

export default async function ReportsPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    const { data: transactions } = await supabase
        .from('Transaction')
        .select('*, category:Category(name)')
        .eq('tenantId', tenantId);

    const totalIncomes = transactions?.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
    const totalExpenses = transactions?.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
    const netProfit = totalIncomes - totalExpenses;

    const incomesByCategory = Array.from((transactions || [])
        .filter(t => t.type === 'INCOME')
        .reduce((acc, t) => {
            const name = t.category?.name || 'Geral';
            acc.set(name, (acc.get(name) || 0) + Number(t.amount || 0));
            return acc;
        }, new Map<string, number>())
    ).map(([name, value], idx) => ({
        name,
        value,
        color: ['#0ea5e9', '#d946ef', '#10B981', '#F59E0B', '#6366F1'][idx % 5]
    })).sort((a, b) => b.value - a.value);

    // Monthly data for the last 6 months
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mIdx = d.getMonth();
        const mYear = d.getFullYear();

        const monthlyIncomes = transactions?.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'INCOME' && tDate.getMonth() === mIdx && tDate.getFullYear() === mYear;
        }).reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

        const monthlyExpenses = transactions?.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'EXPENSE' && tDate.getMonth() === mIdx && tDate.getFullYear() === mYear;
        }).reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

        monthlyData.push({
            month: monthNames[mIdx],
            incomes: monthlyIncomes,
            expenses: monthlyExpenses
        });
    }

    const reportData = {
        totalIncomes,
        totalExpenses,
        netProfit,
        incomesByCategory,
        monthlyData
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Análise Institucional</h2>
                    <p className="text-gray-500 text-sm">Visão consolidada do desempenho financeiro e académico.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
                        <Download className="w-4 h-4" />
                        Relatórios Académicos
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                        <Download className="w-4 h-4" />
                        Exportar Anual (PDF)
                    </button>
                </div>
            </div>

            <RevenueReport data={reportData} />
        </div>
    );
}
