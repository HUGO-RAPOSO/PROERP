"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClass, updateClass } from "@/lib/actions/academic";
import { useState } from "react";
import { Loader2, Trash2, AlertCircle } from "lucide-react";

// Schema for the Class Form
const classSchema = z.object({
    name: z.string().min(3, "Nome da turma deve ter pelo menos 3 caracteres"),
    subjectId: z.string().min(1, "Disciplina é obrigatória"),
    schedule: z.string().optional().or(z.literal("")),
    room: z.string().min(1, "Sala é obrigatória"),
    teacherId: z.string().optional().or(z.literal("")),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassFormProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: ClassFormValues & { id: string };
    prefillData?: Partial<ClassFormValues>; // New prop for pre-filling
    teachers?: { id: string; name: string }[];
    courses?: any[];
}

export default function ClassForm({ tenantId, onSuccess, initialData, prefillData, teachers = [], courses = [] }: ClassFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    // Complex Schedule State
    const [schedules, setSchedules] = useState<{ day: string; start: string; end: string }[]>([
        { day: "Seg", start: "08:00", end: "10:00" }
    ]);

    const form = useForm<ClassFormValues>({
        resolver: zodResolver(classSchema) as any,
        defaultValues: initialData || {
            name: prefillData?.name || "", // Use prefill name if available
            subjectId: "",
            schedule: "",
            room: "",
            teacherId: "",
        },
    });

    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    const availableSubjects = selectedCourse?.subjects || [];

    const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    function addSchedule() {
        setSchedules([...schedules, { day: "Seg", start: "08:00", end: "10:00" }]);
    }

    function removeSchedule(index: number) {
        setSchedules(schedules.filter((_, i) => i !== index));
    }

    function updateSchedule(index: number, field: keyof typeof schedules[0], value: string) {
        const newSchedules = [...schedules];
        newSchedules[index] = { ...newSchedules[index], [field]: value };
        setSchedules(newSchedules);
    }

    async function onSubmit(values: ClassFormValues) {
        setLoading(true);
        form.clearErrors("root"); // Clear previous errors

        // Serialize schedule to JSON string
        const finalSchedule = JSON.stringify(schedules);

        try {
            let result;
            if (initialData) {
                result = await updateClass(initialData.id, { ...values, schedule: finalSchedule });
            } else {
                result = await createClass({
                    ...values,
                    schedule: finalSchedule,
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Curso</label>
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    >
                        <option value="">Selecione um curso...</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Disciplina</label>
                    <select
                        {...form.register("subjectId")}
                        disabled={!selectedCourseId && !initialData}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all disabled:opacity-50"
                    >
                        <option value="">Selecione uma disciplina...</option>
                        {availableSubjects.map((sub: any) => (
                            <option key={sub.id} value={sub.id}>{sub.name} ({sub.year}º Ano)</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Advanced Schedule Builder */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700">Horários de Aula</label>
                    <button type="button" onClick={addSchedule} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        + Adicionar Horário
                    </button>
                </div>

                <div className="space-y-3">
                    {schedules.map((schedule, index) => (
                        <div key={index} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                            <select
                                value={schedule.day}
                                onChange={(e) => updateSchedule(index, 'day', e.target.value)}
                                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium focus:outline-none"
                            >
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>

                            <input
                                type="time"
                                value={schedule.start}
                                onChange={(e) => updateSchedule(index, 'start', e.target.value)}
                                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none"
                            />
                            <span className="text-gray-400 text-xs">até</span>
                            <input
                                type="time"
                                value={schedule.end}
                                onChange={(e) => updateSchedule(index, 'end', e.target.value)}
                                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none"
                            />

                            {schedules.length > 1 && (
                                <button type="button" onClick={() => removeSchedule(index)} className="ml-auto text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Sala <span className="text-red-500">*</span></label>
                    <input
                        {...form.register("room")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="Ex: Sala 101, Lab 3"
                    />
                    {form.formState.errors.room && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.room.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Professor</label>
                    <select
                        {...form.register("teacherId")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                    >
                        <option value="">Selecione um professor</option>
                        {teachers.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {form.formState.errors.root && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h5 className="text-sm font-bold text-red-800">Conflito Detectado</h5>
                        <p className="text-xs text-red-700 leading-relaxed mt-0.5">
                            {form.formState.errors.root.message}
                        </p>
                    </div>
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
