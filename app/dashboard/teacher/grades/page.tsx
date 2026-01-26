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

            // Note: Optimistic update or refetch would be ideal here to recalculate totals
            // For now we just refetch
            toast.success("Nota salva!");
            const data = await getClassStudentsWithGrades(selectedClass);
            setEnrollments(data);
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
                                            <th className="py-2">Trabalho (T1)</th>
                                            <th className="py-2">Frequência</th>
                                            <th className="py-2">Exame</th>
                                            <th className="py-2">Recorrência</th>
                                            <th className="py-2">Situação Final</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map((enr) => {
                                            const getG = (type: string) => enr.grades.find((g: any) => g.type === type)?.value;
                                            const p1 = getG("P1") ?? "";
                                            const p2 = getG("P2") ?? "";
                                            const t1 = getG("T1") ?? "";
                                            const exame = getG("EXAME") ?? "";
                                            const recorrencia = getG("RECORRENCIA") ?? "";

                                            const nP1 = parseFloat(p1) || 0;
                                            const nP2 = parseFloat(p2) || 0;
                                            const nT1 = parseFloat(t1) || 0;

                                            // Rules from Subject or defaults
                                            const waiverPossible = enr.subject?.examWaiverPossible !== false; // Default true
                                            const waiverGrade = enr.subject?.waiverGrade || 14;
                                            const exclusionGrade = enr.subject?.exclusionGrade || 7;

                                            // Count how many frequency grades are entered to determine divisor if needed, 
                                            // but requirement says 2 tests + 1 work. Let's assume standard division by 3.
                                            const freq = (nP1 + nP2 + nT1) / 3;

                                            let status = "Em Curso";
                                            let needsExame = false;
                                            let needsRecorrencia = false;
                                            let finalGrade = freq;

                                            // Logic
                                            if (p1 !== "" && p2 !== "" && t1 !== "") {
                                                if (freq < exclusionGrade) {
                                                    status = "Excluído";
                                                } else if (waiverPossible && freq >= waiverGrade) {
                                                    status = "Dispensado";
                                                } else {
                                                    status = "Exame";
                                                    needsExame = true;
                                                }
                                            }

                                            // If Exam entered
                                            if (needsExame && exame !== "") {
                                                const nExame = parseFloat(exame);
                                                // Exame counts 40% usually? Or simple average? 
                                                // Let's assume standard: Needs to raise average to X. 
                                                // Requirement says: "se tiver uma baixa no exame vai a recorencia"
                                                // Let's assume passed if (Freq + Exam)/2 >= 10 (Standard logic)
                                                // If that is low, GO TO Recorrencia.

                                                const examAvg = (freq + nExame) / 2;
                                                if (examAvg < 10) { // Assuming 10 is pass
                                                    status = "Recorrência";
                                                    needsRecorrencia = true;
                                                } else {
                                                    status = "Aprovado";
                                                    needsExame = false;
                                                }
                                                finalGrade = examAvg;
                                            }

                                            // If Recorrencia entered
                                            if (needsRecorrencia && recorrencia !== "") {
                                                const nRec = parseFloat(recorrencia);
                                                // Usually Recurrence replaces Exam or averages? 
                                                // Simple logic: if Recurrence >= 10 passed.
                                                if (nRec >= 10) {
                                                    status = "Aprovado (Rec)";
                                                    finalGrade = nRec;
                                                } else {
                                                    status = "Reprovado";
                                                    finalGrade = nRec;
                                                }
                                            }

                                            return (
                                                <tr key={enr.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-4 font-medium">{enr.student?.name}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="w-16 p-2 border rounded text-center"
                                                            defaultValue={p1}
                                                            onBlur={(e) => handleSaveGrade(enr.id, "P1", e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="w-16 p-2 border rounded text-center"
                                                            defaultValue={p2}
                                                            onBlur={(e) => handleSaveGrade(enr.id, "P2", e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="w-16 p-2 border rounded text-center"
                                                            defaultValue={t1}
                                                            onBlur={(e) => handleSaveGrade(enr.id, "T1", e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="font-bold text-center text-gray-700 bg-gray-50">
                                                        {freq.toFixed(1)}
                                                    </td>
                                                    <td>
                                                        {needsExame || (exame !== "") ? (
                                                            <input
                                                                type="number"
                                                                className="w-16 p-2 border rounded text-center border-orange-200 bg-orange-50"
                                                                defaultValue={exame}
                                                                onBlur={(e) => handleSaveGrade(enr.id, "EXAME", e.target.value)}
                                                            />
                                                        ) : <span className="text-gray-300">-</span>}
                                                    </td>
                                                    <td>
                                                        {needsRecorrencia || (recorrencia !== "") ? (
                                                            <input
                                                                type="number"
                                                                className="w-16 p-2 border rounded text-center border-red-200 bg-red-50"
                                                                defaultValue={recorrencia}
                                                                onBlur={(e) => handleSaveGrade(enr.id, "RECORRENCIA", e.target.value)}
                                                            />
                                                        ) : <span className="text-gray-300">-</span>}
                                                    </td>
                                                    <td>
                                                        <span className={`px-2 py-1 rounded text-xs font-bold
                                                            ${status === 'Aprovado' || status === 'Dispensado' || status === 'Aprovado (Rec)' ? 'bg-green-100 text-green-700' : ''}
                                                            ${status === 'Exame' ? 'bg-orange-100 text-orange-700' : ''}
                                                            ${status === 'Excluído' || status === 'Reprovado' ? 'bg-red-100 text-red-700' : ''}
                                                            ${status === 'Recorrência' ? 'bg-purple-100 text-purple-700' : ''}
                                                            ${status === 'Em Curso' ? 'bg-gray-100 text-gray-600' : ''}
                                                        `}>
                                                            {status}
                                                        </span>
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
