"use client";

import { Plus, MapPin, Edit2, Trash2, Users } from "lucide-react";
import { useState } from "react";
import BaseModal from "@/components/modals/BaseModal";
import StudentForm from "@/components/modals/StudentForm";
import ClassForm from "@/components/modals/ClassForm";
import RoomForm from "@/components/modals/RoomForm";
import CourseManager from "./CourseManager";
import ClassGrid from "@/components/academic/ClassGrid";
import StudentList from "@/components/academic/StudentList";
import { deleteRoom } from "@/lib/actions/academic";
import { toast } from "react-hot-toast";

interface AcademicManagerProps {
    tenantId: string;
    teachers: { id: string; name: string }[];
    courses: any[];
    classes: any[];
    students: any[];
    subjects: any[];
    accounts: any[];
    rooms: any[];
}

export default function AcademicManager({ tenantId, teachers, courses, classes, students, subjects, accounts, rooms }: AcademicManagerProps) {
    const [activeTab, setActiveTab] = useState<"CLASSES" | "COURSES" | "ROOMS">("CLASSES");
    const [isStudentOpen, setIsStudentOpen] = useState(false);
    const [isClassOpen, setIsClassOpen] = useState(false);
    const [isRoomOpen, setIsRoomOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);

    const handleDeleteRoom = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta sala?")) return;
        try {
            const res = await deleteRoom(id);
            if (res.success) toast.success("Sala excluída!");
            else toast.error(res.error || "Erro ao excluir sala");
        } catch (error) {
            toast.error("Erro ao excluir sala");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Gestão Acadêmica</h2>
                    <p className="text-gray-500 mt-1">Controle de alunos, turmas e organização curricular.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    {/* Tabs */}
                    <div className="flex p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/50 self-start sm:self-auto overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("CLASSES")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "CLASSES" ? "bg-white text-primary-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Turmas e Alunos
                        </button>
                        <button
                            onClick={() => setActiveTab("COURSES")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "COURSES" ? "bg-white text-primary-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Cursos e Grade
                        </button>
                        <button
                            onClick={() => setActiveTab("ROOMS")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === "ROOMS" ? "bg-white text-primary-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            Salas
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 self-start sm:self-auto ml-auto sm:ml-0">
                        {activeTab === "CLASSES" && (
                            <>
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
                        {activeTab === "ROOMS" && (
                            <button
                                onClick={() => setIsRoomOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                Nova Sala
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="min-h-[600px] animate-in fade-in duration-500 slide-in-from-bottom-4">
                {activeTab === "COURSES" ? (
                    <CourseManager tenantId={tenantId} courses={courses} />
                ) : activeTab === "ROOMS" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <div key={room.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => setEditingRoom(room)}
                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRoom(room.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h4>
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Users className="w-4 h-4" />
                                    <span>Capacidade: {room.capacity || "N/A"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
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
                                turmas={classes}
                                teachers={teachers}
                                courses={courses}
                                tenantId={tenantId}
                                rooms={rooms}
                            />
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    Diretório de Alunos
                                    <span className="bg-primary-50 text-primary-600 text-xs px-2.5 py-1 rounded-full">{students.length}</span>
                                </h3>
                                <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">Relatórios</button>
                            </div>
                            <StudentList students={students} courses={courses} subjects={subjects} accounts={accounts} turmas={classes} />
                        </section>
                    </div>
                )}
            </div>

            <BaseModal
                isOpen={isStudentOpen}
                onClose={() => setIsStudentOpen(false)}
                title="Cadastrar Novo Aluno"
            >
                <StudentForm
                    tenantId={tenantId}
                    courses={courses}
                    accounts={accounts}
                    turmas={classes}
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
                    courses={courses}
                    onSuccess={() => setIsClassOpen(false)}
                />
            </BaseModal>

            <BaseModal
                isOpen={isRoomOpen || !!editingRoom}
                onClose={() => { setIsRoomOpen(false); setEditingRoom(null); }}
                title={editingRoom ? "Editar Sala" : "Nova Sala"}
            >
                <RoomForm
                    tenantId={tenantId}
                    initialData={editingRoom}
                    onSuccess={() => { setIsRoomOpen(false); setEditingRoom(null); }}
                />
            </BaseModal>
        </div>
    );
}
