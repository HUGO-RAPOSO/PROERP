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

    const { data: tenant } = await supabase
        .from('Tenant')
        .select('name')
        .eq('id', tenantId)
        .single();

    const { data: transactions } = await supabase
        .from('Transaction')
        .select(`
            *,
            category:Category(name),
            account:Account(name)
        `)
        .eq('tenantId', tenantId);

    const totalIncomes = transactions?.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
    const totalExpenses = transactions?.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
    const netProfit = totalIncomes - totalExpenses;

    const revenueMap = (transactions || [])
        .filter(t => t.type === 'INCOME')
        .reduce((acc, t) => {
            const name = (t.category as any)?.name || 'Geral';
            acc.set(name, (acc.get(name) || 0) + Number(t.amount || 0));
            return acc;
        }, new Map<string, number>());

    const incomesByCategory = Array.from(revenueMap).map((entry, idx) => {
        const [name, value] = entry as [string, number];
        return {
            name,
            value: Number(value),
            color: ['#0ea5e9', '#d946ef', '#10B981', '#F59E0B', '#6366F1'][idx % 5]
        };
    }).sort((a, b) => b.value - a.value);

    // Monthly data for the last 6 months
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData: { month: string; incomes: number; expenses: number }[] = [];
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
            incomes: Number(monthlyIncomes),
            expenses: Number(monthlyExpenses)
        });
    }

    const reportData = {
        totalIncomes: Number(totalIncomes),
        totalExpenses: Number(totalExpenses),
        netProfit: Number(netProfit),
        incomesByCategory,
        monthlyData,
        transactions: (transactions || []).map(t => ({
            ...t,
            categoryName: (t.category as any)?.name || 'Geral',
            accountName: (t.account as any)?.name || 'N/A',
            status: t.status || 'CONCLUÍDO'
        }))
    };

    tenantName: tenant?.name || 'Minha Instituição'
};

return (
    <RevenueReport data={reportData} />
);
}
