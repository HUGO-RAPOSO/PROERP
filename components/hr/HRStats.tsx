import { Users, DollarSign, UserCheck, UserMinus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HRStatsProps {
    totalEmployees: number;
    activeEmployees: number;
    totalPayroll: number;
}

export default function HRStats({ totalEmployees, activeEmployees, totalPayroll }: HRStatsProps) {
    const stats = [
        {
            title: "Total de Colaboradores",
            value: totalEmployees.toString(),
            icon: Users,
            color: "blue"
        },
        {
            title: "Ativos",
            value: activeEmployees.toString(),
            icon: UserCheck,
            color: "green"
        },
        {
            title: "Folha Mensal",
            value: formatCurrency(totalPayroll),
            icon: DollarSign,
            color: "purple"
        },
        {
            title: "Inativos/Férias",
            value: (totalEmployees - activeEmployees).toString(),
            icon: UserMinus,
            color: "orange"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <div key={stat.title} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl bg-${stat.color}-50`}>
                            <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
