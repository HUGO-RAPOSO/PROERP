"use client";

import { useState } from "react";
import { Download, FileText, Loader2, Calendar as CalendarIcon, Filter } from "lucide-react";
import BaseModal from "@/components/modals/BaseModal";
import { getFinancialReportData } from "@/lib/actions/financial";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ReportGeneratorProps {
    tenantId: string;
    categories: { id: string; name: string }[];
}

export default function ReportGenerator({ tenantId, categories }: ReportGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Defaults: Current Month
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [type, setType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
    const [categoryId, setCategoryId] = useState<string>("ALL");

    const generatePDF = async () => {
        setLoading(true);
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Adjust end date to cover the full day
            end.setHours(23, 59, 59, 999);

            const result = await getFinancialReportData({
                startDate: start,
                endDate: end,
                type,
                categoryId: categoryId === "ALL" ? undefined : categoryId,
                tenantId
            });

            if (!result.success || !result.data) {
                alert("Erro ao buscar dados para o relatório.");
                return;
            }

            const transactions = result.data;

            // Generate PDF
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text("Relatório Financeiro", 14, 22);

            doc.setFontSize(10);
            doc.text(`Período: ${formatDate(start)} a ${formatDate(end)}`, 14, 30);
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 35);

            let filterText = `Tipo: ${type === 'ALL' ? 'Todas' : type === 'INCOME' ? 'Entradas' : 'Saídas'}`;
            if (categoryId !== 'ALL') {
                const catName = categories.find(c => c.id === categoryId)?.name;
                filterText += ` | Categoria: ${catName}`;
            }
            doc.text(filterText, 14, 40);

            // Totals Calculation
            const totalIncome = transactions
                .filter((t: any) => t.type === 'INCOME')
                .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

            const totalExpense = transactions
                .filter((t: any) => t.type === 'EXPENSE')
                .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

            const balance = totalIncome - totalExpense;

            // Table
            const tableData = transactions.map((t: any) => [
                formatDate(new Date(t.date)),
                t.description,
                t.category?.name || "-",
                t.type === 'INCOME' ? 'Entrada' : 'Saída',
                formatCurrency(Number(t.amount))
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
                body: tableData,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [22, 163, 74] }, // Green header
            });

            // Summary Footer
            const finalY = (doc as any).lastAutoTable.finalY + 10;

            doc.setFontSize(10);
            doc.text("Resumo:", 14, finalY);
            doc.text(`Total Entradas: ${formatCurrency(totalIncome)}`, 14, finalY + 5);
            doc.text(`Total Saídas: ${formatCurrency(totalExpense)}`, 14, finalY + 10);

            doc.setFontSize(12);
            doc.setTextColor(balance >= 0 ? 0 : 200, balance >= 0 ? 100 : 0, 0); // Green or Red
            doc.text(`Saldo do Período: ${formatCurrency(balance)}`, 14, finalY + 18);

            doc.save(`relatorio_financeiro_${startDate}_${endDate}.pdf`);
            setIsOpen(false);

        } catch (error) {
            console.error(error);
            alert("Erro ao gerar PDF.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-3 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-primary-600 transition-all shadow-sm"
                title="Gerar Relatório"
            >
                <FileText className="w-5 h-5" />
            </button>

            <BaseModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Gerar Relatório Financeiro"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Data Inicial</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Data Final</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Tipo de Transação</label>
                        <div className="flex gap-2">
                            {(['ALL', 'INCOME', 'EXPENSE'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-bold rounded-lg border transition-all",
                                        type === t
                                            ? "bg-primary-50 border-primary-500 text-primary-700"
                                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                    )}
                                >
                                    {t === 'ALL' ? 'Todas' : t === 'INCOME' ? 'Entradas' : 'Saídas'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Categoria</label>
                        <select
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="ALL">Todas as Categorias</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={generatePDF}
                        disabled={loading}
                        className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        Gerar PDF
                    </button>
                </div>
            </BaseModal>
        </>
    );
}
