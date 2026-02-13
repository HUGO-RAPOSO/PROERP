"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

/**
 * Upload a PDF file to Supabase Storage
 * @param file - File data (base64 or buffer)
 * @param fileName - Name for the file
 * @param tenantId - Tenant ID for organization
 * @returns Public URL of the uploaded file
 */
export async function uploadBookPDF(
    fileBuffer: Buffer,
    fileName: string,
    tenantId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        if (!supabaseAdmin) {
            throw new Error("Supabase admin client not available");
        }

        // Create a storage path with tenant isolation
        const filePath = `${tenantId}/books/${Date.now()}_${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
            .from('library-files') // Bucket name
            .upload(filePath, fileBuffer, {
                contentType: 'application/pdf',
                upsert: false,
            });

        if (error) {
            console.error("Error uploading PDF:", error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('library-files')
            .getPublicUrl(filePath);

        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error("Critical error uploading PDF:", error);
        return { success: false, error: error.message || "Erro ao fazer upload do PDF" };
    }
}

/**
 * Delete a PDF file from Supabase Storage
 * @param fileUrl - Full URL of the file to delete
 * @param tenantId - Tenant ID for verification
 */
export async function deleteBookPDF(
    fileUrl: string,
    tenantId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!supabaseAdmin) {
            throw new Error("Supabase admin client not available");
        }

        // Extract file path from URL
        const urlParts = fileUrl.split('/library-files/');
        if (urlParts.length !== 2) {
            return { success: false, error: "Invalid file URL" };
        }

        const filePath = urlParts[1];

        // Verify the file belongs to this tenant
        if (!filePath.startsWith(tenantId)) {
            return { success: false, error: "Unauthorized file access" };
        }

        const { error } = await supabaseAdmin.storage
            .from('library-files')
            .remove([filePath]);

        if (error) {
            console.error("Error deleting PDF:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Critical error deleting PDF:", error);
        return { success: false, error: error.message || "Erro ao deletar PDF" };
    }
}
