import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import KPICard from "@/components/dashboard/KPICard";
import RecentEnrollments from "@/components/dashboard/RecentEnrollments";
import { Users, GraduationCap, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    // Calculate Monthly Revenue dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // Fetch stats in parallel
    const [
        { data: tenant },
        { count: studentCount },
        { count: employeeCount },
        { count: classCount },
        { data: revenueData },
        { data: recentEnrollmentsData },
        { data: upcomingEventsData }
    ] = await Promise.all([
        supabase.from('Tenant').select('name').eq('id', tenantId).single(),
        supabase.from('Student').select('*', { count: 'exact', head: true }).eq('tenantId', tenantId),
        supabase.from('Employee').select('*', { count: 'exact', head: true }).eq('tenantId', tenantId),
        supabase.from('Class').select('*', { count: 'exact', head: true }).eq('tenantId', tenantId),
        supabase.from('Transaction').select('amount').eq('tenantId', tenantId).eq('type', 'INCOME').gte('date', startOfMonth).lte('date', endOfMonth),
        supabase.from('Enrollment').select('*, student:Student!inner(*), subject:Subject(*)').eq('student.tenantId', tenantId).order('year', { ascending: false }).limit(5),
        supabase.from('Event').select('*').eq('tenantId', tenantId).gte('date', now.toISOString()).order('date', { ascending: true }).limit(3)
    ]);

    const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const recentEnrollments = (recentEnrollmentsData || []).map((e: any) => ({
        ...e,
        class: e.subject // Map subject to class as expected by the RecentEnrollments component
    }));

    const stats = [
        {
            title: "Total de Alunos",
            value: (studentCount || 0).toString(),
            icon: Users,
            trend: "+12%",
            color: "blue"
        },
        {
            title: "Colaboradores",
            value: (employeeCount || 0).toString(),
            icon: Users,
            trend: "+3",
            color: "orange"
        },
        {
            title: "Turmas Ativas",
            value: (classCount || 0).toString(),
            icon: GraduationCap,
            trend: "+2",
            color: "purple"
        },
        {
            title: "Receita Mensal",
            value: formatCurrency(totalRevenue),
            icon: DollarSign,
            trend: "+8.4%",
            color: "green"
        },
    ] as const;

    // Upcoming Events
    const upcomingEvents = (upcomingEventsData || []).length > 0 ? upcomingEventsData!.map(e => ({
        ...e,
        date: new Date(e.date)
    })) : [
        {
            id: "mock1",
            title: "Reunião Pedagógica (Exemplo)",
            date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
            startTime: "14:00",
            location: "Sala de Reuniões",
            type: "ACADEMIC"
        },
        {
            id: "mock2",
            title: "Feriado Escolar (Exemplo)",
            date: new Date(new Date().setDate(new Date().getDate() + 5)),
            type: "HOLIDAY"
        }
    ];

    const formatEventDate = (date: Date) => {
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace(".", "")
        };
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Olá, {session.user.name}!</h2>
                <p className="text-gray-500">Aqui está o que está acontecendo na {tenant?.name || 'sua escola'} hoje.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <KPICard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <RecentEnrollments enrollments={recentEnrollments || []} />
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Próximas Atividades</h3>
                    <div className="space-y-6">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event) => {
                                const { day, month } = formatEventDate(event.date);
                                const colorClass =
                                    event.type === "ACADEMIC" ? "bg-primary-50 text-primary-600" :
                                        event.type === "HOLIDAY" ? "bg-orange-50 text-orange-600" :
                                            "bg-purple-50 text-purple-600";

                                return (
                                    <div key={event.id} className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${colorClass}`}>
                                            {day}
                                            <span className="text-[10px] block font-normal ml-0.5">{month}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{event.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {event.startTime ? `${event.startTime} - ` : ""}
                                                {event.location || event.description || "Sem local"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4">Nenhuma atividade programada.</p>
                        )}
                    </div>

                    <button className="w-full mt-8 py-3 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-all">
                        Ver Todos
                    </button>
                </div>
            </div>
        </div>
    );
}
