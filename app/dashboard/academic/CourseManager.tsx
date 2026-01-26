"use client";

import { useState } from "react";
import {
    Plus,
    BookOpen,
    GraduationCap,
    Clock,
    LayoutDashboard,
    Edit2,
    Trash2,
    AlertTriangle,
    Loader2
} from "lucide-react";
import BaseModal from "@/components/modals/BaseModal";
import CourseForm from "@/components/modals/CourseForm";
import CourseDashboard from "@/components/academic/CourseDashboard";
import { deleteCourse, getCourseImpact } from "@/lib/actions/academic-courses";

interface Course {
    id: string;
    name: string;
    type: "DEGREE" | "TECHNICAL" | "SCHOOL";
    duration: number;
    periodType: "YEARS" | "SEMESTERS";
    price: number;
    enrollmentFee: number;
    paymentStartDay: number;
    paymentEndDay: number;
    lateFeeValue: number;
    lateFeeType: "FIXED" | "PERCENTAGE";
    subjects: any[];
    _count?: {
        subjects: number;
        students: number;
    }
}

export default function CourseManager({ tenantId, courses }: { tenantId: string, courses: Course[] }) {
    const [isNewCourseOpen, setIsNewCourseOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
    const [impactData, setImpactData] = useState<any>(null);
    const [loadingImpact, setLoadingImpact] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handlePrepareDelete(course: Course) {
        setDeletingCourse(course);
        setLoadingImpact(true);
        const res = await getCourseImpact(course.id);
        if (res.success) {
            setImpactData(res.impact);
        }
        setLoadingImpact(false);
    }

    async function handleConfirmDelete() {
        if (!deletingCourse) return;
        setIsDeleting(true);
        try {
            await deleteCourse(deletingCourse.id);
            setDeletingCourse(null);
            setImpactData(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir curso");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">Cursos e Grades</h2>
                    <p className="text-gray-500 text-sm font-medium">Controle estratégico da matriz e performance dos cursos.</p>
                </div>
                <button
                    onClick={() => setIsNewCourseOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Novo Curso
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-primary-600/5 transition-all group overflow-hidden relative">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-[100%] translate-x-12 -translate-y-12 transition-transform group-hover:scale-150 group-hover:bg-primary-100/50" />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setEditingCourse(course)}
                                    className="p-2 bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePrepareDelete(course)}
                                    className="p-2 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10 mb-6">
                            <h3 className="text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight truncate pr-4">{course.name}</h3>
                            <p className="text-[10px] text-primary-500 font-black uppercase mt-1 tracking-widest bg-primary-50 w-fit px-2 py-0.5 rounded">
                                {course.type === "DEGREE" ? "Graduação" : course.type === "TECHNICAL" ? "Técnico" : "Escolar"}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Duração</p>
                                <div className="flex items-center gap-1.5 text-sm font-black text-gray-700">
                                    <Clock className="w-3.5 h-3.5 text-primary-500" />
                                    <span>{course.duration} {course.periodType === "YEARS" ? "Anos" : "Sem."}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Disciplinas</p>
                                <div className="flex items-center gap-1.5 text-sm font-black text-gray-700">
                                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                    <span>{course._count?.subjects || 0} Ativas</span>
                                </div>
                            </div>
                        </div>

                        <button
                            className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all active:scale-[0.98] border border-gray-100 group-hover:border-transparent flex items-center justify-center gap-2"
                            onClick={() => setSelectedCourseId(course.id)}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Painel de Controle
                        </button>
                    </div>
                ))}
            </div>

            {/* Modals */}
            <BaseModal
                isOpen={isNewCourseOpen}
                onClose={() => setIsNewCourseOpen(false)}
                title="Novo Curso"
            >
                <CourseForm tenantId={tenantId} onSuccess={() => setIsNewCourseOpen(false)} />
            </BaseModal>

            <BaseModal
                isOpen={!!editingCourse}
                onClose={() => setEditingCourse(null)}
                title="Editar Curso"
            >
                {editingCourse && (
                    <CourseForm
                        tenantId={tenantId}
                        onSuccess={() => setEditingCourse(null)}
                        initialData={editingCourse}
                    />
                )}
            </BaseModal>

            <BaseModal
                isOpen={!!selectedCourseId}
                onClose={() => setSelectedCourseId(null)}
                title="Visão Geral do Curso"
                size="xl"
            >
                {selectedCourseId && (
                    <CourseDashboard
                        courseId={selectedCourseId}
                        onClose={() => setSelectedCourseId(null)}
                    />
                )}
            </BaseModal>

            {/* Delete Confirmation Modal */}
            <BaseModal
                isOpen={!!deletingCourse}
                onClose={() => {
                    setDeletingCourse(null);
                    setImpactData(null);
                }}
                title="Confirmar Exclusão"
            >
                <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <div>
                            <p className="font-bold">Atenção! Esta ação é irreversível.</p>
                            <p className="text-sm">Você está prestes a excluir o curso <strong>{deletingCourse?.name}</strong>.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider">Impacto da Exclusão:</h4>

                        {loadingImpact ? (
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium py-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analisando relacionamentos de banco de dados...
                            </div>
                        ) : impactData ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-2xl font-black text-gray-900">{impactData.subjects}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Disciplinas Removidas</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-2xl font-black text-gray-900">{impactData.classes}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Turmas Removidas</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-2xl font-black text-gray-900">{impactData.tuitions}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Mensalidades Removidas</p>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                                    <p className="text-2xl font-black text-yellow-700">{impactData.students}</p>
                                    <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-tighter">Alunos Ficarão Sem Curso</p>
                                </div>
                            </div>
                        ) : null}

                        <p className="text-xs text-gray-500 leading-relaxed">
                            Ao confirmar, todas as disciplinas e turmas associadas serão deletadas permanentemente.
                            Os alunos matriculados perderão o vínculo com este curso, mas seus cadastros permanecerão ativos.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setDeletingCourse(null)}
                            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={isDeleting || loadingImpact}
                            className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
                        </button>
                    </div>
                </div>
            </BaseModal>
        </div>
    );
}
