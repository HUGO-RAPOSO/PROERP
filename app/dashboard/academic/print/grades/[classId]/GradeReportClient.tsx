"use client";

import { Printer } from "lucide-react";
import { calculateStudentStatus } from "@/lib/utils/grade-calculations";

interface GradeReportClientProps {
    classDetails: any;
    enrollments: any[];
    subject: any;
}

export default function GradeReportClient({ classDetails, enrollments, subject }: GradeReportClientProps) {
    return (
        <div className="min-h-screen bg-white p-8 space-y-8" id="grade-report-container">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: landscape;
                        margin: 10mm;
                    }
                    body * { visibility: hidden; }
                    #grade-report-container, #grade-report-container * { visibility: visible; }
                    #grade-report-container {
                        position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0;
                        font-family: 'Times New Roman', Times, serif !important;
                    }
                    .no-print { display: none !important; }
                    
                    /* Table Styles */
                    table { border-collapse: collapse; width: 100%; font-size: 11px; }
                    th, td { border: 1px solid #000; padding: 4px 8px; color: #000; }
                    th { background-color: #eee !important; font-weight: bold; text-transform: uppercase; }
                    tr:nth-child(even) { background-color: #f9f9f9 !important; }
                    
                    /* Header Styles */
                    .print-header { border-bottom: 2px solid #000; margin-bottom: 15px; padding-bottom: 10px; }
                }
            `}} />

            {/* Print Header */}
            <div className="flex justify-between items-end border-b-2 border-black pb-4 print-header">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight">Pauta de Avaliação</h1>
                    <div className="mt-2 grid grid-cols-2 gap-x-12 gap-y-1 text-sm">
                        <p><span className="font-bold">Curso:</span> {subject?.course?.name}</p>
                        <p><span className="font-bold">Disciplina:</span> {subject?.name}</p>
                        <p><span className="font-bold">Ano/Semestre:</span> {subject?.year}º Ano / {subject?.semester}º Sem.</p>
                        <p><span className="font-bold">Turma:</span> {classDetails.name}</p>
                        <p><span className="font-bold">Docente:</span> {classDetails.teacher?.name || "N/A"}</p>
                    </div>
                </div>
                <div className="text-right text-xs">
                    <p>Instituição de Ensino Superior</p>
                    <p>Gerado em: {new Date().toLocaleString()}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-end no-print">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded font-bold hover:bg-gray-800"
                >
                    <Printer className="w-4 h-4" />
                    Imprimir (Ctrl+P)
                </button>
            </div>

            {/* Grades Table */}
            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="w-10 text-center">#</th>
                        <th className="w-32">Nº Estudante</th>
                        <th>Nome Completo</th>
                        <th className="w-16 text-center">P1</th>
                        <th className="w-16 text-center">P2</th>
                        <th className="w-16 text-center">Trab.</th>
                        <th className="w-16 text-center bg-gray-50">Freq.</th>
                        <th className="w-16 text-center">Exame</th>
                        <th className="w-16 text-center">Rec.</th>
                        <th className="w-16 text-center bg-gray-100">Nota</th>
                        <th className="w-32 text-center">Situação</th>
                    </tr>
                </thead>
                <tbody>
                    {enrollments.map((enrollment: any, idx: number) => {
                        const stats = calculateStudentStatus(enrollment.grades, {
                            examWaiverPossible: subject?.examWaiverPossible,
                            waiverGrade: subject?.waiverGrade,
                            exclusionGrade: subject?.exclusionGrade
                        });

                        return (
                            <tr key={enrollment.id}>
                                <td className="text-center text-gray-500">{idx + 1}</td>
                                <td className="font-mono text-xs">{enrollment.student?.enrollmentSlipNumber || "-"}</td>
                                <td className="font-bold">{enrollment.student?.name}</td>
                                <td className="text-center">{stats.p1 || "-"}</td>
                                <td className="text-center">{stats.p2 || "-"}</td>
                                <td className="text-center">{stats.t1 || "-"}</td>
                                <td className="text-center font-bold bg-gray-50">{stats.freq.toFixed(1)}</td>
                                <td className="text-center">{stats.exame || "-"}</td>
                                <td className="text-center">{stats.recorrencia || "-"}</td>
                                <td className="text-center font-black bg-gray-100 text-lg">{stats.finalGrade.toFixed(1)}</td>
                                <td className="text-center">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-black`}>
                                        {stats.status}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Footer Signatures */}
            <div className="grid grid-cols-3 gap-8 mt-20 pt-8 no-print:hidden">
                <div className="text-center border-t border-black pt-2">
                    <p className="text-xs font-bold uppercase">O Docente</p>
                </div>
                <div className="text-center border-t border-black pt-2">
                    <p className="text-xs font-bold uppercase">O Chefe de Departamento</p>
                </div>
                <div className="text-center border-t border-black pt-2">
                    <p className="text-xs font-bold uppercase">Registo Académico</p>
                </div>
            </div>
        </div>
    );
}
