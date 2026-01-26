"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getStudentGrades } from "@/lib/actions/academic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentGradesPage() {
    const { data: session } = useSession();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.studentId) {
            getStudentGrades(session.user.studentId)
                .then(setEnrollments)
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (!session?.user?.studentId) {
        return <div className="p-8">Acesso restrito a alunos.</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Meu Boletim</h1>

            <div className="grid gap-6">
                {loading ? (
                    <p>Carregando notas...</p>
                ) : enrollments.length === 0 ? (
                    <p>Nenhuma matrícula encontrada.</p>
                ) : (
                    enrollments.map((enr) => (
                        <Card key={enr.id}>
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    {enr.class?.subject?.name} ({enr.class?.subject?.code})
                                </CardTitle>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">Ano: {enr.year}</p>
                                    <div className="text-xs text-gray-400">
                                        Dispensa: {enr.subject?.waiverGrade || 14} | Exclusão: {enr.subject?.exclusionGrade || 7}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase font-bold">P1</div>
                                        <div className="text-xl font-bold">
                                            {enr.grades.find((g: any) => g.type === "P1")?.value || "-"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase font-bold">P2</div>
                                        <div className="text-xl font-bold">
                                            {enr.grades.find((g: any) => g.type === "P2")?.value || "-"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase font-bold">Trabalho</div>
                                        <div className="text-xl font-bold">
                                            {enr.grades.find((g: any) => g.type === "T1")?.value || "-"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-primary-50 rounded-lg md:col-span-1">
                                        <div className="text-xs text-primary-500 uppercase font-bold">Frequência</div>
                                        <div className="text-2xl font-bold text-primary-700">
                                            {(() => {
                                                const p1 = parseFloat(enr.grades.find((g: any) => g.type === "P1")?.value) || 0;
                                                const p2 = parseFloat(enr.grades.find((g: any) => g.type === "P2")?.value) || 0;
                                                const t1 = parseFloat(enr.grades.find((g: any) => g.type === "T1")?.value) || 0;
                                                return ((p1 + p2 + t1) / 3).toFixed(1);
                                            })()}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 grid grid-cols-2 gap-2">
                                        <div className="p-2 bg-orange-50 rounded border border-orange-100">
                                            <div className="text-xs text-orange-500 font-bold">Exame</div>
                                            <div className="text-lg font-bold">
                                                {enr.grades.find((g: any) => g.type === "EXAME")?.value || "-"}
                                            </div>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded border border-red-100">
                                            <div className="text-xs text-red-500 font-bold">Recorrência</div>
                                            <div className="text-lg font-bold">
                                                {enr.grades.find((g: any) => g.type === "RECORRENCIA")?.value || "-"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-6 mt-2 pt-2 border-t">
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm font-bold text-gray-500">SITUAÇÃO ATUAL</div>
                                            <div className="text-lg font-bold">
                                                {(() => {
                                                    const getG = (t: string) => parseFloat(enr.grades.find((g: any) => g.type === t)?.value) || 0;
                                                    const hasG = (t: string) => enr.grades.some((g: any) => g.type === t);

                                                    const p1 = getG("P1"); const hasP1 = hasG("P1");
                                                    const p2 = getG("P2"); const hasP2 = hasG("P2");
                                                    const t1 = getG("T1"); const hasT1 = hasG("T1");
                                                    const exame = getG("EXAME"); const hasExame = hasG("EXAME");
                                                    const rec = getG("RECORRENCIA"); const hasRec = hasG("RECORRENCIA");

                                                    const freq = (p1 + p2 + t1) / 3;
                                                    const waiverPossible = enr.subject?.examWaiverPossible !== false;
                                                    const waiverGrade = enr.subject?.waiverGrade || 14;
                                                    const exclusionGrade = enr.subject?.exclusionGrade || 7;

                                                    if (!hasP1 || !hasP2 || !hasT1) return <span className="text-gray-400">Em Andamento</span>;

                                                    if (freq < exclusionGrade) return <span className="text-red-600">Excluído</span>;

                                                    if (waiverPossible && freq >= waiverGrade) return <span className="text-green-600">Dispensado</span>;

                                                    // Needs Exam
                                                    if (hasExame) {
                                                        const examAvg = (freq + exame) / 2;
                                                        // Logic: if examAvg < 10 (or whatever pass mark), go to Recurrence
                                                        if (examAvg < 10) {
                                                            if (hasRec) {
                                                                return rec >= 10 ? <span className="text-green-600">Aprovado (Rec)</span> : <span className="text-red-600">Reprovado</span>;
                                                            }
                                                            return <span className="text-red-500">Reprovado (Exame) - Aguardando Recorrência</span>;
                                                        }
                                                        return <span className="text-green-600">Aprovado (Exame)</span>;
                                                    }

                                                    return <span className="text-orange-500">Admitido ao Exame</span>;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
