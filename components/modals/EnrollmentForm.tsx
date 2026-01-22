"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createEnrollment } from "@/lib/actions/academic";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const enrollmentSchema = z.object({
    subjectId: z.string().min(1, "A disciplina é obrigatória"),
    year: z.number().min(2000, "Ano inválido").max(2100, "Ano inválido"),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
    studentId: string;
    studentName: string;
    tenantId: string;
    subjects: any[];
    onSuccess: () => void;
}

export default function EnrollmentForm({ studentId, studentName, tenantId, subjects, onSuccess }: EnrollmentFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<EnrollmentFormValues>({
        resolver: zodResolver(enrollmentSchema),
        defaultValues: {
            subjectId: "",
            year: new Date().getFullYear(),
        },
    });

    async function onSubmit(values: EnrollmentFormValues) {
        setLoading(true);
        try {
            await createEnrollment({
                ...values,
                studentId,
                tenantId,
            });
            toast.success(`${studentName} matriculado com sucesso!`);
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao realizar matrícula");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Aluno</label>
                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500">
                    {studentName}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Selecione a Disciplina</label>
                <select
                    {...form.register("subjectId")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                >
                    <option value="">Selecione a disciplina...</option>
                    {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                            {sub.name} ({sub.course?.name} - {sub.year}º Ano)
                        </option>
                    ))}
                </select>
                {form.formState.errors.subjectId && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.subjectId.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Ano de Matrícula</label>
                <input
                    type="number"
                    {...form.register("year", { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Matriculando..." : "Confirmar Matrícula"}
                </button>
            </div>
        </form>
    );
}
