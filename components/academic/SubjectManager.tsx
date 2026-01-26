"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createSubject, deleteSubject } from "@/lib/actions/academic-courses";

// Schema now reflects separate Year and Semester
const subjectSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    code: z.string().optional(),
    year: z.coerce.number().min(1, "Ano deve ser 1 ou maior"),
    semester: z.coerce.number().optional().nullable(),
    credits: z.coerce.number().optional(),
    examWaiverPossible: z.boolean().default(true),
    waiverGrade: z.coerce.number().min(0).max(20).default(14),
    exclusionGrade: z.coerce.number().min(0).max(20).default(7),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface Subject {
    id: string;
    name: string;
    code: string | null;
    year: number;
    semester?: number | null;
    credits: number | null;
    examWaiverPossible: boolean;
    waiverGrade: number;
    exclusionGrade: number;
}

interface SubjectManagerProps {
    courseId: string;
    subjects: Subject[];
}

export default function SubjectManager({ courseId, subjects }: SubjectManagerProps) {
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const form = useForm<SubjectFormValues>({
        resolver: zodResolver(subjectSchema) as any,
        defaultValues: {
            name: "",
            code: "",
            year: 1,
            semester: 1,
            credits: 4,
            examWaiverPossible: true,
            waiverGrade: 14,
            exclusionGrade: 7,
        },
    });

    async function onSubmit(values: SubjectFormValues) {
        setLoading(true);
        try {
            const res = await createSubject({
                ...values,
                semester: values.semester || undefined,
                courseId,
            });

            if (!res.success) {
                alert(res.error || "Erro ao criar disciplina");
                return;
            }
            form.reset({
                name: "",
                code: "",
                year: values.year,       // Keep context
                semester: values.semester, // Keep context
                credits: 4,
                examWaiverPossible: true,
                waiverGrade: 14,
                exclusionGrade: 7,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja remover esta disciplina?")) return;
        setDeletingId(id);
        try {
            const res = await deleteSubject(id);
            if (!res.success) {
                alert(res.error || "Erro ao remover disciplina");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    }

    // Group subjects by Year -> Semester
    const subjectsByYear = subjects.reduce((acc, subject) => {
        const year = subject.year || 1;
        if (!acc[year]) acc[year] = [];
        acc[year].push(subject);
        return acc;
    }, {} as Record<number, Subject[]>);

    const sortedYears = Object.keys(subjectsByYear).map(Number).sort((a, b) => a - b);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar Disciplina
                    </h3>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Nome da Disciplina</label>
                            <input
                                {...form.register("name")}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                placeholder="Ex: Cálculo I"
                            />
                            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Ano</label>
                                <input
                                    type="number"
                                    {...form.register("year")}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                    placeholder="Ex: 1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Semestre</label>
                                <input
                                    type="number"
                                    {...form.register("semester")}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                    placeholder="Ex: 1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Código (Op)</label>
                                <input
                                    {...form.register("code")}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                    placeholder="Ex: MAT101"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Créditos</label>
                                <input
                                    type="number"
                                    {...form.register("credits")}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Regras de Avaliação</h4>

                            <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-600">Permite Dispensa?</label>
                                <input
                                    type="checkbox"
                                    {...form.register("examWaiverPossible")}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nota Dispensa</label>
                                    <input
                                        type="number"
                                        {...form.register("waiverGrade")}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                        placeholder="Ex: 14"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nota Exclusão</label>
                                    <input
                                        type="number"
                                        {...form.register("exclusionGrade")}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                                        placeholder="Ex: 7"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                            Adicionar
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <h3 className="font-bold text-gray-900 mb-4">Grade Curricular</h3>

                {subjects.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">Nenhuma disciplina cadastrada.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sortedYears.map((year) => (
                            <div key={year} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-sm text-gray-700">{year}º Ano</span>
                                    <span className="text-xs text-gray-400">{subjectsByYear[year].length} disciplinas</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {subjectsByYear[year].sort((a, b) => (a.semester || 0) - (b.semester || 0)).map((subject) => (
                                        <div key={subject.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{subject.name}</p>
                                                <div className="flex gap-3 text-xs text-gray-500 items-center">
                                                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                                                        {subject.semester ? `${subject.semester}º Semestre` : "Semestre Único"}
                                                    </span>
                                                    {subject.code && <span>Cód: {subject.code}</span>}
                                                    {subject.credits && <span>{subject.credits} Créditos</span>}
                                                    <span className="text-[10px] text-gray-400">
                                                        (Dispensa: {subject.waiverGrade} | Exclusão: {subject.exclusionGrade})
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                disabled={deletingId === subject.id}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all rounded-lg hover:bg-red-50"
                                                title="Excluir disciplina"
                                            >
                                                {deletingId === subject.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
