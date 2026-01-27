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
    BarChart3,
    Search,
    Filter,
    ArrowUpDown,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RevenueData {
    totalIncomes: number;
    totalExpenses: number;
    netProfit: number;
    incomesByCategory: { name: string; value: number; color: string }[];
    monthlyData: { month: string; incomes: number; expenses: number }[];
    transactions: any[];
}

export default function RevenueReport({ data }: { data: RevenueData }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, INCOME, EXPENSE
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handlePrint = () => {
        window.print();
    };

    const filteredTransactions = data.transactions.filter(t => {
        const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || t.type === filterType;

        const tDate = new Date(t.date);
        const matchesStart = !startDate || tDate >= new Date(startDate);
        const matchesEnd = !endDate || tDate <= new Date(endDate);

        return matchesSearch && matchesType && matchesStart && matchesEnd;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleExportCSV = () => {
        const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor"];
        const rows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.description,
            t.categoryName,
            t.type === 'INCOME' ? 'Entrada' : 'Saída',
            t.amount
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <style jsx global>{`
                @media print {
                    nav, aside, header, .no-print, .print-hidden, [role="navigation"] {
                        display: none !important;
                    }
                    div.pl-64 {
                        padding-left: 0 !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    body {
                        background: white !important;
                    }
                    .shadow-lg, .shadow-xl, .shadow-2xl {
                        box-shadow: none !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Análise Institucional</h2>
                    <p className="text-gray-500 text-sm">Visão consolidada do desempenho financeiro e académico.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir / Gerar PDF
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                    >
                        <Download className="w-4 h-4" />
                        Exportar Dados (Excel/CSV)
                    </button>
                </div>
            </div>
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

            {/* Detailed Transactions Table */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/50">
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Landmark className="w-6 h-6 text-primary-500" />
                            Detalhes das Transações
                        </h4>
                        <p className="text-sm text-gray-500">Histórico completo e detalhado de movimentações.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 print:hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Procurar transação..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all w-64"
                            />
                        </div>

                        <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                            <button
                                onClick={() => setFilterType('ALL')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'ALL' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setFilterType('INCOME')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'INCOME' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Entradas
                            </button>
                            <button
                                onClick={() => setFilterType('EXPENSE')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'EXPENSE' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Saídas
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-b border-gray-100 flex flex-wrap items-center gap-4 bg-white print:hidden">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Período:</span>
                    </div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                    <span className="text-gray-400 text-xs font-bold">até</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                    {(startDate || endDate || searchTerm || filterType !== 'ALL') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('ALL');
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 underline decoration-primary-200 underline-offset-4"
                        >
                            Limpar Filtros
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Data</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Descrição</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Categoria</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Tipo</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((t, idx) => (
                                    <motion.tr
                                        key={t.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-gray-50/80 transition-colors group"
                                    >
                                        <td className="px-8 py-5 text-sm font-medium text-gray-500">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {t.description}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
                                                {t.categoryName}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {t.type === 'INCOME' ? (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-tighter ring-1 ring-green-200">
                                                    <ArrowUpCircle className="w-3 h-3" />
                                                    Entrada
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-tighter ring-1 ring-red-200">
                                                    <ArrowDownCircle className="w-3 h-3" />
                                                    Saída
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right font-mono font-bold text-sm">
                                            <span className={t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                                {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p className="text-sm font-medium">Nenhuma transação encontrada com os filtros aplicados.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span>Total de Registos: {filteredTransactions.length}</span>
                    <div className="flex gap-6">
                        <span className="text-green-600">Total Entradas: {formatCurrency(filteredTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0))}</span>
                        <span className="text-red-600">Total Saídas: {formatCurrency(filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0))}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
