"use client";

import { Edit2, Trash2, Mail, Phone, Loader2, BookOpen, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { deleteStudent } from "@/lib/actions/academic";
import BaseModal from "@/components/modals/BaseModal";
import StudentForm from "@/components/modals/StudentForm";
import EnrollmentForm from "@/components/modals/EnrollmentForm";
import StudentOverviewModal from "@/components/modals/StudentOverviewModal";

interface Student {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    tenantId: string;
    courseId?: string;
    course?: {
        name: string;
    };
    enrollments: {
        subject: {
            name: string;
        };
    }[];
}

interface StudentListProps {
    students: Student[];
    courses: { id: string; name: string }[];
    subjects: any[];
    accounts: any[];
}

export default function StudentList({ students, courses, subjects, accounts }: StudentListProps) {
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [enrollingStudent, setEnrollingStudent] = useState<Student | null>(null);
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este aluno?")) return;

        setLoading(id);
        try {
            await deleteStudent(id);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir aluno");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Aluno</th>
                            <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Curso Matrícula</th>
                            <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Contato</th>
                            <th className="px-8 py-5 text-right text-sm font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg shadow-sm">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{student.name}</p>
                                            <p className="text-xs text-gray-500">ID: {student.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit">
                                            <BookOpen className="w-3 h-3" />
                                            {student.course?.name || "Não Definido"}
                                        </span>
                                        {student.enrollments.length > 0 && (
                                            <div className="flex flex-col gap-1 mt-1 ml-1">
                                                <span className="text-[10px] text-primary-600 font-bold">
                                                    {student.enrollments.length} {student.enrollments.length === 1 ? 'Cadeira' : 'Cadeiras'}
                                                </span>
                                                <div className="flex flex-wrap gap-1 max-w-[240px]">
                                                    {student.enrollments.map((en, idx) => (
                                                        <span key={idx} className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200/50">
                                                            {en.subject.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset",
                                        student.status === "ACTIVE"
                                            ? "bg-green-50 text-green-700 ring-green-600/20"
                                            : "bg-gray-50 text-gray-700 ring-gray-600/20"
                                    )}>
                                        {student.status === "ACTIVE" ? "Ativo" : "Inativo"}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex gap-2 text-gray-400">
                                        {student.email && <span title={student.email}><Mail className="w-4 h-4" /></span>}
                                        {student.phone && <span title={student.phone}><Phone className="w-4 h-4" /></span>}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setViewingStudent(student)}
                                            className="p-2 hover:bg-primary-50 text-gray-400 hover:text-primary-600 rounded-lg transition-all"
                                            title="Visão Geral do Aluno"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEnrollingStudent(student)}
                                            className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-all"
                                            title="Matricular em Turma"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingStudent(student)}
                                            className="p-2 hover:bg-primary-50 text-gray-400 hover:text-primary-600 rounded-lg transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            disabled={loading === student.id}
                                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all disabled:opacity-50"
                                        >
                                            {loading === student.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                <span>Mostrando {students.length} alunos</span>
            </div>

            <BaseModal
                isOpen={!!editingStudent}
                onClose={() => setEditingStudent(null)}
                title="Editar Aluno"
            >
                {editingStudent && (
                    <StudentForm
                        tenantId={editingStudent.tenantId}
                        courses={courses}
                        accounts={accounts}
                        onSuccess={() => setEditingStudent(null)}
                        initialData={{
                            id: editingStudent.id,
                            name: editingStudent.name,
                            email: editingStudent.email || "",
                            phone: editingStudent.phone || "",
                            courseId: editingStudent.courseId || ""
                        }}
                    />
                )}
            </BaseModal>

            <BaseModal
                isOpen={!!enrollingStudent}
                onClose={() => setEnrollingStudent(null)}
                title="Matricular Aluno em Cadeira"
            >
                {enrollingStudent && (
                    <EnrollmentForm
                        studentId={enrollingStudent.id}
                        studentName={enrollingStudent.name}
                        courseId={enrollingStudent.courseId}
                        tenantId={enrollingStudent.tenantId}
                        subjects={subjects}
                        onSuccess={() => setEnrollingStudent(null)}
                    />
                )}
            </BaseModal>
            <BaseModal
                isOpen={!!viewingStudent}
                onClose={() => setViewingStudent(null)}
                title={`Perfil de ${viewingStudent?.name}`}
                size="lg"
            >
                {viewingStudent && (
                    <StudentOverviewModal studentId={viewingStudent.id} />
                )}
            </BaseModal>
        </div>
    );
}
