"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createLead(data: {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    tenantId: string;
}) {
    const { data: lead, error } = await supabase
        .from('Lead')
        .insert({
            ...data,
            status: "OPEN",
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating lead:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/crm");
    return lead;
}

export async function updateLeadStatus(id: string, status: string) {
    const { data: lead, error } = await supabase
        .from('Lead')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error updating lead status:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/crm");
    return lead;
}

export async function createLeadInteraction(data: {
    leadId: string;
    type: string;
    notes?: string;
}) {
    const { data: interaction, error } = await supabase
        .from('LeadInteraction')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error("Error creating lead interaction:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/crm");
    return interaction;
}

export async function deleteLead(id: string) {
    const { error } = await supabase
        .from('Lead')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting lead:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/crm");
}

export async function updateLead(id: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    status: string;
    source: string;
}>) {
    const { data: lead, error } = await supabase
        .from('Lead')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error updating lead:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/crm");
    return lead;
}
