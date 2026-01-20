"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createTransaction, updateTransaction } from "@/lib/actions/financial";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const transactionSchema = z.object({
    description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
    amount: z.coerce.number().positive("Valor deve ser positivo"),
    type: z.enum(["INCOME", "EXPENSE"]),
    categoryId: z.string().optional(),
    accountId: z.string().min(1, "Selecione uma conta"),
    studentId: z.string().optional(),
    employeeId: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
    tenantId: string;
    categories: { id: string; name: string; type: string }[];
    accounts: { id: string; name: string }[];
    students: { id: string; name: string }[];
    employees: { id: string; name: string }[];
    onSuccess: () => void;
    initialData?: TransactionFormValues & { id: string };
}

export default function TransactionForm({ tenantId, categories, accounts, students, employees, onSuccess, initialData }: TransactionFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: initialData || {
            description: "",
            amount: 0,
            type: "EXPENSE",
            categoryId: "",
            accountId: accounts[0]?.id || "",
            studentId: "",
            employeeId: "",
        },
    });

    const selectedType = form.watch("type");
    const filteredCategories = categories.filter((c) => c.type === selectedType);

    async function onSubmit(values: TransactionFormValues) {
        setLoading(true);
        // Clean up empty strings for optional IDs
        const cleanedValues = {
            ...values,
            categoryId: values.categoryId || undefined,
            studentId: values.studentId || undefined,
            employeeId: values.employeeId || undefined,
        };

        try {
            if (initialData) {
                await updateTransaction(initialData.id, cleanedValues);
            } else {
                await createTransaction({
                    ...cleanedValues,
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
                <label className="text-sm font-bold text-gray-700">Tipo de Lançamento</label>
                <div className="flex gap-4">
                    {["EXPENSE", "INCOME"].map((type) => (
                        <label key={type} className="flex-1 cursor-pointer">
                            <input
                                type="radio"
                                {...form.register("type")}
                                value={type}
                                className="sr-only peer"
                            />
                            <div className="w-full py-3 text-center border-2 border-gray-100 rounded-2xl font-bold peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-600 transition-all">
                                {type === "INCOME" ? "Receita" : "Despesa"}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Descrição</label>
                <input
                    {...form.register("description")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: Compra de material escolar"
                />
                {form.formState.errors.description && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.description.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Valor (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...form.register("amount")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="0,00"
                    />
                    {form.formState.errors.amount && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.amount.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Categoria</label>
                    <select
                        {...form.register("categoryId")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                    >
                        <option value="">Selecione...</option>
                        {filteredCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Vincular a Aluno (Opcional)</label>
                    <select
                        {...form.register("studentId")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                    >
                        <option value="">Nenhum aluno...</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Vincular a Colaborador (Opcional)</label>
                    <select
                        {...form.register("employeeId")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                    >
                        <option value="">Nenhum colaborador...</option>
                        {employees.map((e) => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Conta (Origem/Destino)</label>
                <select
                    {...form.register("accountId")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                >
                    <option value="">Selecione a conta...</option>
                    {accounts.map((acc: { id: string, name: string }) => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </select>
                {form.formState.errors.accountId && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.accountId.message}</p>
                )}
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Registrar Transação")}
                </button>
            </div>
        </form>
    );
}
