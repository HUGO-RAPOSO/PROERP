"use server";

import { supabase, supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { createTransaction } from "./financial";

export async function generateMonthlyTuition(tenantId: string, month: number, year: number, dueDate: string) {
    try {
        // 1. Fetch all Active Students with their Courses (directly via student.courseId)
        const { data: students, error: studentError } = await supabaseAdmin
            .from('Student')
            .select(`
                id,
                name,
                status,
                course:Course(id, name, price)
            `)
            .eq('status', 'ACTIVE');

        if (studentError) throw studentError;

        const tuitionToCreate: any[] = [];
        const processed = new Set<string>(); // studentId + courseId

        for (const student of (students || []) as any[]) {
            const course = student.course;

            if (!course || !course.id || !course.price) continue;

            const key = `${student.id}-${course.id}`;
            if (processed.has(key)) continue;

            // Check if tuition already exists for this student/course/month/year
            const { data: existing } = await supabaseAdmin
                .from('Tuition')
                .select('id')
                .eq('studentId', student.id)
                .eq('courseId', course.id)
                .eq('dueDate', dueDate)
                .single();

            if (existing) {
                processed.add(key);
                continue;
            }

            tuitionToCreate.push({
                studentId: student.id,
                courseId: course.id,
                amount: course.price,
                dueDate: dueDate,
                status: 'PENDING',
                tenantId: tenantId
            });

            processed.add(key);
        }

        if (tuitionToCreate.length > 0) {
            const { error: insertError } = await supabaseAdmin
                .from('Tuition')
                .insert(tuitionToCreate);

            if (insertError) throw insertError;
        }

        revalidatePath("/dashboard/financial/tuition");
        return { success: true, count: tuitionToCreate.length };
    } catch (error: any) {
        console.error("Error generating tuition:", error);
        return { success: false, error: error.message };
    }
}

export async function payTuition(
    tuitionId: string,
    categoryId: string,
    accountId: string,
    tenantId: string,
    depositSlipUrl?: string,
    depositSlipNumber?: string
) {
    try {
        // 1. Fetch Tuition details with Course settings
        const { data: tuition, error: fetchError } = await supabaseAdmin
            .from('Tuition')
            .select(`
                *, 
                student:Student(name),
                course:Course(paymentEndDay, lateFeeValue, lateFeeType)
            `)
            .eq('id', tuitionId)
            .single();

        if (fetchError || !tuition) throw new Error("Mensalidade não encontrada");

        // 2. Calculate Late Fee based on Course Rules
        let lateFee = 0;
        const now = new Date();
        const currentDay = now.getDate();
        const endDay = tuition.course?.paymentEndDay || 10;

        // If today is after the end day of the payment period
        if (currentDay > endDay) {
            const feeValue = Number(tuition.course?.lateFeeValue || 0);
            const feeType = tuition.course?.lateFeeType || 'PERCENTAGE';

            if (feeType === 'FIXED') {
                lateFee = feeValue;
            } else {
                // Default to 2% if no value defined, else use percentage
                const percentage = feeValue > 0 ? feeValue / 100 : 0.02;
                lateFee = tuition.amount * percentage;
            }
        }

        const totalAmount = Number(tuition.amount) + lateFee;

        // 3. Update Tuition
        const { error: updateError } = await supabaseAdmin
            .from('Tuition')
            .update({
                status: 'PAID',
                paidDate: new Date(),
                lateFee: lateFee,
                accountId: accountId,
                depositSlipUrl: depositSlipUrl,
                depositSlipNumber: depositSlipNumber
            })
            .eq('id', tuitionId);

        if (updateError) throw updateError;

        // 4. Create Financial Transaction
        await createTransaction({
            description: `Mensalidade - ${tuition.student.name}`,
            amount: totalAmount,
            type: "INCOME",
            categoryId: categoryId,
            accountId: accountId,
            studentId: tuition.studentId,
            tenantId: tenantId,
            date: new Date()
        });

        revalidatePath("/dashboard/financial/tuition");
        revalidatePath("/dashboard/financial");
        return { success: true };
    } catch (error: any) {
        console.error("Error paying tuition:", error);
        return { success: false, error: error.message };
    }
}

export async function createIndividualTuition(data: {
    studentId: string;
    courseId: string;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'PAID';
    tenantId: string;
    categoryId?: string; // Required if status is PAID
    accountId?: string;  // Required if status is PAID
    depositSlipUrl?: string;
    depositSlipNumber?: string;
}) {
    try {
        const { data: tuition, error } = await supabaseAdmin
            .from('Tuition')
            .insert({
                studentId: data.studentId,
                courseId: data.courseId,
                amount: data.amount,
                dueDate: data.dueDate,
                status: data.status,
                tenantId: data.tenantId,
                paidDate: data.status === 'PAID' ? new Date() : null,
                accountId: data.accountId,
                depositSlipUrl: data.depositSlipUrl,
                depositSlipNumber: data.depositSlipNumber
            })
            .select('*, student:Student(name)')
            .single();

        if (error) throw error;

        // If paid immediately, create transaction
        if (data.status === 'PAID' && data.categoryId) {
            await createTransaction({
                description: `Mensalidade (Manual) - ${tuition.student.name}`,
                amount: data.amount,
                type: "INCOME",
                categoryId: data.categoryId,
                accountId: data.accountId,
                studentId: data.studentId,
                tenantId: data.tenantId,
                date: new Date()
            });
        }

        revalidatePath("/dashboard/financial/tuition");
        revalidatePath("/dashboard/financial");
        return { success: true, tuition };
    } catch (error: any) {
        console.error("Error creating individual tuition:", error);
        return { success: false, error: error.message };
    }
}

export async function getStudentFinancialSummaries(tenantId: string) {
    try {
        const { data, error } = await supabase
            .from('Student')
            .select(`
                id,
                name,
                course:Course(id, name, paymentEndDay, lateFeeValue, lateFeeType),
                tuitions:Tuition(*)
            `)
            .eq('tenantId', tenantId)
            .eq('status', 'ACTIVE');

        if (error) throw error;

        const today = new Date();
        const currentDay = today.getDate();

        const summaries = (data || []).map(student => {
            let debt = 0;
            let advance = 0;
            const studentCourse = Array.isArray(student.course) ? student.course[0] : student.course;
            const endDay = (studentCourse as any)?.paymentEndDay || 10;

            (student.tuitions as any[]).forEach(t => {
                const dueDate = new Date(t.dueDate);
                if (t.status === 'PENDING') {
                    let amount = Number(t.amount);

                    // Check if overdue
                    const isOverdue = (
                        (today.getFullYear() > dueDate.getFullYear()) ||
                        (today.getFullYear() === dueDate.getFullYear() && today.getMonth() > dueDate.getMonth()) ||
                        (today.getFullYear() === dueDate.getFullYear() && today.getMonth() === dueDate.getMonth() && currentDay > endDay)
                    );

                    if (isOverdue) {
                        const feeValue = Number((studentCourse as any)?.lateFeeValue || 0);
                        const feeType = (studentCourse as any)?.lateFeeType || 'PERCENTAGE';
                        if (feeType === 'FIXED') {
                            amount += feeValue;
                        } else {
                            const percentage = feeValue > 0 ? feeValue / 100 : 0.02;
                            amount += amount * percentage;
                        }
                    }
                    debt += amount;
                } else if (t.status === 'PAID') {
                    if (dueDate > today) {
                        advance += Number(t.amount);
                    }
                }
            });

            return {
                id: student.id,
                name: student.name,
                courseName: (studentCourse as any)?.name || "Sem Curso",
                debt,
                advance,
                totalTuitions: student.tuitions.length
            };
        });

        // Filter to only show students with some financial activity or debt
        return { success: true, summaries };
    } catch (error: any) {
        console.error("Error fetching financial summaries:", error);
        return { success: false, error: error.message };
    }
}
