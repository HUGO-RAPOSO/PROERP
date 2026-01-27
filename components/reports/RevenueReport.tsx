"use client";

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
    ArrowUpCircle,
    ArrowDownCircle,
    TrendingUp,
    Calendar,
    Download,
    Printer,
    Landmark,
    PieChart,
    BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RevenueData {
    totalIncomes: number;
    totalExpenses: number;
    netProfit: number;
    incomesByCategory: { name: string; value: number; color: string }[];
    monthlyData: { month: string; incomes: number; expenses: number }[];
}

export default function RevenueReport({ data }: { data: RevenueData }) {
    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 group hover:border-green-200 transition-all"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-green-50 rounded-2xl text-green-600">
                            <ArrowUpCircle className="w-8 h-8" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Total Receitas</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 leading-none">{formatCurrency(data.totalIncomes)}</h3>
                    <div className="flex items-center gap-1.5 mt-4 text-green-600 font-bold text-xs">
                        <TrendingUp className="w-4 h-4" />
                        <span>+12.5% vs mês anterior</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 group hover:border-red-200 transition-all"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-red-50 rounded-2xl text-red-600">
                            <ArrowDownCircle className="w-8 h-8" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Total Despesas</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 leading-none">{formatCurrency(data.totalExpenses)}</h3>
                    <p className="text-xs text-gray-500 mt-4 font-medium uppercase tracking-tighter">Principais: Salários e Renda</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-900 p-8 rounded-3xl shadow-xl shadow-gray-200 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10 text-white">
                        <Landmark className="w-20 h-20" />
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-white/10 rounded-2xl text-white">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Lucro Líquido</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white leading-none">{formatCurrency(data.netProfit)}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 flex-grow bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(data.netProfit / (data.totalIncomes || 1)) * 100}%` }}
                                className="h-full bg-primary-400"
                            />
                        </div>
                        <span className="text-[10px] font-bold text-primary-400">
                            {((data.netProfit / (data.totalIncomes || 1)) * 100).toFixed(1)}%
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Main Analysis Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Analysis */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary-500" />
                                Evolução Financeira
                            </h4>
                            <p className="text-xs text-gray-500">Comparativo mensal de entradas vs saídas</p>
                        </div>
                        <div className="flex bg-gray-50 p-1 rounded-xl">
                            <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-xs font-bold">Últimos meses</button>
                        </div>
                    </div>

                    <div className="h-72 flex items-end justify-between gap-4">
                        {data.monthlyData.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-3 group relative h-full">
                                <div className="w-full flex justify-center gap-1.5 h-full items-end">
                                    {/* Income Bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(item.incomes / (Math.max(...data.monthlyData.map(d => d.incomes)) || 1)) * 100}%` }}
                                        className="w-1/2 bg-primary-500/80 rounded-t-lg group-hover:bg-primary-600 transition-all relative"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap z-20">
                                            {formatCurrency(item.incomes)}
                                        </div>
                                    </motion.div>
                                    {/* Expense Bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(item.expenses / (Math.max(...data.monthlyData.map(d => d.incomes)) || 1)) * 100}%` }}
                                        className="w-1/2 bg-red-400/60 rounded-t-lg group-hover:bg-red-500 transition-all relative"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap z-20">
                                            {formatCurrency(item.expenses)}
                                        </div>
                                    </motion.div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.month}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6 flex justify-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Receitas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Despesas</span>
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-500" />
                        Por Categoria
                    </h4>

                    <div className="space-y-6">
                        {data.incomesByCategory.map((cat, idx) => (
                            <div key={idx} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">{cat.name}</p>
                                        <p className="text-[10px] text-gray-400">{((cat.value / (data.totalIncomes || 1)) * 100).toFixed(0)}% do total</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-gray-700">{formatCurrency(cat.value)}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(cat.value / (data.totalIncomes || 1)) * 100}%` }}
                                        style={{ backgroundColor: cat.color }}
                                        className="h-full rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-primary-50/50 rounded-2xl border border-primary-100">
                        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-2">Insight Estratégico</p>
                        <p className="text-xs text-primary-900 leading-relaxed font-medium">
                            A categoria de <b>Matrículas</b> representa o maior volume este mês. Recomenda-se focar em campanhas para <b>Cursos de Curta Duração</b> visando diversificar as receitas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
