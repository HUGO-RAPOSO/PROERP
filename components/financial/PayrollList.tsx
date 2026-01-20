"use client";

import { formatCurrency } from "@/lib/utils";
import { processPayrollPayment } from "@/lib/actions/financial";
import { useState } from "react";
import { Loader2, DollarSign, CheckCircle, Clock } from "lucide-react";

interface PayrollListProps {
    payrolls: any[];
    categories: any[];
    accounts: any[];
    tenantId: string;
    type: "PENDING" | "PAID";
}

export default function PayrollList({ payrolls, categories, accounts, tenantId, type }: PayrollListProps) {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");

    async function handlePay(id: string) {
        if (!confirm("Confirmar pagamento deste salário? Isso criará uma despesa no financeiro.")) return;

        // Ideally show a modal to pick category, but for MVP we pick the first 'EXPENSE' category matching 'Salário' or just the first one.
        // Or we assume a default. Let's use a prompt for now if we want flexibility, or just autodetection.
        // Improved: Pass categories and let's find one.

        let categoryId = categories.find(c => c.name.toLowerCase().includes("salário") || c.name.toLowerCase().includes("pessoal"))?.id;

        if (!categoryId && categories.length > 0) {
            categoryId = categories[0].id;
        }

        if (!categoryId) {
            alert("Crie uma categoria de despesa (ex: Salários) antes de processar pagamentos.");
            return;
        }

        const accountId = selectedAccountId || accounts[0]?.id;
        if (!accountId) {
            alert("Cadastre uma conta financeira antes de pagar.");
            return;
        }

        setProcessingId(id);
        const result = await processPayrollPayment(id, categoryId, accountId, tenantId);
        setProcessingId(null);

        if (!result.success) {
            alert(result.error);
        }
    }

    if (payrolls.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                Nenhum registro encontrado.
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {type === "PENDING" && accounts.length > 0 && (
                <div className="px-8 py-3 bg-red-50/50 border-b border-red-100 flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Pagar de:</span>
                    <select
                        value={selectedAccountId || (accounts[0]?.id)}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="text-xs font-bold bg-white border border-red-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-500/20 outline-none"
                    >
                        {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase">Colaborador</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase">Cargo</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase">Valor</th>
                            <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payrolls.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="font-bold text-gray-900">{item.employee?.name}</div>
                                </td>
                                <td className="px-8 py-5 text-gray-600 font-medium">
                                    {item.employee?.role?.name || "-"}
                                </td>
                                <td className="px-8 py-5 text-gray-600">
                                    {new Date(item.date).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-5 font-bold text-gray-900">
                                    {formatCurrency(item.amount)}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    {type === "PENDING" ? (
                                        <button
                                            onClick={() => handlePay(item.id)}
                                            disabled={!!processingId}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {processingId === item.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <DollarSign className="w-4 h-4" />
                                            )}
                                            Pagar
                                        </button>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                            <CheckCircle className="w-3 h-3" />
                                            Pago
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
