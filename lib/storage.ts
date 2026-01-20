import { supabase } from "@/lib/supabase";

export async function uploadFile(
    file: File,
    path: string,
    bucket: string = "documents"
) {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) throw error;

        return { success: true, path: data.path };
    } catch (error: any) {
        console.error("Upload error:", error);
        return { success: false, error: error.message };
    }
}

export function getPublicUrl(path: string, bucket: string = "documents") {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}
