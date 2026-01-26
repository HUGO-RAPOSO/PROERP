"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
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
    try {
        const client = supabaseAdmin || supabase;
        const { data: transaction, error } = await client
            .from('Transaction')
            .insert({
                ...data,
                date: data.date || new Date(),
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating transaction:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/financial");
        revalidatePath("/dashboard");
        return { success: true, data: transaction };
    } catch (error: any) {
        console.error("Critical error in createTransaction:", error);
        return { success: false, error: error.message || "Erro ao criar transação" };
    }
}

export async function createCategory(data: {
    name: string;
    type: "INCOME" | "EXPENSE";
    color?: string; // Add color
    tenantId: string;
}) {
    try {
        const client = supabaseAdmin || supabase;
        const { data: category, error } = await client
            .from('Category')
            .insert({
                ...data,
                color: data.color || '#3B82F6'
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating category:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/financial");
        return { success: true, data: category };
    } catch (error: any) {
        console.error("Critical error in createCategory:", error);
        return { success: false, error: error.message || "Erro ao criar categoria" };
    }
}

export async function deleteCategory(id: string) {
    try {
        const client = supabaseAdmin || supabase;
        const { error } = await client
            .from('Category')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting category:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/financial");
        return { success: true };
    } catch (error: any) {
        console.error("Critical error in deleteCategory:", error);
        return { success: false, error: error.message || "Erro ao excluir categoria" };
    }
}

export async function deleteTransaction(id: string) {
    try {
        const client = supabaseAdmin || supabase;
        const { error } = await client
            .from('Transaction')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting transaction:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/financial");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Critical error in deleteTransaction:", error);
        return { success: false, error: error.message || "Erro ao excluir transação" };
    }
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
    try {
        const client = supabaseAdmin || supabase;
        const { data: transaction, error } = await client
            .from('Transaction')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating transaction:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/financial");
        revalidatePath("/dashboard");
        return { success: true, data: transaction };
    } catch (error: any) {
        console.error("Critical error in updateTransaction:", error);
        return { success: false, error: error.message || "Erro ao atualizar transação" };
    }
}

// Payroll Actions
export async function generateMonthlyPayroll(tenantId: string) {
    try {
        const client = supabaseAdmin || supabase;
        // 1. Get all active employees with salary > 0
        const { data: employees, error: empError } = await client
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
            const { data: existing } = await client
                .from('Payroll')
                .select('id')
                .eq('employeeId', emp.id)
                .gte('date', startOfMonth)
                .lte('date', endOfMonth)
                .maybeSingle();

            if (!existing) {
                await client.from('Payroll').insert({
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
        console.error("Critical error in generateMonthlyPayroll:", error);
        return { success: false, error: error.message || "Erro ao gerar folha" };
    }
}

export async function processPayrollPayment(payrollId: string, categoryId: string, accountId: string, tenantId: string) {
    try {
        const client = supabaseAdmin || supabase;
        // 1. Get Payroll details
        const { data: payroll, error: fetchError } = await client
            .from('Payroll')
            .select('*, employee:Employee(name)')
            .eq('id', payrollId)
            .single();

        if (fetchError || !payroll) throw new Error("Registro de folha não encontrado.");
        if (payroll.status === 'PAID') throw new Error("Este pagamento já foi processado.");

        // 2. Update Payroll status
        const { error: updateError } = await client
            .from('Payroll')
            .update({ status: 'PAID', date: new Date() })
            .eq('id', payrollId);

        if (updateError) throw updateError;

        // 3. Create Expense Transaction
        const transactionRes = await createTransaction({
            description: `Salário - ${(payroll.employee as any)?.name}`,
            amount: Number(payroll.amount),
            type: 'EXPENSE',
            categoryId,
            accountId,
            employeeId: payroll.employeeId,
            tenantId,
            date: new Date()
        });

        if (!transactionRes.success) {
            throw new Error(transactionRes.error || "Erro ao criar transação de pagamento");
        }

        revalidatePath("/dashboard/financial/payroll");
        revalidatePath("/dashboard/financial");
        revalidatePath("/dashboard/hr"); // Update HR views too

        return { success: true };
    } catch (error: any) {
        console.error("Critical error in processPayrollPayment:", error);
        return { success: false, error: error.message || "Erro ao processar pagamento" };
    }
}
