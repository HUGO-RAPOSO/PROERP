"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createAccount(data: {
    name: string;
    type: 'CASH' | 'BANK' | 'MOBILE_WALLET';
    bankName?: string;
    accountNumber?: string;
    tenantId: string;
}) {
    const { data: account, error } = await supabase
        .from('Account')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error("Error creating account:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/financial/accounts");
    revalidatePath("/dashboard/financial");
    return { success: true, data: account };
}

export async function getAccounts(tenantId: string) {
    const { data, error } = await supabase
        .from('Account')
        .select('*')
        .eq('tenantId', tenantId)
        .order('name', { ascending: true });

    if (error) {
        console.error("Error fetching accounts:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
}

export async function deleteAccount(id: string) {
    const { error } = await supabase
        .from('Account')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting account:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/financial/accounts");
    revalidatePath("/dashboard/financial");
    return { success: true };
}
