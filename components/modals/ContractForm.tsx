"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContract, deleteContract } from "@/lib/actions/hr";
import { useState } from "react";
import { Loader2, Plus, Trash2, FileText } from "lucide-react";

const contractSchema = z.object({
    name: z.string().min(2, "Nome do contrato é obrigatório"),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface ContractFormProps {
    tenantId: string;
    existingContracts: any[];
    onSuccess: () => void;
}

export default function ContractForm({ tenantId, existingContracts, onSuccess }: ContractFormProps) {
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractSchema),
        defaultValues: { name: "" },
    });

    async function onSubmit(values: ContractFormValues) {
        setLoading(true);
        const result = await createContract({ ...values, tenantId });
        setLoading(false);
        if (result.success) {
            form.reset();
            onSuccess();
        } else {
            alert(result.error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este tipo de contrato?")) return;

        setDeletingId(id);
        const result = await deleteContract(id);
        setDeletingId(null);

        if (!result.success) {
            alert(result.error);
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                <input
                    {...form.register("name")}
                    placeholder="Novo tipo (ex: CLT, Estágio...)"
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
            </form>

            <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipos de Contrato</h4>
                <div className="grid grid-cols-1 gap-2">
                    {existingContracts.map((contract) => (
                        <div key={contract.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-gray-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-gray-400">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{contract.name}</span>
                            </div>
                            <button
                                onClick={() => handleDelete(contract.id)}
                                disabled={deletingId === contract.id}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                {deletingId === contract.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    ))}
                    {existingContracts.length === 0 && (
                        <p className="text-sm text-gray-400 italic">Nenhum tipo de contrato cadastrado.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
