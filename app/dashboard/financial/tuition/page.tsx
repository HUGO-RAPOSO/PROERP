import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, Loader2, CreditCard, AlertCircle, CheckCircle, Landmark } from "lucide-react";
import Link from "next/link";
import TuitionList from "@/components/financial/TuitionList";
import TuitionManager from "@/app/dashboard/financial/tuition/TuitionManager";
import StudentFinancialList from "@/components/financial/StudentFinancialList";
import { getStudentFinancialSummaries } from "@/lib/actions/tuition";
import { getAccounts } from "@/lib/actions/accounts";

export const dynamic = "force-dynamic";

export default async function TuitionPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;
    const currentStatus = (Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status || 'PENDING') as 'PENDING' | 'PAID';
    const currentView = (Array.isArray(searchParams.view) ? searchParams.view[0] : searchParams.view || 'TUITION') as 'TUITION' | 'STUDENT';

    // Fetch Tuitions based on status
    const { data: tuitions } = await supabase
        .from('Tuition')
        .select('*, student:Student(name), course:Course(name, paymentStartDay, paymentEndDay, lateFeeValue, lateFeeType)')
        .eq('status', currentStatus)
        .eq('tenantId', tenantId)
        .order('dueDate', { ascending: currentStatus === 'PENDING' });

    // Fetch Categories (Income) for payment processing
    const { data: categories } = await supabase
        .from('Category')
        .select('*')
        .eq('tenantId', tenantId)
        .eq('type', 'INCOME');

    // Fetch Active Students for individual payment creation
    const { data: students } = await supabase
        .from('Student')
        .select('*, course:Course(id, name, price)')
        .eq('tenantId', tenantId)
        .eq('status', 'ACTIVE');

    // Fetch Accounts
    const { data: accountsRaw } = await getAccounts(tenantId);
    const accounts = accountsRaw || [];

    // Fetch Summaries for TuitionManager and views
    const result = await getStudentFinancialSummaries(tenantId);
    const summaries = result.summaries || [];

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
                    <h2 className="text-3xl font-bold text-gray-900">Gestão de Mensalidades</h2>
                    <p className="text-gray-500">Controle os recebimentos, datas de vencimento e multas.</p>
                </div>
                <div className="ml-auto">
                    <TuitionManager
                        tenantId={tenantId}
                        students={students || []}
                        categories={categories || []}
                        accounts={accounts}
                        summaries={summaries}
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2">
                <Link
                    href="/dashboard/financial/tuition?view=TUITION&status=PENDING"
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${currentView === 'TUITION' && currentStatus === 'PENDING'
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                >
                    Em Aberto {(tuitions && currentStatus === 'PENDING' && currentView === 'TUITION') ? `(${tuitions.length})` : ''}
                </Link>
                <Link
                    href="/dashboard/financial/tuition?view=TUITION&status=PAID"
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${currentView === 'TUITION' && currentStatus === 'PAID'
                        ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                >
                    Pagas {(tuitions && currentStatus === 'PAID' && currentView === 'TUITION') ? `(${tuitions.length})` : ''}
                </Link>
                <div className="w-px h-8 bg-gray-200 mx-2 self-center" />
                <Link
                    href="/dashboard/financial/tuition?view=STUDENT"
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${currentView === 'STUDENT'
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                >
                    Situação por Estudante
                </Link>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    {currentView === 'STUDENT' ? (
                        <StudentFinancialList summaries={summaries} />
                    ) : (
                        <TuitionList
                            tuitions={tuitions || []}
                            categories={categories || []}
                            accounts={accounts}
                            tenantId={tenantId}
                            isHistory={currentStatus === 'PAID'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
