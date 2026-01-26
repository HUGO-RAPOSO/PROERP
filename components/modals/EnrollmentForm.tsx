"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { enrollStudentInSubjects } from "@/lib/actions/academic";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "react-hot-toast";

const enrollmentSchema = z.object({
    subjectIds: z.array(z.string()).min(1, "Selecione pelo menos uma disciplina"),
    year: z.number().min(2000, "Ano inválido").max(2100, "Ano inválido"),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
    studentId: string;
    studentName: string;
    courseId?: string;
    tenantId: string;
    subjects: any[];
    onSuccess: () => void;
}

export default function EnrollmentForm({ studentId, studentName, courseId, tenantId, subjects, onSuccess }: EnrollmentFormProps) {
    const [loading, setLoading] = useState(false);

    // Filter subjects by student's course
    // Handle both courseId and course_id just in case, and be more lenient
    const filteredSubjects = subjects.filter(sub => {
        const subCourseId = sub.courseId || sub.course_id;
        return subCourseId === courseId;
    });

    // If no filtered subjects, maybe show all as a fallback or for debugging
    const subjectsToDisplay = filteredSubjects.length > 0 ? filteredSubjects : subjects;
    const isFiltered = filteredSubjects.length > 0;

    const form = useForm<EnrollmentFormValues>({
        resolver: zodResolver(enrollmentSchema),
        defaultValues: {
            subjectIds: [],
            year: new Date().getFullYear(),
        },
    });

    async function onSubmit(values: EnrollmentFormValues) {
        setLoading(true);
        try {
            const res = await enrollStudentInSubjects({
                ...values,
                studentId,
                tenantId,
            });

            if (!res.success) {
                throw new Error(res.error || "Erro ao realizar matrícula");
            }

            toast.success(`${studentName} matriculado com sucesso!`);
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao realizar matrícula");
        } finally {
            setLoading(false);
        }
    }

    const toggleSubject = (id: string) => {
        const current = form.getValues("subjectIds");
        if (current.includes(id)) {
            form.setValue("subjectIds", current.filter(i => i !== id));
        } else {
            form.setValue("subjectIds", [...current, id]);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Aluno</label>
                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-medium">
                    {studentName}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex justify-between items-center">
                    Selecione as Disciplinas
                    <div className="flex gap-2">
                        {courseId && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-400 font-mono">ID: {courseId.slice(0, 8)}</span>}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isFiltered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {isFiltered ? 'Filtrado por Curso' : 'Mostrando Todas (Sem Filtro)'}
                        </span>
                    </div>
                </label>

                <div className="max-h-[300px] overflow-y-auto border border-gray-100 rounded-2xl p-2 space-y-1 bg-gray-50/50">
                    {subjectsToDisplay.length > 0 ? (
                        subjectsToDisplay.map((sub) => {
                            const isSelected = form.watch("subjectIds").includes(sub.id);
                            return (
                                <div
                                    key={sub.id}
                                    onClick={() => toggleSubject(sub.id)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all
                                        ${isSelected ? 'bg-primary-50 border-primary-100' : 'bg-white border-transparent hover:bg-gray-100'}
                                        border
                                    `}
                                >
                                    <div className={`
                                        w-5 h-5 rounded flex items-center justify-center transition-all
                                        ${isSelected ? 'bg-primary-600 text-white' : 'border-2 border-gray-200'}
                                    `}>
                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-bold ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                                            {sub.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                                            {sub.code || 'S/ Código'} • {sub.year}º Ano
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-gray-400 text-sm">
                            Nenhuma disciplina encontrada para este curso.
                        </div>
                    )}
                </div>
                {form.formState.errors.subjectIds && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.subjectIds.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Ano Letivo</label>
                <input
                    type="number"
                    {...form.register("year", { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading || subjectsToDisplay.length === 0}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Matriculando..." : "Confirmar Matrículas"}
                </button>
            </div>
        </form>
    );
}
