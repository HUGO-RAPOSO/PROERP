"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function uploadFileAdmin(
    formData: FormData,
    path: string,
    bucket: string = "documents"
) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: "Nenhum ficheiro fornecido." };
        }

        const buffer = await file.arrayBuffer();
        const client = supabaseAdmin || supabase;

        const { data, error } = await client.storage
            .from(bucket)
            .upload(path, buffer, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            });

        if (error) throw error;

        return { success: true, path: data.path };
    } catch (error: any) {
        console.error("Upload error:", error);
        return { success: false, error: error.message };
    }
}
