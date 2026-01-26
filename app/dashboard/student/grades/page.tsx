"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getStudentGrades } from "@/lib/actions/academic";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

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

    const calculateStatus = (enr: any) => {
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

        let statusText = "Em Andamento";
        let color = "bg-gray-100 text-gray-700";

        if (!hasP1 || !hasP2 || !hasT1) return { text: statusText, color };

        if (freq < exclusionGrade) {
            return { text: "Excluído", color: "bg-red-100 text-red-700" };
        }

        if (waiverPossible && freq >= waiverGrade) {
            return { text: "Dispensado", color: "bg-green-100 text-green-700" };
        }

        // Needs Exam
        if (hasExame) {
            const examAvg = (freq + exame) / 2;
            if (examAvg < 10) {
                if (hasRec) {
                    return rec >= 10
                        ? { text: "Aprovado (Rec)", color: "bg-green-100 text-green-700" }
                        : { text: "Reprovado", color: "bg-red-100 text-red-700" };
                }
                return { text: "Reprovado (Exame)", color: "bg-red-50 text-red-600 border border-red-100" };
            }
            return { text: "Aprovado (Exame)", color: "bg-green-100 text-green-700" };
        }

        return { text: "Admitido ao Exame", color: "bg-orange-100 text-orange-700" };
    };

    // Group by Year
    const byYear = enrollments.reduce((acc, enr) => {
        const year = enr.year || 1;
        if (!acc[year]) acc[year] = [];
        acc[year].push(enr);
        return acc;
    }, {} as Record<number, any[]>);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Meu Boletim</h1>

            {loading ? (
                <p>Carregando notas...</p>
            ) : enrollments.length === 0 ? (
                <p>Nenhuma matrícula encontrada.</p>
            ) : (
                <div className="space-y-8">
                    {Object.keys(byYear).map(year => (
                        <div key={year} className="bg-white rounded-xl border p-4">
                            <h2 className="text-lg font-bold mb-4">{year}º Ano</h2>

                            <Accordion type="single" collapsible className="w-full">
                                {byYear[parseInt(year)].map((enr: any) => {
                                    const { text: statusText, color: statusColor } = calculateStatus(enr);
                                    return (
                                        <AccordionItem key={enr.id} value={enr.id}>
                                            <AccordionTrigger className="hover:no-underline">
                                                <div className="flex justify-between w-full pr-4 items-center">
                                                    <div className="text-left">
                                                        <div className="font-semibold">{enr.class?.subject?.name}</div>
                                                        <div className="text-xs text-gray-400">{enr.class?.subject?.code}</div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                                                        {statusText}
                                                    </span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="p-4 bg-gray-50/50 rounded-lg space-y-4">
                                                    <div className="text-xs text-gray-400 text-right">
                                                        Regras: Dispensa &ge; {enr.subject?.waiverGrade || 14} | Exclusão &lt; {enr.subject?.exclusionGrade || 7}
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                                        {/* Basic Grades */}
                                                        {["P1", "P2", "T1"].map(type => (
                                                            <div key={type} className="bg-white p-3 rounded border text-center">
                                                                <div className="text-[10px] bg-gray-100 inline-block px-1 rounded text-gray-500 font-bold mb-1">
                                                                    {type === "T1" ? "TRAB" : type}
                                                                </div>
                                                                <div className="text-lg font-semibold text-gray-900">
                                                                    {enr.grades.find((g: any) => g.type === type)?.value || "-"}
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Frequency */}
                                                        <div className="bg-blue-50/50 p-3 rounded border border-blue-100 text-center md:col-span-1">
                                                            <div className="text-[10px] text-blue-600 font-bold mb-1">
                                                                FREQ
                                                            </div>
                                                            <div className="text-xl font-bold text-blue-700">
                                                                {(() => {
                                                                    const p1 = parseFloat(enr.grades.find((g: any) => g.type === "P1")?.value) || 0;
                                                                    const p2 = parseFloat(enr.grades.find((g: any) => g.type === "P2")?.value) || 0;
                                                                    const t1 = parseFloat(enr.grades.find((g: any) => g.type === "T1")?.value) || 0;
                                                                    return ((p1 + p2 + t1) / 3).toFixed(1);
                                                                })()}
                                                            </div>
                                                        </div>

                                                        {/* Exam & Recurrence */}
                                                        <div className="bg-white p-3 rounded border text-center">
                                                            <div className="text-[10px] text-orange-500 font-bold mb-1">EXAME</div>
                                                            <div className="text-lg font-semibold text-gray-900">
                                                                {enr.grades.find((g: any) => g.type === "EXAME")?.value || "-"}
                                                            </div>
                                                        </div>
                                                        <div className="bg-white p-3 rounded border text-center">
                                                            <div className="text-[10px] text-red-500 font-bold mb-1">REC</div>
                                                            <div className="text-lg font-semibold text-gray-900">
                                                                {enr.grades.find((g: any) => g.type === "RECORRENCIA")?.value || "-"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
