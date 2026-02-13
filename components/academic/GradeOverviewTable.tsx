"use client";

import { useState } from "react";
import { saveGrade } from "@/lib/actions/academic";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

                                    // Calculate Average and Status for locking logic
                                    const p1 = Number(enrollment.grades?.find((g: any) => g.type === 'P1')?.value);
                                    const p2 = Number(enrollment.grades?.find((g: any) => g.type === 'P2')?.value);
                                    const t1 = Number(enrollment.grades?.find((g: any) => g.type === 'T1')?.value);
                                    const exam = Number(enrollment.grades?.find((g: any) => g.type === 'EXAM')?.value);

                                    let isDisabled = false;
                                    const hasContinuousGrades = !isNaN(p1) && !isNaN(p2) && !isNaN(t1);

                                    if (hasContinuousGrades) {
                                        const avg = (p1 + p2 + t1) / 3;

                                        // Locking Logic
                                        if (type === 'EXAM') {
                                            // Lock Exam if Excluded (< 7) or Exempt (>= 14)
                                            // Also default subject waiver/exclusion if present
                                            const waiver = enrollment.subject?.waiverGrade ?? 14;
                                            const exclusion = enrollment.subject?.exclusionGrade ?? 7;

                                            if (avg < exclusion || avg >= waiver) {
                                                isDisabled = true;
                                            }
                                        } else if (type === 'RESOURCE') {
                                            // Lock Resource if NOT Failed Exam (< 10)
                                            // Basically, only enable if Exam exists AND is < 10
                                            if (isNaN(exam) || exam >= 10) {
                                                isDisabled = true;
                                            }
                                        } else if (type === 'FINAL') {
                                            // Usually auto-calculated or locked if excluded
                                            // For now, let's lock it if Excluded
                                            const exclusion = enrollment.subject?.exclusionGrade ?? 7;
                                            if (avg < exclusion) {
                                                isDisabled = true;
                                            }
                                        }
                                    } else {
                                        // If continuous grades are missing, logic typically dictates we can't do Exam yet.
                                        // But to be safe/flexible, maybe we don't lock, OR we lock Exam until P1/P2/T1 are in.
                                        // Let's lock Exam/Resource/Final if P1/P2/T1 are missing to force order.
                                        if (['EXAM', 'RESOURCE', 'FINAL'].includes(type)) {
                                            isDisabled = true;
                                        }
                                    }

                                    return (
                                        <td key={type} className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
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
                                                    value={getGradeValue(enrollment.id, type, grade?.value)}
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
