"use client";

import { useState } from "react";
import { saveGrade } from "@/lib/actions/academic";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { calculateStudentStatus } from "@/lib/academic-utils";

interface GradeOverviewTableProps {
    students: any[];
    lesson: any;
    currentTenantId: string;
}

export default function GradeOverviewTable({ students, lesson, currentTenantId }: GradeOverviewTableProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [edits, setEdits] = useState<Record<string, number>>({});
    const router = useRouter();

    const handleGradeChange = (enrollmentId: string, type: string, value: string) => {
        const key = `${enrollmentId}-${type}`;
        setEdits(prev => ({ ...prev, [key]: Number(value) }));
    };

    const handleSave = async (enrollmentId: string, type: string) => {
        const key = `${enrollmentId}-${type}`;
        const value = edits[key];

        if (value === undefined || isNaN(value)) return;

        setLoading(key);
        try {
            await saveGrade({
                enrollmentId,
                value,
                type,
                tenantId: currentTenantId,
            });
            setSuccess(key);
            setTimeout(() => setSuccess(null), 2000);
            router.refresh();
        } catch (error) {
            console.error("Failed to save grade:", error);
            alert("Erro ao salvar nota");
        } finally {
            setLoading(null);
        }
    };

    const getGradeValue = (enrollmentId: string, type: string, originalValue?: number) => {
        const key = `${enrollmentId}-${type}`;
        return edits[key] !== undefined ? edits[key] : (originalValue ?? "");
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="max-h-[600px] overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 font-medium">Aluno</th>
                            <th className="px-6 py-4 font-medium w-32 text-center">P1</th>
                            <th className="px-6 py-4 font-medium w-32 text-center">P2</th>
                            <th className="px-6 py-4 font-medium w-32 text-center">Trabalho (T1)</th>
                            <th className="px-6 py-4 font-medium w-32 text-center">Exame</th>
                            <th className="px-6 py-4 font-medium w-32 text-center">Recurso</th>
                            <th className="px-6 py-4 font-medium w-32 text-center">Final</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((enrollment) => (
                            <tr key={enrollment.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {enrollment.student?.name || "Aluno desconhecido"}
                                </td>
                                {['P1', 'P2', 'T1', 'EXAM', 'RESOURCE', 'FINAL'].map((type) => {
                                    const grade = enrollment.grades?.find((g: any) => g.type === type);
                                    const key = `${enrollment.id}-${type}`;
                                    const isLoading = loading === key;
                                    const isSuccess = success === key;

                                    // Use shared calculation logic
                                    const rules = {
                                        waiverGrade: enrollment.subject?.waiverGrade,
                                        exclusionGrade: enrollment.subject?.exclusionGrade
                                    };

                                    // Map grades to the helper format
                                    const studentGrades = ['P1', 'P2', 'T1', 'EXAM', 'RESOURCE'].map(t => ({
                                        type: t,
                                        value: Number(enrollment.grades?.find((g: any) => g.type === t)?.value)
                                    })).filter(g => !isNaN(g.value));

                                    const status = calculateStudentStatus(studentGrades, rules);
                                    let isDisabled = false;
                                    let displayValue = getGradeValue(enrollment.id, type, grade?.value);
                                    let isReadOnly = false;

                                    // Locking Logic based on calculated status
                                    if (type === 'EXAM') {
                                        // Lock Exam if Excluded or Exempt, or if continuous grades missing
                                        if (status.isExcluded || status.isExempt || !status.hasContinuousGrades) {
                                            isDisabled = true;
                                        }
                                    } else if (type === 'RESOURCE') {
                                        // Lock Resource if NOT Recurrence
                                        if (!status.isRecurrence) {
                                            isDisabled = true;
                                        }
                                    } else if (type === 'FINAL') {
                                        // Final is ALWAYS Auto-Calculated/Read-Only in this view?
                                        // User asked for "nota final (deve ser automatica)"
                                        // So we should display the calculated final grade and disable editing.
                                        isDisabled = true;
                                        isReadOnly = true;
                                        if (status.finalGrade !== null) {
                                            displayValue = status.finalGrade.toString();
                                        } else {
                                            displayValue = "-";
                                        }
                                    } else {
                                        // P1, P2, T1
                                        // Could lock if Exam is present? usually yes, but let's keep flexible for corrections.
                                    }


                                    return (
                                        <td key={type} className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                {isReadOnly ? (
                                                    <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-md min-w-[3rem] text-center block">
                                                        {displayValue}
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="20"
                                                            step="0.1"
                                                            disabled={isDisabled}
                                                            className={`w-16 px-2 py-1 text-center border rounded-md outline-none transition-all ${isDisabled
                                                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                : "border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                                }`}
                                                            value={displayValue}
                                                            onChange={(e) => handleGradeChange(enrollment.id, type, e.target.value)}
                                                        />
                                                        {!isDisabled && (
                                                            <button
                                                                onClick={() => handleSave(enrollment.id, type)}
                                                                disabled={isLoading}
                                                                className={`p-1.5 rounded-md transition-colors ${isSuccess
                                                                    ? "text-green-500 bg-green-50"
                                                                    : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                                    }`}
                                                            >
                                                                {isLoading ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : isSuccess ? (
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                ) : (
                                                                    <Save className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Nenhum aluno encontrado nesta turma.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
