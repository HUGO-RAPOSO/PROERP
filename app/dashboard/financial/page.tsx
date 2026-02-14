import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAccounts } from "@/lib/actions/accounts";
import DashboardOverview from "@/components/financial/DashboardOverview";

export default async function FinancialPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    const { data: categories } = await supabase
        .from('Category')
        .select('*')
        .eq('tenantId', tenantId);

    const { data: accountsRaw } = await getAccounts(tenantId);
    const accounts = accountsRaw || [];

    const { data: students } = await supabase
        .from('Student')
        .select('id, name')
        .eq('tenantId', tenantId)
        .eq('status', 'ACTIVE');

    const { data: employees } = await supabase
        .from('Employee')
        .select('id, name')
        .eq('tenantId', tenantId)
        .eq('status', 'ACTIVE');

    return (
        <DashboardOverview
            tenantId={tenantId}
            categories={categories || []}
            accounts={accounts}
            students={students || []}
            employees={employees || []}
        />
    );
}
