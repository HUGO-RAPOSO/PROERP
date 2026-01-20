"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import BaseModal from "@/components/modals/BaseModal";
import StudentForm from "@/components/modals/StudentForm";
import ClassForm from "@/components/modals/ClassForm";
import CourseManager from "./CourseManager";
import ClassGrid from "@/components/academic/ClassGrid";
import StudentList from "@/components/academic/StudentList";

interface AcademicManagerProps {
    tenantId: string;
    teachers: { id: string; name: string }[];
    courses: any[];
    classes: any[];
    students: any[];
}

export default function AcademicManager({ tenantId, teachers, courses, classes, students }: AcademicManagerProps) {
    const [activeTab, setActiveTab] = useState<"CLASSES" | "COURSES">("CLASSES");
    const [isStudentOpen, setIsStudentOpen] = useState(false);
    const [isClassOpen, setIsClassOpen] = useState(false);

    return (
        <div className="space-y-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Gestão Acadêmica</h2>
                    <p className="text-gray-500 mt-1">Controle de alunos, turmas e organização curricular.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    {/* Tabs */}
                    <div className="flex p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/50 self-start sm:self-auto">
                        <button
                            onClick={() => setActiveTab("CLASSES")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "CLASSES" ? "bg-white text-primary-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Turmas e Alunos
                        </button>
                        <button
                            onClick={() => setActiveTab("COURSES")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "COURSES" ? "bg-white text-primary-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Cursos e Grade
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 self-start sm:self-auto ml-auto sm:ml-0">
                        {activeTab === "CLASSES" && (
                            <>
                                <button className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
                                    Importar
                                </button>
                                <button
                                    onClick={() => setIsClassOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" />
                                    Turma
                                </button>
                                <button
                                    onClick={() => setIsStudentOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" />
                                    Aluno
                                </button>
                            </>
                        )}
                        {/* We can add actions for Courses tab here if needed */}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[600px] animate-in fade-in duration-500 slide-in-from-bottom-4">
                {activeTab === "COURSES" ? (
                    <CourseManager tenantId={tenantId} courses={courses} />
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    Turmas Ativas
                                    <span className="bg-primary-50 text-primary-600 text-xs px-2.5 py-1 rounded-full">{classes.length}</span>
                                </h3>
                            </div>
                            <ClassGrid
                                classes={classes}
                                teachers={teachers}
                                courses={courses}
                                tenantId={tenantId}
                            />
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    Diretório de Alunos
                                    <span className="bg-primary-50 text-primary-600 text-xs px-2.5 py-1 rounded-full">{students.length}</span>
                                </h3>
                                <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">Ver Relatórios</button>
                            </div>
                            <StudentList students={students} courses={courses} />
                        </section>
                    </div>
                )}
            </div>

            {/* Shared Modals */}
            <BaseModal
                isOpen={isStudentOpen}
                onClose={() => setIsStudentOpen(false)}
                title="Cadastrar Novo Aluno"
            >
                <StudentForm
                    tenantId={tenantId}
                    courses={courses}
                    onSuccess={() => setIsStudentOpen(false)}
                />
            </BaseModal>

            <BaseModal
                isOpen={isClassOpen}
                onClose={() => setIsClassOpen(false)}
                title="Criar Nova Turma"
            >
                <ClassForm
                    tenantId={tenantId}
                    teachers={teachers}
                    courses={courses}
                    onSuccess={() => setIsClassOpen(false)}
                />
            </BaseModal>
        </div>
    );
}
