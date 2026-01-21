"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTeacherClasses, getClassStudentsWithGrades, saveGrade } from "@/lib/actions/academic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";

export default function TeacherGradesPage() {
    const { data: session } = useSession();
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.teacherId) {
            getTeacherClasses(session.user.teacherId).then(setClasses);
        }
    }, [session]);

    const handleClassChange = async (classId: string) => {
        setSelectedClass(classId);
        setLoading(true);
        try {
            const data = await getClassStudentsWithGrades(classId);
            setEnrollments(data);
        } catch (error) {
            toast.error("Erro ao buscar alunos");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGrade = async (enrollmentId: string, type: string, value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        try {
            await saveGrade({
                enrollmentId,
                type,
                value: numValue,
                tenantId: session?.user?.tenantId!,
            });
            toast.success("Nota salva!");
            // Refresh data
            handleClassChange(selectedClass);
        } catch (error) {
            toast.error("Erro ao salvar nota");
        }
    };

    const isAdmin = session?.user?.role?.toUpperCase() === "ADMIN";

    if (!session?.user?.teacherId && !isAdmin) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Restrito</h1>
                <p className="mb-4">Esta página é exclusiva para professores vinculados ou administradores.</p>
                <div className="bg-gray-100 p-4 rounded-lg text-sm font-mono">
                    <p>DEBUG INFO:</p>
                    <p>Role: {session?.user?.role}</p>
                    <p>TeacherID: {session?.user?.teacherId || "Nulo"}</p>
                </div>
                <p className="mt-4 text-gray-500">
                    Dica: Se você acabou de se vincular como professor, tente
                    <button onClick={() => window.location.reload()} className="underline text-primary-600 ml-1">recarregar a página</button> ou
                    fazer logout e login novamente.
                </p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Lançamento de Notas</h1>

            <div className="mb-8">
                <label className="block text-sm font-medium mb-2">Selecione a Turma</label>
                <select
                    className="w-full max-w-md p-2 border rounded-lg bg-white"
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                >
                    <option value="">-- Selecione --</option>
                    {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                            {cls.subject?.name} ({cls.subject?.course?.name} - {cls.subject?.year}º Ano)
                        </option>
                    ))}
                </select>
            </div>

            {selectedClass && (
                <Card>
                    <CardHeader>
                        <CardTitle>Alunos da Turma</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p>Carregando...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-2">Aluno</th>
                                            <th className="py-2">P1</th>
                                            <th className="py-2">P2</th>
                                            <th className="py-2">Média Final</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map((enr) => {
                                            const p1 = enr.grades.find((g: any) => g.type === "P1")?.value || "";
                                            const p2 = enr.grades.find((g: any) => g.type === "P2")?.value || "";
                                            return (
                                                <tr key={enr.id} className="border-b">
                                                    <td className="py-4 font-medium">{enr.student?.name}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="w-20 p-2 border rounded"
                                                            defaultValue={p1}
                                                            onBlur={(e) => handleSaveGrade(enr.id, "P1", e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="w-20 p-2 border rounded"
                                                            defaultValue={p2}
                                                            onBlur={(e) => handleSaveGrade(enr.id, "P2", e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="font-bold">
                                                        {((parseFloat(p1) || 0) + (parseFloat(p2) || 0)) / 2}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
