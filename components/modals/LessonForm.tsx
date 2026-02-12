"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createLesson, updateLesson } from "@/lib/actions/academic";
import { useState } from "react";
import { Loader2, Trash2, AlertCircle, Clock, MapPin, User, BookOpen } from "lucide-react";

const lessonSchema = z.object({
    subjectId: z.string().min(1, "Disciplina é obrigatória"),
    teacherId: z.string().optional().or(z.literal("")),
    room: z.string().min(1, "Sala é obrigatória"),
    schedule: z.string().optional().or(z.literal("")),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

interface LessonFormProps {
    tenantId: string;
    classId: string;
    onSuccess: () => void;
    initialData?: any; // Using any for simplicity with nested types from parent
    teachers?: { id: string; name: string }[];
    subjects?: { id: string; name: string; year: number }[];
}

export default function LessonForm({ tenantId, classId, onSuccess, initialData, teachers = [], subjects = [] }: LessonFormProps) {
    const [loading, setLoading] = useState(false);

    // Schedule State
    const [schedules, setSchedules] = useState<{ day: string; start: string; end: string }[]>(() => {
        if (initialData?.schedule) {
            try {
                const parsed = JSON.parse(initialData.schedule);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) { console.error("Error parsing schedule:", e); }
        }
        return [{ day: "Seg", start: "08:00", end: "10:00" }];
    });

    const form = useForm<LessonFormValues>({
        resolver: zodResolver(lessonSchema) as any,
        defaultValues: {
            subjectId: initialData?.subject?.id || initialData?.subjectId || "",
            teacherId: initialData?.teacher?.id || initialData?.teacherId || "",
            room: initialData?.room || "",
            schedule: initialData?.schedule || "",
        },
    });

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

    async function onSubmit(values: LessonFormValues) {
        setLoading(true);
        form.clearErrors("root");

        const finalSchedule = JSON.stringify(schedules);

        try {
            let result;
            if (initialData?.id) {
                result = await updateLesson(initialData.id, { ...values, schedule: finalSchedule });
            } else {
                result = await createLesson({
                    ...values,
                    classId,
                    schedule: finalSchedule,
                    tenantId,
                });
            }

            if (result.success) {
                onSuccess();
                form.reset();
            } else {
                form.setError("root", { message: result.error || "Erro ao salvar aula" });
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
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary-500" />
                    Disciplina
                </label>
                <select
                    {...form.register("subjectId")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                >
                    <option value="">Selecione uma disciplina...</option>
                    {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.year}º Ano)</option>
                    ))}
                </select>
                {form.formState.errors.subjectId && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.subjectId.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-500" />
                        Professor
                    </label>
                    <select
                        {...form.register("teacherId")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    >
                        <option value="">Selecione um professor...</option>
                        {teachers.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        Sala
                    </label>
                    <input
                        {...form.register("room")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="Ex: Sala 101"
                    />
                    {form.formState.errors.room && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.room.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        Horários
                    </label>
                    <button type="button" onClick={addSchedule} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary-600 hover:bg-primary-50 transition-all">
                        + Adicionar
                    </button>
                </div>

                <div className="space-y-2">
                    {schedules.map((schedule, index) => (
                        <div key={index} className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-left-2">
                            <select
                                value={schedule.day}
                                onChange={(e) => updateSchedule(index, 'day', e.target.value)}
                                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none"
                            >
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>

                            <input
                                type="time"
                                value={schedule.start}
                                onChange={(e) => updateSchedule(index, 'start', e.target.value)}
                                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none"
                            />
                            <span className="text-gray-400 text-[10px] font-black uppercase">até</span>
                            <input
                                type="time"
                                value={schedule.end}
                                onChange={(e) => updateSchedule(index, 'end', e.target.value)}
                                className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none"
                            />

                            {schedules.length > 1 && (
                                <button type="button" onClick={() => removeSchedule(index)} className="ml-auto p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {form.formState.errors.root && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h5 className="text-sm font-bold text-red-800">Conflito Detectado</h5>
                        <p className="text-xs text-red-700 leading-relaxed mt-0.5 whitespace-pre-line">
                            {form.formState.errors.root.message}
                        </p>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Salvando..." : (initialData?.id ? "Salvar Alterações" : "Adicionar Aula")}
            </button>
        </form>
    );
}
