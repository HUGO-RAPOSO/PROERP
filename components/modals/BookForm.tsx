"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createBook, updateBook } from "@/lib/actions/library";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const bookSchema = z.object({
    title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
    author: z.string().min(3, "Autor deve ter pelo menos 3 caracteres"),
    isbn: z.string().optional().or(z.literal("")),
    quantity: z.number().min(1, "Quantidade deve ser pelo menos 1"),
});

type BookFormValues = z.infer<typeof bookSchema>;

interface BookModalProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: BookFormValues & { id: string };
}

export default function BookForm({ tenantId, onSuccess, initialData }: BookModalProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<BookFormValues>({
        resolver: zodResolver(bookSchema),
        defaultValues: initialData || {
            title: "",
            author: "",
            isbn: "",
            quantity: 1,
        },
    });

    async function onSubmit(values: BookFormValues) {
        setLoading(true);
        try {
            if (initialData) {
                await updateBook(initialData.id, values);
            } else {
                await createBook({
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
                <label className="text-sm font-bold text-gray-700">Título do Livro</label>
                <input
                    {...form.register("title")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: Dom Casmurro"
                />
                {form.formState.errors.title && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.title.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Autor</label>
                <input
                    {...form.register("author")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: Machado de Assis"
                />
                {form.formState.errors.author && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.author.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">ISBN</label>
                    <input
                        {...form.register("isbn")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="Ex: 9788594318181"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Quantidade</label>
                    <input
                        type="number"
                        {...form.register("quantity")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                    {form.formState.errors.quantity && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.quantity.message}</p>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Adicionar ao Acervo")}
                </button>
            </div>
        </form>
    );
}
