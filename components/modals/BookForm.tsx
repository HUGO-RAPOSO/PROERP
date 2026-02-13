"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createBook, updateBook } from "@/lib/actions/library";
import { useState, useEffect } from "react";
import { Loader2, Search, BookOpen, FileText, BookMarked } from "lucide-react";
import { getBookMetadataFromISBN } from "@/lib/utils/bookCover";
import Image from "next/image";

const bookSchema = z.object({
    title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
    author: z.string().min(3, "Autor deve ter pelo menos 3 caracteres"),
    isbn: z.string().optional().or(z.literal("")),
    type: z.enum(["PHYSICAL", "DIGITAL", "BOTH"]),
    quantity: z.number().min(1, "Quantidade deve ser pelo menos 1"),
    publisher: z.string().optional().or(z.literal("")),
    publishYear: z.number().optional().or(z.literal(0)),
    pages: z.number().optional().or(z.literal(0)),
    coverUrl: z.string().optional().or(z.literal("")),
    fileUrl: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
});

type BookFormValues = z.infer<typeof bookSchema>;

interface BookModalProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: BookFormValues & { id: string };
}

export default function BookForm({ tenantId, onSuccess, initialData }: BookModalProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingMetadata, setFetchingMetadata] = useState(false);
    const [coverPreview, setCoverPreview] = useState<string | null>(initialData?.coverUrl || null);

    const form = useForm<BookFormValues>({
        resolver: zodResolver(bookSchema),
        defaultValues: initialData || {
            title: "",
            author: "",
            isbn: "",
            type: "PHYSICAL",
            quantity: 1,
            publisher: "",
            publishYear: 0,
            pages: 0,
            coverUrl: "",
            fileUrl: "",
            description: "",
        },
    });

    const isbn = form.watch("isbn");
    const bookType = form.watch("type");

    async function fetchBookData() {
        if (!isbn || isbn.length < 10) return;

        setFetchingMetadata(true);
        try {
            const metadata = await getBookMetadataFromISBN(isbn);

            if (metadata) {
                if (metadata.title) form.setValue("title", metadata.title);
                if (metadata.authors) form.setValue("author", metadata.authors);
                if (metadata.publisher) form.setValue("publisher", metadata.publisher);
                if (metadata.publishYear) form.setValue("publishYear", metadata.publishYear);
                if (metadata.pages) form.setValue("pages", metadata.pages);
                if (metadata.coverUrl) {
                    form.setValue("coverUrl", metadata.coverUrl);
                    setCoverPreview(metadata.coverUrl);
                }
            }
        } catch (error) {
            console.error("Error fetching book metadata:", error);
        } finally {
            setFetchingMetadata(false);
        }
    }

    async function onSubmit(values: BookFormValues) {
        setLoading(true);
        try {
            const bookData = {
                ...values,
                available: values.quantity, // Set available to match quantity for new books
            };

            if (initialData) {
                await updateBook(initialData.id, bookData);
            } else {
                await createBook({
                    ...bookData,
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
            {/* Cover Preview */}
            {coverPreview && (
                <div className="flex justify-center p-4 bg-gray-50 rounded-2xl">
                    <div className="relative w-32 h-48 rounded-lg overflow-hidden shadow-lg">
                        <Image
                            src={coverPreview}
                            alt="Book cover preview"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            )}

            {/* ISBN Field with Auto-fetch */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">ISBN</label>
                <div className="flex gap-2">
                    <input
                        {...form.register("isbn")}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="Ex: 9788594318181"
                    />
                    <button
                        type="button"
                        onClick={fetchBookData}
                        disabled={fetchingMetadata || !isbn}
                        className="px-4 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {fetchingMetadata ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Buscar
                    </button>
                </div>
                <p className="text-xs text-gray-500">Digite o ISBN e clique em "Buscar" para preencher automaticamente</p>
            </div>

            {/* Book Type */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tipo de Livro</label>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: "PHYSICAL", label: "Físico", icon: BookOpen },
                        { value: "DIGITAL", label: "Digital", icon: FileText },
                        { value: "BOTH", label: "Ambos", icon: BookMarked },
                    ].map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => form.setValue("type", value as any)}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${bookType === value
                                    ? "border-primary-500 bg-primary-50 text-primary-700"
                                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                                }`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-sm font-bold">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Title */}
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

            {/* Author */}
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

            {/* Publisher and Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Editora</label>
                    <input
                        {...form.register("publisher")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="Ex: Companhia das Letras"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Ano de Publicação</label>
                    <input
                        type="number"
                        {...form.register("publishYear", { valueAsNumber: true })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="Ex: 2020"
                    />
                </div>
            </div>

            {/* Quantity and Pages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                        {bookType === "DIGITAL" ? "Licenças" : "Quantidade (Cópias Físicas)"}
                    </label>
                    <input
                        type="number"
                        {...form.register("quantity", { valueAsNumber: true })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                    {form.formState.errors.quantity && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.quantity.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Número de Páginas</label>
                    <input
                        type="number"
                        {...form.register("pages", { valueAsNumber: true })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="Ex: 256"
                    />
                </div>
            </div>

            {/* File URL for Digital Books */}
            {(bookType === "DIGITAL" || bookType === "BOTH") && (
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">URL do Arquivo Digital</label>
                    <input
                        {...form.register("fileUrl")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="https://exemplo.com/livro.pdf"
                    />
                    <p className="text-xs text-gray-500">Link para o PDF, EPUB ou outro formato digital</p>
                </div>
            )}

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Descrição (Opcional)</label>
                <textarea
                    {...form.register("description")}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                    placeholder="Breve sinopse ou descrição do livro..."
                />
            </div>

            {/* Submit Button */}
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
