import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import FinancialSummary from "@/components/financial/FinancialSummary";
import TransactionList from "@/components/financial/TransactionList";
import FinancialManager from "./FinancialManager";
import { Download, Filter, DollarSign, CreditCard, Landmark } from "lucide-react";
import Link from "next/link";
import { getAccounts } from "@/lib/actions/accounts";

export default async function FinancialPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    const { data: transactions } = await supabase
        .from('Transaction')
        .select('*, category:Category(*), student:Student(name), employee:Employee(name)')
        .eq('tenantId', tenantId)
        .order('date', { ascending: false });

    const formattedTransactions = (transactions || []).map((t) => ({
        ...t,
        type: t.type as "INCOME" | "EXPENSE"
    }));

    const { data: categories } = await supabase
        .from('Category')
        .select('*')
        .eq('tenantId', tenantId);

    const { data: accountsRaw } = await getAccounts(tenantId);
    const accounts = accountsRaw || [];

    const { data: students } = await supabase
        .from('Student')
        .select('id, name')
        .eq('tenantId', tenantId)
        .eq('status', 'ACTIVE');

    const { data: employees } = await supabase
        .from('Employee')
        .select('id, name')
        .eq('tenantId', tenantId)
        .eq('status', 'ACTIVE');

    // Date Ranges
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const getTotals = (start: Date, end: Date) => {
        const periodTransactions = formattedTransactions.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });
        return {
            income: periodTransactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0),
            expense: periodTransactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0)
        };
    };

    const currentStats = getTotals(currentMonthStart, currentMonthEnd);
    const prevStats = getTotals(prevMonthStart, prevMonthEnd);

    const calculateTrend = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    const incomeTrend = calculateTrend(currentStats.income, prevStats.income);
    const expenseTrend = calculateTrend(currentStats.expense, prevStats.expense);
    const balance = currentStats.income - currentStats.expense;

    const categoryStats = formattedTransactions
        .filter((t) => t.type === "EXPENSE" && t.category)
        .reduce((acc, t) => {
            const catName = (t as any).category!.name;
            const color = (t as any).category!.color || '#3B82F6';

            if (!acc[catName]) {
                acc[catName] = { amount: 0, color };
            }
            acc[catName].amount += (t.amount as number);
            return acc;
        }, {} as Record<string, { amount: number; color: string }>);

    const topCategories = Object.entries(categoryStats)
        .map(([name, data]: [string, any]) => ({ name, amount: data.amount, color: data.color }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Gestão Financeira</h2>
                    <p className="text-gray-500">Acompanhe o fluxo de caixa e a saúde financeira da sua escola.</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/dashboard/financial/payroll"
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Folha de Pagamento
                    </Link>
                    <Link
                        href="/dashboard/financial/tuition"
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Mensalidades
                    </Link>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                        Relatórios
                    </button>
                    <FinancialManager
                        tenantId={tenantId}
                        categories={categories || []}
                        accounts={accounts}
                        students={students || []}
                        employees={employees || []}
                    />
                </div>
            </div>

            <FinancialSummary
                income={currentStats.income}
                expenses={currentStats.expense}
                balance={balance}
                incomeTrend={incomeTrend}
                expenseTrend={expenseTrend}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">Últimas Transações</h3>
                        <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors">
                            <Filter className="w-4 h-4" />
                            Filtrar
                        </button>
                    </div>
                    <TransactionList
                        transactions={formattedTransactions}
                        categories={categories || []}
                        accounts={accounts}
                        students={students || []}
                        employees={employees || []}
                    />
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Resumo por Categoria</h3>
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                        <div className="space-y-6">
                            {topCategories.length > 0 ? (
                                topCategories.map((cat) => (
                                    <div key={cat.name} className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-gray-600">{cat.name}</span>
                                            <span className="text-gray-900">{formatCurrency(cat.amount)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${Math.min((cat.amount / (currentStats.expense || 1)) * 100, 100)}%`,
                                                    backgroundColor: cat.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm py-4 text-center">Nenhuma despesa categorizada no momento.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
