"use client";

import { useState, useEffect } from "react";
import {
    Users,
    BookOpen,
    Clock,
    Calendar,
    ChevronRight,
    Search,
    GraduationCap,
    Loader2,
    Printer
} from "lucide-react";
import SubjectManager from "./SubjectManager";
import { getCourseDashboardData } from "@/lib/actions/academic";
import { formatCurrency } from "@/lib/utils";

interface CourseDashboardProps {
    courseId: string;
    onClose: () => void;
}

export default function CourseDashboard({ courseId, onClose }: CourseDashboardProps) {
    const [activeTab, setActiveTab] = useState<"CURRICULUM" | "STUDENTS" | "SCHEDULE">("CURRICULUM");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await getCourseDashboardData(courseId);
                if (res.success) {
                    setData(res);
                } else {
                    setError(res.error || "Erro desconhecido ao carregar dados.");
                    console.error("CourseDashboard error:", res.error);
                }
            } catch (err: any) {
                setError(err.message || "Erro inesperado ao carregar dados.");
                console.error("CourseDashboard catch error:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [courseId]);

    if (loading) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Carregando dados do curso...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 inline-block max-w-md">
                    <p className="font-bold mb-2">Erro ao carregar dados</p>
                    <p className="text-sm opacity-90">{error || "Não foi possível carregar as informações do curso."}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="block mx-auto text-sm font-bold text-primary-600 hover:text-primary-700"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    const { course, students, classes } = data;

    // Group students by something (simplified: by their first enrollment year or dummy year)
    // In a real app we'd have a 'year' field on Student or Enrollment.
    // For now we'll just show them in a list.
    const groupedStudents = students.reduce((acc: any, student: any) => {
        // Get year from the active enrollment or default to 1
        const activeEnrollment = (student.enrollments || []).find((e: any) => e.status === 'ENROLLED');
        const year = activeEnrollment?.year || student.year || 1;

        if (!acc[year]) acc[year] = [];
        acc[year].push(student);
        return acc;
    }, {});

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-primary-50 to-white p-8 rounded-3xl border border-primary-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-primary-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider">
                            {course.type}
                        </span>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{course.name}</h2>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
                        <div className="flex items-center gap-1.5 ring-1 ring-gray-200 px-3 py-1 rounded-full bg-white">
                            <Clock className="w-4 h-4 text-primary-500" />
                            {course.duration} {course.periodType === "YEARS" ? "Anos" : "Semestres"}
                        </div>
                        <div className="flex items-center gap-1.5 ring-1 ring-gray-200 px-3 py-1 rounded-full bg-white">
                            <Users className="w-4 h-4 text-green-500" />
                            {students.length} Alunos
                        </div>
                        <div className="flex items-center gap-1.5 ring-1 ring-gray-200 px-3 py-1 rounded-full bg-white font-black text-primary-600">
                            Preço: {formatCurrency(course.price || 0)}
                        </div>
                    </div>
                </div>
                <GraduationCap className="absolute -right-12 -bottom-12 w-64 h-64 text-primary-500/5 rotate-12 pointer-events-none" />
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1.5 bg-gray-100/50 rounded-2xl border border-gray-200/50 space-x-2 w-fit">
                {[
                    { id: "CURRICULUM", label: "Matriz Curricular", icon: BookOpen },
                    { id: "STUDENTS", label: "Alunos", icon: Users },
                    { id: "SCHEDULE", label: "Horários & Docentes", icon: Calendar },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all
                            ${activeTab === tab.id
                                ? "bg-white text-primary-600 shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl min-h-[400px]">
                {activeTab === "CURRICULUM" && (
                    <SubjectManager
                        courseId={courseId}
                        subjects={course.subjects}
                    />
                )}

                {activeTab === "STUDENTS" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(groupedStudents).map(([year, yearStudents]: [any, any]) => (
                                <div key={year} className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest pl-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                        Ano {year}
                                        <span className="ml-auto text-[10px] bg-gray-100 px-2 py-0.5 rounded-md">{yearStudents.length}</span>
                                    </h4>
                                    <div className="space-y-2">
                                        {yearStudents.map((s: any) => (
                                            <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:border-primary-100 hover:bg-primary-50/30 transition-all group cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-primary-600 shadow-sm transition-transform group-hover:scale-105">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-black text-gray-900 truncate">{s.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{s.status}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {students.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                    <Users className="w-10 h-10 text-gray-200" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Nenhum aluno matriculado</h3>
                                    <p className="text-sm text-gray-500 font-medium">Os alunos vinculados a este curso aparecerão aqui.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "SCHEDULE" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(classes || []).flatMap((cls: any) =>
                                (cls.lessons || []).map((lesson: any) => ({
                                    ...lesson,
                                    className: cls.name,
                                    classId: cls.id
                                }))
                            ).map((lesson: any) => {
                                const schedules = JSON.parse(lesson.schedule || "[]");

                                return (
                                    <div key={lesson.id} className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-6 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-600/5 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{lesson.subject?.name || "Sem Disciplina"}</span>
                                                <h4 className="text-xl font-black text-gray-900 leading-tight">{lesson.className}</h4>
                                            </div>
                                            <div className="flex gap-2">
                                                <a
                                                    href={`/dashboard/academic/print/grades/${lesson.id}`}
                                                    target="_blank"
                                                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl transition-colors hover:bg-black hover:text-white"
                                                    title="Imprimir Pauta"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </a>
                                                <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl transition-colors group-hover:bg-primary-50 group-hover:text-primary-500">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-sm font-bold text-gray-600 bg-gray-50/50 p-2.5 rounded-2xl group-hover:bg-white group-hover:ring-1 group-hover:ring-gray-100 transition-all">
                                                <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary-600">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <span className="truncate">{lesson.teacher?.name || "Sem Docente"}</span>
                                            </div>

                                            <div className="space-y-2">
                                                {schedules.map((s: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-3 text-xs font-black text-gray-400 bg-gray-50/30 p-2 rounded-xl">
                                                        <Clock className="w-3.5 h-3.5 text-primary-400" />
                                                        <span>{s.day}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-gray-600">{s.start} - {s.end}</span>
                                                    </div>
                                                ))}
                                                {schedules.length === 0 && (
                                                    <p className="text-xs text-gray-400 font-bold italic px-2">Sem horários definidos</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Local: {lesson.room?.name || "Não def."}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {classes.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                    <Calendar className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900">Nenhuma turma para este curso</h3>
                                <p className="text-sm text-gray-500 font-medium max-w-xs">Crie turmas para as disciplinas deste curso para visualizar os horários aqui.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
