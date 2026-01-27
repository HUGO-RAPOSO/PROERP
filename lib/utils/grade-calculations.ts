
interface Grade {
    type: string;
    value: number;
}

interface StudentStatusResult {
    p1: string;
    p2: string;
    t1: string;
    exame: string;
    recorrencia: string;
    freq: number;
    finalGrade: number;
    status: string;
    needsExame: boolean;
    needsRecorrencia: boolean;
}

export function calculateStudentStatus(
    grades: Grade[],
    subjectRules?: {
        examWaiverPossible?: boolean;
        waiverGrade?: number;
        exclusionGrade?: number;
    }
): StudentStatusResult {
    const getG = (type: string) => grades.find((g) => g.type === type)?.value;
    const p1 = getG("P1")?.toString() ?? "";
    const p2 = getG("P2")?.toString() ?? "";
    const t1 = getG("T1")?.toString() ?? "";
    const exame = getG("EXAME")?.toString() ?? "";
    const recorrencia = getG("RECORRENCIA")?.toString() ?? "";

    const nP1 = parseFloat(p1) || 0;
    const nP2 = parseFloat(p2) || 0;
    const nT1 = parseFloat(t1) || 0;

    // Rules from Subject or defaults
    const waiverPossible = subjectRules?.examWaiverPossible !== false; // Default true
    const waiverGrade = subjectRules?.waiverGrade || 14;
    const exclusionGrade = subjectRules?.exclusionGrade || 7;

    // Standard division by 3 (P1, P2, T1)
    const freq = (nP1 + nP2 + nT1) / 3;

    let status = "Em Curso";
    let needsExame = false;
    let needsRecorrencia = false;
    let finalGrade = freq;

    // Logic - Only calculate if all term grades are present
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
        // Metric: (Freq + Exam)/2 >= 10
        const examAvg = (freq + nExame) / 2;

        if (examAvg < 10) {
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
        // Recurrence replaces Exam - if >= 10 passed
        if (nRec >= 10) {
            status = "Aprovado (Rec)";
            finalGrade = nRec;
        } else {
            status = "Reprovado";
            finalGrade = nRec;
        }
    }

    return {
        p1,
        p2,
        t1,
        exame,
        recorrencia,
        freq,
        finalGrade,
        status,
        needsExame,
        needsRecorrencia
    };
}
