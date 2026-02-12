"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
            <motion.div
                variants={item}
                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group hover:shadow-2xl transition-all border-l-4 border-l-green-500 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-700" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Entradas Mensais</p>
                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(income)}</h3>
                        </div>
                    </div>
                    <p className={cn(
                        "text-xs font-bold px-2 py-1 rounded-lg inline-block",
                        incomeTrend >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                    )}>
                        {formatTrend(incomeTrend)}
                    </p>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group hover:shadow-2xl transition-all border-l-4 border-l-red-500 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-700" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Saídas Mensais</p>
                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(expenses)}</h3>
                        </div>
                    </div>
                    <p className={cn(
                        "text-xs font-bold px-2 py-1 rounded-lg inline-block",
                        expenseTrend <= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                    )}>
                        {formatTrend(expenseTrend)}
                    </p>
                </div>
            </motion.div>

            <motion.div
                variants={item}
                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group hover:shadow-2xl transition-all border-l-4 border-l-primary-500 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-700" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Saldo Atual</p>
                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(balance)}</h3>
                        </div>
                    </div>
                    <p className={cn(
                        "text-xs font-bold px-2 py-1 rounded-lg inline-block",
                        balance >= 0 ? "text-primary-600 bg-primary-50" : "text-red-600 bg-red-50"
                    )}>
                        {balance >= 0 ? "Fluxo Positivo" : "Atenção: Fluxo Negativo"}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
