"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createLead, updateLead } from "@/lib/actions/crm";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const leadSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().min(8, "Telefone inválido").optional().or(z.literal("")),
    source: z.string().optional(),
    status: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: LeadFormValues & { id: string };
}

export default function LeadForm({ tenantId, onSuccess, initialData }: LeadFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<LeadFormValues>({
        resolver: zodResolver(leadSchema),
        defaultValues: initialData || {
            name: "",
            email: "",
            phone: "",
            source: "Website",
            status: "OPEN",
        },
    });

    async function onSubmit(values: LeadFormValues) {
        setLoading(true);
        try {
            if (initialData) {
                await updateLead(initialData.id, values);
            } else {
                await createLead({
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
                <label className="text-sm font-bold text-gray-700">Nome do Prospecto</label>
                <input
                    {...form.register("name")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: João Silva"
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
                        placeholder="joao@email.com"
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
                        placeholder="(11) 98888-7777"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Origem</label>
                <select
                    {...form.register("source")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                >
                    <option value="Website">Website</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Outros">Outros</option>
                </select>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Cadastrar Lead")}
                </button>
            </div>
        </form>
    );
}
