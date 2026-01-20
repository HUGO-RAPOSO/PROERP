"use client";

import { formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Edit2, Trash2, Loader2 } from "lucide-react";
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
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir transação");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100/50">
                            <th className="px-8 py-5 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">Descrição</th>
                            <th className="px-8 py-5 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">Categorias</th>
                            <th className="px-8 py-5 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">Data</th>
                            <th className="px-8 py-5 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">Valor</th>
                            <th className="px-8 py-5 text-right text-sm font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {transactions.map((t) => (
                            <tr key={t.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-xl",
                                            t.type === "INCOME" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                        )}>
                                            {t.type === "INCOME" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{t.description}</p>
                                            <p className="text-xs text-gray-500">ID: {t.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold w-fit">
                                            {t.category?.name || "Sem categoria"}
                                        </span>
                                        {(t.student || t.employee) && (
                                            <span className="text-[10px] text-gray-400 font-medium italic">
                                                Para: {t.student?.name || t.employee?.name}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                                    {formatDate(t.date)}
                                </td>
                                <td className={cn(
                                    "px-8 py-5 text-sm font-bold",
                                    t.type === "INCOME" ? "text-green-600" : "text-red-600"
                                )}>
                                    {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingTransaction(t)}
                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            disabled={loading === t.id}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
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
    );
}
