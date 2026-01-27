"use client";

import { useEffect, useState } from "react";
import { getStudentFullProfile } from "@/lib/actions/academic";
import { Loader2, User, BookOpen, CreditCard, Calendar, CheckCircle, AlertCircle, TrendingUp, FileText, Printer } from "lucide-react";
import { getPublicUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface StudentOverviewModalProps {
    studentId: string;
}

export default function StudentOverviewModal({ studentId }: StudentOverviewModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"summary" | "academic" | "financial">("summary");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const result = await getStudentFullProfile(studentId);
            if (result.success) {
                setData(result);
            }
            setLoading(false);
        }
        fetchData();
    }, [studentId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <p className="text-gray-500 font-medium">Carregando perfil completo...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-900 font-bold">Erro ao carregar dados</p>
                <p className="text-gray-500 text-sm">Não foi possível encontrar o perfil do aluno.</p>
            </div>
        );
    }

    const { student, enrollments, tuitions, documents } = data;

    return (
        <div className="space-y-6">
            {/* Quick Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100">
                    <div className="flex items-center gap-3 mb-1">
                        <User className="w-4 h-4 text-primary-600" />
                        <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Status Geral</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {student.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-3 mb-1">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Matrículas</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {enrollments.length} Disciplinas
                    </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <div className="flex items-center gap-3 mb-1">
                        <CreditCard className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Financeiro</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                        {tuitions.filter((t: any) => t.status === 'PENDING' || t.status === 'OVERDUE').length} Pendentes
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/50">
                {(['summary', 'academic', 'financial'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize",
                            activeTab === tab
                                ? "bg-white text-primary-600 shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {tab === 'summary' ? 'Resumo' : tab === 'academic' ? 'Acadêmico' : 'Financeiro'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
                {activeTab === 'summary' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Informações de Contato</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Cadastrado em</p>
                                            <p className="text-sm font-bold text-gray-900">{new Date(student.createdAt).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400">
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Curso Atual</p>
                                            <p className="text-sm font-bold text-gray-900">{student.course?.name || "Nenhum curso associado"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Documentação</h4>
                                    <a
                                        href={`/print/enrollment/${student.id}`}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg hover:bg-gray-800 transition-all shadow-sm uppercase tracking-widest"
                                    >
                                        <Printer className="w-3 h-3" />
                                        Imprimir Comprovativo
                                    </a>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {/* Primary Enrollment Slip */}
                                    {student.enrollmentSlipUrl && (
                                        <a
                                            href={getPublicUrl(student.enrollmentSlipUrl)}
                                            target="_blank"
                                            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-300 hover:shadow-sm transition-all shadow-sm"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-700 block line-height-tight">Comprovativo de Matrícula</span>
                                                {student.enrollmentSlipNumber && (
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Talão: {student.enrollmentSlipNumber}</span>
                                                )}
                                            </div>
                                        </a>
                                    )}

                                    {/* List of Other Documents */}
                                    {documents?.map((doc: any) => (
                                        <a
                                            key={doc.id}
                                            href={getPublicUrl(doc.url)}
                                            target="_blank"
                                            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-primary-300 hover:shadow-sm transition-all shadow-sm"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-700 block">{doc.type}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Anexado em {new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </a>
                                    ))}

                                    {(!student.enrollmentSlipUrl && (!documents || documents.length === 0)) && (
                                        <p className="text-xs text-gray-400 italic py-2">Nenhum documento anexado.</p>
                                    )}
                                </div>

                                <div className="p-4 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-500/20">
                                    <p className="text-xs font-bold text-primary-100 uppercase mb-2">Sugestão do Sistema</p>
                                    <p className="text-sm leading-relaxed">
                                        O aluno está com {tuitions.filter((t: any) => t.status === 'PENDING' || t.status === 'OVERDUE').length} pagamentos pendentes.
                                        Considere enviar um lembrete via e-mail.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'academic' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Disciplina</th>
                                        <th className="px-6 py-4 text-center">P1</th>
                                        <th className="px-6 py-4 text-center">P2</th>
                                        <th className="px-6 py-4 text-center">Exame</th>
                                        <th className="px-6 py-4 text-center">Média</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {enrollments.length > 0 ? enrollments.map((en: any) => {
                                        const p1 = en.grades?.find((g: any) => g.type === 'P1')?.value || '-';
                                        const p2 = en.grades?.find((g: any) => g.type === 'P2')?.value || '-';
                                        const exame = en.grades?.find((g: any) => g.type === 'EXAM')?.value || '-';

                                        // Simple avg calculation if both exist
                                        const avg = (typeof p1 === 'number' && typeof p2 === 'number')
                                            ? ((p1 + p2) / 2).toFixed(1)
                                            : '-';

                                        return (
                                            <tr key={en.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900">{en.subject?.name}</p>
                                                    <p className="text-[10px] text-gray-500">Ano: {en.year}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium">{p1}</td>
                                                <td className="px-6 py-4 text-center font-medium">{p2}</td>
                                                <td className="px-6 py-4 text-center font-medium">{exame}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={cn(
                                                        "px-2 py-1 rounded-lg text-xs font-bold",
                                                        avg !== '-' && Number(avg) >= 10 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                                    )}>
                                                        {avg}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                                Nenhuma disciplina matriculada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Vencimento</th>
                                        <th className="px-6 py-4">Valor</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Data Pagto</th>
                                        <th className="px-6 py-4">Conta</th>
                                        <th className="px-6 py-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tuitions.length > 0 ? tuitions.map((t: any) => (
                                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'MZN' }).format(t.amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                                                    t.status === 'PAID' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                                )}>
                                                    {t.status === 'PAID' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                    {t.status === 'PAID' ? 'Pago' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {t.paidDate ? new Date(t.paidDate).toLocaleDateString('pt-BR') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {t.account?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-3">
                                                    {t.depositSlipUrl && (
                                                        <a
                                                            href={getPublicUrl(t.depositSlipUrl)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary-600 hover:text-primary-800 transition-colors"
                                                            title={`Ver Talão: ${t.depositSlipNumber || 'N/A'}`}
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {t.status === 'PAID' && (
                                                        <a
                                                            href={`/print/receipt/${t.id}`}
                                                            className="text-gray-400 hover:text-gray-900 transition-colors"
                                                            title="Imprimir Recibo"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                                Nenhum registro financeiro encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
