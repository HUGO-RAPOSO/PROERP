"use client";

import { formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Edit2, Trash2, Loader2, Filter } from "lucide-react";
import { useState } from "react";
import { deleteTransaction } from "@/lib/actions/financial";
import BaseModal from "@/components/modals/BaseModal";
import TransactionForm from "@/components/modals/TransactionForm";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: Date;
    status: string;
    tenantId: string;
    categoryId: string | null;
    accountId: string | null;
    studentId: string | null;
    employeeId: string | null;
    category: {
        id: string;
        name: string;
        type: string;
    } | null;
    student: { name: string } | null;
    employee: { name: string } | null;
}

interface TransactionListProps {
    transactions: Transaction[];
    categories: { id: string; name: string; type: string }[];
    accounts: { id: string; name: string }[];
    students: { id: string; name: string }[];
    employees: { id: string; name: string }[];
}

export default function TransactionList({ transactions, categories, accounts, students, employees }: TransactionListProps) {
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    async function handleDelete(id: string) {
        if (!confirm("Deseja excluir este lançamento financeiro?")) return;

        setLoading(id);
        try {
            await deleteTransaction(id);
            // In a real app with server-side pagination, we might want to trigger a refresh here.
            // But since this is a client component inside a bigger one, the parent should likely handle the refresh.
            // For now, we rely on revalidatePath in the server action if it refreshes the page, 
            // OR we'd need a calback `onDelete` to refresh parent. 
            // Given the current architecture, revalidatePath refreshes the SC, but DashboardOverview is checking on mount/change.
            // We should ideally reload window or use a callback. 
            // Let's assume revalidatePath is enough for page reload, but for client component we might need forced update.
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir transação");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Últimas Transações</h3>
                    <p className="text-sm text-gray-500 font-medium">Histórico recente de todas as movimentações.</p>
                </div>
            </div>

            <div className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Descrição</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Fluxo</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Data</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Valor</th>
                                <th className="px-8 py-6 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((t) => (
                                <tr key={t.id} className="group hover:bg-primary-50/30 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-2xl shadow-sm transition-transform group-hover:scale-110 duration-300",
                                                t.type === "INCOME" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                            )}>
                                                {t.type === "INCOME" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{t.description}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">#{t.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="px-3 py-1 bg-white border border-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-wider w-fit shadow-sm">
                                                {t.category?.name || "Sem categoria"}
                                            </span>
                                            {(t.student || t.employee) && (
                                                <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                    {t.student?.name || t.employee?.name}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-gray-500 font-bold">
                                        {formatDate(t.date)}
                                    </td>
                                    <td className={cn(
                                        "px-8 py-6 text-base font-black tracking-tight",
                                        t.type === "INCOME" ? "text-green-600" : "text-red-600"
                                    )}>
                                        <span className="text-xs mr-1 opacity-50 font-bold">{t.type === "INCOME" ? "+" : "-"}</span>
                                        {formatCurrency(t.amount)}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                            <button
                                                onClick={() => setEditingTransaction(t)}
                                                className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-white rounded-xl shadow-sm hover:shadow transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                disabled={loading === t.id}
                                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
                                            >
                                                {loading === t.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {transactions.length === 0 && (
                    <div className="px-8 py-12 text-center">
                        <p className="text-gray-500 font-medium">Nenhuma transação encontrada.</p>
                    </div>
                )}

                <BaseModal
                    isOpen={!!editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                    title="Editar Transação"
                >
                    {editingTransaction && (
                        <TransactionForm
                            tenantId={editingTransaction.tenantId}
                            categories={categories}
                            accounts={accounts}
                            students={students}
                            employees={employees}
                            onSuccess={() => setEditingTransaction(null)}
                            initialData={{
                                id: editingTransaction.id,
                                description: editingTransaction.description,
                                amount: editingTransaction.amount,
                                type: editingTransaction.type,
                                categoryId: editingTransaction.categoryId || "",
                                accountId: editingTransaction.accountId || "",
                                studentId: editingTransaction.studentId || "",
                                employeeId: editingTransaction.employeeId || ""
                            }}
                        />
                    )}
                </BaseModal>
            </div>
        </div>
    );
}
