"use client";

import { formatCurrency } from "@/lib/utils";
import { payTuition } from "@/lib/actions/tuition";
import { useState } from "react";
import { Loader2, CreditCard, AlertCircle, CheckCircle, Landmark } from "lucide-react";
import Link from "next/link";

interface TuitionListProps {
    tuitions: any[];
    categories: any[];
    accounts: any[];
    tenantId: string;
    isHistory?: boolean;
}

export default function TuitionList({ tuitions, categories, accounts, tenantId, isHistory = false }: TuitionListProps) {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");

    async function handlePay(id: string) {
        if (!confirm("Confirmar recebimento desta mensalidade? Isso criará uma receita no financeiro.")) return;

        let categoryId = categories.find(c =>
            c.name.toLowerCase().includes("mensalidade") ||
            c.name.toLowerCase().includes("ensino")
        )?.id;

        if (!categoryId && categories.length > 0) {
            categoryId = categories[0].id;
        }

        if (!categoryId) {
            alert("Nenhuma categoria financeira de entrada vinculada.");
            return;
        }

        const accountId = selectedAccountId || accounts[0]?.id;

        if (!accountId) {
            alert("Nenhuma conta financeira capturada. Cadastre uma conta (Banco/M-Pesa/Dinheiro) primeiro.");
            return;
        }

        setProcessingId(id);
        const result = await payTuition(id, categoryId, accountId, tenantId);
        setProcessingId(null);

        if (!result.success) {
            alert(result.error);
        }
    }

    if (tuitions.length === 0) {
        return (
            <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-gray-200" />
                </div>
                <div className="text-gray-500 font-medium">
                    {isHistory ? "Nenhum histórico de pagamento encontrado." : "Nenhuma mensalidade pendente encontrada."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-0 shadow-xl border border-gray-100 rounded-3xl overflow-hidden bg-white">
            {/* Simple Account Selector for pending payments */}
            {!isHistory && (
                accounts.length > 0 ? (
                    <div className="px-8 py-4 bg-blue-50/50 border-b border-blue-100 flex flex-col md:flex-row md:items-center gap-4 transition-all">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                <Landmark className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Receber mensalidade em:</span>
                        </div>
                        <select
                            value={selectedAccountId || (accounts[0]?.id)}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="flex-1 max-w-xs text-xs font-bold bg-white border border-blue-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer hover:border-blue-400"
                        >
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="px-8 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Atenção: Cadastre uma Conta Financeira (Banco/Caixa) para permitir recebimentos.</span>
                        <Link href="/dashboard/financial/accounts" className="ml-auto text-[10px] font-black text-amber-700 underline uppercase">Configurar Contas</Link>
                    </div>
                )
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Aluno</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Curso</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Vencimento</th>
                            {isHistory && <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Pago</th>}
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Base</th>
                            {isHistory && <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Multa</th>}
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status / Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tuitions.map((item) => {
                            const today = new Date();
                            const currentDay = today.getDate();
                            const endDay = item.course?.paymentEndDay || 10;
                            const dueDate = new Date(item.dueDate);

                            // A tuition is overdue if today is after the endDay of the month/year of the due date
                            // OR if it's already past the due month.
                            const isOverdue = !isHistory && (
                                (today.getFullYear() > dueDate.getFullYear()) ||
                                (today.getFullYear() === dueDate.getFullYear() && today.getMonth() > dueDate.getMonth()) ||
                                (today.getFullYear() === dueDate.getFullYear() && today.getMonth() === dueDate.getMonth() && currentDay > endDay)
                            );

                            let calculatedLateFee = Number(item.lateFee || 0);
                            if (isOverdue && calculatedLateFee === 0) {
                                // Calculate fee for display
                                const feeValue = Number(item.course?.lateFeeValue || 0);
                                const feeType = item.course?.lateFeeType || 'PERCENTAGE';
                                if (feeType === 'FIXED') {
                                    calculatedLateFee = feeValue;
                                } else {
                                    const percentage = feeValue > 0 ? feeValue / 100 : 0.02;
                                    calculatedLateFee = Number(item.amount) * percentage;
                                }
                            }

                            const total = Number(item.amount) + calculatedLateFee;

                            return (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="font-black text-gray-900">{item.student?.name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Matrícula: {item.studentId.split('-')[0]}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-gray-500 px-2 py-1 bg-gray-100 rounded-lg whitespace-nowrap">
                                            {item.course?.name || "-"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-gray-600">
                                        {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                                    </td>
                                    {isHistory && (
                                        <td className="px-8 py-5 text-sm font-black text-green-600">
                                            {item.paidDate ? new Date(item.paidDate).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                    )}
                                    <td className="px-8 py-5 text-sm font-bold text-gray-600">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    {isHistory && (
                                        <td className="px-8 py-5 text-sm font-black text-red-500">
                                            {calculatedLateFee > 0 ? `+ ${formatCurrency(calculatedLateFee)}` : '-'}
                                        </td>
                                    )}
                                    <td className="px-8 py-5 text-sm font-black text-gray-900 bg-gray-50/30">
                                        {formatCurrency(total)}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {isHistory ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-tighter ring-1 ring-green-200">
                                                <CheckCircle className="w-3 h-3" />
                                                Regular
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-3">
                                                {isOverdue ? (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-tighter ring-1 ring-red-200">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Atraso
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-tighter ring-1 ring-blue-200">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Pendente
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handlePay(item.id)}
                                                    disabled={!!processingId}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/10 active:scale-95"
                                                >
                                                    {processingId === item.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CreditCard className="w-4 h-4" />
                                                    )}
                                                    Pagar
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
