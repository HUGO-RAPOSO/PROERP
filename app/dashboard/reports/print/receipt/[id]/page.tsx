import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FinancialReceipt from "@/components/reports/FinancialReceipt";

export default async function PrintReceiptPage({ params }: { params: { id: string } }) {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    // Fetch transaction data
    const { data: transaction } = await supabase
        .from('Transaction')
        .select('*, category:Category(name), student:Student(name)')
        .eq('id', params.id)
        .eq('tenantId', tenantId)
        .single();

    if (!transaction) {
        notFound();
    }

    const { data: tenant } = await supabase
        .from('Tenant')
        .select('name')
        .eq('id', tenantId)
        .single();

    const transactionData = {
        description: transaction.description,
        amount: Number(transaction.amount),
        date: transaction.date,
        categoryName: transaction.category?.name,
        studentName: transaction.student?.name,
        reference: transaction.id.substring(0, 8).toUpperCase()
    };

    return (
        <div className="bg-white min-h-screen">
            <FinancialReceipt transaction={transactionData} tenantName={tenant?.name} />
            <script dangerouslySetInnerHTML={{ __html: `window.onload = () => { window.print(); }` }} />
        </div>
    );
}
