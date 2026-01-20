"use client";

import { GraduationCap, Users, Clock, Edit2, Trash2, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { deleteClass } from "@/lib/actions/academic";
import BaseModal from "@/components/modals/BaseModal";
import ClassForm from "@/components/modals/ClassForm";

interface Class {
    id: string;
    name: string;
    subject: {
        id: string;
        name: string;
    } | null;
    schedule: string | null;
    teacher: {
        id: string;
        name: string;
    } | null;
    _count: {
        enrollments: number;
    };
    tenantId: string;
    subjectId: string | null;
    room: string | null;
}

interface ClassGridProps {
    classes: Class[];
    teachers?: { id: string; name: string }[];
    courses?: any[];
    tenantId: string;
}



export default function ClassGrid({ classes, teachers = [], courses = [], tenantId }: ClassGridProps) {
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [prefillClass, setPrefillClass] = useState<{ name: string } | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    async function handleDelete(id: string) {
        if (!confirm("Excluir esta aula?")) return;
        setLoading(id);
        try {
            await deleteClass(id);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir");
        } finally {
            setLoading(null);
        }
    }

    function toggleGroup(groupName: string) {
        setExpandedGroups(prev =>
            prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
        );
    }

    // Grouping Logic
    const groupedClasses = classes.reduce((acc, cls) => {
        if (!acc[cls.name]) acc[cls.name] = [];
        acc[cls.name].push(cls);
        return acc;
    }, {} as Record<string, Class[]>);

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
                {Object.entries(groupedClasses).map(([groupName, groupClasses]) => {
                    // Approximate student count (max of the group)
                    const distinctStudents = Math.max(...groupClasses.map(c => c._count.enrollments));

                    return (
                        <div key={groupName} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:border-primary-200 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-gray-500">
                                    <Users className="w-4 h-4" />
                                    ~{distinctStudents} Alunos
                                </div>
                            </div>

                            <div className="mb-4">
                                <h4 className="text-xl font-bold text-gray-900">{groupName}</h4>
                                <p className="text-sm text-gray-500">{groupClasses.length} disciplinas cadastradas</p>
                            </div>

                            <div className="space-y-3 flex-1 mb-6">
                                {groupClasses.map(cls => (
                                    <div key={cls.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all relative group/item">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-bold text-gray-800 text-sm block">{cls.subject?.name || "Disciplina Removida"}</span>
                                                <span className="text-xs text-gray-500 block">{cls.teacher?.name || "Sem Professor"}</span>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingClass(cls)} className="p-1 text-gray-400 hover:text-primary-600"><Edit2 className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(cls.id)} disabled={loading === cls.id} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                                            <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                            <span className="truncate" title={formatSchedule(cls.schedule)}>{formatSchedule(cls.schedule)}</span>
                                        </div>
                                        {cls.room && <div className="mt-1 text-xs font-bold text-gray-500 uppercase tracking-wide">Sala: {cls.room}</div>}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setPrefillClass({ name: groupName })}
                                className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-600 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar Aula
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            <BaseModal
                isOpen={!!editingClass || !!prefillClass}
                onClose={() => { setEditingClass(null); setPrefillClass(null); }}
                title={editingClass ? "Editar Aula" : "Adicionar Nova Aula"}
            >
                <ClassForm
                    tenantId={tenantId}
                    initialData={editingClass ? {
                        ...editingClass,
                        subjectId: editingClass.subjectId!,
                        teacherId: editingClass.teacher?.id || "",
                        schedule: editingClass.schedule || "",
                        room: editingClass.room || ""
                    } : undefined}
                    prefillData={prefillClass || undefined}
                    onSuccess={() => { setEditingClass(null); setPrefillClass(null); }}
                    teachers={teachers}
                    courses={courses}
                />
            </BaseModal>
        </div>
    );
}
