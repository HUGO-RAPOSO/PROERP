
export interface Grade {
    type: string;
    value: number;
}

export interface SubjectRules {
    waiverGrade?: number;
    exclusionGrade?: number;
}

export interface StudentStatus {
    average: number | null;
    finalGrade: number | null;
    status: 'Enrolled' | 'Excluded' | 'Admitted' | 'Exempt' | 'Recurrence' | 'Approved' | 'Failed';
    isExcluded: boolean;
    isExempt: boolean;
    isAdmitted: boolean;
    isRecurrence: boolean;
    hasContinuousGrades: boolean;
}

export function calculateStudentStatus(grades: Grade[] | undefined, rules: SubjectRules = {}): StudentStatus {
    const defaultWaiver = 14;
    const defaultExclusion = 7;

    const waiverGrade = rules.waiverGrade ?? defaultWaiver;
    const exclusionGrade = rules.exclusionGrade ?? defaultExclusion;

    const p1 = grades?.find(g => g.type === 'P1')?.value;
    const p2 = grades?.find(g => g.type === 'P2')?.value;
    const t1 = grades?.find(g => g.type === 'T1')?.value;
    const exam = grades?.find(g => g.type === 'EXAM')?.value;
    const resource = grades?.find(g => g.type === 'RESOURCE')?.value;

    const hasP1 = p1 !== undefined && !isNaN(p1);
    const hasP2 = p2 !== undefined && !isNaN(p2);
    const hasT1 = t1 !== undefined && !isNaN(t1);
    const hasContinuousGrades = hasP1 && hasP2 && hasT1;

    let average: number | null = null;
    let finalGrade: number | null = null;
    let status: StudentStatus['status'] = 'Enrolled';

    if (hasContinuousGrades) {
        average = (p1! + p2! + t1!) / 3;
    }

    const isExcluded = average !== null && average < exclusionGrade;
    const isExempt = average !== null && average >= waiverGrade;
    const isAdmitted = average !== null && average >= exclusionGrade && average < waiverGrade;

    // Determine Status & Final Grade
    if (average !== null) {
        if (isExcluded) {
            status = 'Excluded';
            finalGrade = average; // Final grade is just the average if excluded
        } else if (isExempt) {
            status = 'Exempt';
            finalGrade = average; // Exempt students keep their average as final
        } else if (isAdmitted) {
            status = 'Admitted';
            // If they are admitted, they need an Exam
            if (exam !== undefined && !isNaN(exam)) {
                // Calculate Final with Exam
                // Formula: Simple Average (Avg + Exam) / 2
                let examFinal = (average + exam) / 2;

                if (examFinal >= 10) {
                    status = 'Approved';
                    finalGrade = examFinal;
                } else {
                    // Recurrence Check
                    // If Exam < 10, they go to Recurrence (Resource)
                    // Or if the combined is < 10? Usually if Exam < 10 implies Recurrence.
                    // But strictly, if (Avg + Exam)/2 < 10.
                    status = 'Recurrence';
                    finalGrade = examFinal; // Provisional final

                    if (resource !== undefined && !isNaN(resource)) {
                        // Resource replaces the Exam in the calculation? 
                        // Or Resource is the final grade directly?
                        // Usually Resource replaces Exam.
                        // Let's assume Resource is the new "Exam" grade.
                        const resourceFinal = (average + resource) / 2;
                        // OR Resource is the Grade itself. Many systems use Resource as the grade.
                        // Let's stick to (Avg + Resource) / 2 for consistency unless Resource is 100% weight.
                        // Code elsewhere implies Resource is a replacement.
                        finalGrade = resourceFinal;
                        status = finalGrade >= 10 ? 'Approved' : 'Failed';
                    }
                }
            }
        }
    }

    // Recurrence boolean helper
    const isRecurrence = status === 'Recurrence';

    return {
        average,
        finalGrade: finalGrade !== null ? Number(finalGrade.toFixed(1)) : null,
        status,
        isExcluded,
        isExempt,
        isAdmitted,
        isRecurrence,
        hasContinuousGrades
    };
}
