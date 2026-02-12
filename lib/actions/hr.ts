"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Roles (Cargos)
export async function createRole(data: { name: string; tenantId: string; permissions?: string[] }) {
    try {
        const { data: role, error } = await supabase
            .from('Role')
            .insert({
                ...data,
                permissions: data.permissions || []
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/hr");
        return { success: true, data: role };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Contracts (Tipos de Contrato)
export async function createContract(data: { name: string; tenantId: string }) {
    try {
        const { data: contract, error } = await supabase
            .from('Contract')
            .insert(data)
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/hr");
        return { success: true, data: contract };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteContract(id: string) {
    try {
        const { error } = await supabase
            .from('Contract')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath("/dashboard/hr");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Employees
export async function createEmployee(data: {
    name: string;
    email?: string;
    phone?: string;
    roleId: string;
    salary: number;
    tenantId: string;
    contractId?: string;
}) {
    try {
        const { data: employee, error } = await supabase
            .from('Employee')
            .insert({
                ...data,
                status: "ACTIVE",
            })
            .select('*, Role(*)')
            .single();

        if (error) throw error;

        // Sync with Academic if Role is "Professor" or "Docente"
        const lowerRole = (employee as any).Role?.name?.toLowerCase();
        if (lowerRole?.includes("professor") || lowerRole?.includes("docente")) {
            const { data: teacher, error: teacherError } = await supabase
                .from('Teacher')
                .insert({
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                    tenantId: employee.tenantId,
                    employeeId: employee.id
                })
                .select()
                .single();

            if (teacherError) {
                console.error("Error syncing teacher:", teacherError);
            } else if (employee.email) {
                // Also create/sync User account
                const hashedPassword = await bcrypt.hash("Mudar@123", 10);
                const { error: userError } = await supabase
                    .from('User')
                    .upsert({
                        email: employee.email,
                        name: employee.name,
                        password: hashedPassword,
                        tenantId: employee.tenantId,
                        role: 'TEACHER',
                        teacherId: teacher.id
                    }, { onConflict: 'email' });

                if (userError) console.error("Error creating teacher user:", userError);
            }
            revalidatePath("/dashboard/academic");
        }

        revalidatePath("/dashboard/hr");
        return { success: true, data: employee };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateEmployee(id: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    roleId: string;
    salary: number;
    status: string;
    contractId: string;
}>) {
    try {
        const { data: employee, error } = await supabase
            .from('Employee')
            .update(data)
            .eq('id', id)
            .select('*, Role(*)')
            .single();

        if (error) throw error;

        // Update linked Teacher if exists
        const lowerRole = (employee as any).Role?.name?.toLowerCase();
        if (lowerRole?.includes("professor") || lowerRole?.includes("docente")) {
            const { error: teacherError } = await supabase
                .from('Teacher')
                .upsert({
                    name: employee.name,
                    email: employee.email,
                    tenantId: employee.tenantId,
                    employeeId: employee.id
                }, { onConflict: 'employeeId' });

            if (teacherError) console.error("Error updating teacher:", teacherError);
            revalidatePath("/dashboard/academic");
        }

        revalidatePath("/dashboard/hr");
        return { success: true, data: employee };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteEmployee(id: string) {
    try {
        // Delete linked teacher first if exists
        await supabase.from('Teacher').delete().eq('employeeId', id);

        const { error } = await supabase
            .from('Employee')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath("/dashboard/hr");
        revalidatePath("/dashboard/academic");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Documents
export async function addEmployeeDocument(data: {
    name: string;
    url: string;
    employeeId: string;
}) {
    try {
        const client = supabaseAdmin || supabase;
        const { data: doc, error } = await client
            .from('EmployeeDocument')
            .insert(data)
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/hr");
        return { success: true, data: doc };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createPayroll(data: {
    employeeId: string;
    amount: number;
    date: Date;
    status: string;
}) {
    const { data: payroll, error } = await supabase
        .from('Payroll')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error("Error creating payroll:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/hr");
    return payroll;
}
