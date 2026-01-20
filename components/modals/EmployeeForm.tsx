"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createEmployee, updateEmployee } from "@/lib/actions/hr";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const employeeSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    roleId: z.string().min(1, "Cargo é obrigatório"),
    contractId: z.string().optional(),
    salary: z.coerce.number().min(0, "Salário deve ser maior que zero"),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeModalProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: EmployeeFormValues & { id: string };
    roles: { id: string; name: string }[];
    contracts: { id: string; name: string }[];
}

export default function EmployeeForm({ tenantId, onSuccess, initialData, roles = [], contracts = [] }: EmployeeModalProps) {
    const [loading, setLoading] = useState(false);
    const [document, setDocument] = useState<File | null>(null);

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema) as any,
        defaultValues: initialData || {
            name: "",
            email: "",
            phone: "",
            roleId: "",
            contractId: "",
            salary: 0,
        },
    });

    async function onSubmit(values: EmployeeFormValues) {
        setLoading(true);
        try {
            if (initialData) {
                await updateEmployee(initialData.id, values);
            } else {
                await createEmployee({
                    ...values,
                    tenantId,
                });
            }
            onSuccess();
            form.reset();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nome Completo</label>
                <input
                    {...form.register("name")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: Ana Maria Silva"
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">E-mail</label>
                    <input
                        {...form.register("email")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="ana@email.com"
                    />
                    {form.formState.errors.email && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Telefone</label>
                    <input
                        {...form.register("phone")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="(11) 99999-9999"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Cargo</label>
                    <select
                        {...form.register("roleId")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                    >
                        <option value="">Selecione um cargo</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    {form.formState.errors.roleId && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.roleId.message}</p>
                    )}
                    {roles.length === 0 && (
                        <p className="text-[10px] text-amber-600 font-medium">Cadastre cargos no botão "Gerenciar Cargos" primeiro.</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Modelo de Contrato</label>
                    <select
                        {...form.register("contractId")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                    >
                        <option value="">Selecione um contrato</option>
                        {contracts.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Salário (MZN)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...form.register("salary")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                    {form.formState.errors.salary && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.salary.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Anexar Documentos</label>
                    <input
                        type="file"
                        onChange={(e) => setDocument(e.target.files?.[0] || null)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <p className="text-[10px] text-gray-400 italic">Identidade, Currículo, etc.</p>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Cadastrar Colaborador")}
                </button>
            </div>
        </form>
    );
}
