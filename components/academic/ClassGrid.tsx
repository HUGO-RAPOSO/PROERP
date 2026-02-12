"use client";

import { GraduationCap, Users, Clock, Edit2, Trash2, Loader2, Plus, Printer, BookOpen } from "lucide-react";
import { useState } from "react";
import { deleteClass, deleteLesson } from "@/lib/actions/academic";
import BaseModal from "@/components/modals/BaseModal";
import ClassForm from "@/components/modals/ClassForm";
import LessonForm from "@/components/modals/LessonForm";

interface Lesson {
    id: string;
    subject: {
        id: string;
        name: string;
    } | null;
    schedule: string | null;
    teacher: {
        id: string;
        name: string;
    } | null;
    room: string | null;
}

interface Turma {
    id: string;
    name: string;
    courseId: string;
    lessons: Lesson[];
    _count: {
        students: number;
    };
    tenantId: string;
}

interface ClassGridProps {
    turmas: Turma[];
    teachers?: { id: string; name: string }[];
    courses?: any[];
    tenantId: string;
}

export default function ClassGrid({ turmas, teachers = [], courses = [], tenantId }: ClassGridProps) {
    const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson & { classId: string } | null>(null);
    const [creatingLessonFor, setCreatingLessonFor] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    async function handleDeleteTurma(id: string) {
        if (!confirm("Excluir esta turma? Todas as aulas vinculadas serão removidas.")) return;
        setLoading(id);
        try {
            const res = await deleteClass(id);
            if (!res.success) alert(res.error);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir");
        } finally {
            setLoading(null);
        }
    }

    async function handleDeleteLesson(id: string) {
        if (!confirm("Excluir esta aula?")) return;
        setLoading(id);
        try {
            const res = await deleteLesson(id);
            if (!res.success) alert(res.error);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir aula");
        } finally {
            setLoading(null);
        }
    }

    function formatSchedule(scheduleString: string | null) {
        if (!scheduleString) return "Horário não definido";
        try {
            const parsed = JSON.parse(scheduleString);
            if (Array.isArray(parsed)) {
                return parsed.map(s => `${s.day.substring(0, 3)} ${s.start}-${s.end}`).join(", ");
            }
        } catch { return scheduleString; }
        return scheduleString;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {turmas.map((turma) => (
                    <div key={turma.id} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:border-primary-200 transition-all flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-sm font-bold text-gray-500">
                                    <Users className="w-4 h-4" />
                                    {turma._count?.students || 0} Alunos
                                </div>
                                <div className="flex gap-1 ml-4">
                                    <button onClick={() => setEditingTurma(turma)} className="p-2 text-gray-400 hover:text-primary-600 bg-gray-50 rounded-xl transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteTurma(turma.id)} disabled={loading === turma.id} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-xl transition-all">
                                        {loading === turma.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-xl font-bold text-gray-900">{turma.name}</h4>
                            <p className="text-sm text-gray-500">{turma.lessons?.length || 0} aulas cadastradas</p>
                        </div>

                        <div className="space-y-3 flex-1 mb-6">
                            {turma.lessons?.map(lesson => (
                                <div key={lesson.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all relative group/item">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                                                <span className="font-bold text-gray-800 text-sm block">{lesson.subject?.name || "Disciplina Removida"}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 block ml-5">{lesson.teacher?.name || "Sem Professor"}</span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <a
                                                href={`/dashboard/academic/print/grades/${lesson.id}`}
                                                target="_blank"
                                                className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded-lg shadow-sm"
                                                title="Imprimir Pauta"
                                            >
                                                <Printer className="w-3.5 h-3.5" />
                                            </a>
                                            <button onClick={() => setEditingLesson({ ...lesson, classId: turma.id })} className="p-1.5 text-gray-400 hover:text-primary-600 bg-white rounded-lg shadow-sm">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteLesson(lesson.id)} disabled={loading === lesson.id} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-lg shadow-sm">
                                                {loading === lesson.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                            <Clock className="w-3 h-3 text-primary-400" />
                                            <span className="truncate" title={formatSchedule(lesson.schedule)}>{formatSchedule(lesson.schedule)}</span>
                                        </div>
                                        {lesson.room && (
                                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                SALA {lesson.room}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setCreatingLessonFor(turma.id)}
                            className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all group"
                        >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Adicionar Aula
                        </button>
                    </div>
                ))}
            </div>

            {/* Modals */}
            <BaseModal
                isOpen={!!editingTurma}
                onClose={() => setEditingTurma(null)}
                title="Editar Turma"
            >
                <ClassForm
                    tenantId={tenantId}
                    initialData={editingTurma ? {
                        id: editingTurma.id,
                        name: editingTurma.name,
                        courseId: editingTurma.courseId
                    } : undefined}
                    onSuccess={() => setEditingTurma(null)}
                    courses={courses}
                />
            </BaseModal>

            <BaseModal
                isOpen={!!editingLesson || !!creatingLessonFor}
                onClose={() => { setEditingLesson(null); setCreatingLessonFor(null); }}
                title={editingLesson ? "Editar Aula" : "Adicionar Nova Aula"}
            >
                <LessonForm
                    tenantId={tenantId}
                    classId={editingLesson?.classId || creatingLessonFor || ""}
                    initialData={editingLesson || undefined}
                    onSuccess={() => { setEditingLesson(null); setCreatingLessonFor(null); }}
                    teachers={teachers}
                    subjects={courses.find(c => c.id === (turmas.find(t => t.id === (editingLesson?.classId || creatingLessonFor))?.courseId))?.subjects || []}
                />
            </BaseModal>
        </div>
    );
}
