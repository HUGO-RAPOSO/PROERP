"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createMessage(data: {
    subject: string;
    content: string;
    type: string;
    tenantId: string;
}) {
    const { data: message, error } = await supabase
        .from('Message')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error("Error creating message:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/communication");
    return message;
}

export async function deleteMessage(id: string) {
    const { error } = await supabase
        .from('Message')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting message:", error);
        throw new Error(error.message);
    }

    revalidatePath("/dashboard/communication");
}
