import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import HRStats from "@/components/hr/HRStats";
import EmployeeTable from "@/components/hr/EmployeeTable";
import HRManager from "./HRManager";
import { Download, Search, Filter } from "lucide-react";

export default async function HRPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    const { data: employees } = await supabase
        .from('Employee')
        .select('*, role:Role(*)')
        .eq('tenantId', tenantId)
        .order('name', { ascending: true });

    const { data: roles } = await supabase.from('Role').select('*').eq('tenantId', tenantId);
    const { data: contracts } = await supabase.from('Contract').select('*').eq('tenantId', tenantId);

    const totalEmployees = employees?.length || 0;
    const activeEmployees = employees?.filter((e: any) => e.status === "ACTIVE").length || 0;
    const totalPayroll = employees?.reduce((acc: number, e: any) => acc + (e.salary || 0), 0) || 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Recursos Humanos</h2>
                    <p className="text-gray-500">Gerencie sua equipe, cargos e folha de pagamento.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                        Relatórios
                    </button>
                    <HRManager
                        tenantId={tenantId}
                        roles={roles || []}
                        contracts={contracts || []}
                    />
                </div>
            </div>

            <HRStats
                totalEmployees={totalEmployees}
                activeEmployees={activeEmployees}
                totalPayroll={totalPayroll}
            />

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Diretório de Colaboradores</h3>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar colaborador..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                        <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                            <Filter className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
                <EmployeeTable
                    employees={employees || []}
                    roles={roles || []}
                    contracts={contracts || []}
                />
            </div>
        </div>
    );
}
