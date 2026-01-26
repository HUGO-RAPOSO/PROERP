"use server";

import { supabase, supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createTransaction(data: {
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    categoryId?: string;
    accountId?: string;
    studentId?: string;
    employeeId?: string;
    tenantId: string;
    date?: Date;
}) {
    const { data: transaction, error } = await supabaseAdmin
        .from('Transaction')
        .insert({
            ...data,
            date: data.date || new Date(),
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating transaction:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/financial");
    revalidatePath("/dashboard");
    return transaction;
}

export async function createCategory(data: {
    name: string;
    type: "INCOME" | "EXPENSE";
    color?: string; // Add color
    tenantId: string;
}) {
    const { data: category, error } = await supabaseAdmin
        .from('Category')
        .insert({
            ...data,
            color: data.color || '#3B82F6'
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating category:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/financial");
    return category;
}

export async function deleteCategory(id: string) {
    const { error } = await supabaseAdmin
        .from('Category')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting category:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/financial");
}

export async function deleteTransaction(id: string) {
    const { error } = await supabaseAdmin
        .from('Transaction')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting transaction:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/financial");
    revalidatePath("/dashboard");
}

export async function updateTransaction(id: string, data: Partial<{
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    categoryId?: string;
    accountId?: string;
    studentId?: string;
    employeeId?: string;
    date?: Date;
}>) {
    const { data: transaction, error } = await supabaseAdmin
        .from('Transaction')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error updating transaction:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/financial");
    revalidatePath("/dashboard");
    return transaction;
}

// Payroll Actions
export async function generateMonthlyPayroll(tenantId: string) {
    try {
        // 1. Get all active employees with salary > 0
        const { data: employees, error: empError } = await supabaseAdmin
            .from('Employee')
            .select('*')
            .eq('tenantId', tenantId)
            .eq('status', 'ACTIVE')
            .gt('salary', 0);

        if (empError) throw empError;
        if (!employees || employees.length === 0) return { success: false, error: "Nenhum funcionário ativo com salário encontrado." };

        // 2. Check for existing payroll for current month to avoid duplicates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        let createdCount = 0;

        for (const emp of employees) {
            // Check if already exists
            const { data: existing } = await supabaseAdmin
                .from('Payroll')
                .select('id')
                .eq('employeeId', emp.id)
                .gte('date', startOfMonth)
                .lte('date', endOfMonth)
                .maybeSingle();

            if (!existing) {
                await supabaseAdmin.from('Payroll').insert({
                    employeeId: emp.id,
                    amount: emp.salary,
                    date: new Date(),
                    status: 'PENDING'
                });
                createdCount++;
            }
        }

        revalidatePath("/dashboard/financial/payroll");
        return { success: true, message: `${createdCount} registros de folha gerados.` };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function processPayrollPayment(payrollId: string, categoryId: string, accountId: string, tenantId: string) {
    try {
        // 1. Get Payroll details
        const { data: payroll, error: fetchError } = await supabaseAdmin
            .from('Payroll')
            .select('*, employee:Employee(name)')
            .eq('id', payrollId)
            .single();

        if (fetchError || !payroll) throw new Error("Registro de folha não encontrado.");
        if (payroll.status === 'PAID') throw new Error("Este pagamento já foi processado.");

        // 2. Update Payroll status
        const { error: updateError } = await supabaseAdmin
            .from('Payroll')
            .update({ status: 'PAID', date: new Date() })
            .eq('id', payrollId);

        if (updateError) throw updateError;

        // 3. Create Expense Transaction
        await createTransaction({
            description: `Salário - ${(payroll.employee as any)?.name}`,
            amount: Number(payroll.amount),
            type: 'EXPENSE',
            categoryId,
            accountId,
            employeeId: payroll.employeeId,
            tenantId,
            date: new Date()
        });

        revalidatePath("/dashboard/financial/payroll");
        revalidatePath("/dashboard/financial");
        revalidatePath("/dashboard/hr"); // Update HR views too

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
