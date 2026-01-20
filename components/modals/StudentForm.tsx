"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createStudent, updateStudent } from "@/lib/actions/academic";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const studentSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    courseId: z.string().min(1, "O curso é obrigatório"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentModalProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: StudentFormValues & { id: string };
    courses: { id: string; name: string }[];
}

export default function StudentForm({ tenantId, onSuccess, initialData, courses }: StudentModalProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
        defaultValues: initialData || {
            name: "",
            email: "",
            phone: "",
            courseId: "",
        },
    });

    async function onSubmit(values: StudentFormValues) {
        setLoading(true);
        try {
            if (initialData) {
                await updateStudent(initialData.id, values);
            } else {
                await createStudent({
                    ...values,
                    tenantId,
                });
            }
            onSuccess();
            form.reset();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar aluno");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nome Completo</label>
                <input
                    {...form.register("name")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: Ana Maria Silva"
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Curso</label>
                <select
                    {...form.register("courseId")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                >
                    <option value="">Selecione o curso...</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
                {form.formState.errors.courseId && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.courseId.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">E-mail</label>
                    <input
                        {...form.register("email")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="ana@email.com"
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
                        placeholder="(11) 99999-9999"
                    />
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Cadastrar Aluno")}
                </button>
            </div>
        </form>
    );
}
