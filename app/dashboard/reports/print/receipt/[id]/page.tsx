import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import FinancialReceipt from "@/components/reports/FinancialReceipt";

export default async function PrintReceiptPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    const client = supabaseAdmin || supabase;

    // Fetch tuition data
    const { data: tuition, error } = await client
        .from('Tuition')
        .select('*, student:Student(name), account:Account(name)')
        .eq('id', params.id)
        .eq('tenantId', tenantId)
        .single();

    if (error || !tuition) {
        console.error("Print Error (Receipt):", error);
        notFound();
    }
    const { data: tenant } = await supabase
        .from('Tenant')
        .select('name')
        .eq('id', tenantId)
        .single();

    const transactionData = {
        description: `Mensalidade - ${(tuition.student as any)?.name}`,
        amount: Number(tuition.amount) + Number(tuition.lateFee || 0),
        date: tuition.paidDate || tuition.dueDate,
        categoryName: "Mensalidade",
        studentName: (tuition.student as any)?.name,
        reference: tuition.id.substring(0, 8).toUpperCase()
    };

    return (
        <div className="bg-white min-h-screen">
            <FinancialReceipt transaction={transactionData} tenantName={tenant?.name} />
        </div>
    );
}
