"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClass, updateClass } from "@/lib/actions/academic";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

const classSchema = z.object({
    name: z.string().min(3, "Nome da turma deve ter pelo menos 3 caracteres"),
    courseId: z.string().min(1, "Curso é obrigatório"),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassFormProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: ClassFormValues & { id: string };
    courses?: any[];
}

export default function ClassForm({ tenantId, onSuccess, initialData, courses = [] }: ClassFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<ClassFormValues>({
        resolver: zodResolver(classSchema) as any,
        defaultValues: initialData || {
            name: "",
            courseId: "",
        },
    });

    async function onSubmit(values: ClassFormValues) {
        setLoading(true);
        form.clearErrors("root");

        try {
            let result;
            if (initialData) {
                result = await updateClass(initialData.id, values);
            } else {
                result = await createClass({
                    ...values,
                    tenantId,
                });
            }

            if (result.success) {
                onSuccess();
                form.reset();
            } else {
                form.setError("root", { message: result.error || "Erro ao salvar turma" });
            }
        } catch (error: any) {
            console.error(error);
            form.setError("root", { message: "Ocorreu um erro inesperado." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nome da Turma</label>
                <input
                    {...form.register("name")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: 10º A - Manhã"
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Curso</label>
                <select
                    {...form.register("courseId")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                >
                    <option value="">Selecione um curso...</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                </select>
                {form.formState.errors.courseId && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.courseId.message}</p>
                )}
            </div>

            {form.formState.errors.root && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-700 leading-relaxed">
                        {form.formState.errors.root.message}
                    </p>
                </div>
            )}

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Criar Turma")}
                </button>
            </div>
        </form>
    );
}
