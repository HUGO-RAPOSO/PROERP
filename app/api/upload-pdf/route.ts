import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const { file, fileName, tenantId } = await request.json();

        if (!file || !fileName || !tenantId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!supabaseAdmin) {
            return NextResponse.json(
                { success: false, error: 'Supabase admin not configured' },
                { status: 500 }
            );
        }

        // Convert base64 to buffer
        const base64Data = file.replace(/^data:application\/pdf;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Create a storage path with tenant isolation
        const filePath = `${tenantId}/books/${Date.now()}_${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
            .from('library-files')
            .upload(filePath, buffer, {
                contentType: 'application/pdf',
                upsert: false,
            });

        if (error) {
            console.error('Error uploading PDF:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('library-files')
            .getPublicUrl(filePath);

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error: any) {
        console.error('Critical error uploading PDF:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Erro ao fazer upload do PDF' },
            { status: 500 }
        );
    }
}
