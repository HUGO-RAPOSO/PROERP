import { Users, UserCheck, Target, BarChart3 } from "lucide-react";

interface CRMStatsProps {
    totalLeads: number;
    interestedLeads: number;
    enrolledLeads: number;
    conversionRate: string | number;
}

export default function CRMStats({ totalLeads, interestedLeads, enrolledLeads, conversionRate }: CRMStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all group">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <Users className="w-6 h-6" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Total de Leads</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 px-1">{totalLeads}</h3>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all group">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                        <Target className="w-6 h-6" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Interessados</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 px-1">{interestedLeads}</h3>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all group">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Convertidos</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 px-1">{enrolledLeads}</h3>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all group">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">Taxa de Conversão</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 px-1">{conversionRate}%</h3>
            </div>
        </div>
    );
}
