import { BookOpen, Bookmark, Clock, CheckCircle } from "lucide-react";

interface LibraryStatsProps {
    totalBooks: number;
    totalLoans: number;
    availableBooks: number;
}

export default function LibraryStats({ totalBooks, totalLoans, availableBooks }: LibraryStatsProps) {
    const stats = [
        {
            title: "Acervo Total",
            value: totalBooks.toString(),
            icon: BookOpen,
            color: "blue"
        },
        {
            title: "Livros Disponíveis",
            value: availableBooks.toString(),
            icon: CheckCircle,
            color: "green"
        },
        {
            title: "Empréstimos Ativos",
            value: totalLoans.toString(),
            icon: Bookmark,
            color: "purple"
        },
        {
            title: "Atrasados",
            value: "0",
            icon: Clock,
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
