"use client";

import { useState } from "react";
import { Loader2, CreditCard, Tag, Landmark, FileUp, X, CheckCircle } from "lucide-react";
import BaseModal from "@/components/modals/BaseModal";
import { formatCurrency } from "@/lib/utils";
import { payTuition } from "@/lib/actions/tuition";
import { uploadFileAdmin } from "@/lib/actions/storage-actions";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    tuition: any;
    categories: any[];
    accounts: any[];
    tenantId: string;
}

export default function PaymentModal({ isOpen, onClose, tuition, categories, accounts, tenantId }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [accountId, setAccountId] = useState(accounts[0]?.id || "");
    const [categoryId, setCategoryId] = useState(() => {
        return categories.find(c =>
            c.name.toLowerCase().includes("mensalidade") ||
            c.name.toLowerCase().includes("ensino")
        )?.id || (categories[0]?.id || "");
    });
    const [slipNumber, setSlipNumber] = useState("");
    const [file, setFile] = useState<File | null>(null);

    async function handleConfirm() {
        if (!accountId) {
            alert("Selecione uma conta de destino.");
            return;
        }
        if (!categoryId) {
            alert("Selecione uma categoria financeira.");
            return;
        }

        setLoading(true);
        try {
            let slipUrl = "";
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const path = `tuitions/${tenantId}/${tuition.id}_${Date.now()}_${file.name}`;
                const uploadResult = await uploadFileAdmin(formData, path);
                if (uploadResult.success) {
                    slipUrl = uploadResult.path || "";
                } else {
                    throw new Error(uploadResult.error);
                }
            }

            const result = await payTuition(
                tuition.id,
                categoryId,
                accountId,
                tenantId,
                slipUrl,
                slipNumber
            );

            if (result.success) {
                onClose();
            } else {
                alert(result.error);
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    if (!tuition) return null;

    // Calculate fees like in TuitionList
    const today = new Date();
    const currentDay = today.getDate();
    const endDay = tuition.course?.paymentEndDay || 10;
    const dueDate = new Date(tuition.dueDate);
    const isOverdue = (
        (today.getFullYear() > dueDate.getFullYear()) ||
        (today.getFullYear() === dueDate.getFullYear() && today.getMonth() > dueDate.getMonth()) ||
        (today.getFullYear() === dueDate.getFullYear() && today.getMonth() === dueDate.getMonth() && currentDay > endDay)
    );

    let calculatedLateFee = Number(tuition.lateFee || 0);
    if (isOverdue && calculatedLateFee === 0) {
        const feeValue = Number(tuition.course?.lateFeeValue || 0);
        const feeType = tuition.course?.lateFeeType || 'PERCENTAGE';
        if (feeType === 'FIXED') {
            calculatedLateFee = feeValue;
        } else {
            const percentage = feeValue > 0 ? feeValue / 100 : 0.02;
            calculatedLateFee = Number(tuition.amount) * percentage;
        }
    }

    const total = Number(tuition.amount) + calculatedLateFee;

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Confirmar Recebimento">
            <div className="space-y-6 pt-4">
                {/* Summary Info */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Aluno:</span>
                        <span className="text-sm font-black text-gray-900">{tuition.student?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Valor Base:</span>
                        <span className="font-bold text-gray-700">{formatCurrency(tuition.amount)}</span>
                    </div>
                    {calculatedLateFee > 0 && (
                        <div className="flex justify-between items-center text-xs text-red-600">
                            <span>Multa por Atraso:</span>
                            <span className="font-black">+ {formatCurrency(calculatedLateFee)}</span>
                        </div>
                    )}
                    <div className="h-px bg-gray-200 my-1" />
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900">Total a Pagar:</span>
                        <span className="text-lg font-black text-primary-600">{formatCurrency(total)}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Conta de Destino</label>
                            <div className="relative">
                                <Landmark className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <select
                                    value={accountId}
                                    onChange={(e) => setAccountId(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none text-sm font-medium"
                                >
                                    {accounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Categoria</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none text-sm font-medium"
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Número do Talão / Depósito</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ex: 12345678"
                                value={slipNumber}
                                onChange={(e) => setSlipNumber(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Anexo (Scanner / Foto)</label>
                        {!file ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100/50 hover:border-primary-300 transition-all cursor-pointer group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 mb-2 group-hover:scale-110 transition-transform">
                                        <FileUp className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-500">Clique para selecionar o ficheiro</p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">JPG, PNG ou PDF</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-100 rounded-2xl">
                                <FileUp className="w-5 h-5 text-primary-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-primary-900 truncate">{file.name}</p>
                                    <p className="text-[10px] text-primary-600 font-black uppercase">{(file.size / 1024).toFixed(0)} KB</p>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="p-2 hover:bg-white rounded-xl transition-colors text-primary-400 hover:text-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    {loading ? "Processando..." : "Confirmar Recebimento"}
                </button>
            </div>
        </BaseModal>
    );
}
