"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createLoan } from "@/lib/actions/library";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const loanSchema = z.object({
    bookId: z.string().min(1, "Selecione um livro"),
    dueDate: z.string().min(1, "Data de devolução é obrigatória"),
});

type LoanFormValues = z.infer<typeof loanSchema>;

interface LoanModalProps {
    tenantId: string;
    onSuccess: () => void;
    books: { id: string, title: string, available: number }[];
}

export default function LoanForm({ tenantId, onSuccess, books }: LoanModalProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<LoanFormValues>({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            bookId: "",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
    });

    async function onSubmit(values: LoanFormValues) {
        setLoading(true);
        try {
            await createLoan({
                bookId: values.bookId,
                dueDate: new Date(values.dueDate),
                tenantId,
            });
            onSuccess();
            form.reset();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Erro ao criar empréstimo");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Selecionar Livro</label>
                <select
                    {...form.register("bookId")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                >
                    <option value="">Selecione um livro disponível...</option>
                    {books.map((book) => (
                        <option key={book.id} value={book.id} disabled={book.available <= 0}>
                            {book.title} ({book.available} disponíveis)
                        </option>
                    ))}
                </select>
                {form.formState.errors.bookId && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.bookId.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Data de Devolução</label>
                <input
                    type="date"
                    {...form.register("dueDate")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
                {form.formState.errors.dueDate && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.dueDate.message}</p>
                )}
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Processando..." : "Confirmar Empréstimo"}
                </button>
            </div>
        </form>
    );
}
