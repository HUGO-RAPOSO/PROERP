"use client";

import { useState } from "react";
import { Plus, Loader2, Calendar, CreditCard, User, Tag, Landmark, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import BaseModal from "@/components/modals/BaseModal";
import { generateMonthlyTuition, createIndividualTuition } from "@/lib/actions/tuition";

interface Student {
    id: string;
    name: string;
    course?: {
        id: string;
        name: string;
        price: number;
    }
}

interface Account {
    id: string;
    name: string;
    type: string;
}

interface Category {
    id: string;
    name: string;
}

interface Summary {
    id: string;
    name: string;
    debt: number;
    advance: number;
}

interface TuitionManagerProps {
    tenantId: string;
    students: Student[];
    categories: Category[];
    accounts: Account[];
    summaries: Summary[];
}

export default function TuitionManager({ tenantId, students, categories, accounts, summaries }: TuitionManagerProps) {
    const [isBatchOpen, setIsBatchOpen] = useState(false);
    const [isIndividualOpen, setIsIndividualOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Batch State
    const [dueDate, setDueDate] = useState("");

    // Individual State
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [individualDueDate, setIndividualDueDate] = useState("");
    const [status, setStatus] = useState<'PENDING' | 'PAID'>('PENDING');
    const [categoryId, setCategoryId] = useState("");
    const [accountId, setAccountId] = useState("");

    async function handleGenerateBatch() {
        if (!dueDate) return;
        setLoading(true);
        const dateObj = new Date(dueDate);
        const result = await generateMonthlyTuition(
            tenantId,
            dateObj.getMonth() + 1,
            dateObj.getFullYear(),
            dueDate
        );
        setLoading(false);
        if (result.success) {
            alert(`${result.count} mensalidades geradas com sucesso!`);
            setIsBatchOpen(false);
        } else {
            alert(result.error);
        }
    }

    async function handleCreateIndividual() {
        if (!selectedStudentId || !amount || !individualDueDate) {
            alert("Preencha todos os campos obrigatórios");
            return;
        }

        if (status === 'PAID' && accounts.length === 0) {
            alert("Cadastre uma conta financeira para registrar pagamentos.");
            return;
        }

        if (status === 'PAID' && !categoryId) {
            alert("Selecione a categoria financeira para o recebimento");
            return;
        }

        const student = students.find(s => s.id === selectedStudentId);
        if (!student?.course?.id) return;

        setLoading(true);
        const result = await createIndividualTuition({
            studentId: selectedStudentId,
            courseId: student.course.id,
            amount,
            dueDate: individualDueDate,
            status,
            tenantId,
            categoryId: status === 'PAID' ? categoryId : undefined,
            accountId: status === 'PAID' ? accountId : undefined
        });
        setLoading(false);

        if (result.success) {
            alert("Mensalidade registrada com sucesso!");
            setIsIndividualOpen(false);
            // Reset state
            setSelectedStudentId("");
            setAmount(0);
            setIndividualDueDate("");
            setCategoryId("");
            setAccountId("");
            setStatus('PENDING');
        } else {
            alert(result.error);
        }
    }

    const selectedStudent = students.find(s => s.id === selectedStudentId);

    return (
        <div className="flex gap-2">
            <button
                onClick={() => setIsIndividualOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-all"
            >
                <CreditCard className="w-5 h-5" />
                Novo Recebimento
            </button>

            <button
                onClick={() => setIsBatchOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
            >
                <Plus className="w-5 h-5" />
                Gerar Lote Mensal
            </button>

            {/* Batch Modal */}
            <BaseModal
                isOpen={isBatchOpen}
                onClose={() => setIsBatchOpen(false)}
                title="Gerar Mensalidades em Lote"
            >
                <div className="space-y-6 pt-4">
                    <p className="text-sm text-gray-500">
                        Isso irá gerar as mensalidades para todos os alunos **Ativos** com base nos preços configurados.
                    </p>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Data de Vencimento</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={handleGenerateBatch}
                        disabled={loading || !dueDate}
                        className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                        {loading ? "Gerando..." : "Confirmar e Gerar"}
                    </button>
                </div>
            </BaseModal>

            {/* Individual Receipt Modal */}
            <BaseModal
                isOpen={isIndividualOpen}
                onClose={() => setIsIndividualOpen(false)}
                title="Novo Recebimento / Adiantamento"
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Aluno</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => {
                                        const sId = e.target.value;
                                        setSelectedStudentId(sId);
                                        const s = students.find(item => item.id === sId);
                                        if (s?.course?.price) setAmount(s.course.price);
                                    }}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none"
                                >
                                    <option value="">Selecione um aluno...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.course?.name || "S/ Curso"})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedStudentId && summaries.find(s => s.id === selectedStudentId) && (
                            <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                {(() => {
                                    const summary = summaries.find(s => s.id === selectedStudentId);
                                    const hasDebt = summary && summary.debt > 0;
                                    const hasAdvance = summary && summary.advance > 0;

                                    return (
                                        <>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Dívida Atual</p>
                                                <p className={`text-lg font-black ${hasDebt ? 'text-red-600' : 'text-gray-400'}`}>
                                                    {summary ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'MZN' }).format(summary.debt) : '-'}
                                                </p>
                                            </div>
                                            <div className="w-px h-10 bg-gray-200 self-center" />
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Adiantado</p>
                                                <p className={`text-lg font-black ${hasAdvance ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {summary ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'MZN' }).format(summary.advance) : '-'}
                                                </p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Valor</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Vencimento</label>
                                <input
                                    type="date"
                                    value={individualDueDate}
                                    onChange={(e) => setIndividualDueDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Status Inicial</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStatus('PAID')}
                                    className={`flex-1 py-3 rounded-xl font-bold border transition-all ${status === 'PAID' ? 'bg-green-50 border-green-600 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                >
                                    Pago Agora
                                </button>
                                <button
                                    onClick={() => setStatus('PENDING')}
                                    className={`flex-1 py-3 rounded-xl font-bold border transition-all ${status === 'PENDING' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                >
                                    Ficar Pendente
                                </button>
                            </div>
                        </div>

                        {status === 'PAID' && (
                            accounts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Categoria Financeira</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <select
                                                value={categoryId}
                                                onChange={(e) => setCategoryId(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none"
                                            >
                                                <option value="">Selecione...</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Conta de Destino</label>
                                        <div className="relative">
                                            <Landmark className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <select
                                                value={accountId}
                                                onChange={(e) => setAccountId(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none"
                                            >
                                                <option value="">Selecione...</option>
                                                {accounts.map(a => (
                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-amber-700">Contas financeiras necessárias</p>
                                        <p className="text-[10px] text-amber-600">Cadastre uma conta antes de registrar pagamentos.</p>
                                    </div>
                                    <Link href="/dashboard/financial/accounts" className="text-xs font-black text-amber-700 underline">CRIAR AGORA</Link>
                                </div>
                            )
                        )}
                    </div>

                    <button
                        onClick={handleCreateIndividual}
                        disabled={loading || !selectedStudentId || !amount || !individualDueDate}
                        className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {status === 'PAID' ? 'Confirmar Recebimento' : 'Lançar Mensalidade'}
                    </button>
                </div>
            </BaseModal>
        </div>
    );
}
