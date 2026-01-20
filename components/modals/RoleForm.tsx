"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRole } from "@/lib/actions/hr";
import { useState } from "react";
import { Loader2, Plus, Check } from "lucide-react";
import { MODULE_PERMISSIONS } from "@/lib/utils/permissions";

const roleSchema = z.object({
    name: z.string().min(2, "Nome do cargo é obrigatório"),
    permissions: z.array(z.string()).optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
    tenantId: string;
    existingRoles: any[];
    onSuccess: () => void;
}

export default function RoleForm({ tenantId, existingRoles, onSuccess }: RoleFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: { name: "", permissions: [] },
    });

    async function onSubmit(values: RoleFormValues) {
        setLoading(true);
        const result = await createRole({
            ...values,
            permissions: values.permissions || [],
            tenantId
        });
        setLoading(false);
        if (result.success) {
            form.reset();
            onSuccess();
        } else {
            alert(result.error);
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nome do Cargo</label>
                    <input
                        {...form.register("name")}
                        placeholder="Ex: Professor, Coordenador, Financeiro..."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                    {form.formState.errors.name && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">Permissões de Acesso</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {MODULE_PERMISSIONS.map((permission) => (
                            <label key={permission.value} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    value={permission.value}
                                    {...form.register("permissions")}
                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">{permission.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Criar Cargo
                    </button>
                </div>
            </form>

            <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cargos Existentes</h4>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {existingRoles.map((role) => (
                        <div key={role.id} className="flex flex-col p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-800">{role.name}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {role.permissions && role.permissions.length > 0 ? (
                                    role.permissions.map((perm: string) => {
                                        const label = MODULE_PERMISSIONS.find(p => p.value === perm)?.label || perm;
                                        return (
                                            <span key={perm} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                                {label}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Sem permissões específicas</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {existingRoles.length === 0 && (
                        <p className="text-sm text-gray-400 italic text-center py-2">Nenhum cargo cadastrado.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
