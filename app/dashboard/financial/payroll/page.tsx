import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PayrollList from "@/components/financial/PayrollList";
import { getAccounts } from "@/lib/actions/accounts";
import GeneratePayrollButton from "../../../../components/financial/GeneratePayrollButton";

export default async function PayrollPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    // Fetch Payrolls
    const { data: payrolls } = await supabase
        .from('Payroll')
        .select('*, employee:Employee(name, role:Role(name))')
        .eq('status', 'PENDING') // Show pending first
        .order('date', { ascending: false });

    const { data: history } = await supabase
        .from('Payroll')
        .select('*, employee:Employee(name)')
        .eq('status', 'PAID')
        .order('date', { ascending: false })
        .limit(20);

    // Fetch Categories for payment selection
    const { data: categories } = await supabase
        .from('Category')
        .select('*')
        .eq('tenantId', tenantId)
        .eq('type', 'EXPENSE');

    // Fetch Accounts for payment selection
    const { data: accountsRaw } = await getAccounts(tenantId);
    const accounts = accountsRaw || [];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/financial"
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Folha de Pagamento</h2>
                    <p className="text-gray-500">Gerencie e processe os salários da sua equipe.</p>
                </div>
                <div className="ml-auto">
                    <GeneratePayrollButton tenantId={tenantId} />
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Pagamentos Pendentes</h3>
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <PayrollList
                        payrolls={payrolls || []}
                        categories={categories || []}
                        accounts={accounts}
                        tenantId={tenantId}
                        type="PENDING"
                    />
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Histórico de Pagamentos</h3>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <PayrollList
                        payrolls={history || []}
                        categories={[]}
                        accounts={accounts}
                        tenantId={tenantId}
                        type="PAID"
                    />
                </div>
            </div>
        </div>
    );
}
