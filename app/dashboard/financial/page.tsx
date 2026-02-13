import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import FinancialSummary from "@/components/financial/FinancialSummary";
import TransactionList from "@/components/financial/TransactionList";
import FinancialManager from "./FinancialManager";
import ReportGenerator from "@/components/financial/ReportGenerator";
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
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Financeiro</h2>
                    </div>
                    <p className="text-gray-500 font-medium max-w-md">Controle o fluxo de caixa, pagamentos e a saúde financeira da sua instituição em tempo real.</p>
                </div>

                <div className="flex items-center bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50">
                    <Link
                        href="/dashboard/financial/payroll"
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-600 rounded-xl text-sm font-bold hover:bg-white hover:text-green-600 hover:shadow-sm transition-all"
                    >
                        <DollarSign className="w-4 h-4" />
                        Folha
                    </Link>
                    <Link
                        href="/dashboard/financial/tuition"
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-600 rounded-xl text-sm font-bold hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                    >
                        <CreditCard className="w-4 h-4" />
                        Mensalidades
                    </Link>
                </div>

                <FinancialManager
                    tenantId={tenantId}
                    categories={categories || []}
                    accounts={accounts}
                    students={students || []}
                    employees={employees || []}
                />

                <ReportGenerator
                    tenantId={tenantId}
                    categories={categories || []}
                />
            </div>


            <FinancialSummary
                income={currentStats.income}
                expenses={currentStats.expense}
                balance={balance}
                incomeTrend={incomeTrend}
                expenseTrend={expenseTrend}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3 space-y-8">
                    <TransactionList
                        transactions={formattedTransactions}
                        categories={categories || []}
                        accounts={accounts}
                        students={students || []}
                        employees={employees || []}
                    />
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Gastos</h3>
                        <p className="text-sm text-gray-500 font-medium">Distribuição por categoria.</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="space-y-8">
                            {topCategories.length > 0 ? (
                                topCategories.map((cat) => (
                                    <div key={cat.name} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{cat.name}</span>
                                                <p className="text-lg font-black text-gray-900 tracking-tight">{formatCurrency(cat.amount)}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                {Math.round((cat.amount / (currentStats.expense || 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                                style={{
                                                    width: `${Math.min((cat.amount / (currentStats.expense || 1)) * 100, 100)}%`,
                                                    backgroundColor: cat.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center space-y-3">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                                        <Filter className="w-6 h-6" />
                                    </div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Sem dados</p>
                                </div>
                            )}
                        </div>

                        <button className="w-full mt-10 py-4 bg-gray-50 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                            Ver todos os detalhes
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}
