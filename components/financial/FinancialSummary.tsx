import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FinancialSummaryProps {
    income: number;
    expenses: number;
    balance: number;
    incomeTrend: number;
    expenseTrend: number;
}

export default function FinancialSummary({ income, expenses, balance, incomeTrend, expenseTrend }: FinancialSummaryProps) {
    const formatTrend = (value: number) => {
        if (value === 0) return "0% em relação ao mês anterior";
        const sign = value > 0 ? "+" : "";
        return `${sign}${value.toFixed(1)}% em relação ao mês anterior`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group hover:shadow-2xl transition-all border-l-4 border-l-green-500">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Entradas Mensais</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(income)}</h3>
                    </div>
                </div>
                <p className={cn(
                    "text-xs font-bold px-2 py-1 rounded-lg inline-block",
                    incomeTrend >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                )}>
                    {formatTrend(incomeTrend)}
                </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group hover:shadow-2xl transition-all border-l-4 border-l-red-500">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Saídas Mensais</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(expenses)}</h3>
                    </div>
                </div>
                <p className={cn(
                    "text-xs font-bold px-2 py-1 rounded-lg inline-block",
                    expenseTrend <= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                )}>
                    {formatTrend(expenseTrend)}
                </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group hover:shadow-2xl transition-all border-l-4 border-l-primary-500">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Saldo Atual</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(balance)}</h3>
                    </div>
                </div>
                <p className={cn(
                    "text-xs font-bold px-2 py-1 rounded-lg inline-block",
                    balance >= 0 ? "text-primary-600 bg-primary-50" : "text-red-600 bg-red-50"
                )}>
                    {balance >= 0 ? "Fluxo Positivo" : "Atenção: Fluxo Negativo"}
                </p>
            </div>
        </div>
    );
}
