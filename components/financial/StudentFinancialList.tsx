"use client";

import { formatCurrency } from "@/lib/utils";
import { Users, TrendingDown, TrendingUp, Search } from "lucide-react";
import { useState } from "react";

interface Summary {
    id: string;
    name: string;
    courseName: string;
    debt: number;
    advance: number;
    totalTuitions: number;
}

interface StudentFinancialListProps {
    summaries: Summary[];
}

export default function StudentFinancialList({ summaries }: StudentFinancialListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = summaries.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="p-6 bg-white border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar aluno ou curso..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Total em Dívida: {formatCurrency(summaries.reduce((acc, s) => acc + s.debt, 0))}</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Estudante</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Curso</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Dívida (Pendente)</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Adiantamento</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Geral</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-black">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900">{student.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{student.totalTuitions} mensalidades registradas</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-xs font-bold text-gray-500 px-2 py-1 bg-gray-100 rounded-lg whitespace-nowrap">
                                        {student.courseName}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className={`text-sm font-black ${student.debt > 0 ? "text-red-600" : "text-gray-400"}`}>
                                        {formatCurrency(student.debt)}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className={`text-sm font-black ${student.advance > 0 ? "text-green-600" : "text-gray-400"}`}>
                                        {formatCurrency(student.advance)}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    {student.debt > 0 ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-tighter ring-1 ring-red-200">
                                            Devedor
                                        </div>
                                    ) : student.advance > 0 ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-tighter ring-1 ring-green-200">
                                            Adiantado
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-tighter ring-1 ring-blue-200">
                                            Regular
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="p-20 text-center">
                        <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Nenhum estudante encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
