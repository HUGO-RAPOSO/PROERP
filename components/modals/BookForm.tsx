"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createBook, updateBook } from "@/lib/actions/library";
import { useState } from "react";
import { Loader2, Search, BookOpen, FileText, BookMarked, Upload, X } from "lucide-react";
import { getBookMetadataFromISBN } from "@/lib/utils/bookCover";
import Image from "next/image";
import toast from "react-hot-toast";

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
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [uploadingPdf, setUploadingPdf] = useState(false);

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
    const fileUrl = form.watch("fileUrl");

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
                toast.success("Dados carregados!");
            } else {
                toast.error("Livro não encontrado");
            }
        } catch (error) {
            console.error("Error fetching book metadata:", error);
            toast.error("Erro ao buscar dados");
        } finally {
            setFetchingMetadata(false);
        }
    }

    function handlePdfFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error("Por favor, selecione um arquivo PDF");
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            toast.error("Arquivo muito grande. Máximo: 50MB");
            return;
        }

        setPdfFile(file);
        toast.success(`"${file.name}" selecionado`);
    }

    async function uploadPdfFile(): Promise<string | null> {
        if (!pdfFile) return null;

        setUploadingPdf(true);
        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(pdfFile);
            });

            const response = await fetch('/api/upload-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: base64,
                    fileName: pdfFile.name,
                    tenantId,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Erro ao fazer upload");
            }

            toast.success("PDF enviado!");
            return result.url;
        } catch (error: any) {
            console.error("Error uploading PDF:", error);
            toast.error(error.message || "Erro ao enviar PDF");
            return null;
        } finally {
            setUploadingPdf(false);
        }
    }

    async function onSubmit(values: BookFormValues) {
        setLoading(true);
        try {
            let finalFileUrl = values.fileUrl;

            // Upload PDF if file is selected
            if (pdfFile) {
                const uploadedUrl = await uploadPdfFile();
                if (uploadedUrl) {
                    finalFileUrl = uploadedUrl;
                } else {
                    setLoading(false);
                    return;
                }
            }

            const bookData = {
                ...values,
                fileUrl: finalFileUrl,
                available: values.quantity,
            };

            if (initialData) {
                await updateBook(initialData.id, bookData);
            } else {
                await createBook({
                    ...bookData,
                    tenantId,
                });
            }
            toast.success(initialData ? "Livro atualizado!" : "Livro adicionado!");
            onSuccess();
            form.reset();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar livro");
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
                            alt="Book cover"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            )}

            {/* ISBN with Auto-fetch */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">ISBN</label>
                <div className="flex gap-2">
                    <input
                        {...form.register("isbn")}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        placeholder="Ex: 9788594318181"
                    />
                    <button
                        type="button"
                        onClick={fetchBookData}
                        disabled={fetchingMetadata || !isbn}
                        className="px-4 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                    >
                        {fetchingMetadata ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Buscar
                    </button>
                </div>
                <p className="text-xs text-gray-500">Digite o ISBN e clique em "Buscar"</p>
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
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${bookType === value
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
                <label className="text-sm font-bold text-gray-700">Título</label>
                <input
                    {...form.register("title")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    placeholder="Ex: Machado de Assis"
                />
                {form.formState.errors.author && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.author.message}</p>
                )}
            </div>

            {/* Publisher and Year */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Editora</label>
                    <input
                        {...form.register("publisher")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        placeholder="Ex: Companhia das Letras"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Ano</label>
                    <input
                        type="number"
                        {...form.register("publishYear", { valueAsNumber: true })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        placeholder="2020"
                    />
                </div>
            </div>

            {/* Quantity and Pages */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                        {bookType === "DIGITAL" ? "Licenças" : "Quantidade"}
                    </label>
                    <input
                        type="number"
                        {...form.register("quantity", { valueAsNumber: true })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    />
                    {form.formState.errors.quantity && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.quantity.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Páginas</label>
                    <input
                        type="number"
                        {...form.register("pages", { valueAsNumber: true })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                        placeholder="256"
                    />
                </div>
            </div>

            {/* PDF Upload for Digital Books */}
            {(bookType === "DIGITAL" || bookType === "BOTH") && (
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Arquivo PDF</label>
                    <div className="flex flex-col gap-3">
                        {fileUrl && !pdfFile && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                                <FileText className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-700 font-medium flex-1">Arquivo já enviado</span>
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 underline">
                                    Ver
                                </a>
                            </div>
                        )}

                        {pdfFile && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <span className="text-sm text-blue-700 font-medium flex-1">{pdfFile.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setPdfFile(null)}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <label className="cursor-pointer">
                            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 border-2 border-dashed border-purple-200 rounded-xl hover:bg-purple-100 transition-colors">
                                <Upload className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-bold text-purple-700">
                                    {pdfFile || fileUrl ? "Substituir PDF" : "Selecionar PDF"}
                                </span>
                            </div>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handlePdfFileChange}
                                className="hidden"
                            />
                        </label>
                        <p className="text-xs text-gray-500">Máximo: 50MB</p>
                    </div>
                </div>
            )}

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Descrição</label>
                <textarea
                    {...form.register("description")}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
                    placeholder="Breve sinopse..."
                />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading || uploadingPdf}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {(loading || uploadingPdf) && <Loader2 className="w-5 h-5 animate-spin" />}
                    {uploadingPdf ? "Enviando PDF..." : loading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Adicionar ao Acervo")}
                </button>
            </div>
        </form>
    );
}
