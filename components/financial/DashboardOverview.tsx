"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getFinancialSummary, getTransactionsPaginated, getCategoryStats } from "@/lib/actions/financial";
import FinancialSummary from "./FinancialSummary";
import TransactionList from "./TransactionList";
import FinancialManager from "@/app/dashboard/financial/FinancialManager";
import ReportGenerator from "./ReportGenerator";
import { formatCurrency } from "@/lib/utils";
import { Filter, DollarSign, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

interface DashboardOverviewProps {
    tenantId: string;
    categories: any[];
    accounts: any[];
    students: any[];
    employees: any[];
}

export default function DashboardOverview({
    tenantId,
    categories,
    accounts,
    students,
    employees
}: DashboardOverviewProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State
    const [summary, setSummary] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const limit = 10;

    // Filters
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [filterType, setFilterType] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, [page, filterCategory, filterType, searchTerm]); // Re-fetch when dependencies change

    async function fetchData() {
        setLoading(true);
        try {
            // Fetch Summary (only once or periodically, but for now every time is okay or we can separate)
            // Ideally summary should react to filters? The request implies general optimization.
            // Current summary logic in page.tsx was global. Let's keep it global for now or filterable?
            // Usually summary is "Current Month" agnostic of list filters. 
            const summaryRes = await getFinancialSummary(tenantId);
            if (summaryRes.success) setSummary(summaryRes.data);

            // Fetch Transactions
            const txRes = await getTransactionsPaginated(tenantId, page, limit, {
                type: filterType !== "ALL" ? filterType as any : undefined,
                categoryId: filterCategory !== "ALL" ? filterCategory : undefined,
                search: searchTerm
            });
            if (txRes.success) {
                setTransactions(txRes.data || []);
                setTotalTransactions(txRes.count || 0);
            }

            // Fetch Category Stats
            const catRes = await getCategoryStats(tenantId);
            if (catRes.success) setCategoryStats(catRes.data || []);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }

    const totalPages = Math.ceil(totalTransactions / limit);

    return (
        <div className="space-y-10">
            {/* Header Section */}
            {/* Header Section */}
            <div className="flex flex-row justify-between items-center gap-8 mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-900/20 text-white shrink-0">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Financeiro</h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/financial/payroll"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 hover:text-green-600 hover:shadow-sm transition-all shadow-sm h-[42px]"
                    >
                        <DollarSign className="w-4 h-4" />
                        Folha
                    </Link>
                    <Link
                        href="/dashboard/financial/tuition"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 hover:text-blue-600 hover:shadow-sm transition-all shadow-sm h-[42px]"
                    >
                        <CreditCard className="w-4 h-4" />
                        Mensalidades
                    </Link>

                    <FinancialManager
                        tenantId={tenantId}
                        categories={categories}
                        accounts={accounts}
                        students={students}
                        employees={employees}
                    />

                    <ReportGenerator
                        tenantId={tenantId}
                        categories={categories}
                    />
                </div>
            </div>

            {loading && !summary ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                </div>
            ) : (
                <>
                    <FinancialSummary
                        income={summary?.income || 0}
                        expenses={summary?.expense || 0}
                        balance={summary?.balance || 0}
                        incomeTrend={summary?.incomeTrend || 0}
                        expenseTrend={summary?.expenseTrend || 0}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        <div className="lg:col-span-3 space-y-8">
                            <div className="rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 bg-white p-6">
                                {/* Filters */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                    <input
                                        type="text"
                                        placeholder="Buscar transação..."
                                        className="px-4 py-2 border rounded-xl text-sm flex-1"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <select
                                        className="px-4 py-2 border rounded-xl text-sm font-bold text-gray-600"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="ALL">Todos os Tipos</option>
                                        <option value="INCOME">Entradas</option>
                                        <option value="EXPENSE">Saídas</option>
                                    </select>
                                    <select
                                        className="px-4 py-2 border rounded-xl text-sm font-bold text-gray-600"
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                    >
                                        <option value="ALL">Todas Categorias</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <TransactionList
                                    transactions={transactions}
                                    categories={categories}
                                    accounts={accounts}
                                    students={students}
                                    employees={employees}
                                />

                                {/* Pagination Controls */}
                                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="px-4 py-2 text-sm font-bold text-gray-500 disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm font-medium text-gray-600">
                                        Página {page} de {totalPages || 1}
                                    </span>
                                    <button
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-4 py-2 text-sm font-bold text-gray-500 disabled:opacity-50"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Gastos</h3>
                                <p className="text-sm text-gray-500 font-medium">Distribuição por categoria.</p>
                            </div>

                            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                                <div className="space-y-8">
                                    {categoryStats.length > 0 ? (
                                        categoryStats.map((cat: any) => (
                                            <div key={cat.name} className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{cat.name}</span>
                                                        <p className="text-lg font-black text-gray-900 tracking-tight">{formatCurrency(cat.amount)}</p>
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                                        {Math.round((cat.amount / (summary?.expense || 1)) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                                        style={{
                                                            width: `${Math.min((cat.amount / (summary?.expense || 1)) * 100, 100)}%`,
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
                </>
            )}
        </div>
    );
}
