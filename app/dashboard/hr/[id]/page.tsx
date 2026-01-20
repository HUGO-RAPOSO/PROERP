import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EmployeeProfile from "@/components/hr/EmployeeProfile";
import EmployeeDocs from "@/components/hr/EmployeeDocs";
import EmployeeFinancial from "@/components/hr/EmployeeFinancial";
import EmployeeTabs from "@/components/hr/EmployeeTabs";

export default async function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    // Fetch Employee Data
    const { data: employee } = await supabase
        .from('Employee')
        .select('*, role:Role(*), contract:Contract(*)')
        .eq('id', id)
        .single();

    if (!employee) {
        notFound();
    }

    // Fetch Documents
    const { data: documents } = await supabase
        .from('EmployeeDocument')
        .select('*')
        .eq('employeeId', id)
        .order('createdAt', { ascending: false });

    // Fetch Payroll
    const { data: payroll } = await supabase
        .from('Payroll')
        .select('*')
        .eq('employeeId', id)
        .order('date', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/hr"
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{employee.name}</h2>
                    <p className="text-gray-500">{employee.role?.name || "Sem cargo defined"}</p>
                </div>
                <div className="ml-auto">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${employee.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                        {employee.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-1">
                <EmployeeTabs
                    profile={<EmployeeProfile employee={employee} />}
                    docs={<EmployeeDocs employeeId={employee.id} documents={documents || []} />}
                    financial={<EmployeeFinancial payroll={payroll || []} />}
                />
            </div>
        </div>
    );
}
