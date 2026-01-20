import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CRMStats from "@/components/crm/CRMStats";
import LeadTable from "@/components/crm/LeadTable";
import CRMManager from "./CRMManager";
import { Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function CRMPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    const { data: leads } = await supabase
        .from('Lead')
        .select('*')
        .eq('tenantId', tenantId)
        .order('createdAt', { ascending: false });

    const totalLeads = leads?.length || 0;
    const interestedLeads = leads?.filter(l => l.status === "INTERESTED").length || 0;
    const enrolledLeads = leads?.filter(l => l.status === "ENROLLED").length || 0;
    const conversionRate = totalLeads > 0 ? ((enrolledLeads / totalLeads) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">CRM & Leads</h2>
                    <p className="text-gray-500">Gerencie prospectos e acompanhe o funil de matrículas.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                        Exportar
                    </button>
                    <CRMManager tenantId={tenantId} />
                </div>
            </div>

            <CRMStats
                totalLeads={totalLeads}
                interestedLeads={interestedLeads}
                enrolledLeads={enrolledLeads}
                conversionRate={conversionRate}
            />

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Diretório de Leads</h3>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar lead..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>
                </div>
                <LeadTable leads={leads || []} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Origem dos Leads</h3>
                    <div className="space-y-4">
                        {[
                            { label: "Website", value: "45%", color: "bg-blue-500" },
                            { label: "WhatsApp", value: "30%", color: "bg-green-500" },
                            { label: "Instagram", value: "15%", color: "bg-pink-500" },
                            { label: "Indicação", value: "10%", color: "bg-purple-500" },
                        ].map((item) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-600">{item.label}</span>
                                    <span className="font-bold text-gray-900">{item.value}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full", item.color)} style={{ width: item.value }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Próximas Tarefas</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-2 h-12 bg-blue-500 rounded-full" />
                            <div>
                                <p className="font-bold text-gray-900">Ligar para João Silva</p>
                                <p className="text-sm text-gray-500">Agendado para hoje, 14:00</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 h-12 bg-orange-500 rounded-full" />
                            <div>
                                <p className="font-bold text-gray-900">Enviar Proposta - Maria Santos</p>
                                <p className="text-sm text-gray-500">Pendente há 2 dias</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
