"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addEmployeeDocument } from "@/lib/actions/hr";
import { uploadFileAdmin } from "@/lib/actions/storage-actions";
import { Loader2, Upload, X } from "lucide-react";

const documentSchema = z.object({
    name: z.string().min(2, "Nome do documento é obrigatório"),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface DocumentUploadFormProps {
    employeeId: string;
    onSuccess: () => void;
}

export default function DocumentUploadForm({ employeeId, onSuccess }: DocumentUploadFormProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const form = useForm<DocumentFormValues>({
        resolver: zodResolver(documentSchema),
        defaultValues: { name: "" },
    });

    async function onSubmit(values: DocumentFormValues) {
        if (!file) {
            alert("Por favor, selecione um arquivo.");
            return;
        }

        setLoading(true);

        try {
            // 1. Upload to Supabase Storage using server action
            const formData = new FormData();
            formData.append('file', file);
            const path = `employee-docs/${employeeId}/${Date.now()}_${file.name}`;

            const uploadResult = await uploadFileAdmin(formData, path);

            if (!uploadResult.success) {
                throw new Error("Erro ao fazer upload do arquivo: " + uploadResult.error);
            }

            // 2. Save metadata to Database
            // The path returned by uploadFileAdmin is already the relative path in the bucket
            // We can construct a public URL if needed, or just store the path
            // Looking at previous patterns, we might need a public URL
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${uploadResult.path}`;

            const result = await addEmployeeDocument({
                employeeId,
                name: values.name,
                url: publicUrl
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            form.reset();
            setFile(null);
            onSuccess();

        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nome do Documento</label>
                    <input
                        {...form.register("name")}
                        placeholder="Ex: Contrato de Trabalho, Cópia do RG..."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                    {form.formState.errors.name && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Arquivo</label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {file ? (
                            <div className="flex items-center justify-center gap-2 text-primary-600">
                                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFile(null);
                                    }}
                                    className="p-1 hover:bg-red-50 rounded-full text-red-500 z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <Upload className="w-8 h-8" />
                                <span className="text-sm">Clique ou arraste um arquivo aqui</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        Salvar Documento
                    </button>
                </div>
            </form>
        </div>
    );
}
