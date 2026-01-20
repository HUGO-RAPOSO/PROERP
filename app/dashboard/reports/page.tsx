import { supabase } from "@/lib/supabase";
import { BarChart3, TrendingUp, Users, DollarSign, Download } from "lucide-react";

export default async function ReportsPage() {
    const { count: totalStudents } = await supabase.from('Student').select('*', { count: 'exact', head: true });
    const { count: totalTeachers } = await supabase.from('Teacher').select('*', { count: 'exact', head: true });

    const { data: revenueData } = await supabase
        .from('Transaction')
        .select('amount')
        .eq('type', 'INCOME');

    const totalRevenueSum = revenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Relatórios e Consultas</h2>
                    <p className="text-gray-500">Analise o desempenho da sua instituição com dados em tempo real.</p>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20">
                    <Download className="w-5 h-5" />
                    Exportar Tudo (PDF)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Crescimento Alunos", value: "+12%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Taxa de Adimplência", value: "94.2%", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Novas Matrículas", value: "24", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((report) => (
                    <div key={report.label} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{report.label}</p>
                            <h3 className="text-3xl font-bold text-gray-900">{report.value}</h3>
                        </div>
                        <div className={`p-4 rounded-2xl ${report.bg} ${report.color}`}>
                            <report.icon className="w-8 h-8" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900">Distribuição por Categoria</h3>
                    <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                        <option>Últimos 12 meses</option>
                        <option>Este ano</option>
                    </select>
                </div>

                <div className="h-80 flex items-end gap-4">
                    {[60, 45, 75, 50, 90, 65, 80, 55, 70, 85, 40, 95].map((height, i) => (
                        <div key={i} className="flex-1 space-y-2 group cursor-pointer">
                            <div className="relative h-full bg-gray-50 rounded-t-lg overflow-hidden flex items-end">
                                <div
                                    className="w-full bg-primary-500 group-hover:bg-primary-600 transition-all rounded-t-lg"
                                    style={{ height: `${height}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded">R$ 1.5k</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 text-center font-medium">Mês {i + 1}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
