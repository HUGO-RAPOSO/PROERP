"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategory, deleteCategory } from "@/lib/actions/financial";
import { useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";

const categorySchema = z.object({
    name: z.string().min(2, "Nome da categoria é obrigatório"),
    type: z.enum(["INCOME", "EXPENSE"]),
    color: z.string().min(4, "Cor é obrigatória"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    tenantId: string;
    existingCategories: any[];
    onSuccess: () => void;
}

const COLORS = [
    "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981", "#06B6D4",
    "#3B82F6", "#6366F1", "#8B5CF6", "#D946EF", "#F43F5E", "#64748B"
];

export default function CategoryForm({ tenantId, existingCategories, onSuccess }: CategoryFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            type: "EXPENSE",
            color: "#3B82F6",
        },
    });

    async function onSubmit(values: CategoryFormValues) {
        setLoading(true);
        try {
            await createCategory({
                ...values,
                tenantId,
            });
            form.reset();
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Erro ao criar categoria");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
        try {
            await deleteCategory(id);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir categoria");
        }
    }

    return (
        <div className="space-y-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Tipo</label>
                    <div className="flex gap-4">
                        {["EXPENSE", "INCOME"].map((type) => (
                            <label key={type} className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    {...form.register("type")}
                                    value={type}
                                    className="sr-only peer"
                                />
                                <div className="w-full py-2 text-center border-2 border-gray-100 rounded-xl font-bold peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-600 transition-all text-sm">
                                    {type === "INCOME" ? "Receita" : "Despesa"}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nome da Categoria</label>
                    <input
                        {...form.register("name")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="Ex: Marketing, Salários..."
                    />
                    {form.formState.errors.name && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Cor</label>
                    <div className="flex flex-wrap gap-3">
                        {COLORS.map((color) => (
                            <label key={color} className="cursor-pointer">
                                <input
                                    type="radio"
                                    {...form.register("color")}
                                    value={color}
                                    className="sr-only peer"
                                />
                                <div
                                    className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-900 peer-checked:scale-110 transition-all shadow-sm ring-2 ring-transparent peer-checked:ring-offset-2"
                                    style={{ backgroundColor: color }}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Categoria"}
                </button>
            </form>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 text-sm">Categorias Existentes</h4>
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
                    {existingCategories.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.color || '#3B82F6' }}
                                />
                                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                                    {cat.type === "INCOME" ? "Receita" : "Despesa"}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {existingCategories.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">Nenhuma categoria criada.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
