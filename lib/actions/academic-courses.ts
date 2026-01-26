"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// --- Courses ---

export async function createCourse(data: {
    name: string;
    type: string;
    duration: number;
    periodType: string;
    price: number;
    enrollmentFee: number;
    tenantId: string;
    paymentStartDay?: number;
    paymentEndDay?: number;
    lateFeeValue?: number;
    lateFeeType?: "FIXED" | "PERCENTAGE";
}) {
    try {
        const { data: course, error } = await supabase
            .from('Course')
            .insert({
                name: data.name,
                type: data.type,
                duration: data.duration,
                periodType: data.periodType,
                price: data.price,
                tenantId: data.tenantId,
                paymentStartDay: data.paymentStartDay,
                paymentEndDay: data.paymentEndDay,
                lateFeeValue: data.lateFeeValue,
                lateFeeType: data.lateFeeType,
                enrollmentFee: data.enrollmentFee
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating course:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/academic");
        return { success: true, data: course };
    } catch (error: any) {
        console.error("Critical error in createCourse:", error);
        return { success: false, error: error.message || "Erro ao criar curso" };
    }
}

export async function updateCourse(id: string, data: {
    name: string;
    duration: number;
    price: number;
    enrollmentFee: number;
    type: string;
    periodType: string;
    paymentStartDay?: number;
    paymentEndDay?: number;
    lateFeeValue?: number;
    lateFeeType?: "FIXED" | "PERCENTAGE";
}) {
    try {
        const { data: course, error } = await supabase
            .from('Course')
            .update({
                name: data.name,
                duration: data.duration,
                price: data.price,
                type: data.type,
                periodType: data.periodType,
                paymentStartDay: data.paymentStartDay,
                paymentEndDay: data.paymentEndDay,
                lateFeeValue: data.lateFeeValue,
                lateFeeType: data.lateFeeType,
                enrollmentFee: data.enrollmentFee
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating course:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/academic");
        return { success: true, data: course };
    } catch (error: any) {
        console.error("Critical error in updateCourse:", error);
        return { success: false, error: error.message || "Erro ao atualizar curso" };
    }
}

export async function getCourseImpact(id: string) {
    try {
        // 1. Subjects
        const { count: subjects } = await supabase
            .from('Subject')
            .select('*', { count: 'exact', head: true })
            .eq('courseId', id);

        // 2. Students
        const { count: students } = await supabase
            .from('Student')
            .select('*', { count: 'exact', head: true })
            .eq('courseId', id);

        // 3. Tuitions
        const { count: tuitions } = await supabase
            .from('Tuition')
            .select('*', { count: 'exact', head: true })
            .eq('courseId', id);

        // 4. Classes (via Subjects)
        const { data: subjectIds } = await supabase
            .from('Subject')
            .select('id')
            .eq('courseId', id);

        const ids = (subjectIds || []).map(s => s.id);

        const { count: classes } = await supabase
            .from('Class')
            .select('*', { count: 'exact', head: true })
            .in('subjectId', ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000']);

        return {
            success: true,
            impact: {
                subjects: subjects || 0,
                students: students || 0,
                tuitions: tuitions || 0,
                classes: classes || 0
            }
        };
    } catch (error: any) {
        console.error("Error getting course impact:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteCourse(id: string) {
    try {
        const { error } = await supabase
            .from('Course')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting course:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/academic");
        return { success: true };
    } catch (error: any) {
        console.error("Critical error in deleteCourse:", error);
        return { success: false, error: error.message || "Erro ao excluir curso" };
    }
}

// --- Subjects (Disciplinas) ---

export async function createSubject(data: {
    name: string;
    code?: string;
    year: number;
    semester?: number;
    credits?: number;
    courseId: string;
    examWaiverPossible?: boolean;
    waiverGrade?: number;
    exclusionGrade?: number;
}) {
    try {
        const { data: subject, error } = await supabase
            .from('Subject')
            .insert({
                name: data.name,
                code: data.code,
                year: data.year,
                semester: data.semester,
                credits: data.credits,
                courseId: data.courseId,
                examWaiverPossible: data.examWaiverPossible,
                waiverGrade: data.waiverGrade,
                exclusionGrade: data.exclusionGrade,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating subject:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/academic");
        return { success: true, data: subject };
    } catch (error: any) {
        console.error("Critical error in createSubject:", error);
        return { success: false, error: error.message || "Erro ao criar disciplina" };
    }
}

export async function updateSubject(id: string, data: {
    name: string;
    code?: string;
    credits?: number;
    year?: number;
    semester?: number;
    examWaiverPossible?: boolean;
    waiverGrade?: number;
    exclusionGrade?: number;
}) {
    try {
        const { data: subject, error } = await supabase
            .from('Subject')
            .update({
                name: data.name,
                code: data.code,
                credits: data.credits,
                year: data.year,
                semester: data.semester,
                examWaiverPossible: data.examWaiverPossible,
                waiverGrade: data.waiverGrade,
                exclusionGrade: data.exclusionGrade,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating subject:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/academic");
        return { success: true, data: subject };
    } catch (error: any) {
        console.error("Critical error in updateSubject:", error);
        return { success: false, error: error.message || "Erro ao atualizar disciplina" };
    }
}

export async function deleteSubject(id: string) {
    try {
        const { error } = await supabase
            .from('Subject')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting subject:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/academic");
        return { success: true };
    } catch (error: any) {
        console.error("Critical error in deleteSubject:", error);
        return { success: false, error: error.message || "Erro ao excluir disciplina" };
    }
}
